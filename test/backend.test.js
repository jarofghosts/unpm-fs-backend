var EE = require('events').EventEmitter

var test = require('unpm-backend-test')
  , rmrf = require('rimraf')

var fs_back = require('../')

teardown()

var backend = fs_back(
    './test/dirs/meta'
  , './test/dirs/user'
  , './test/dirs/tgz'
  , './test/dirs/store'
)

test(backend, teardown)

function teardown() {
  rmrf.sync('./test/dirs')
}
