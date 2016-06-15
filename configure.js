/**
 * @fileoverview Closure Builder - Configuration
 *
 * @license Copyright 2016 Google Inc. All Rights Reserved.
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
var path = require('path');

var packageJson = require('./package.json');
var buildTools = require('./build_tools.js');
var remoteTools = require('./tools/remote.js');

console.log('Configuring Closure Builder ' + packageJson.version + ' ...\n');
var googdl = 'https://dl.google.com/';


// Google Closure Compiler
remoteTools.getTarGz(
  'Google Closure Compiler',
  googdl + 'closure-compiler/compiler-latest.tar.gz',
  path.join('.', 'runtime', 'closure-compiler')
);

// Google Closure Templates Compiler
remoteTools.getZip(
  'Google Closure Templates Compiler',
  googdl + 'closure-templates/closure-templates-for-javascript-latest.zip',
  path.join('.', 'runtime', 'closure-templates-compiler')
);

// Google Closure Stylesheets
var gcs = 'https://github.com/google/closure-stylesheets/releases/download/';
var gcsVersion = 'v1.2.0';
var gcsDoc = 'https://raw.githubusercontent.com/google/closure-stylesheets/';
remoteTools.getFiles(
  'Google Closure Stylesheets', [
    gcs + gcsVersion + '/closure-stylesheets.jar',
    gcs + gcsVersion + '/closure-stylesheets-library.jar',
    gcsDoc + 'master/LICENSE',
    gcsDoc + 'master/README.md'],
  path.join('.', 'runtime', 'closure-stylesheets')
);


// JAVA check
console.log('Perform basic Java checks ...');
buildTools.execJava(['-version'], function(error, stdout, stderr) {
  if (!error && stderr && stderr.indexOf('java version') >= 0) {
    var versionReg = /java version \"?([0-9_.-]+)\"?/;
    var version = stderr.match(versionReg)[1];
    console.log('Found global Java ...', version);
  } else {
    console.warn('No global Java available!!!\n' +
      'Please install an Java Runtime (JRE) to be able to use all features!');
  }
});
