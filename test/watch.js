'use strict';

var test = require('tape')
  , lib = require('../index.js')
  , path = require('path')
  , fs = require('fs')
  , entryPath = path.join(__dirname, 'fixtures', 'watch')
  , outputPath = path.join(entryPath, 'output')
  , changerPath = path.join(outputPath, 'changer.js')
  , now = Date.now()
  , mkdirp = require('mkdirp')
  , setup = function setup(){
    var file = 'module.exports = ' + now

    mkdirp.sync(outputPath)
    fs.writeFileSync(changerPath, file)
  }

// watchify is completely broken on linux right now
// TODO: re-enable watch test on linux when watchify fixes itself https://github.com/substack/watchify/issues/82 https://github.com/substack/watchify/issues/73
if (process.platform === 'linux') return

test('opts.watch', function(t){
  var callbackCallCount = 0
    , callback
    , w

  setup()
  t.plan(4)

  // get the watchify instance so that we can close it an end the test
  lib.emitter.once('watchify', function assignWatchify(watchify){
    w = watchify
  })

  // callback will be called each time the changer file is changed
  callback = function callback(err, bundle){
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

      // commit a change to the file so that we trigger the callback again
      fs.writeFileSync(changerPath, changerContents2)
    }
    else {
      t.error(err, 'does not error on the second callback')

      t.ok(
        src.indexOf(changerContents2) > -1
        , 'contains the watched dep on the second callback'
      )

      // close all file handlers ← important so that tests exit
      w.close()
    }
  }

  // run the lib with watchify enabled
  // wait just a bit to ensure all the file watchers are in place
  setTimeout(function (){
    lib({watch: true, entry: path.join(entryPath, 'index.js')}, callback)
  }, 50)
})
