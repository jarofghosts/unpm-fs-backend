var stream = require('stream')
  , fs = require('fs')

var fs_back = require('../')
  , rmrf = require('rimraf')
  , test = require('tape')

teardown()

var backend = fs_back(
    './test/dirs/meta'
  , './test/dirs/user'
  , './test/dirs/tgz'
  , './test/dirs/store'
)

var test_stream = test.createStream()

test_stream.pipe(process.stdout)
test_stream.on('end', teardown)

test('setMeta stores meta-data', function(t) {
  var test_data = {test: 'data'}

  t.plan(3)

  backend.setMeta('dummy', test_data, check_file)

  function check_file(err, data) {
    t.ok(!err, 'callback gets no error')
    t.equal(
        data
      , JSON.stringify(test_data, null, 2)
      , 'callback gets stringified data'
    )
    t.equal(
        fs.readFileSync('./test/dirs/meta/dummy.json').toString()
      , JSON.stringify(test_data, null, 2)
      , 'file is written with proper content'
    )
  }
})

test('getMeta gets meta-data', function(t) {
  var expected = {test: 'data'}

  t.plan(2)

  backend.getMeta('dummy', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.deepEqual(data, expected, 'data matches what was set')
  }
})

test('createMetaStream returns stream of meta-data entries', function(t) {
  var expected = {key: 'dummy', value: '{"test":"data"}'}

  var meta_stream = backend.createMetaStream()
    , data

  t.plan(3)

  t.ok(meta_stream.pipe, 'return is stream-like')
  t.equal(typeof meta_stream.pipe, 'function', 'return has pipe')

  meta_stream.on('data', function(chunk) {
    data = chunk
  })

  meta_stream.on('end', function() {
    t.deepEqual(data, expected, 'streams entries')
  })
})

test('getMeta returns null on file not found', function(t) {
  t.plan(2)

  backend.getMeta('nope', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.strictEqual(data, null, 'data is null')
  }
})

test('setUser stores user-data', function(t) {
  var test_data = {test: 'data'}

  t.plan(3)

  backend.setUser('dummy', test_data, check_file)

  function check_file(err, data) {
    t.ok(!err, 'callback gets no error')
    t.equal(
        data
      , JSON.stringify(test_data, null, 2)
      , 'callback gets stringified data'
    )
    t.equal(
        fs.readFileSync('./test/dirs/user/dummy.json').toString()
      , JSON.stringify(test_data, null, 2)
      , 'file is written with proper content'
    )
  }
})

test('getUser gets user-data', function(t) {
  var expected = {test: 'data'}

  t.plan(2)

  backend.getUser('dummy', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.deepEqual(data, expected, 'user data retrieved')
  }
})

test('createUserStream returns stream of user entries', function(t) {
  var expected = {key: 'dummy', value: '{"test":"data"}'}

  var user_stream = backend.createUserStream()
    , data

  t.plan(3)

  t.ok(user_stream.pipe, 'return is stream-like')
  t.equal(typeof user_stream.pipe, 'function', 'return has pipe')

  user_stream.on('data', function(chunk) {
    data = chunk
  })

  user_stream.on('end', function() {
    t.deepEqual(data, expected, 'streams entries')
  })
})

test('getUser returns null on file not found', function(t) {
  t.plan(2)

  backend.getUser('nope', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.strictEqual(data, null, 'data is null')
  }
})

test('set_tarball creates writable stream to tgz file', function(t) {
  var dummy_contents = 'drangus'

  var set_tarball = backend.setTarball('dummy', '1.2.3')

  t.plan(3)

  t.ok(set_tarball.write, 'return is writable-stream-like')
  t.equal(typeof set_tarball.write, 'function', 'return has write')

  set_tarball.on('finish', function() {
    t.equal(
        fs.readFileSync('./test/dirs/tgz/dummy@1.2.3.tgz').toString()
      , dummy_contents
      , 'file was written with correct contents'
    )
  })

  set_tarball.end(dummy_contents)
})

test('get_tarball streams tgz contents', function(t) {
  var expected = 'drangus'

  var get_tarball = backend.getTarball('dummy', '1.2.3')
    , data = ''

  t.plan(5)

  t.ok(get_tarball.pipe, 'return is stream-like')
  t.ok(get_tarball.read, 'return is readable-stream-like')
  t.equal(typeof get_tarball.pipe, 'function', 'return has pipe')
  t.equal(typeof get_tarball.read, 'function', 'return has read')

  get_tarball.on('data', function(chunk) {
    data += chunk
  })

  get_tarball.on('end', function() {
    t.equal(data, expected, 'streams file contents')
  })
})

test('set stores arbitrary data', function(t) {
  var test_data = {test: 'data'}

  t.plan(3)

  backend.set('dummy', test_data, check_file)

  function check_file(err, data) {
    t.ok(!err, 'callback gets no error')
    t.equal(
        data
      , JSON.stringify(test_data, null, 2)
      , 'callback gets stringified data'
    )
    t.equal(
        fs.readFileSync('./test/dirs/store/dummy.json').toString()
      , JSON.stringify(test_data, null, 2)
      , 'file is written with proper content'
    )
  }
})

test('get gets arbitrary data', function(t) {
  var expected = {test: 'data'}

  t.plan(2)

  backend.get('dummy', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.deepEqual(data, expected, 'arbitrary data retrieved')
  }
})

test('createStream returns stream of store entries', function(t) {
  var expected = {key: 'dummy', value: '{"test":"data"}'}

  var get_stream = backend.createStream()
    , data

  t.plan(3)

  t.ok(get_stream.pipe, 'return is stream-like')
  t.equal(typeof get_stream.pipe, 'function', 'return has pipe')

  get_stream.on('data', function(chunk) {
    data = chunk
  })

  get_stream.on('end', function() {
    t.deepEqual(data, expected, 'streams entries')
  })
})

test('get returns null on file not found', function(t) {
  t.plan(2)

  backend.get('nope', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.strictEqual(data, null, 'data is null')
  }
})


function teardown() {
  rmrf.sync('./test/dirs')
}
