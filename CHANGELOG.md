# Changelog

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
