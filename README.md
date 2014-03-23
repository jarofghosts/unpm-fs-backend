μnpm-fs-backend
====

[![Build Status](https://travis-ci.org/jarofghosts/unpm-fs-backend.svg?branch=master)](https://travis-ci.org/jarofghosts/unpm-fs-backend)

a static-file backend for [μnpm](https://www.npmjs.org/package/unpm)

## Example

```js
var backend = require('unpm-fs-backend')

config.backend = backend(meta_dir, user_id, tarballs_dir)
```

## API

`backend(meta_dir, user_dir, tarballs_dir) -> Backend`

Where `meta_dir` is where to store package metadata, `user_dir` is where to
store user data, and `tarballs_dir` is where your .tgz files live.

`Backend` is an object with the following methods:

* `get_user(name, done)`

Retrieves user data for user `name` and calls `done` as a node-style callback
(`function(err, data)`)

* `set_user(name, data, done)`

Saves user data to `name` and calls `done` with node-style callback when
complete

User information should be an object of form:

```js
{
    name: String
  , email: String
  , salt: String
  , date: String
  , password_has: String
}
```

* `get_meta(name, done)`

Get metadata about package `name`, calls a node-style callback with data.

* `set_meta(name, data, done)`

Save package metadata for `name`  and calls a node-style callback when
complete.

Metadata should be an object that looks like
[EXAMPLE-META-DATA.json](./EXAMPLE-META-DATA.json)

* `get_tarball(name, version) -> ReadableStream`

Returns a readable stream of the .tgz file for package `name` at `version`.

* `set_tarball(name, version) -> WritableStream`

Returns a writable stream for a .tgz file for package `name` at `version`. The
tarball must conform to the specification as outline by
[npm-install](https://www.npmjs.org/doc/cli/npm-install.html)

## License

MIT
