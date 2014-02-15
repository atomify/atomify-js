var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , prefix = __dirname + '/fixtures/transforms/'
  , read = function (file) {
    return fs.readFileSync(prefix + file, 'utf8')
  }

test('envify', function (t) {
  t.plan(1)

  js(prefix + 'envify-entry.js', function (err, src) {
    t.equal(read('envify-bundle.js'), src)
  })
})

test('ejsify', function (t) {
  t.plan(1)

  js(prefix + 'ejsify-entry.js', function (err, src) {
    t.equal(read('ejsify-bundle.js'), src)
  })
})

test('hbsfy', function (t) {
  t.plan(1)

  js(prefix + 'hbsfy-entry.js', function (err, src) {
    t.equal(read('hbsfy-bundle.js'), src)
  })
})

test('jadeify', function (t) {
  t.plan(1)

  js(prefix + 'jadeify-entry.js', function (err, src) {
    t.equal(read('jadeify-bundle.js'), src)
  })
})

test('partialify', function (t) {
  t.plan(1)

  js(prefix + 'partialify-entry.js', function (err, src) {
    t.equal(read('partialify-bundle.js'), src)
  })
})

test('brfs', function (t) {
  t.plan(1)

  js(prefix + 'brfs-entry.js', function (err, src) {
    t.equal(read('brfs-bundle.js'), src)
  })
})
