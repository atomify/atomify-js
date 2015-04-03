atomify-js
===============

[![Build Status](https://travis-ci.org/atomify/atomify-js.svg)](https://travis-ci.org/atomify/atomify-js)

[![Dependencies Up-to-date](https://david-dm.org/atomify/atomify-js.png)](https://david-dm.org/atomify/atomify-js)

Atomic JavaScript - Reusable front-end modules using Browserify, transforms, and templates

## Description

atomify-js is a tool that makes it easy to create small, atomic modules of client-side code. It provides support for several templating libraries and Browserify transforms out of the box while allowing for ample customization. It also provides several convenience features to make working with Browserify even easier.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Install](#install)
- [Default transforms and template support](#default-transforms-and-template-support)
- [API](#api)
  - [Options](#options)
    - [opts.entry or opts.entries](#optsentry-or-optsentries)
    - [opts.common](#optscommon)
    - [opts.output](#optsoutput)
    - [opts.debug](#optsdebug)
    - [opts.minify](#optsminify)
    - [opts.watch](#optswatch)
    - [opts.cache](#optscache)
    - [opts.transforms](#optstransforms)
    - [opts.globalTransforms](#optsglobaltransforms)
    - [opts.require](#optsrequire)
    - [opts.external](#optsexternal)
    - [opts.assets](#optsassets)
  - [Callback](#callback)
  - [Events](#events)
    - [browserify `(<browserifyInstance> bundle)`](#browserify-browserifyinstance-bundle)
    - [watchify `(<watchifyInstance> bundle)`](#watchify-watchifyinstance-bundle)
    - [changed `(<String> id)`](#changed-string-id)
    - [bundle `(<Number> time)`](#bundle-number-time)
    - [package `(<Object> package)`](#package-object-package)
    - [entry `(<Buffer> entryBuffer, <String> entryName)`](#entry-buffer-entrybuffer-string-entryname)
- [Examples](#examples)
- [Developing](#developing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
npm install atomify-js
```

## Default transforms and template support
 * [envify](https://github.com/hughsk/envify) - Replace Node-style environment variables with plain strings
 * [ejsify](https://github.com/hughsk/ejsify) - Provides support for [EJS](https://github.com/visionmedia/ejs) templates
 * [hbsfy](https://github.com/epeli/node-hbsfy) - Provides support for [Handlebars](http://handlebarsjs.com/) templates
 * [jadeify](https://github.com/domenic/jadeify) - Provides support for [Jade](http://jade-lang.com/) templates
 * [partialify](https://github.com/bclinkinbeard/partialify) - Useful for templating with regular HTML files e.g. [Angular](http://angularjs.org/)
 * [brfs](https://github.com/substack/brfs) - `fs.readFileSync()` static asset inliner
 * [reactify](https://github.com/andreypopp/reactify) [React's JSX](https://facebook.github.io/react/) support, with limited es6 functionality in `.jsx` files.

## API

In its default form, atomify-js takes an `opts` object and a `callback` function.

### Options

#### opts.entry or opts.entries
Path or paths that will be provided to Browserify as entry points. For convenience, you may simply provide a string or array of strings in place of the `opts` object, which will be treated as the `entry` or `entries` property, respectively. Paths will be resolved relative to `process.cwd()`.

#### opts.common
If you have multiple entries, you can set this to `true` to enable [factor-bundle](https://github.com/substack/factor-bundle), which will take the common dependencies of all entries and move them to a common bundle. If you use this option, the api changes a little bit.

If using a callback, you're passed an object that with keys of each entry file and values of the compiled JS file. You'll also have a `common` key.

```js
var js = require('atomify-js')
  , path = require('path')

js({
  entries [path.join(__dirname, 'entry1.js'), path.join(__dirname, 'entry2.js')]
  , common: true
  }, function(err, entries){
    console.log(entries['entry1'].toString())
    console.log(entries['entry2'].toString())
    console.log(entries['common'].toString())
  })
```

If piping the response, you'll be pipped the common bundle. You'll need to listen to the `'entry'` event to get the compiled entry files.

```js
var js = require('atomify-js')
  , path = require('path')

js({
  entries [path.join(__dirname, 'entry1.js'), path.join(__dirname, 'entry2.js')]
  , common: true
}).pipe(commonStream)

js.emitter.on('entry', function(content, bundleName){
  console.log(bundleName, content.toString())
})
```

#### opts.output
If you simply want your bundle written out to a file, provide the path in this property. Path will be resolved relative to `process.cwd()`.

#### opts.debug
Passed to Browserify to generate source maps if `true`. Also provides additional CLI output, if applicable.

#### opts.minify
If `true`, minifies source code and sets debug to true. If object, passed as options to [minifyify](https://github.com/ben-ng/minifyify) and sets debug to true. If `false`, no minification.

#### opts.watch
If `true`, [watchify](https://github.com/substack/watchify) will be used to create a file watcher and speed up subsequent builds.

#### opts.cache
If truthy, will use [browserify-incremental](https://github.com/jsdf/browserify-incremental) to cache the result of a build. This can give you dramatically faster build times if you're not using `opts.watch`.

If `opts.cache` is a string, it will be used as the file path to save the cache file to.

_NOTE_: `opts.cache` and `opts.watch` are incompatible. An error will be thrown if you set both.

#### opts.transforms
Provide your own transforms that will be added to the defaults listed above.

#### opts.defaultTransforms
If set to `false`, the default list of transforms will not be run. This is useful if you'd like to customize a default transform, or simply don't need them to run.

#### opts.globalTransforms
Browserify global transforms that will process all files used in your application, including those within `node_modules`. You should take great care when defining global transforms as [noted in the Browserify documentation](https://github.com/substack/node-browserify#btransformopts-tr).

#### opts.require
Array of files to pass to Browserify's `require` method.

#### opts.external
Array of files to pass to Browserify's `external` method.

#### opts.assets
One of the challenges with writing truly modular code is that your templates often refer to assets that need to be accessible from your final bundle. Configuring this option solves that problem by detecting asset paths in your templates, copying them to a new location, and rewriting the references to them to use the new paths. Paths in the `src` attribute of `img`, `video`, and `audio` tags will be processed according to your configuration.

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

You may also provide any valid [browserify bundle options](https://github.com/substack/node-browserify#bbundleopts-cb) in the `opts` object as well, and they will be passed directly to Browserify.

### Callback

Standard Browserify bundle callback with `cb(err, src)` signature. Not called if `opts.output` is specifed. If `callback` is provided as a string rather than function reference it will be used as the `opts.output` file path.

If `opts.watch` is truthy, the callback will be called on every file change

### Events

The `emitter` property will emit events.

```js
var js = require('atomify-js')

js('./entry.js', './bundle.js')

js.emitter.on('browserify', function setBrowserifyInstance(b){
  console.log(b)
})
```

#### browserify `(<browserifyInstance> bundle)`
When the browserify instance is created, emits it. This might be useful to you, but it's really just for testing.

#### watchify `(<watchifyInstance> bundle)`
When the watchify instance is created, emits it. This might be useful to you, but it's really just for testing.

#### changed `(<String> id)`
Emitted when watchify detects a file change. Passes the bundle id that changed.

#### bundle `(<Number> time)`
If `opts.watch` is truthy, this is emitted when the bundle changes. `time` is the re-compilation time.

#### package `(<Object> package)`
Proxies the package event from browserify.

#### entry `(<Buffer> entryBuffer, <String> entryName)`
If `opts.common` is truthy, this will be emitted when an entry file is bundled. `entryBundle` is the contents of the entry file in buffer form. `entryName` is the file name of the original entry file.

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

## Developing
Tests can be run with `npm test`. You can run the tests on every file change with `npm run tdd`.
