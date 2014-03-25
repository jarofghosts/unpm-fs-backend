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
)

var test_stream = test.createStream()

test_stream.pipe(process.stdout)
test_stream.on('end', teardown)

test('set_meta stores meta-data', function(t) {
  var test_data = {test: 'data'}

  t.plan(3)

  backend.set_meta('dummy', test_data, check_file)

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

test('get_meta gets meta-data', function(t) {
  var expected = {test: 'data'}

  t.plan(2)

  backend.get_meta('dummy', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.deepEqual(data, expected, 'data matches what was set')
  }
})

test('get_meta returns null on file not found', function(t) {
  t.plan(2)

  backend.get_meta('nope', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.strictEqual(data, null, 'data is null')
  }
})

test('set_user stores user-data', function(t) {
  var test_data = {test: 'data'}

  t.plan(3)

  backend.set_user('dummy', test_data, check_file)

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

test('get_user gets user-data', function(t) {
  var expected = {test: 'data'}

  t.plan(2)

  backend.get_user('dummy', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.deepEqual(data, expected, 'user data retrieved')
  }
})

test('get_user returns null on file not found', function(t) {
  t.plan(2)

  backend.get_user('nope', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.strictEqual(data, null, 'data is null')
  }
})

test('set_tarball creates writable stream to tgz file', function(t) {
  var dummy_contents = 'drangus'

  var set_tarball = backend.set_tarball('dummy', '1.2.3')

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

  var get_tarball = backend.get_tarball('dummy', '1.2.3')
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

function teardown() {
  rmrf.sync('./test/dirs')
}
