var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , prefix = __dirname + '/fixtures/entry/'
  , read = function (file) {
    return fs.readFileSync(prefix + file, 'utf8')
  }

test('single entry string', function (t) {
  t.plan(1)

  js(prefix + 'entry-1.js', function (err, src) {
    t.equal(read('bundle-single-entry.js'), src)
  })
})

test('opts.entry', function (t) {
  t.plan(1)

  js({entry: prefix + 'entry-1.js'}, function (err, src) {
    t.equal(read('bundle-single-entry.js'), src)
  })
})

test('entry strings array', function (t) {
  t.plan(1)

  js([prefix + 'entry-1.js', prefix + 'entry-2.js'], function (err, src) {
    t.equal(read('bundle-multiple-entries.js'), src)
  })
})

test('opts.entries', function (t) {
  t.plan(1)

  js({
    entries: [prefix + 'entry-1.js', prefix + 'entry-2.js']
  }, function (err, src) {
    t.equal(read('bundle-multiple-entries.js'), src)
  })
})
