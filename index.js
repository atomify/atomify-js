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
  , minifyify  = require('minifyify')

module.exports = function (opts, cb) {
  if (Array.isArray(opts)) opts = {entries: opts}
  if (typeof opts === 'string') opts = {entries: [opts]}
  if (opts.entry) opts.entries = [opts.entry]

  if (typeof cb === 'string') opts.output = cb

  opts.minify = opts.minify || false
  opts.debug = opts.debug || opts.minify || false

  if(opts.output && opts.minify) {
    throw new Error('Minification only works with a callback')
  }

  var b = opts.watch ? watchify() : browserify()
  if (opts.shim) b = shim(b, opts.shim)

  if (opts.watch) {
    b.on('update', function () {
      b.bundle(opts, cb)
    })
  }

  opts.entries.forEach(function (entry) {
    b.add(path.resolve(process.cwd(), entry))
  })

  // Browserify modifies the transforms property once opts is passed in to bundle()
  // so we copy that prop here to ensure we only use what is passed in from config
  if (!opts._transforms) {
    opts._transforms = opts.transforms ? opts.transforms.slice(0) : []
  }

  // ensure brfs runs last because it requires valid js
  var transforms = [envify, ejsify, hbsfy, jadeify, partialify].concat(opts._transforms).concat([brfs])
  transforms.forEach(function (transform) {
    if (Array.isArray(transform)) {
      b.transform(transform[1], transform[0])
    } else {
      b.transform(transform)
    }
  })

  if (opts.assets) {
    var assets = ['resrcify', {
      dest: opts.assets.dest || ''
      , prefix: opts.assets.prefix || ''
    }]

    opts.globalTransforms = opts.globalTransforms || []
    opts.globalTransforms.push(assets)
  }

  if (opts.globalTransforms) {
    opts.globalTransforms.forEach(function (gt) {
      if (Array.isArray(gt)) {
        var gto = gt[1]
        gto.global = true
        b.transform(gto, gt[0])
      } else {
        b.transform({global: true}, gt)
      }
    })
  }

  if (opts.output) {
    return b.bundle(opts, writer(path.resolve(process.cwd(), opts.output), {debug: opts.debug}))
  } else {
    if(opts.minify) {
      var minifier = new minifyify({
        map: typeof opts.minify === 'string' ? opts.minify : undefined
      , compressPaths: function (f) {
          return path.relative(opts.entries[0], f)
        }
      })

      b.transform({global: true}, minifier.transformer)
      b.bundle(opts).pipe(minifier.consumer(cb))
    }
    else {
      return b.bundle(opts, cb)
    }
  }
}
