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

test('providing output property and callback writes file and calls callback', function (t) {
  t.plan(2)

  var cfg = {
      entry: prefix + 'entry.js'
      , output: prefix + 'bundle-output-property.js'
    }

  if (fs.existsSync(cfg.output)) fs.unlinkSync(cfg.output)

  js(cfg, function (err, src) {
    t.ok(fs.existsSync(cfg.output))
    t.equal(src, read('bundle-output-property.js'))
  })
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

test('output to non-existent directory', function (t) {
  t.plan(1)

  var file = 'new-dir/' + 'bundle-output-new-dir.js'

  if (fs.existsSync(prefix + file)) fs.unlinkSync(prefix + file)

  js(prefix + 'entry.js', prefix + file)

  setTimeout(function () {
    t.equal(read(file), read('bundle.js'))
  }, 100)
})
