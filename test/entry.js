var test = require('tape')
  , js = require('../')
  , path = require('path')
  , prefix = path.join(__dirname, 'fixtures', 'entry')

test('single entry string', function (t) {
  t.plan(2)

  js(path.join(prefix, '/entry-1.js'), function (err, src) {
    t.error(err, 'should not error')
    t.ok(
      src.toString().indexOf('module.exports = \'I am dep 1\'') > -1
      , 'contains the dep'
    )
  })
})

test('opts.entry', function (t) {
  t.plan(2)

  js({entry: path.join(prefix, '/entry-1.js')}, function (err, src) {
    t.error(err, 'should not error')
    t.ok(
      src.toString().indexOf('module.exports = \'I am dep 1\'') > -1
      , 'contains the dep'
    )
  })
})

test('opts.require', function (t) {
  t.plan(2)

  js({require: {file: path.join(prefix, '/entry-1.js'), opts: {expose: 'test'}} }, function (err, src) {
    t.error(err, 'should not error')
    t.ok(
      src.toString().indexOf('module.exports = \'I am dep 1\'') > -1
      , 'contains the dep'
    )
  })

})

test('entry strings array', function (t) {
  t.plan(3)

  js([path.join(prefix, '/entry-1.js'), path.join(prefix, '/entry-2.js')], function (err, src) {
    t.error(err, 'should not error')
    t.ok(
      src.toString().indexOf('module.exports = \'I am dep 1\'') > -1
      , 'contains the dep'
    )
    t.ok(
      src.toString().indexOf('module.exports = \'I am dep 2\'') > -1
      , 'contains the second dep'
    )
  })
})

test('opts.entries', function (t) {
  t.plan(3)

  js({
    entries: [path.join(prefix, '/entry-1.js'), path.join(prefix, '/entry-2.js')]
  }, function (err, src) {
    t.error(err, 'should not error')
    t.ok(
      src.toString().indexOf('module.exports = \'I am dep 1\'') > -1
      , 'contains the dep'
    )
    t.ok(
      src.toString().indexOf('module.exports = \'I am dep 2\'') > -1
      , 'contains the second dep'
    )
  })
})
