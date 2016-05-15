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
var decompress = require('decompress');
var path = require('path');

var packageJson = require('./package.json');
var buildTools = require('./build_tools.js');
var remoteTools = require('./tools/remote.js');

console.log('Configuring Closure Builder ' + packageJson.version + ' ...\n');
var tempPath = buildTools.getRandomTempPath();

// Google Closure Library
console.log('Downloading Google Closure Library ...');
var closureLibrary = 'https://github.com/google/closure-library/tarball/master';
remoteTools.getFile(closureLibrary, tempPath, 'closure-library.tar.gz',
    function() {
      console.log('Extracting Google Closure Library, please wait ...');
      new decompress({mode: '755'})
        .src(path.join(tempPath, 'closure-library.tar.gz'))
        .dest('./resources/closure-library')
        .use(decompress.targz({strip: 1}))
        .run();
    });


// Closure Templates
console.log('Downloading Google Closure Templates ...');
var closureTemplates = 'https://github.com/google/closure-templates/' +
  'tarball/master';
remoteTools.getFile(closureTemplates, tempPath, 'closure-templates.tar.gz',
    function() {
      console.log('Extracting Google Closure Templates, please wait ...');
      new decompress({mode: '755'})
        .src(path.join(tempPath, 'closure-templates.tar.gz'))
        .dest('./resources/closure-templates')
        .use(decompress.targz({strip: 1}))
        .run();
    });


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
