var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , prefix = __dirname + '/fixtures/transforms/'
  , read = function (file) {
    return fs.readFileSync(prefix + file, 'utf8').replace(/[\n]$/, '')
  }

test('envify', function (t) {
  t.plan(2)

  js(prefix + 'envify-entry.js', function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.indexOf('node_modules" === \'foo\') {') > -1, 'contains compiled vars')
  })
})

test('ejsify', function (t) {
  t.plan(2)

  js(prefix + 'ejsify-entry.js', function (err, src) {
    t.error(err, 'does not error')
    t.ok(src.indexOf('buf.push(\'<h1>\', escape((1,  title )), \'</h1>\'); })();') > -1, 'contains a compiled template')
  })
})

test('hbsfy', function (t) {
  t.plan(2)

  js(prefix + 'hbsfy-entry.js', function (err, src) {
    t.error(err, 'does not error')
    t.equal(src, read('hbsfy-bundle.js'), 'compiles correctly')
  })
})

test('jadeify', function (t) {
  t.plan(2)

  js(prefix + 'jadeify-entry.js', function (err, src) {
    t.error(err, 'does not error')
    // this is more reliable than checking a whole fixture
    t.ok(
      src.indexOf('buf.push("<h1>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</h1>");}.call(this,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return buf.join("");') > -1
      , 'compile correctly'
    )
  })
})

test('partialify', function (t) {
  t.plan(2)

  js(prefix + 'partialify-entry.js', function (err, src) {
    t.error(err, 'does not error')
    t.equal(src, read('partialify-bundle.js'), 'compiles correctly')
  })
})

test('partialify-custom', function (t) {
  t.plan(2)

  js({
    entry: prefix + 'partialify-entry-custom.js'
    , transforms: [
      ['partialify', {'alsoAllow': 'xml'}]
    ]
  }, function (err, src) {
    t.error(err, 'does not error')
    t.equal(src, read('partialify-bundle-custom.js'), 'compiles correctly')
  })
})

test('brfs', function (t) {
  t.plan(2)

  js(prefix + 'brfs-entry.js', function (err, src) {
    t.error(err, 'does not error')
    t.equal(src, read('brfs-bundle.js'), 'compiles correctly')
  })
})
