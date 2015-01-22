var test = require('tape')
  , js = require('../')
  , path = require('path')
  , prefix = path.join(__dirname, 'fixtures', 'minify')

test('minifies code', function (t) {
  t.plan(4)

  js({entries: [path.join(prefix, '/entry.js')], minify: {map: 'app.map.json'}}, function (err, src, map) {
    t.error(err, 'should not error')
    t.ok(map, 'there should be a map')
    t.ok(src.toString().indexOf('should keep') > -1, 'is correct')
    t.ok(src.toString().indexOf('should not keep') < 0, 'removed dead code')
  })
})
