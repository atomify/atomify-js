var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , prefix = __dirname + '/fixtures/minify/'
  , read = function (file) {
    return fs.readFileSync(prefix + file, 'utf8')
  }

test('minify with callback', function (t) {
  t.plan(2)

  js({entries: [prefix + 'entry.js'], minify: 'minify-bundle.map.json'}, function (err, src, map) {
    t.equal(src, read('minify-bundle.js'))
    t.equal(map, read('minify-bundle.map.json'))
  })
})
