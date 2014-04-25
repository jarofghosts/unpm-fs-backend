var EE = require('events').EventEmitter
  , path = require('path')
  , fs = require('fs')

var jrs = require('json-readdir-stream')
  , mkdirp = require('mkdirp')

var normal = path.normalize
  , join = path.join

var CWD = process.cwd()

module.exports = fs_back

function fs_back(_meta_dir, _user_dir, _tarballs_dir, _store_dir) {
  var backend = new EE
    , tarballs_dir
    , store_dir
    , user_dir
    , meta_dir

  tarballs_dir = _tarballs_dir ? normal(_tarballs_dir) : join(CWD, 'tarballs')
  store_dir = _store_dir ? normal(_store_dir) : join(CWD, 'store')
  user_dir = _user_dir ? normal(_user_dir) : join(CWD, 'users')
  meta_dir = _meta_dir ? normal(_meta_dir) : join(CWD, 'meta')

  mkdirp.sync(tarballs_dir)
  mkdirp.sync(store_dir)
  mkdirp.sync(user_dir)
  mkdirp.sync(meta_dir)

  backend.getUser = get(user_dir)
  backend.setUser = set(user_dir, 'setUser')
  backend.removeUser = remove(user_dir, 'removeUser')
  backend.createUserStream = stream_all(user_dir)
  backend.getMeta = get(meta_dir)
  backend.setMeta = set(meta_dir, 'setMeta')
  backend.removeMeta = remove(meta_dir, 'removeMeta')
  backend.createMetaStream = stream_all(meta_dir)
  backend.get = get(store_dir)
  backend.set = set(store_dir, 'set')
  backend.remove = remove(store_dir, 'remove')
  backend.createStream = stream_all(store_dir)
  backend.getTarball = get_tarball
  backend.setTarball = set_tarball
  backend.removeTarball = remove_tarball

  return backend

  function get(dir) {
    return function get_data(key, _done) {
      var done = _done || noop

      read_json(join(dir, key), done)
    }
  }

  function stream_all(dir) {
    return function stream_data(options) {
      return jrs(dir, options)
    }
  }

  function set(dir, event_name) {
    return function set_data(key, data, _done) {
      var done = _done || noop
        , old_data

      get(dir)(key, got_old)

      function got_old(err, old) {
        if(err) return done(err)

        old_data = old

        write_json(join(dir, key), data, saved_new)
      }

      function saved_new(err, data) {
        if(err) return done(err)

        done(null, data, old_data)
        backend.emit(event_name, key, data, old_data)
      }
    }
  }

  function remove(dir, event_name) {
    return function remove_data(key, _done) {
      var done = _done || noop
        , old_data

      get(dir)(key, got_old)

      function got_old(err, data) {
        if(err) return done(err)

        old_data = data

        fs.unlink(join(dir, key + '.json'), removed)
      }

      function removed(err) {
        if(err) return done(err)

        done(null, old_data)
        backend.emit(event_name, key, old_data)
      }
    }
  }

  function get_tarball(name, version) {
    return fs.createReadStream(
        join(tarballs_dir, name + '@' + version + '.tgz')
    )
  }

  function set_tarball(name, version) {
    return fs.createWriteStream(
        join(tarballs_dir, name + '@' + version + '.tgz')
    )
  }

  function remove_tarball(name, version, callback) {
    fs.unlink(join(tarballs_dir, name + '@' + version + '.tgz'), callback)
  }
}

function write_json(filename, data, ready) {
  try {
    var json_data = JSON.stringify(data, null, 2)
  } catch(e) {
    return ready(e)
  }

  fs.writeFile(filename + '.json', json_data, write_done)

  function write_done(err) {
    if(err) return ready(err)

    ready(null, data)
  }
}

function read_json(filename, ready) {
  fs.readFile(filename + '.json', parse_json)

  function parse_json(err, data) {
    if(err) return err.code === 'ENOENT' ? ready(null, null) : ready(err)

    try {
      return ready(null, JSON.parse(data))
    } catch(e) {
      return ready(e)
    }
  }
}

function noop() {}
