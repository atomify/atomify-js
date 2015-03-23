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
