Closure Builder - Closure build system
======================================

Closure build system to easily compile Soy template files together with
Closure JavaScript files without the need to configure anything.
The Google Closure library will be included automatically if needed.

This simple build system could be also used for normal css, js and
static files as well.

* [Installation](#installation)
* [Basic Usage](#basic-usage)
* [Options](#options)
* [Installation](#installation)
* [Example build configurations](#example-build-configurations)
  * [Compile closure JavaScript files](#compile-closure-javascript-files)
  * [Compile closure Javascript files with soy files](#compile-closure-javascript-files-with-soy-files)
  * [Compile soy files](#compile-soy-files)
  * [Compile JavaScript files](#compile-javascript-files)
  * [Copy Resources](#copy-resources)
  * [Compile css files](#compile-css-files)
* [Disclaimer](#disclaimer)
* [Author](#author)
* [License](#license)


Installation
------------
Use NPM using `npm install closure-builder` or fork, clone download the source on GitHub to get the latest version.


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
These basic options are required:
- `name` Closure name space to compiler or unique name of your build rule 
- `srcs` List of (Soy, Closure or JavaScript files) which should be compiled
- `out` Output path / output file for the compiled Soy, Closure or JavaScript files
- `resources` Resource files which will be copied to the out folder

#### Additional ####
These options could be used for adding additional information:
- `deps` Dependencies like additional closure files or additional file for the compiler
- `license` Additional license header file which will be include as header to the compiled files
- `debug` If true display additional debug informations
- `trace` If true display additional trace informations

##### Options #####
The following options are available for the closure and soy compiler:
- `options.soy` Additional settings for the Soy compiler
- `options.closure` Additional settings for the Closure compiler
- `options.exclude_test` If true *_test.* files will be excluded

#### Not implemented yet ####
The following options are partial implemented and should not be used:
- `data`
- `compress`
- `type`


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
  ])
  out: 'genfiles/merged-and-minified.js'
});
```

#### Compile Closure JavaScript files with Soy files ####
Compiling Closure JavaScript files and associated Soy files to an single
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

#### Compile Soy files ####
Compiling Soy files into Soy JavaScript files to an targeted directory.
```javascript
closureBuilder.build({
  name: 'soy_files',
  srcs: glob([
    'soy/**/*.soy'
  ])
  out: 'genfiles/compiled_soy_files/'
});
```

#### Compile JavaScript files ####
Combine several JavaScript files to an single JavaScript file.
```javascript
closureBuilder.build({
  name: 'javascript_files',
  srcs: glob([
    'src/js/*.js'
  ])
  out: 'genfiles/merged-and-minified.js'
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

#### Compile CSS files ####
Combine and minified several CSS files to an single CSS file.
```javascript
closureBuilder.build({
  name: 'css_files',
  srcs: glob([
    'src/css/*.css'
  ])
  out: 'genfiles/merged-and-minified.css'
});
```

Disclaimer
----------
This is not an official Google product.


Author
------
[Markus Bordihn] (https://github.com/MarkusBordihn)


License
-------
Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0.htm
