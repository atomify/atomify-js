var browserify = require('browserify')
  , watchify   = require('watchify')
  , shim       = require('browserify-shim')
  , ejsify     = require('ejsify')
  , hbsfy      = require('hbsfy')
  , jadeify    = require('jadeify')
  , envify     = require('envify')
  , partialify = require('partialify')
  , brfs       = require('brfs')

module.exports = function (opts, cb) {
  if (typeof opts === 'string') opts = {entry: opts};
  opts = opts || {}
  opts.shim = opts.shim || {}
  opts.debug = opts.debug || false
  var bundle = shim(opts.watch ? watchify() : browserify(), opts.shim)

  if (opts.watch) {
    bundle.on('update', function () {
      bundle.bundle(opts, cb)
    })
  }

  bundle.require(require.resolve(opts.entry), {entry: true})

  // ensure brfs runs last because it requires valid js
  opts.transforms = [envify, ejsify, hbsfy, jadeify, partialify].concat(opts.transforms || []).concat(brfs)
  opts.transforms.forEach(function (transform) {
    bundle.transform(transform)
  })

  bundle.bundle(opts, cb)
}
