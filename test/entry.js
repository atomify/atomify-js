var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , prefix = __dirname + '/fixtures/entry/'
  , read = function (file) {
    return fs.readFileSync(prefix + file, 'utf8').toString()
  }

test('single entry string', function (t) {
  t.plan(1)

  js(prefix + 'entry-1.js', function (err, src) {
    t.equal(src, read('bundle-single-entry.js'))
  })
})

test('opts.entry', function (t) {
  t.plan(1)

  js({entry: prefix + 'entry-1.js'}, function (err, src) {
    t.equal(src, read('bundle-single-entry.js'))
  })
})

test('entry strings array', function (t) {
  t.plan(1)

  js([prefix + 'entry-1.js', prefix + 'entry-2.js'], function (err, src) {
    t.equal(src, read('bundle-multiple-entries.js'))
  })
})

test('opts.entries', function (t) {
  t.plan(1)

  js({
    entries: [prefix + 'entry-1.js', prefix + 'entry-2.js']
  }, function (err, src) {
    t.equal(src, read('bundle-multiple-entries.js'))
  })
})
