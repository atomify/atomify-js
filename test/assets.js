var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , prefix = __dirname + '/fixtures/assets/'
  , read = function (file) {
    return fs.readFileSync(prefix + file, 'utf8').replace(/[\n]$/, '')
  }

test('opts.assets', function (t) {
  t.plan(2)

  js({
    entry: prefix + 'entry.js'
    , assets: {
      dest: prefix + '/output/img'
      , prefix: 'img/'
    }
  }, function (err, src) {
    t.equal(src, read('output/bundle.js'))
    t.ok(fs.existsSync(prefix + '/output/img/4314d804f81c8510.png'), 'file exists')
  })
})
