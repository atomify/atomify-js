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

**opts.entry** or **opts.entries** - Path or paths that will be provided to Browserify as entry points. For convenience, you may simply provide a string or array of strings in place of the `opts` object, which will be treated as the `entry` or `entries` property, respectively. Paths will be resolved relative to `process.cwd()`.

**opts.output** - If you simply want your bundle written out to a file, provide the path in this property. Note that your `callback` will NOT be called if this property is present. Path will be resolved relative to `process.cwd()`.

**opts.debug** - Passed to Browserify to generate source maps if `true`. Also provides additional CLI output, if applicable.

**opts.watch** - If `true`, [watchify](https://github.com/substack/watchify) will be used to create a file watcher and speed up subsequent builds.

**opts.transforms** - Provide your own transforms that will be added to the defaults listed above.

**opts.globalTransforms** - Browserify global transforms that will process all files used in your application, including those within `node_modules`. You should take great care when defining global transforms as [noted in the Browserify documentation](https://github.com/substack/node-browserify#btransformopts-tr).

**opts.assets** - One of the challenges with writing truly modular code is that your templates often refer to assets that need to be accessible from your final bundle. Configuring this option solves that problem by detecting asset paths in your templates, copying them to a new location, and rewriting the references to them to use the new paths. Paths in the `src` attribute of `img`, `video`, and `audio` tags will be processed according to your configuration.

The processing is configured using two sub-properties of opts.assets: `dest` and `prefix`. The `dest` field determines the location files will be copied to, relative to `process.cwd()`, and `prefix` specifies what will be prepended to the new file names in the rewritten `src` attributes. The filenames are generated from a hash of the assets themselves, so you don't have to worry about name collisions.

To demonstrate, see the following example.

```js
// config
{
  entry: './entry.js',
  output: 'dist/bundle.js',
  ...
  assets: {
    dest: 'dist/assets',
    prefix: 'assets/'
  }
}
```

```html
<img src="some/path/to/logo.png">
```

becomes

```html
<img src="assets/4314d804f81c8510.png">
```

and a copy of logo.png will now exist at `dist/assets/4314d804f81c8510.png`

**opts.shim** - If you are using [browserify-shim](https://github.com/thlorenz/browserify-shim) 2.x, you can provide your shim config in this property. browserify-shim version 3 is configured using `package.json` and should be used if possible.

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
