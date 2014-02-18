var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , prefix = __dirname + '/fixtures/output/'
  , read = function (file) {
    return fs.readFileSync(prefix + file, 'utf8')
  }

test('basic with output string', function (t) {
  t.plan(1)

  var file = 'bundle-output-string.js'

  js(prefix + 'entry.js', prefix + file)

  setTimeout(function () {
    t.equal(read(file), read('bundle.js'))
  }, 100)
})

test('basic with output property', function (t) {
  t.plan(1)

  var file = 'bundle-output-property.js'

  js({entry: prefix + 'entry.js', output: prefix + file})

  setTimeout(function () {
    t.equal(read(file), read('bundle.js'))
  }, 100)
})

test('output property prevents callback running', function (t) {
  t.plan(1)

  var file = 'bundle-output-property.js'
    , cb = false

  js({
    entry: prefix + 'entry.js'
    , output: prefix + file
  }, function (err, src) {
    cb = true
  })

  setTimeout(function () {
    t.false(cb)
  }, 100)
})

test('callback', function (t) {
  t.plan(2)

  var cb = false

  js(prefix + 'entry.js', function (err, src) {
    t.equal(src, read('bundle.js'))
    cb = true
  })

  setTimeout(function () {
    t.true(cb)
  }, 100)
})