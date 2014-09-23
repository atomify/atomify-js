var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , path = require('path')
  , prefix = __dirname + '/fixtures/assets/'
  , read = function (file) {
    return fs.readFileSync(prefix + file, 'utf8')
  }

test('package emission', function (t) {
  t.plan(2)
  var ext = '.js'
  js.emitter.on('package', function(pkg){
    t.equal( path.join(prefix, 'entry' + ext), pkg )
    ext = '.html'
  })
  js({ entry: prefix + 'entry.js' });
})
