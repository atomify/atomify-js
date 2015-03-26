'use strict'

var test = require('tape')
  , lib = require('../index.js')
  , path = require('path')
  , fs = require('fs')
  , entryPath = path.join(__dirname, 'fixtures', 'cache')
  , outputPath = path.join(entryPath, 'output')
  , changerPath = path.join(outputPath, 'changer.js')
  , mkdirp = require('mkdirp')
  , cachePath = path.join(outputPath, 'cache.json')
  , setup = function setup(value){
    var file = 'module.exports = ' + value || Date.now()

    mkdirp.sync(outputPath)
    fs.writeFileSync(changerPath, file)
  }

test('opts.cache', function(t){
  var parseTime = function parseTime(logMsg){
    return parseFloat(logMsg.replace(/.*?\(([0-9\.]{1,}) seconds\)/, '$1'))
  }

  setup()

  t.plan(5)

  t.throws(
    lib.bind(null, {watch: true, cache: true})
    , 'should throw if opts.watch is also set'
  )

  lib.emitter.once('browserify', function (b){
    b.once('log', function(msg){
      var initialTime = parseTime(msg)

      t.ok(
        msg
        , 'compiles once'
      )

      b.bundle()
      b.once('log', function(msg2){
        var secondTime = parseTime(msg2)

        // wait for the second callback because some fs are slow. (linux)
        t.ok(
          fs.existsSync(cachePath)
          , 'writes the cache file'
        )

        // cleanup
        fs.unlinkSync(cachePath)

        t.ok(
          msg2
          , 'compiles a second time'
        )

        t.ok(
          secondTime <= initialTime
          , 'the second of ' + secondTime + ' compiles faster than ' + initialTime
        )
      })
    })
  })

  lib({cache: cachePath, entry: path.join(entryPath, 'index.js')})
})

test('opts.cache works with opts.common', function(t){
  var parseTime = function parseTime(logMsg){
      return parseFloat(logMsg.replace(/.*?\(([0-9\.]{1,}) seconds\)/, '$1'))
    }
    , bundleNames = ['common', 'dep-1', 'dep-2', 'index']
    , b

  setup()

  t.plan(6 + bundleNames.length)

  t.throws(
    lib.bind(null, {watch: true, cache: true})
    , 'should throw if opts.watch is also set'
  )

  lib.emitter.once('browserify', function (browserifyInstance){
    b = browserifyInstance
    b.once('log', function(msg){
      var initialTime = parseTime(msg)

      t.ok(
        msg
        , 'compiles once'
      )

      b.once('log', function(msg2){
        var secondTime = parseTime(msg2)

        // wait for the second callback because some fs are slow. (linux)
        t.ok(
          fs.existsSync(cachePath)
          , 'writes the cache file'
        )

        // cleanup
        fs.unlinkSync(cachePath)

        t.ok(
          msg2
          , 'compiles a second time'
        )

        t.ok(
          secondTime <= initialTime
          , 'the second of ' + secondTime + ' compiles faster than ' + initialTime
        )
      })
    })
  })

  lib({
    cache: cachePath
    , entries: [
      path.join(entryPath, 'index.js')
      , path.join(entryPath, '..', 'entry', 'dep-2.js')
      , path.join(entryPath, '..', 'entry', 'dep-1.js')
    ]
    , common: true
    , debug: true
    }
  , function(err, bundles){
    var bundleKeys = Object.keys(bundles)
    t.error(err, 'should not error')

    bundleNames.forEach(function ensureEachBundleExists(bundleName){
      t.ok(
        bundleKeys.indexOf(bundleName) > -1
        , 'creates the ' + bundleName + ' bundle'
      )
    })

    // trigger another bundle so that we can time the difference
    b.bundle()
  })
})
