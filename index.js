var browserify = require('browserify')
  , path       = require('path')
  , watchify   = require('watchify')
  , shim       = require('browserify-shim')
  , ejsify     = require('ejsify')
  , hbsfy      = require('hbsfy')
  , jadeify    = require('jadeify')
  , envify     = require('envify')
  , partialify = require('partialify')
  , brfs       = require('brfs')
  , writer     = require('write-to-path')

module.exports = function (opts, cb) {
  if (Array.isArray(opts)) opts = {entries: opts}
  if (typeof opts === 'string') opts = {entries: [opts]}
  if (opts.entry) opts.entries = [opts.entry]

  if (typeof cb === 'string') opts.output = cb

  opts.shim = opts.shim || {}
  opts.debug = opts.debug || false

  var b = shim(opts.watch ? watchify() : browserify(), opts.shim)

  if (opts.watch) {
    b.on('update', function () {
      b.bundle(opts, cb)
    })
  }

  opts.entries.forEach(function (entry) {
    b.add(path.resolve(process.cwd(), entry))
  })

  // ensure brfs runs last because it requires valid js
  opts.transforms = [envify, ejsify, hbsfy, jadeify, partialify].concat(opts.transforms || []).concat([brfs])
  opts.transforms.forEach(function (transform) {
    b.transform(transform)
  })

  if (opts.output) {
    b.bundle(opts, writer(path.resolve(process.cwd(), opts.output), {debug: opts.debug}))
  } else {
    b.bundle(opts, cb)
  }
}
