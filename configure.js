/**
 * @fileoverview Closure Builder - Configuration
 *
 * @license Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mbordihn@google.com (Markus Bordihn)
 */
var packageJson = require('./package.json');

var buildTools = require('./build_tools.js');
var remoteTools = require('./tools/remote.js');

console.log('Configuring Closure Builder ' + packageJson.version + ' ...\n');

// Google Closure Library
console.log('Downloading Google Closure Library ...');
var closureLibrary = 'https://github.com/google/closure-library/zipball/master';
var closureLibraryTarget = './resources/closure-library.zip';
remoteTools.getFile(closureLibrary, closureLibraryTarget);


// JAVA
console.log('Perform basic Java checks ...');
buildTools.execJava(['-version'], function(error, stdout, stderr) {
  if (!error && stderr && stderr.indexOf('java version') >= 0) {
    var versionReg = /java version \"?([0-9_.-]+)\"?/;
    var version = stderr.match(versionReg)[1];
    console.log('Found global Java ...', version);
  } else {
    console.warn('No global Java available ...');
  }
});
