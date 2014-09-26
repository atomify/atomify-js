var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , path = require('path')
  , prefix = __dirname + '/fixtures/assets/'
  , read = function (file) {
    return fs.readFileSync(prefix + file, 'utf8')
  }

test('package emission', function (t) {
  t.plan(1)

  js.emitter.once('package', function(pkg){
    t.equal( path.join(prefix, 'entry.js'), pkg )
  })

  js({ entry: prefix + 'entry.js' });
})
