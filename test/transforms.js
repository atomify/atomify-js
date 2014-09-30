'use strict';

var test = require('tape')
  , js = require('../')
  , prefix = __dirname + '/fixtures/transforms/'

test('envify', function (t) {
  t.plan(2)

  js(prefix + 'envify-entry.js', function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('node_modules" === \'foo\')') > -1, 'contains compiled vars')
  })
})

test('ejsify', function (t) {
  t.plan(2)

  js(prefix + 'ejsify-entry.js', function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('buf.push(\'<h1>\', escape((1,  title )), \'</h1>\'); })();') > -1, 'contains a compiled template')
  })
})

test('hbsfy', function (t) {
  t.plan(3)

  js(prefix + 'hbsfy-entry.js', function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('require("./handlebars/base");') > -1, 'adds handlebars')
    t.ok(src.toString().indexOf('buffer += "<h1>";') > -1, 'compiles correctly')
  })
})

test('jadeify', function (t) {
  t.plan(2)

  js(prefix + 'jadeify-entry.js', function (err, src) {
    t.error(err, 'does not error')
    // this is more reliable than checking a whole fixture
    t.ok(
      src.toString().indexOf('buf.push("<h1>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</h1>");}.call(this,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return buf.join("");') > -1
      , 'compiles correctly'
    )
  })
})

test('partialify', function (t) {
  t.plan(3)

  js(prefix + 'partialify-entry.js', function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('module.exports = \'<div>I am a dep</div>\'') > -1, 'adds the dep')
    t.ok(src.toString().indexOf('require(\'./partialify-dep.html\')') > -1, 'calls the dep')
  })
})

test('partialify-custom', function (t) {
  t.plan(3)

  js({
    entry: prefix + 'partialify-entry-custom.js'
    , transforms: [
      ['partialify', {'alsoAllow': 'xml'}]
    ]
  }, function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('module.exports = \'<div>I am a dep</div>\'') > -1, 'adds the dep')
    t.ok(src.toString().indexOf('require(\'./partialify-dep.xml\')') > -1, 'calls the dep')
  })
})

test('brfs', function (t) {
  t.plan(2)

  js(prefix + 'brfs-entry.js', function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('var dep = "I am a dep"') > -1, 'compiles correctly')
  })
})

test('reactify', function (t){
  t.plan(3)

  js(prefix + 'reactify-entry.jsx', function (err, src){
    t.error(err)
    t.ok(
      src.toString().indexOf('React.DOM.div(null, "hi")') > -1
      , 'compiles jsx'
    )

    t.ok(
      src.toString().indexOf('render:function(){') > -1
      , 'compiles es6'
    )
  })
})
