var browserify = require('browserify')
  , shim       = require('browserify-shim')
  , hbsfy      = require('hbsfy')
  , brfs       = require('brfs')

module.exports = function (opts, cb) {
  if (!opts.shim) opts.shim = {}
  var bundle = shim(browserify([opts.entry]), opts.shim)
  bundle.transform(hbsfy)
  bundle.transform(brfs)
  bundle.bundle({debug: opts.debug || false}, cb)
}
