var fs = require('fs')

var fs_back = require('../')
  , rmrf = require('rimraf')
  , test = require('tape')

// pre-emptive teardown, just in case.
//teardown()

var backend = fs_back('./meta', './user', './tgz')

test('stores meta-data', function(t) {
  var test_data = {test: 'data'}

  t.plan(3)

  backend.set_meta('dummy', test_data, check_file)

  function check_file(err, data) {
    t.ok(!err, 'callback gets no error')
    t.equal(
        data
      , JSON.stringify(test_data, null, 2), 'callback gets stringified data'
    )
    t.equal(
        fs.readFileSync('./meta/dummy.json').toString()
      , JSON.stringify(test_data, null, 2)
    )
  }
})

test('gets meta-data', function(t) {
  var expected = {test: 'data'}

  t.plan(2)

  backend.get_meta('dummy', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.deepEqual(data, expected)
  }
})

test('stores user-data', function(t) {
  var test_data = {test: 'data'}

  t.plan(3)

  backend.set_user('dummy', test_data, check_file)

  function check_file(err, data) {
    t.ok(!err, 'callback gets no error')
    t.equal(
        data
      , JSON.stringify(test_data, null, 2), 'callback gets stringified data'
    )
    t.equal(
        fs.readFileSync('./user/dummy.json').toString()
      , JSON.stringify(test_data, null, 2)
    )
  }
})

test('gets user-data', function(t) {
  var expected = {test: 'data'}

  t.plan(2)

  backend.get_user('dummy', check_result)

  function check_result(err, data) {
    t.ok(!err, 'callback gets no error')
    t.deepEqual(data, expected)
  }
})

//teardown()

function teardown() {
  rmrf.sync('./meta')
  rmrf.sync('./user')
  rmrf.sync('./tgz')
}
