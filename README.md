# webpack-jasmine-html-runner-plugin

> *interactive in-browser testing* with webpack.

* allows using [webpack](http://webpack.github.io/) & its dev-server for in-browser [Jasmine](http://jasmine.github.io/2.4/introduction.html) tests.

* generates a `spec-runner.html` webpack entry for each of your JavaScript spec-entry files (specified by a pattern).

* uses [sourcemapped-stacktrace](https://github.com/novocaine/sourcemapped-stacktrace) to fix stack traces in the Jasmine HTML reporter


### Installation

First make sure that `webpack` and `webpack-dev-server` are installed and configured for your project.
Make sure that Jasmine 2 is installed in your project, and that your spec-test use the Jasmine APIs (`describe`, `beforeEach`, etc.) as global functions.

```console
npm install --save-dev webpack-jasmine-html-runner-plugin
```


### Usage

Create a webpack configuration for your tests, e.g. `webpack.spec.config.js`.

In this configuration:

```js
// load or otherwise create your base webpack configuration:
const config = require( './webpack.config' );

// in this example, your spec-runners are named e.g. 'lib/some-module/spec/spec-runner.js'
config.entry = WebpackJasmineHtmlRunnerPlugin.entry( './lib/[name]/spec/spec-runner.js' );
config.output = {
   path: path.resolve( path.join( process.cwd(), 'spec-output' ) ),
   publicPath: '/spec-output/',
   filename: '[name].bundle.js'
};

config.plugins = [
   new webpack.SourceMapDevToolPlugin( {
      filename: '[name].bundle.js.map'
   } ),
   new WebpackJasmineHtmlRunnerPlugin()
];
```

Now, run the webpack-dev-server:

```console
webpack-dev-server --inline --config webpack.spec.config.js
```

When the webpack dev server has finished setting up, you can visit your spec-tests at [localhost:8080/webpack-dev-server](http://localhost:8080/webpack-dev-server).



### Usage with additional script

Let's assume that your project or its tests need additional polyfills or framework script to be loaded.
You could try to shoehorn it into the webpack entry points generated above, but the `WebpackJasmineHtmlRunnerPlugin` also has an option for this:

Create a file `polyfills.js` containing your additional dependencies and modify your configuration like this:

```js
const config = require( /* see above */ );
config.entry = WebpackJasmineHtmlRunnerPlugin.entry( /* see above */ );
config.output = { /* see above */ };

// add an option to also bundle and load the polyfills
config.entry.polyfills = './polyfills.js';

config.plugins = [
   new webpack.SourceMapDevToolPlugin( {
      filename: '[name].bundle.js.map'
   } ),
   new WebpackJasmineHtmlRunnerPlugin( {
      // add an option to also bundle and load the polyfills
      includePaths: path.resolve( process.cwd(), 'spec-output/polyfills.bundle.js' )
   } )
];
```
