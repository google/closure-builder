/**
 * @fileoverview Closure Builder Test - File tools
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
var assert = require('assert');
var path = require('path');

var pathTools = require('../tools/path.js');
var fileTools = require('../tools/file.js');

var testFilesPath = 'test_files/resources/';
var testDirectory = pathTools.getTempPath('closure-builder-test');


describe('fileTools', function() {

  it ('getGlobFiles', function() {
    var files = fileTools.getGlobFiles(testFilesPath + '*');
    assert(files.length >= 9);
  });

  it('mkfile', function() {
    var file = path.join(testDirectory, 'tools', 'example-file');
    fileTools.mkfile(file);
    assert(pathTools.existFile(file));
    assert(!pathTools.existDirectory(file));
  });

  it('mkdir', function() {
    var folder = path.join(testDirectory, 'tools', 'example-folder');
    fileTools.mkdir(folder);
    assert(!pathTools.existFile(folder));
    assert(pathTools.existDirectory(folder));
  });

});
