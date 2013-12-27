var browserify = require('browserify')
  , shim       = require('browserify-shim')
  , envify     = require('envify')
  , hbsfy      = require('hbsfy')
  , brfs       = require('brfs')

module.exports = function (opts, cb) {
  if (!opts.shim) opts.shim = {}
  var bundle = shim(browserify(), opts.shim)
  bundle.require(require.resolve(opts.entry), {entry: true})
  bundle.transform(envify)
  bundle.transform(hbsfy)
  bundle.transform(brfs)
  bundle.bundle({debug: opts.debug || false}, cb)
}
