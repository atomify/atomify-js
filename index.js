var browserify = require('browserify')
  , shim       = require('browserify-shim')
  , hbsfy      = require('hbsfy')
  , envify     = require('envify')
  , brfs       = require('brfs')

module.exports = function (opts, cb) {
  if (!opts.shim) opts.shim = {}
  var bundle = shim(browserify(), opts.shim)

  bundle.require(require.resolve(opts.entry), {entry: true})

  // ensure brfs runs last because it requires valid js
  opts.transforms = [envify, hbsfy].concat(opts.transforms || []).concat(brfs)
  opts.transforms.forEach(function (transform) {
    bundle.transform(transform)
  })

  bundle.bundle({debug: opts.debug || false}, cb)
}
