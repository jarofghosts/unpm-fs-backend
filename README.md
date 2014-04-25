μnpm-fs-backend
====

[![Build Status](https://travis-ci.org/jarofghosts/unpm-fs-backend.svg?branch=master)](https://travis-ci.org/jarofghosts/unpm-fs-backend)

a static-file backend for [μnpm](https://www.npmjs.org/package/unpm)

## Example

```js
var backend = require('unpm-fs-backend')

config.backend = backend(metaDir, userDir, tarballsDir)
```

## API

`backend(metaDir, userDir, tarballsDir, miscDir) -> Backend`

Where `metaDir` is where to store package metadata, `userDir` is where to
store user data, `tarballsDir` is where your .tgz files live, and `miscDir`
is where any arbitrary data stored by middleware will go (using `Backend.set`
and `Backend.get`).

`Backend` is an Event Emitter with the following methods:

* `getUser(name, done)`

Retrieves user data for user `name` and calls `done` as a node-style callback
(`function(err, data)`)

* `setUser(name, data, done)`

Saves user data to `name` and calls `done` with node-style callback when
complete

User information should be an object of form:

```js
{
    name: String
  , email: String
  , salt: String
  , date: String
  , password_hash: String
}
```

Emits `setUser(name, data, previousData)` where `previousData` is the data
`name` had before being set (`null` in the case of no previous data).

* `createUserStream(options)`

Get a key/value stream of users, options should be of a form matching levelup's
`createReadStream` options.

* `getMeta(name, done)`

Get metadata about package `name`, calls a node-style callback with data.

* `setMeta(name, data, done)`

Save package metadata for `name` and calls a node-style callback when
complete.

Emits `setMeta(name, data, previousData)`

Metadata should be an object that looks like
[EXAMPLE-META-DATA.json](./EXAMPLE-META-DATA.json)

* `createMetaStream(options)`

Get a key/value stream of metadata, options should be of a form matching
levelup's `createReadStream` options.

* `getTarball(name, version) -> ReadableStream`

Returns a readable stream of the .tgz file for package `name` at `version`.

* `setTarball(name, version) -> WritableStream`

Returns a writable stream for a .tgz file for package `name` at `version`. The
tarball must conform to the specification as outline by
[npm-install](https://www.npmjs.org/doc/cli/npm-install.html)

* `get(key, done)`

Get the value of `key` from the miscellaneous key/value store.

* `set(key, value, done)`

Save `value` to `key` in the misc. key/value store.

Emits `set(key, value, previousValue)`

* `createStream(options)`

Get a key/value stream for misc. data, options should be of a form matching
levelup's `createReadStream` options.

## License

MIT
