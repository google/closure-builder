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

var fileTools = require('./tools/file.js');
var javaTools = require('./tools/java.js');
var packageJson = require('./package.json');
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
var gcsVersion = 'v1.4.0';
var gcsDoc = 'https://raw.githubusercontent.com/google/closure-stylesheets/';
remoteTools.getFiles(
  'Google Closure Stylesheets', [
    gcs + gcsVersion + '/closure-stylesheets.jar',
    gcs + gcsVersion + '/closure-stylesheets-library.jar',
    gcsDoc + 'master/LICENSE',
    gcsDoc + 'master/README.md'],
  path.join('.', 'runtime', 'closure-stylesheets')
);

// Cleanup Google Closure Library
console.log('Optimizing Google Closure Library ...');
var closureLibrary = path.join('.', 'third_party', 'closure-library');
fileTools.removeFiles(path.join(closureLibrary, '**', '*_test.js'));
fileTools.removeFiles(path.join(closureLibrary, '**', '*_test.html'));
fileTools.removeFiles(path.join(closureLibrary, '**', 'test_module.js'));
fileTools.removeFiles(path.join(closureLibrary, '**', 'test_module_dep.js'));
fileTools.removeFiles(path.join(closureLibrary, '**', 'transpile.js'));
fileTools.removeFiles(path.join(closureLibrary, 'closure', 'goog', 'demos'));

// Cleanup Google Closure Templates
console.log('Optimizing Google Closure Templates ...');
var closureTemplates = path.join('.', 'third_party', 'closure-templates');
fileTools.removeFiles(path.join(closureTemplates, 'java'));
fileTools.removeFiles(path.join(closureTemplates, 'python'));
fileTools.removeFiles(path.join(closureTemplates, 'src'));

// JAVA check
console.log('Perform basic Java checks ...');
if (javaTools.hasJava()) {
  console.log('Found global Java ...', javaTools.getJavaVersion());
} else {
  console.warn('\nWARNING!!!\nFound no global JRE!\n' +
    'Please install an Java Runtime Environment (JRE), to be able to use' +
    ' all features and compilers!\n');
}
