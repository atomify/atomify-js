atomify-js
===============

Atomify your js - use js and handlebars templates from node modules on the front end.

### Description

You want to use node modules with handlebars tempaltes and inlined fs calls on the front-end. Atomify-js helps you do that.

### Method

atomify-js takes an `opts` object and a `callback`.

The `opts` object must contain an `entry` key that is the path to the entry file for atomify.

The `callback` will be called with an (optional) `error` as it's first argument and atomified `source`.

### Examples

index.js
```js
var js = require('atomify-js')

var opts = {
  entry: './entry.js'
, shim: {
    jquery: { path: './jquery.js', exports: '$' }
  }
, debug: true // default: `false`
}

js(opts, function (err, src) {
  
  // do something with the src
  
})
```

entry.js
```js
var module = require('module')
  , template = require('template.html.hbs')
  
template({param: 'param'})
```

### Install

Installing via npm is easy:

```bash
npm install atomify-js
```
