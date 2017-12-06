Closure Builder - Closure build system
======================================

[![Build status](https://travis-ci.org/google/closure-builder.svg?branch=master)](http://travis-ci.org/google/closure-builder)
[![NPM version](https://img.shields.io/npm/v/closure-builder.svg)](https://www.npmjs.org/package/closure-builder)

[![NPM](https://nodei.co/npm/closure-builder.png?downloads=true&downloadRank=true)](https://nodei.co/npm/closure-builder/)

A Closure build system to easily compile Closure JavaScript files,
Closure Template files and Closure Stylesheet files without the need to
configure anything.
The Google Closure library will be included automatically if needed.

This build system could be also used for normal css, js, nodejs and
static files as well.

* [Installation](#installation)
* [Requirements](#requirements)
* [Basic Usage](#basic-usage)
* [Options](#options)
   * [Closure compiler options](#closure-compiler-options)
* [Function callback](#function-callback)
* [Example build configurations](#example-build-configurations)
  * [Compile Closure JavaScript files](#compile-closure-javascript-files)
  * [Compile Closure Javascript files with soy files](#compile-closure-javascript-files-with-soy-files)
  * [Compile Closure Javascript files with externs](#compile-closure-javascript-files-with-externs)
  * [Compile Closure JavaScript files over remote service](#compile-closure-javascript-files-over-remote-service)
  * [Compile Closure Template (.soy) files](#compile-closure-template-files)
  * [Compile Closure Stylesheet (.gss) files](#compile-closure-stylesheet-files)
  * [Compile JavaScript files](#compile-javascript-files)
  * [Compile Node.js files](#compile-node-js-files)
  * [Compile Rollup files (experimental)](#compile-rollup-files)
  * [Compile css files](#compile-css-files)
  * [Copy Resources](#copy-resources)
  * [Copy Remote Resources](#copy-remote-resources)
  * [Convert Markdown (.md) to .html file](#convert-markdown-md-to-html-file)

* [Best practise](#best-practise)
* [Development](#development)
* [Disclaimer](#disclaimer)
* [Author](#author)
* [License](#license)


Installation
------------
Use NPM using `npm install closure-builder` or fork, clone download the source
on GitHub to get the latest version.


Requirements
------------
To be able to use all available features and options, please make sure to
install the Java Runtime Environment (JRE).


Basic Usage
-----------

```javascript
var closureBuilder = require('closure-builder');
var glob = closureBuilder.globSupport();

closureBuilder.build({
  name: 'goog.namespace',
  srcs: glob([
    'src/**/*.js',
    'soy/**/*.soy'
  ]),
  deps: [...],
  out: 'genfiles/whatever.js'
});
```


Options
-------
All of the options will be defined inside the BUILD rule.
But there is not limit of BUILD rules which could be setup for your needs.

#### Required ####
These basic required options for compiling are:
- `name` Closure namespace to compiler or unique name of your build rule
- `srcs` List of (Soy, CSS, Closure or JavaScript files) which should be compiled
- `out` Output path / output file for the compiled Soy, Closure or JavaScript files

For copying files the required options are:
- `name` Unique name of your build rule
- `resources` Resource files which will be copied to the output folder
- `out` Output path / output file for the compiled Soy, Closure or JavaScript files

#### Additional ####
These options could be used for adding additional information.

- `type` Overwrites the automatic type detection
- `out_source_map` Stores possible source map to the given output file
- `append` Append the given text to the final output
- `prepend` Prepend the given text to the final output
- `replace` Replace the given text on the final output

##### Closure compiler options #####
- `deps` Dependencies like additional closure files or additional file for the compiler
- `entry_point` Closure namespace if not already defined under `name`
- `externs` Additional JavaScript externs for the compiler
- `license` Additional license header file which will be include as header to the compiled files
- `remote_service` If true use online remote services instead of local tools

#### Verbose ####
- `warn` If false disable all warning messages
- `debug` If true display additional debug informations
- `trace` If true display additional trace informations

#### Options ####
The following options are available for the closure and soy compiler:
- `options.soy` Additional settings for the Soy compiler
- `options.closure` Additional settings for the Closure compiler
- `options.exclude_test` If true *_test.* files will be excluded

#### Closure compiler warnings ####
To adjust the Closure compiler warnings, you could use
`options.closure.jscomp_...` or the shortcut `jscomp_...`.
- `jscomp_error`  List of compiler checks which produce an error message.
- `jscomp_warning` List of compiler checks which produce an warning message.
- `jscomp_off` List of compiler checks which should be disabled.

See full [list of compiler checks](https://github.com/google/closure-compiler/wiki/Warnings#warnings-categories)

```javascript
closureBuilder.build({
  name: 'Closure compiler warnings',
  options: {
    closure : {
      jscomp_error: ['deprecated', 'extraRequire',
        'missingProvide', 'missingRequire', 'newCheckTypes']
    }
  },
  ...
}
```

#### Not implemented yet ####
The following options are partially implemented and should not be used:
- `data`
- `compress`
- `type`


Function Callback
-----------------
For performance reasons the tasks will be executed asynchronous whenever it
is possible.

If you need to know exactly if a tasks has finished you could add a callback
function as well.

```javascript
var closureBuilder = require('closure-builder');
var callbackExample = function(errors, warnings, files, results) {
  ...
};

closureBuilder.build({
  ...
}, callbackExample.bind(this));
```

The callback will be called with the following parameters:
- `errors` Errors if any
- `warnings` Warnings if any
- `files` Single output file or list of output files if any
- `results` Result if any


Example build configurations
----------------------------
These example shows the basic usage for the different file types.
You could define as many build rules you want.
Please keep in mind to add the needed require before like:
```javascript
var closureBuilder = require('closure-builder');
var glob = closureBuilder.globSupport();

closureBuilder.build({
  ...
});
```


#### Compile Closure JavaScript files ####
Compiling Closure JavaScript files for the given namespace to an single
JavaScript file.
```javascript
closureBuilder.build({
  name: 'goog.namespace',
  srcs: glob([
    'src/js/*.js'
  ]),
  out: 'genfiles/merged-and-minified.js'
});
```

#### Compile Closure JavaScript files with Soy files ####
Compiling Closure JavaScript files and associated Soy files to a single
javascript file.
```javascript
closureBuilder.build({
  name: 'goog.namespace',
  srcs: glob([
    'src/**/*.js',
    'soy/**/*.soy'
  ]),
  deps: [...],
  out: 'genfiles/compiled.js'
});
```

#### Compile Closure JavaScript files with externs ####
Compiling Closure JavaScript files with JavaScript externs.
javascript file.
```javascript
closureBuilder.build({
  name: 'goog.namespace',
  srcs: glob([
    'src/**/*.js',
  ]),
  externs: [
    'src/externs/global.js'
  ],
  out: 'genfiles/compiled.js'
});
```

#### Compile Closure JavaScript files over remote service ####
Compiling Closure JavaScript files with the remote service to a single
javascript file.
Please keep in mind that the remote service is not supporting all features and
options of the closure compiler.
```javascript
closureBuilder.build({
  name: 'goog.namespace',
  srcs: glob([
    'src/**/*.js',
  ]),
  remote_service: true,
  deps: [...],
  out: 'genfiles/compiled.js'
});
```

#### Compile Closure Template files ####
Compiling Soy files into Soy JavaScript files to an targeted directory.
```javascript
closureBuilder.build({
  name: 'soy_files',
  srcs: glob([
    'soy/**/*.soy'
  ]),
  out: 'genfiles/compiled_soy_files/'
});
```

#### Compile Closure Stylesheet files ####
Compiling closure stylesheet files into css files to an targeted directory.
```javascript
closureBuilder.build({
  name: 'gss_files',
  srcs: glob([
    'css/**/*.gss'
  ]),
  out: 'genfiles/compiled.css'
});
```

#### Compile JavaScript files ####
Combine several JavaScript files to a single JavaScript file.
```javascript
closureBuilder.build({
  name: 'javascript_files',
  srcs: glob([
    'src/js/*.js'
  ]),
  out: 'genfiles/merged-and-minified.js'
});
```

#### Compile Node.js files ####
Combine node.js JavaScript files with browserify to a single JavaScript bundle.
```javascript
closureBuilder.build({
  name: 'node_bundle_files',
  srcs: glob([
    'src/js/node_file.js'
  ]),
  out: 'genfiles/node_bundle.js'
});
```

#### Compile Rollup files ####
Combine JavaScript files with rollup to a single JavaScript bundle.
```javascript
closureBuilder.build({
  name: 'module_name',
  format: 'umd',
  srcs: 'src/js/entry_file.js',
  out: 'genfiles/rollup_bundle.js'
});
```

#### Compile CSS files ####
Combine and minified several CSS files to a single CSS file.
```javascript
closureBuilder.build({
  name: 'css_files',
  srcs: glob([
    'src/css/*.css'
  ]),
  out: 'genfiles/merged-and-minified.css'
});
```

#### Copy resources ####
Copy static resources from the different location to the target directory.
```javascript
closureBuilder.build({
  name: 'static_resources',
  resources: glob([
    'static/css/*.css',
    'static/htm/*.htm',
    'static/html/*.html',
    'static/jpg/*.jpg',
    'static/gif/*.gif',
    'static/png/*.png',
    'static/xml/*.xml'
  ]),
  out: 'genfiles/static-folder/'
});
```


#### Copy remote resources ####
Copy resources from an remote location to the target directory.
```javascript
closureBuilder.build({
  name: 'static_resources',
  resources: [
    'https://raw.githubusercontent.com/google/closure-builder/master/test_files/resources/file.js',
    'https://raw.githubusercontent.com/google/closure-builder/master/test_files/resources/file.html',
    'https://raw.githubusercontent.com/google/closure-builder/master/test_files/resources/file.jpg',
    'https://raw.githubusercontent.com/google/closure-builder/master/test_files/resources/file.gif',
    'https://raw.githubusercontent.com/google/closure-builder/master/test_files/resources/file.png',
    'https://raw.githubusercontent.com/google/closure-builder/master/test_files/resources/file.xml',
    'https://raw.githubusercontent.com/google/closure-builder/master/test_files/resources/file.css'
  ],
  out: 'genfiles/static-folder/'
});
```


#### Convert Markdown (.md) to .html file ####
Convert markdown (.md) to .html file.
```javascript
closureBuilder.build({
  name: 'md_file',
  markdown: [
    'README.md'
  ],
  out: 'genfiles/'
});
```


Best practise
-------------
For a better overview, you could split your build rules to several files.
They could be placed in an "build" folder or something like this.
Example: https://github.com/google/coding-with-chrome/tree/master/build

This allows you to rebuild only some of the files if needed.

Example package.json:
```
 "scripts": {
    "build": "npm run build-static-files && npm run build-remote-files && npm run build-extra-files && npm run build-cwc-files",
    "rebuild": "npm run build-static-files && npm run build-cwc-files",
    "build-static-files": "node build/static_files.js",
    "build-remote-files": "node build/remote_files.js",
    "build-extra-files": "node build/extra_files.js",
    "build-cwc-files": "node build/cwc_files.js",
 },
```


Development
-----------
There are some automated scripts which will help you for development on the
closure-builder project.

### Get the sources
Download the source files manual from GitHub or with git by running:
```bash
git clone --recursive git://github.com/google/closure-builder.git
```

#### Init / update submodules
In some cases you need to init and update the submodules manually by:
```bash
git submodule init
git submodule update
```

#### Get required packages
Enter the "closure-builder" directory and get the required packages by:
```bash
npm install
```

### Updating dependencies ###
Before you start working, run `npm run update` to update the dependencies to
the latest package versions.

### Code Style ###
Run `npm run lint` to make sure that your code is according the general style.

### Testing ###
Tests could be performed with `npm run test`. Before the test runs it will
automatically run the linter to make sure that the code has no syntax errors.

### Deploying ###
Add all your files and create your commit, but instead of using "git push"
directly please use `npm run deploy` instead.
It will automatically run some tests and increase the versions number by 0.0.1.


Disclaimer
----------
This is not an official Google product.


Author
------
[Markus Bordihn](https://github.com/MarkusBordihn)


License
-------
Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0
