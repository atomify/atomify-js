# Changelog

## 4.7.3
* upgrade browserify to v13.0.1

## 4.7.2
* fix: directly require factor-bundle. #61
* internal: fix watch test not finishing

## 4.7.1
* internal: linter cleanup

## 4.7.0
* add: Setting default watchify delay to 0
* fix: transforms not getting passed in
* internal: replace jshint and jscs with eslint

## 4.6.0
* remove reactify and replace it with babelify
* add `opts.defaultTransforms` to disable the builtin transforms

## 4.5.1
* revert to browserify v7. See #55

## 4.5.0
* Upgrade dependencies
* Add: `opts.cache` for much faster incremental builds.

## 4.4.0
* Upgrade dependencies: Browserify got a major version bump
* now testing against node 0.12 & iojs@latest

## 4.3.0
* update minifify: now outputs a buffer like it's supposed to

## 4.2.0
* upgrade browserify to v8
* upgrade several other deps

## 4.1.1
* Work around for Browserify v7.0.1 change that breaks transforms that are passed as string options instead of functions. See: https://github.com/substack/node-browserify/issues/1032
* Fixes a bug in global transforms that was a remnant of the Browserify v5 transition.

## 4.1.0
* dependency updates: Browserify v7 and reactify v0.17

## 4.0.6
* Fixed regression: require option works again.

## 4.0.5
* Fixed regression: all options are now passed to browserify (again)

## 4.0.4
* Fix sourcemaps always on

## 4.0.3
* Fixes some syntax errors not erroring out on compile

## 4.0.2
* Update reactify to 0.16.x

## 4.0.1
* Fixed watchify for updated version. There was a breaking change that sunk by us.

## 4.0.0
* upgraded deps to the latest versions
  - reactify is a breaking change b/c react introduced many breaking changes
  - hbsfy update to handlebars 2.0. [breaking changes](https://stackoverflow.com/questions/24662703/what-are-the-differences-between-the-handlebars-1-x-and-2-x-apis).
* added `npm run tdd`

## 3.0.0
* upgraded to browserify v5
  * **breaking change!** the callback now passes a buffer, not a string. Use `.toString()`
* added `opts.common` for factor-bundle support.
* added `opts.minify` for js minification!

## 2.4.0
* all tests now pass
* add travis
* add react's jsx
