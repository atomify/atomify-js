var test = require('tape')
  , js = require('../')
  , fs = require('fs')
  , path = require('path')
  , prefix = path.join(__dirname, 'fixtures', 'output')
  , read = function (file) {
    return fs.readFileSync(path.join(prefix, '/' + file), 'utf8')
  }

test('basic with output string', function (t) {
  t.plan(1)

  var file = 'bundle-output-string.js'

  js(path.join(prefix, '/entry.js'), path.join(prefix, '/' + file))
    .on('end', function (){
      t.ok(
        read(file).indexOf('module.exports = \'I am a dep\'') > -1
        , 'outputs correctly'
      )
    })
})

test('basic with output property', function (t) {
  t.plan(2)

  var file = 'bundle-output-property.js'

  js({entry: path.join(prefix, '/entry.js'), output: path.join(prefix, '/' + file)}, function (err){
    t.error(err, 'should not error')
    t.ok(
      read(file).indexOf('module.exports = \'I am a dep\'') > -1
      , 'outputs correctly'
    )
  })
})

test('providing output property and callback', function (t) {
  t.plan(3)

  var cfg = {
      entry: path.join(prefix, '/entry.js')
      , output: path.join(prefix, 'bundle-output-property.js')
    }

  if (fs.existsSync(cfg.output)) fs.unlinkSync(cfg.output)

  js(cfg, function (err, src) {
    t.error(err, 'should not error')
    t.ok(fs.existsSync(cfg.output), 'writes the file')
    t.ok(
      src.toString().indexOf('module.exports = \'I am a dep\'') > -1
      , 'calls the callback with the output'
    )
  })
})

test('callback', function (t) {
  t.plan(2)

  js(path.join(prefix, '/entry.js'), function (err, src) {
    t.error(err, 'should not error')
    t.ok(
      src.toString().indexOf('module.exports = \'I am a dep\'') > -1
      , 'compiles correctly'
    )
  })
})

test('output to non-existent directory', function (t) {
  t.plan(2)

  var file = path.join('/new-dir', '/bundle-output-new-dir.js')
    , filepath = path.join(prefix, file)

  if (fs.existsSync(filepath))
    fs.unlinkSync(filepath)

  js({
    entry: path.join(prefix, '/entry.js'),
    output: path.join(prefix, file)
  }, function (err){
    t.error(err, 'should not error')
    t.ok(
      read(file).indexOf('module.exports = \'I am a dep\'') > -1
      , 'compiles correctly'
    )
  })
})
