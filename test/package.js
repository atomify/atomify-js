var test = require('tape')
  , js = require('../')
  , path = require('path')
  , prefix = path.join(__dirname, 'fixtures', 'assets')

test('package emission', function (t) {
  t.plan(1)

  js.emitter.once('package', function(pkg){
    t.equal( prefix, pkg.__dirname)
  })

  js({ entry: path.join(prefix, '/entry.js') });
})
