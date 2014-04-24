var path = require('path')
  , fs = require('fs')

var jrs = require('json-readdir-stream')
  , through = require('through')
  , mkdirp = require('mkdirp')

var normal = path.normalize
  , join = path.join

var CWD = process.cwd()

module.exports = fs_back

function fs_back(_meta_dir, _user_dir, _tarballs_dir, _store_dir) {
  var tarballs_dir
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

  return {
      getUser: get_user
    , createUserStream: get_users
    , setUser: set_user
    , getMeta: get_meta
    , createMetaStream: get_metas
    , setMeta: set_meta
    , getTarball: get_tarball
    , setTarball: set_tarball
    , get: get_store
    , createStream: get_stores
    , set: set_store
  }

  function get_user(name, done) {
    read_json(join(user_dir, name), done)
  }

  function get_users(options) {
    return jrs(user_dir, options)
  }

  function set_user(name, data, done) {
    write_json(join(user_dir, name), data, done)
  }

  function get_meta(name, done) {
    read_json(join(meta_dir, name), done)
  }

  function get_metas(options) {
    return jrs(meta_dir, options)
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

  function get_store(name, done) {
    read_json(join(user_dir, name), done)
  }

  function get_stores(options) {
    return jrs(store_dir, options)
  }

  function set_store(name, data, done) {
    write_json(join(store_dir, name), data, done)
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
    if(err) return err.code === 'ENOENT' ? ready(null, null) : ready(err)

    try {
      return ready(null, JSON.parse(data))
    } catch(e) {
      return ready(e)
    }
  }
}
