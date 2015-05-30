'use strict'

var browserify = require('browserify')
  , browserifyInc = require('browserify-incremental')
  , path = require('path')
  , fs = require('fs')
  , events = require('events')
  , mkdirp = require('mkdirp')
  , watchify = require('watchify')
  , ejsify = require('ejsify')
  , hbsfy = require('hbsfy')
  , jadeify = require('jadeify')
  , envify = require('envify')
  , partialify = require('partialify')
  , babelify = require('babelify')
  , brfs = require('brfs')
  , writer = require('write-to-path')
  , emitter = new events.EventEmitter()
  , streamBuffer = require('stream-buffers')
  , _ = require('lodash')
  , minifyify = require('minifyify')
  , resrcify = require('resrcify')
  , factorBundle = require('factor-bundle')
  , ctor

ctor = module.exports = function atomifyJs (opts, cb) {
  var outputPath
    , outputDir
    , writeFile
    , _outputcb
    , _buffercb
    , browserifyOptions
    , transforms
    , assets
    , outputs
    , b
    , streamGenerator

  if (Array.isArray(opts)) opts = {entries: opts}
  if (typeof opts === 'string') opts = {entries: [opts]}
  if (opts.entry) opts.entries = [opts.entry]
  if (!opts.entries) opts.entries = []
  if (opts.watch && opts.cache) throw new Error('You can only cache if not using watch')

  // js('entry.js', 'bundle.js')
  if (typeof cb === 'string') opts.output = cb

  if (opts.output) {
    // we definitely have to write the file
    outputPath = path.resolve(process.cwd(), opts.output)
    outputDir = path.dirname(outputPath)
    writeFile = writer(outputPath, {debug: opts.debug})

    if (!fs.existsSync(outputDir)) mkdirp.sync(outputDir)

    // we might need to call a callback also
    if (typeof cb === 'function') {
      _outputcb = cb
      cb = function wrappedCallback (err, src, map) {
        if (err) return _outputcb(err)
        writeFile(null, src)
        _outputcb(null, src, map)
      }
    }
    else {
      cb = writeFile
    }
  }

  _buffercb = cb

  cb = function wrappedBufferCallback (err, buff, map) {
    if (typeof _buffercb === 'function') _buffercb(err, buff, map)
  }

  opts.debug = opts.debug || false

  if (opts.minify === true) {
    opts.minify = {map: false}
  }
  // Debug mode must be on to get sourcemaps
  else if (typeof opts.minify === 'object') {
    opts.debug = true
  }

  browserifyOptions = _.omit(opts, ['entry', 'entries', 'require'])

  // mixin the required watchify options if we need to watch
  // these are required for creating the browserify instance
  // remove the default 600ms delay because speed is tood
  // ignoreWatch to true to ignore node_modules
  if (opts.watch) _.extend({delay: 0, ignoreWatch: true}, browserifyOptions, watchify.args)
  // mixin the required browserifyInc options if we need to cache
  if (opts.cache) _.extend(browserifyOptions, browserifyInc.args)

  b = browserify(browserifyOptions)

  if (opts.cache) {
    b = browserifyInc(b
      , _.isString(opts.cache) ? {cacheFile: opts.cache} : {}
    )
  }

  emitter.emit('browserify', b)

  if (opts.watch) {
    b = watchify(b)
    emitter.emit('watchify', b)
  }

  if (opts.watch) {
    b.on('update', function onUpdate (ids) {
      ids.forEach(function eachId (id) {
        emitter.emit('changed', id)
      })

      rebundle()
    })

    b.on('time', function onTime (time) {
      emitter.emit('bundle', time)
    })
  }

  b.on('package', function onBrowserifyPackage (pkg) {
    emitter.emit('package', pkg)
  })

  opts.entries.forEach(function eachEntry (entry) {
    b.add(path.resolve(process.cwd(), entry))
  })

  // Browserify modifies the transforms property once opts is passed in to bundle()
  // so we copy that prop here to ensure we only use what is passed in from config
  if (!opts._transforms) {
    opts._transforms = opts.transforms ? opts.transforms.slice(0) : []
  }

  transforms = opts.defaultTransforms !== false ?
    [
      envify
      , ejsify
      , hbsfy
      , jadeify
      , partialify
      , [babelify, {modules: 'common'}]
    ]
    // ensure brfs runs last because it requires valid js
    .concat(opts._transforms, [brfs])
    : opts._transforms || []

  transforms.forEach(function eachTransform (transform) {
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
    assets = [resrcify, {
      dest: opts.assets.dest || ''
      , prefix: opts.assets.prefix || ''
      , retainName: opts.assets.retainName || ''
    }]

    opts._globalTransforms.push(assets)
  }

  opts._globalTransforms.forEach(function eachGlobalTransform (transform) {
    var transformOptions

    if (Array.isArray(transform)) {
      transformOptions = transform[1]
      transformOptions.global = true
      b.transform(transform[0], transformOptions)
    }
    else {
      b.transform(transform, {global: true})
    }
  })

  if (typeof opts.minify === 'object') {
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

  if (opts.common === true){
    if (opts.entries.length < 2) {
      // TODO: we should do this, but it casues tape to falsely see the error event on itself!?
      // emitter.emit('error', error)
      return void cb(new Error('the `common` option requires an `entries` option with more than one entry'))
    }

    // we need a function to generate streams
    // users can optionally provide one, else fallback to generating streamable buffers
    streamGenerator = _.isFunction(opts.streams)
                    ? opts.streams
                    : function() {
                          return new streamBuffer.WritableStreamBuffer({
                            // these values are arbitrary, but we don't want to require huge buffers
                            // start as 1 kilobytes.
                            initialSize: 1 * 1024
                            // grow by 1 kilobytes each time buffer overflows.
                            , incrementAmount: 1 * 1024
                          })
                      }
  }

  return rebundle()

  function rebundle() {
    // if we've got the common option, we want to use factor bundle
    if (opts.common === true){
      // generate the output streams
      outputs = opts.entries.reduce(function(acc, entry, ix){
        var s = streamGenerator(entry, ix)

        // sanity check
        if (_.isObject(s) && _.isFunction(s.pipe)) {
          acc.push(s)
          return acc
        } else {
          return void cb(new Error('if provided, the `streams` option must be a function that returns a stream'))
        }
      },[])

      // setup factor bundle
      b.plugin(factorBundle, {
        // passing in generated streams to receive the output
	o: outputs
      })

      // we need to wrap the callback to output an object with all the bundles
      return b.bundle(function bundledWithCommon (err, common) {
        var hasCallback = _.isFunction(cb)
          , out = {}

        if (err && hasCallback) return void cb(err)

        if (!_.isFunction(opts.streams)) {
          // turn the stream-able buffers into plain buffers
          out = opts.entries.reduce(function(acc, entry, ix) {
            var entryBuffer = outputs[ix].getContents()
              , entryName   = path.basename(entry).replace(path.extname(entry), '')
  
            // for those using the streaming interface, emit an event with the entry
            // do this here so that we don't have to itterate through the outputs twice
            emitter.emit('entry', entryBuffer, entryName)
  
            acc[entryName] = entryBuffer
            return acc
          }, {})
        }

        // add in the common bundle
        out.common = common

        if (hasCallback) cb(err, out)
      })
    }
    // if we don't need to use factor bundle, just browserify!
    else return b.bundle(cb)
  }
}

ctor.emitter = emitter
