var EE = require('events').EventEmitter
  , qs = require('querystring')
  , path = require('path')
  , fs = require('fs')

var jrs = require('json-readdir-stream')
  , through = require('through')
  , mkdirp = require('mkdirp')

var normal = path.normalize
  , join = path.join

var CWD = process.cwd()

module.exports = fsBack

function fsBack(_metaDir, _userDir, _tarballsDir, _storeDir) {
  var backend = new EE
    , tarballsDir
    , storeDir
    , userDir
    , metaDir

  tarballsDir = _tarballsDir ? normal(_tarballsDir) : join(CWD, 'tarballs')
  storeDir = _storeDir ? normal(_storeDir) : join(CWD, 'store')
  userDir = _userDir ? normal(_userDir) : join(CWD, 'users')
  metaDir = _metaDir ? normal(_metaDir) : join(CWD, 'meta')

  mkdirp.sync(tarballsDir)
  mkdirp.sync(storeDir)
  mkdirp.sync(userDir)
  mkdirp.sync(metaDir)

  backend.getUser = get(userDir)
  backend.setUser = set(userDir, 'setUser')
  backend.removeUser = remove(userDir, 'removeUser')
  backend.createUserStream = streamAll(userDir)
  backend.getMeta = get(metaDir)
  backend.setMeta = set(metaDir, 'setMeta')
  backend.removeMeta = remove(metaDir, 'removeMeta')
  backend.createMetaStream = streamAll(metaDir)
  backend.get = get(storeDir)
  backend.set = set(storeDir, 'set')
  backend.remove = remove(storeDir, 'remove')
  backend.createStream = streamAll(storeDir)
  backend.getTarball = getTarball
  backend.setTarball = setTarball
  backend.removeTarball = removeTarball

  return backend

  function get(dir) {
    return function getData(_key, _done) {
      var key = qs.escape(_key)
        , done = _done || noop

      readJson(join(dir, key), done)
    }
  }

  function streamAll(dir) {
    return function streamData(options) {
      return jrs(dir, options).pipe(unescapeStream(options))
    }
  }

  function set(dir, eventName) {
    return function setData(_key, data, _done) {
      var key = qs.escape(_key)
        , done = _done || noop
        , oldData

      get(dir)(key, gotOld)

      function gotOld(err, old) {
        if(err) return done(err)

        oldData = old

        writeJson(join(dir, key), data, savedNew)
      }

      function savedNew(err, data) {
        if(err) return done(err)

        done(null, data, oldData)
        backend.emit(eventName, key, data, oldData)
      }
    }
  }

  function remove(dir, eventName) {
    return function removeData(_key, _done) {
      var key = qs.escape(_key)
        , done = _done || noop
        , oldData

      get(dir)(key, gotOld)

      function gotOld(err, data) {
        if(err) return done(err)

        oldData = data

        fs.unlink(join(dir, key + '.json'), removed)
      }

      function removed(err) {
        if(err) return done(err)

        done(null, oldData)
        backend.emit(eventName, key, oldData)
      }
    }
  }

  function getTarball(name, version) {
    return fs.createReadStream(
        join(tarballsDir, qs.escape(name) + '@' + version + '.tgz')
    )
  }

  function setTarball(name, version) {
    return fs.createWriteStream(
        join(tarballsDir, qs.escape(name) + '@' + version + '.tgz')
    )
  }

  function removeTarball(name, version, callback) {
    fs.unlink(join(tarballsDir, qs.escape(name) + '@' + version + '.tgz'), callback)
  }
}

function writeJson(filename, data, ready) {
  try {
    var jsonData = JSON.stringify(data, null, 2)
  } catch(e) {
    return ready(e)
  }

  fs.writeFile(filename + '.json', jsonData, writeDone)

  function writeDone(err) {
    if(err) return ready(err)

    ready(null, data)
  }
}

function readJson(filename, ready) {
  fs.readFile(filename + '.json', parseJson)

  function parseJson(err, data) {
    if(err) return err.code === 'ENOENT' ? ready(null, null) : ready(err)

    try {
      return ready(null, JSON.parse(data))
    } catch(e) {
      return ready(e)
    }
  }
}

function unescapeStream(options) {
  if(options && !options.keys && typeof options.keys !== 'undefined') {
    return through()
  }

  return through(function unescape(data) {
    if(typeof data === 'object') {
      data.key = qs.unescape(data.key)
      return this.queue(data)
    }

    return this.queue(qs.unescape(data))
  })
}
function noop() {}
