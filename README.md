# webpack-jasmine-html-runner-plugin

> *interactive in-browser testing* with webpack and Jasmine

This webpack plugin helps to use  [webpack](http://webpack.github.io/) and the [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html) for loading and running in-browser [Jasmine 2](http://jasmine.github.io/2.4/introduction.html) tests.

It generates an `spec-runner.html` webpack entry for each of your JavaScript spec-files, specified by a pattern. It uses [sourcemapped-stacktrace](https://github.com/novocaine/sourcemapped-stacktrace) to fix stack traces in the Jasmine HTML reporter so that reported bundle locations (file, line, column) are replaced with their actual source location.


## Installation

First make sure that `webpack` and `webpack-dev-server` are installed and configured for your project.
Make sure that Jasmine 2 is installed in your project, and that your spec-tests use the Jasmine APIs (`describe`, `beforeEach`, etc.) as global functions.

```console
npm install --save-dev webpack-jasmine-html-runner-plugin
```


## Usage

Create a webpack configuration for your tests, e.g. `webpack.spec.config.js`:

```js
const webpack = require( 'webpack' );
const WebpackJasmineHtmlRunnerPlugin = require(
   'webpack-jasmine-html-runner-plugin'
);

// Alternatively, `require` your base `webpack.config.js`
// to add your custom loaders, modules, etc.
const config = {};

// In this example, your spec-runners are named
// e.g. 'lib/some-module/spec/spec-runner.js'.
// Pass more string arguments to process additional files.
config.entry = WebpackJasmineHtmlRunnerPlugin.entry(
   './lib/**/spec/spec-runner.js'
);
config.output = {
   path: './spec-output',
   publicPath: '/spec-output/',
   filename: '[name].bundle.js'
};

config.plugins = [
   new webpack.SourceMapDevToolPlugin( {
      filename: '[name].bundle.js.map'
   } ),
   new WebpackJasmineHtmlRunnerPlugin( {
      fixupScripts: []
   } )
];

module.exports = config;
```

Now, run webpack and the webpack-dev-server:

```console
webpack --config webpack.spec.config.js
webpack-dev-server --inline --config webpack.spec.config.js
```

You may skip the first step (running `webpack`), but doing so allows you to conveniently browse through a file listing in your web browser, in order to navigate to your spec-tests.

When the webpack dev server has finished setting up, you can visit your spec-tests under [localhost:8080/webpack-dev-server/spec-output/](http://localhost:8080/webpack-dev-server/spec-output/) (append `lib/some-module/spec/spec-runner.html` to view the test for `some-module` from above).


## Options

There are some options to customize the behavior of the plugins. You can pass them as an object argument to the plugin constructor.


### `includePaths` (default: `[]`)

#### Loading user-defined additional scripts

Let's assume that your project or its tests need additional polyfills or framework scripts to be loaded.
You could try to shoehorn those scripts into the webpack entry points generated above, but the `WebpackJasmineHtmlRunnerPlugin` also provides the convenient option `includePaths` for this:

Create a file containing your additional dependencies, e.g. `polyfills.js`, and modify your configuration like this:

```js
const config = require( /* see above */ );
config.entry = WebpackJasmineHtmlRunnerPlugin.entry( /* see above */ );
config.output = { /* see above */ };

// add a webpack entry to also generate the polyfills bundle
config.entry.polyfills = './polyfills.js';

config.plugins = [
   new webpack.SourceMapDevToolPlugin( {
      filename: '[name].bundle.js.map'
   } ),
   new WebpackJasmineHtmlRunnerPlugin( {
      // add an include path to load the polyfills
      includePaths: [ path.resolve( process.cwd(), 'spec-output/polyfills.bundle.js' ) ]
   } )
];

module.exports = config;
```


### `pattern` (default: `/.*\bspec\b.*/i`)

#### Filtering spec runners

When adding webpack entry points for polyfills and other script-loaded dependencies, you do not want to create HTML spec runners for them.
HTML will only be generated for entry paths matching this pattern.
If your tests follow a different naming conventions, you may need to change this.


### `fixup` (default: `[ 'fixup-stacktraces', 'fixup-json-messages' ]`)

#### Loading pre-bundled fixup scripts

To improve debugging convenience, the plugin comes with several *fixup scripts* that augment the Jasmine 2 HTML reporter.
They can be controlled using the option `fixupScripts`, which takes an array of strings:

* `fixup-stacktraces`: uses [sourcemapped-stacktrace](https://github.com/novocaine/sourcemapped-stacktrace) to improve Jasmine stacktraces by looking them up against a source map (if available).

* `fixup-json-messages`: improves formatting of Jasmine error reports when using `expect( objectA ).toEqual( objectB )`.
  The builtin error messages are relatively hard to read. When using this script, the JSON objects are reformatted, and you can click on them to get a nice colored diff generated by [jsondiffpatch](https://github.com/benjamine/jsondiffpatch).
