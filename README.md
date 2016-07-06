WDIO Cucumber [![Build Status](https://travis-ci.org/webdriverio/wdio-cucumber-framework.svg?branch=master)](https://travis-ci.org/webdriverio/wdio-cucumber-framework) [![Code Climate](https://codeclimate.com/github/webdriverio/wdio-cucumber-framework/badges/gpa.svg)](https://codeclimate.com/github/webdriverio/wdio-cucumber-framework) [![Test Coverage](https://codeclimate.com/github/webdriverio/wdio-cucumber-framework/badges/coverage.svg)](https://codeclimate.com/github/webdriverio/wdio-cucumber-framework/coverage)
==========

> A WebdriverIO plugin. Adapter for CucumberJS testing framework.

## Installation

The easiest way is to keep `wdio-cucumber-framework` as a devDependency in your `package.json`.

```json
{
  "devDependencies": {
    "wdio-cucumber-framework": "~0.2.0"
  }
}
```

You can simple do it by:

```bash
npm install wdio-cucumber-framework --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here.](http://webdriver.io/guide/getstarted/install.html)

### Install Cucumber

Note that `cucumber` is defined as a peer dependency so make sure it is installed in your project as well.

```json
{
  "devDependencies": {
    "cucumber": "~1.2.0"
  }
}
```

You can simply do it by:

```bash
npm install cucumber --save-dev
```

## Configuration

Following code shows the default wdio test runner configuration...

```js
// wdio.conf.js
module.exports = {
  // ...
  framework: 'cucumber'
  cucumberOpts: {
    timeout: 10000
  }
  // ...
};
```

## `cucumberOpts` Options

### backtrace
Show full backtrace for errors.

Type: `Boolean`<br>
Default: `false`

### compiler
Require files with the given EXTENSION after requiring MODULE.

Type: `String[]`<br>
Default: `*[]*`<br>
Example: `['js:babel-core/register']`

### dryRun
Invoke formatters without executing steps.

Type: `Boolean`<br>
Default: `false`

### failFast
Abort the run on first failure.

Type: `Boolean`<br>
Default: `false`

### format
Specify the output format, optionally supply PATH to redirect formatter output (repeatable).

Type: `String[]`<br>
Default: `['pretty']`

### name
Only execute the scenarios with name matching the expression (repeatable).

Type: `REGEXP[]`<br>
Default: `[]`

### colors
If false it disables colors in formatter output.

Type: `Boolean`<br>
Default: `true`

### snippets
Hide step definition snippets for pending steps.

Type: `Boolean`<br>
Default: `true`

### source
Hide source uris.

Type: `Boolean`<br>
Default: `true`

### profile
Specify the profile to use.

Type: `String[]`<br>
Default: `[]`

### require
Require files/dir before executing features.

Type: `String[]`<br>
Default: `[]`

### snippetSyntax
Specify a custom snippet syntax.

Type: `String`<br>
Default: `undefined`

### strict
Fail if there are any undefined or pending steps

Type: `Boolean`<br>
Default: `false`

### tags
Only execute the features or scenarios with tags matching the expression.

Type: `String[]`<br>
Default: `[]`

### timeout
Timeout for step definitions.

Type: `Number`<br>
Default: `30000`

----

For more information on WebdriverIO see the [homepage](http://webdriver.io).
