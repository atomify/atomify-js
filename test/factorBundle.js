'use strict';

var test = require('tape')
  , js = require('../')
  , path = require('path')
  , streamBuffer = require('stream-buffers')
  , prefix = path.join(__dirname, 'fixtures', 'entry/')
  , dep1 = require('./fixtures/entry/dep-1.js')
  , dep2 = require('./fixtures/entry/dep-2.js')
  , depCommon = require('./fixtures/entry/dep-common.js')

test('opts.common: calls back with the common bundle', function (t){
  js({
      entries: [
        path.join(prefix, 'entry-1.js')
        , path.join(prefix, 'entry-2.js')
      ]
      , common: true
    }
    , function (err, codes) {
      t.error(err)

      t.equal(
        typeof codes
        , 'object'
        , 'calls back with an object'
      )

      // the first dep
      t.ok(
        codes['entry-1'].toString().indexOf(dep1) > -1
        , 'entry-1 contains dep 1'
      )
      t.ok(
        codes['entry-1'].toString().indexOf(dep2) < 0
        , 'entry-1 does not contain dep 2'
      )
      t.ok(
        codes['entry-1'].toString().indexOf(depCommon) < 0
        , 'entry-1 does not contain the common dep'
      )

      // the second dep
      t.ok(
        codes['entry-2'].toString().indexOf(dep2) > -1
        , 'entry-2 contains dep 2'
      )
      t.ok(
        codes['entry-2'].toString().indexOf(dep1) < 0
        , 'entry-1 does not contain dep 1'
      )
      t.ok(
        codes['entry-2'].toString().indexOf(depCommon) < 0
        , 'entry-2 does not contain the common dep'
      )

      // the common dep
      t.ok(
        codes.common.toString().indexOf(dep1) < 0
        , 'common does not contain dep 1'
      )
      t.ok(
        codes.common.toString().indexOf(dep2) < 0
        , 'common does not contain dep 2'
      )
      t.ok(
        codes.common.toString().indexOf(depCommon) > -1
        , 'common contains the common dep'
      )

      t.end()
  })
})

test('opts.common: pipes the common bundle', function (t){
  t.plan(9)

  var commonStreamBuffer = new streamBuffer.WritableStreamBuffer()

  js({
    entries: [
      path.join(prefix, 'entry-1.js')
      , path.join(prefix, 'entry-2.js')
    ]
    , common: true
  })
    .on('end', function (){
      var common = commonStreamBuffer.getContents().toString()
      // the common dep
      t.ok(
        common.indexOf(dep1) < 0
        , 'common does not contain dep 1'
      )
      t.ok(
        common.indexOf(dep2) < 0
        , 'common does not contain dep 2'
      )
      t.ok(
        common.indexOf(depCommon) > -1
        , 'common contains the common dep'
      )
    })
    .pipe(commonStreamBuffer)

  js.emitter.on('entry', function (content, entry){
    if (entry === 'entry-1'){
      // the first dep
      t.ok(
        content.toString().indexOf(dep1) > -1
        , 'entry-1 contains dep 1'
      )
      t.ok(
        content.toString().indexOf(dep2) < 0
        , 'entry-1 does not contain dep 2'
      )
      t.ok(
        content.toString().indexOf(depCommon) < 0
        , 'entry-1 does not contain the common dep'
      )
    }
    else if (entry === 'entry-2'){
      // the second dep
      t.ok(
        content.toString().indexOf(dep2) > -1
        , 'entry-2 contains dep 2'
      )
      t.ok(
        content.toString().indexOf(dep1) < 0
        , 'entry-1 does not contain dep 1'
      )
      t.ok(
        content.toString().indexOf(depCommon) < 0
        , 'entry-2 does not contain the common dep'
      )
    }
  })
})

test('opts.common: passing the common option without entries', function (t){
  t.plan(1)

  js({
    common: true
    , entry: path.join(prefix, 'entry-1.js')
  }, function (err){
    t.ok(
      err instanceof Error
      , 'callsback with an error'
    )
  })

  // TODO: we should do this, but it casues tape to falsely see the error event on itself!?
  // js.emitter.on('error', function (err){
  //   t.ok(err, 'calls the error event')
  // })

})

test('streaming')

