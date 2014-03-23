var path = require('path')
  , fs = require('fs')

var mkdirp = require('mkdirp')

var normal = path.normalize
  , join = path.join

var CWD = process.cwd()

module.exports = fs_back

function fs_back(_meta_dir, _user_dir, _tarballs_dir) {
  var tarballs_dir = normal(_tarballs_dir) || join(CWD, 'tarballs')
    , user_dir = normal(_user_dir) || join(CWD, 'users')
    , meta_dir = normal(_meta_dir) || join(CWD, 'meta')

  mkdirp.sync(tarballs_dir)
  mkdirp.sync(user_dir)
  mkdirp.sync(meta_dir)

  return {
      get_user: get_user
    , set_user: set_user
    , get_meta: get_meta
    , set_meta: set_meta
    , get_tarball: get_tarball
    , set_tarball: set_tarball
  }

  function get_user(name, done) {
    read_json(join(user_dir, name), done)
  }

  function set_user(name, data, done) {
    write_json(join(user_dir, name), data, done)
  }

  function get_meta(name, done) {
    read_json(join(meta_dir, name), done)
  }

  function set_meta(name, data, done) {
    write_json(join(meta_dir, name), data, done)
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

    ready(null, json_data)
  }
}

function read_json(filename, ready) {
  fs.readFile(filename + '.json', parse_json)

  function parse_json(err, data) {
    if(err) return err.code === 'ENOENT' ? ready(null, []) : ready(err)

    try {
      return ready(null, JSON.parse(data))
    } catch(e) {
      return ready(e)
    }
  }
}
