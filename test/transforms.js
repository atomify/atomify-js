'use strict'

var test = require('tape')
  , js = require('../')
  , path = require('path')
  , prefix = path.join(__dirname, 'fixtures', 'transforms')

test('envify', function (t) {
  t.plan(2)

  js(path.join(prefix, 'envify-entry.js'), function (err, src) {
    t.error(err, 'does not error')

    // on some systems (linux), envify fails as per https://github.com/hughsk/envify#purging-processenv
    // ensure that the shim is added instead, this is really hacky, and not a
    // good test. TODO: figure out why linux is special
    t.ok(
      src.toString().indexOf('node_modules\' === \'foo\')') > -1
      || src.toString().indexOf('// shim for using process in browser') > -1
      , 'contains compiled vars or the process shim'
    )
  })
})

test('ejsify', function (t) {
  t.plan(2)

  js(path.join(prefix, 'ejsify-entry.js'), function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('buf.push(\'<h1>\', escape((1,  title )), \'</h1>\'); })();') > -1, 'contains a compiled template')
  })
})

test('hbsfy', function (t) {
  t.plan(3)

  js(path.join(prefix, 'hbsfy-entry.js'), function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('require("./handlebars/base");') > -1, 'adds handlebars')
    t.ok(src.toString().indexOf('return "<h1>"\n') > -1, 'compiles correctly')
  })
})

test('jadeify', function (t) {
  t.plan(2)

  js(path.join(prefix, 'jadeify-entry.js'), function (err, src) {
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

  js(path.join(prefix, 'partialify-entry.js'), function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('module.exports = \'<div>I am a dep</div>\'') > -1, 'adds the dep')
    t.ok(src.toString().indexOf('require(\'./partialify-dep.html\')') > -1, 'calls the dep')
  })
})

test('partialify-custom', function (t) {
  t.plan(3)

  js({
    entry: path.join(prefix, 'partialify-entry-custom.js')
    , transforms: [
      [require('partialify'), {'alsoAllow': 'xml'}]
    ]
  }, function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('module.exports = \'<div>I am a dep</div>\'') > -1, 'adds the dep')
    t.ok(src.toString().indexOf('require(\'./partialify-dep.xml\')') > -1, 'calls the dep')
  })
})

test('brfs', function (t) {
  t.plan(2)

  js(path.join(prefix, 'brfs-entry.js'), function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.toString().indexOf('var dep = "I am a dep"') > -1, 'compiles correctly')
  })
})

test('babelify', function (t){
  t.plan(3)

  js(path.join(prefix, 'babelify-entry.jsx'), function (err, src){
    t.error(err)
    t.ok(
      src.toString().indexOf('React.createElement(') > -1
      , 'compiles jsx'
    )

    t.ok(
      src.toString().indexOf('var a') > -1
      , 'compiles es6'
    )
  })
})

test('opts.defaultTransforms === false', function noDefaultTransforms (t){
  t.plan(1)

  js({entry: path.join(prefix, 'hbsfy-entry.js'), defaultTransforms: false}, function (err) {
    t.ok(err.message.indexOf('Unexpected token') > -1, 'errors when requiring a file that requires a default transform')
  })

})
