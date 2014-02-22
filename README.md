atomify-js
===============

Atomic JavaScript - Reusable front-end modules using Browserify, transforms, and templates

## Description

atomify-js is a tool that makes it easy to create small, atomic modules of client-side code. It provides support for several templating libraries and Browserify transforms out of the box while allowing for ample customization. It also provides several convenience features to make working with Browserify even easier.

### Default transforms and template support
 * [envify](https://github.com/hughsk/envify) - Replace Node-style environment variables with plain strings
 * [ejsify](https://github.com/hughsk/ejsify) - Provides support for [EJS](https://github.com/visionmedia/ejs) templates
 * [hbsfy](https://github.com/epeli/node-hbsfy) - Provides support for [Handlebars](http://handlebarsjs.com/) templates
 * [jadeify](https://github.com/domenic/jadeify) - Provides support for [Jade](http://jade-lang.com/) templates
 * [partialify](https://github.com/bclinkinbeard/partialify) - Useful for templating with regular HTML files e.g. [Angular](http://angularjs.org/)
 * [brfs](https://github.com/substack/brfs) - fs.readFileSync() static asset inliner

## API

In its default form, atomify-js takes an `opts` object and a `callback` function.

### opts 

**opts.entry** or **opts.entries** - Path or paths that will be provided to Browserify as entry points. For convenience, you may simply provide a string or array of strings, which will be treated as the `entry` or `entries` property, respectively. Paths will be resolved relative to `process.cwd()`.

**opts.debug** - Passed to Browserify to generate source maps if `true`. Also provides additional CLI output, if applicable.

**opts.watch** - If `true`, [watchify](https://github.com/substack/watchify) will be used to create a file watcher and speed up subsequent builds.

**opts.transforms** - Provide your own transforms that will be added to the defaults listed above.

**opts.shim** - If you are using [browserify-shim](https://github.com/thlorenz/browserify-shim) 2.x, you can provide your shim config in this property. browserify-shim version 3 is configured using `package.json` and should be used if possible.

**opts.output** - If you simply want your bundle written out to a file, provide the path in this property. Note that your `callback` will NOT be called if this property is present. Path will be resolved relative to `process.cwd()`.

You may also provide any valid [browserify bundle options](https://github.com/substack/node-browserify#bbundleopts-cb) in the `opts` object as well.

### callback

Standard Browserify bundle callback with `cb(err, src)` signature. Not called if `opts.output` is specifed. If `callback` is provided as a string rather than function reference it will be used as the `opts.output` file path.

## Examples

```js
// entry.js
var thing = require('thing')
  , template = require('./template.html.hbs')
  
template({param: 'param'})
```

```js
// build.js
var js = require('atomify-js')

var opts = {
  entry: './entry.js'
, debug: true // default: `false`
}

js(opts, function (err, src) {
  // do something with the src
})
```

OR

```js
var js = require('atomify-js')

js('./entry.js', './bundle.js')
```

## Install

```bash
npm install atomify-js
```
