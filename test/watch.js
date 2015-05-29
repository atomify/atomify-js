'use strict'

var test = require('tape')
  , lib = require('../index.js')
  , path = require('path')
  , fs = require('fs')
  , entryPath = path.join(__dirname, 'fixtures', 'watch')
  , outputPath = path.join(entryPath, 'output')
  , changerPath = path.join(outputPath, 'changer.js')
  , now = Date.now()
  , mkdirp = require('mkdirp')
  , setup = function setup () {
    var file = 'module.exports = ' + now

    mkdirp.sync(outputPath)
    fs.writeFileSync(changerPath, file)
  }

test('opts.watch', function (t) {
  var callbackCallCount = 0
    , callback
    , w

  setup()

  // get the watchify instance so that we can close it an end the test
  lib.emitter.once('watchify', function assignWatchify (watchify) {
    w = watchify
  })

  // callback will be called each time the changer file is changed
  callback = function callback (err, bundle) {
    var src = bundle.toString()
      , changerContents2 = 'module.exports = changed'

    callbackCallCount++

    // first call only
    if (callbackCallCount === 1){
      t.error(err, 'does not error on initial callback')

      t.ok(
        src.indexOf(now) > -1
        , 'contains the watched dep on inital callback'
      )

      // wait for a bit to write the file because watchify has a delay
      setTimeout(function () {
        // commit a change to the file so that we trigger the callback again
        fs.writeFile(changerPath, changerContents2)
      }, 800)
    }
    else {
      // close all file handlers ← important so that tests exit
      w.close()

      t.error(err, 'does not error on the second callback')

      t.ok(
        src.indexOf(changerContents2) > -1
        , 'contains the watched dep on the second callback'
      )

      // hack around this test never ending… not really sure why that happens
      t.end()
      process.exit(0)
    }
  }

  // run the lib with watchify enabled
  // wait just a bit to ensure all the file watchers are in place
  setTimeout(function () {
    lib({watch: true, entry: path.join(entryPath, 'index.js')}, callback)
  }, 50)
})
