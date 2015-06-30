'use strict'

var test = require('tape')
  , lib = require('../index.js')
  , path = require('path')
  , fs = require('fs')
  , entryPath = path.join(__dirname, 'fixtures', 'cache')
  , outputPath = path.join(entryPath, 'output')
  , changerPath = path.join(outputPath, 'changer.js')
  , mkdirp = require('mkdirp')
  , cacheDir = path.join(outputPath, 'cache')
  , rimraf = require('rimraf')
  , setup = function setup (value) {
    var file = 'module.exports = ' + value || Date.now()

    mkdirp.sync(outputPath)
    mkdirp.sync(cacheDir)
    fs.writeFileSync(changerPath, file)
  }

test('opts.cache', function (t) {
  var startTime = Date.now()
    , runTests
    , b
  setup()

  t.plan(5)

  t.throws(
    lib.bind(null, {watch: true, cache: true})
    , 'should throw if opts.watch is also set'
  )

  lib.emitter.once('browserify', function (br) {
    b = br
  })

  runTests = function () {
    var firstBundleTime = Date.now()
      , firstBundleDuration = firstBundleTime - startTime

    t.ok(
      firstBundleDuration
      , 'compiles once'
    )

    b.bundle(function () {
      var secondBundleTime = Date.now()
        , secondBundleDuration = secondBundleTime - firstBundleTime

      // wait for 1000ms, b/c rebundler does
      setTimeout(function () {
        // wait for the second callback because some fs are slow. (linux)
        t.ok(
          fs.existsSync(cacheDir)
          , 'writes the cache file'
        )

        // cleanup
        rimraf.sync(cacheDir)
      }, 1050)

      t.ok(
        secondBundleDuration
        , 'compiles a second time'
      )

      t.ok(
        secondBundleDuration <= firstBundleDuration
        , 'the second bundle time of ' + secondBundleDuration + ' compiles faster than the initial ' + firstBundleDuration
      )
    })
  }

  lib({cache: cacheDir, entry: path.join(entryPath, 'index.js')}, runTests)
})

test('opts.cache works with opts.common', function (t) {
  var startTime = Date.now()
    , bundleNames = ['common', 'dep-1', 'dep-2', 'index']
    , runTests
    , b

  setup()

  t.plan(5 + bundleNames.length)

  t.throws(
    lib.bind(null, {watch: true, cache: true})
    , 'should throw if opts.watch is also set'
  )

  lib.emitter.once('browserify', function (browserifyInstance) {
    b = browserifyInstance
  })

  runTests = function (err, bundles) {
    var bundleKeys = Object.keys(bundles)
      , firstBundleTime = Date.now()
      , firstBundleDuration = firstBundleTime - startTime

    t.error(err, 'should not error')

    bundleNames.forEach(function ensureEachBundleExists (bundleName) {
      t.ok(
        bundleKeys.indexOf(bundleName) > -1
        , 'creates the ' + bundleName + ' bundle'
      )
    })

    t.ok(
      firstBundleTime
      , 'compiles once'
    )

    // trigger another bundle so that we can time the difference
    b.bundle(function () {
      var secondBundleTime = Date.now()
        , secondBundleDuration = secondBundleTime - firstBundleTime

      // wait for 1000ms, b/c rebundler does
      setTimeout(function () {
        // cleanup
        if (fs.existsSync(cacheDir)) rimraf.sync(cacheDir)
      }, 1020)

      t.ok(
        secondBundleDuration
        , 'compiles a second time'
      )

      t.ok(
        secondBundleDuration <= firstBundleDuration
        , 'the second bundle time of ' + secondBundleDuration + ' compiles faster than the initial ' + firstBundleDuration
      )
    })
  }

  lib({
    cache: cacheDir
    , entries: [
      path.join(entryPath, 'index.js')
      , path.join(entryPath, '..', 'entry', 'dep-2.js')
      , path.join(entryPath, '..', 'entry', 'dep-1.js')
    ]
    , common: true
    , debug: true
  }
  , runTests)
})
