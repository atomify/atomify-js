var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , path = require('path')
  , prefix = path.join(__dirname, 'fixtures', 'assets')

test('opts.assets', function (t) {
  t.plan(3)

  js({
    entry: path.join(prefix, '/entry.js')
    , assets: {
      dest: path.join(prefix, 'output', 'img')
      , prefix: 'img/'
    }
  }, function (err, src) {
    t.error(err)
    t.ok(
      src.toString().indexOf('module.exports = \'<img src="img/4314d804f81c8510.png" alt="SpatialKey logo"/>') > -1
      , 'outputs correctly'
    )
    t.ok(fs.existsSync(prefix + '/output/img/4314d804f81c8510.png'), 'file exists')
  })
})
