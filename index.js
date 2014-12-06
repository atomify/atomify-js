var browserify   = require('browserify')
  , path         = require('path')
  , fs           = require('fs')
  , events       = require('events')
  , mkdirp       = require('mkdirp')
  , watchify     = require('watchify')
  , ejsify       = require('ejsify')
  , hbsfy        = require('hbsfy')
  , jadeify      = require('jadeify')
  , envify       = require('envify')
  , partialify   = require('partialify')
  , reactify     = require('reactify')
  , brfs         = require('brfs')
  , writer       = require('write-to-path')
  , emitter      = new events.EventEmitter()
  , streamBuffer = require('stream-buffers')
  , _            = require('lodash')
  , minifyify  = require('minifyify')
  , ctor

require('factor-bundle')

ctor = module.exports = function atomifyJs(opts, cb){
  if (Array.isArray(opts)) opts = {entries: opts}
  if (typeof opts === 'string') opts = {entries: [opts]}
  if (opts.entry) opts.entries = [opts.entry]
  if (!opts.entries) opts.entries = []

  if (typeof cb === 'string') opts.output = cb // js('entry.js', 'bundle.js')

  if (opts.output) {
    // we definitely have to write the file
    var outputPath = path.resolve(process.cwd(), opts.output)
      , outputDir = path.dirname(outputPath)
      , writeFile = writer(outputPath, {debug: opts.debug})

    if (!fs.existsSync(outputDir)) mkdirp.sync(outputDir)

    // we might need to call a callback also
    if (typeof cb === 'function') {
      var _outputcb = cb
      cb = function (err, src, map) {
        if (err) return _outputcb(err)
        writeFile(null, src)
        _outputcb(null, src, map)
      }
    }
    else {
      cb = writeFile
    }
  }

  var _buffercb = cb

  cb = function (err, buff, map) {
    if(typeof _buffercb == 'function')
      _buffercb(err, buff, map)
  }

  opts.debug  = opts.debug || false

  if(opts.minify === true) {
    opts.minify = {map: false}
  }
  // Debug mode must be on to get sourcemaps
  else if(typeof opts.minify == 'object') {
    opts.debug = true
  }

  var browserifyOptions = _.omit(opts, ['entry', 'entries', 'require'])
    , b
    , w

  // mixin the required watchify options if we need to watch
  // these are required for creating the browserify instance
  if (opts.watch) _.extend(browserifyOptions, watchify.args)

  b = browserify(browserifyOptions)
  emitter.emit('browserify', b)

  if (opts.watch) {
    w = watchify(b)
    emitter.emit('watchify', w)
  }

  if (opts.watch) {
    w.on('update', function onUpdate(ids){
      ids.forEach(function eachId(id){
        emitter.emit('changed', id)
      })

      w.bundle(cb)
    })

    w.on('time', function onTime(time){
      emitter.emit('bundle', time)
    })
  }

  b.on('package', function(pkg){
    emitter.emit('package', pkg)
  })

  opts.entries.forEach(function eachEntry(entry){
    b.add(path.resolve(process.cwd(), entry))
  })

  // Browserify modifies the transforms property once opts is passed in to bundle()
  // so we copy that prop here to ensure we only use what is passed in from config
  if (!opts._transforms) {
    opts._transforms = opts.transforms ? opts.transforms.slice(0) : []
  }

  var transforms = [
      envify
      , ejsify
      , hbsfy
      , jadeify
      , partialify
      , [reactify, {'es6': true}]
    ]
    // ensure brfs runs last because it requires valid js
    .concat(opts._transforms, [brfs])

  transforms.forEach(function eachTransform(transform){
    if (Array.isArray(transform)) {
      b.transform(transform[1], transform[0])
    }
    else {
      b.transform(transform)
    }
  })

  // reset list of global transforms every time
  opts._globalTransforms = opts.globalTransforms ? opts.globalTransforms.slice(0) : []

  if (opts.assets) {
    var assets = ['resrcify', {
      dest: opts.assets.dest || ''
      , prefix: opts.assets.prefix || ''
      , retainName: opts.assets.retainName || ''
    }]

    opts._globalTransforms.push(assets)
  }

  opts._globalTransforms.forEach(function eachGlobalTransform(gt){
    if (Array.isArray(gt)) {
      var gto = gt[1]
      gto.global = true
      b.transform(gto, gt[0])
    }
    else {
      b.transform({global: true}, gt)
    }
  })

  if(typeof opts.minify == 'object') {
    b.plugin(minifyify, opts.minify)
  }

  if (opts.require) {
    if (Array.isArray(opts.require) || typeof opts.require === 'string'){
      opts.require = {file: opts.require}
    }
    b.require(opts.require.file, opts.require.opts)
  }

  if (Array.isArray(opts.external) || typeof opts.external === 'string'){
    b.external(opts.external)
  }

  // if we've got the common option, we want to use factor bundle
  if (opts.common === true){
    if (opts.entries.length < 2) {
      var error = new Error('the `common` option requires an `entries` option with more than one entry')
      cb(error)
      // TODO: we should do this, but it casues tape to falsely see the error event on itself!?
      // emitter.emit('error', error)
      return
    }

    // for each entry, we're going to create a stream-able buffer to put the factored bundle into
    var outputs = {}
    opts.entries.forEach(function createOutputs(entry){
      outputs[path.basename(entry).replace(path.extname(entry), '')] = new streamBuffer.WritableStreamBuffer({
          // these values are arbitrary, but we don't want to require huge buffers
          initialSize: (1 * 1024)         // start as 1 kilobytes.
          , incrementAmount: (1 * 1024)    // grow by 1 kilobytes each time buffer overflows.
      })
    })

    // setup factor bundle, pass in our streamable-buffers as the output source
    b.plugin('factor-bundle', {
      o: _.values(outputs)
    })

    // we need to wrap the callback to output an object with all the bundles
    return b.bundle(function (err, common){
      var hasCallback = _.isFunction(cb)
        , out = {}

      if (err && hasCallback) return void cb(err)

      // turn the stream-able buffers into plain buffers
      out = _.mapValues(outputs, function (stream, entryName){
        var entryBuffer = stream.getContents()

        // for those using the streaming interface, emit an event with the entry
        // do this here so that we don't have to itterate through the outputs twice
        emitter.emit('entry', entryBuffer, entryName)

        return entryBuffer
      })

      // add in the common bundle
      out.common = common

      if (hasCallback) cb(err, out)
    })
  }
  // if we don't need to use factor bundle, just browserify!
  else return b.bundle(cb)
}

ctor.emitter = emitter
