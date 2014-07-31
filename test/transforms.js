var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , prefix = __dirname + '/fixtures/transforms/'
  , read = function (file) {
    return fs.readFileSync(prefix + file, 'utf8').toString()
  }

test('envify', function (t) {
  t.plan(1)

  js(prefix + 'envify-entry.js', function (err, src) {
    t.equal(src, read('envify-bundle.js'))
  })
})

test('ejsify', function (t) {
  t.plan(1)

  js(prefix + 'ejsify-entry.js', function (err, src) {
    t.equal(src, read('ejsify-bundle.js'))
  })
})

test('hbsfy', function (t) {
  t.plan(1)

  js(prefix + 'hbsfy-entry.js', function (err, src) {
    t.equal(src, read('hbsfy-bundle.js'))
  })
})

test('jadeify', function (t) {
  t.plan(1)

  js(prefix + 'jadeify-entry.js', function (err, src) {
    t.equal(src, read('jadeify-bundle.js'))
  })
})

test('partialify', function (t) {
  t.plan(1)

  js(prefix + 'partialify-entry.js', function (err, src) {
    t.equal(src, read('partialify-bundle.js'))
  })
})

test('partialify-custom', function (t) {
  t.plan(1)

  js({
    entry: prefix + 'partialify-entry-custom.js'
    , transforms: [
      ['partialify', {'alsoAllow': 'xml'}]
    ]
  }, function (err, src) {
    t.equal(src, read('partialify-bundle-custom.js'))
  })
})

test('brfs', function (t) {
  t.plan(1)

  js(prefix + 'brfs-entry.js', function (err, src) {
    t.equal(src, read('brfs-bundle.js'))
  })
})
