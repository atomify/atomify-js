var browserify = require('browserify')
  , hbsfy      = require('hbsfy')
  , brfs       = require('brfs')

module.exports = function (opts, cb) {
  var bundle = browserify([opts.entry])
  bundle.transform(hbsfy)
  bundle.transform(brfs)
  bundle.bundle({debug: opts.debug || false}, cb)
}
