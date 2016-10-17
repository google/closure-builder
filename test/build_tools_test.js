/**
 * @fileoverview Closure Builder Test - Build tools
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
var assert = require('assert');

var buildTools = require('../build_tools');
var fileTools = require('../tools/file.js');

var testFilesPath = 'test_files/resources/';


describe('buildTools', function() {

  describe('Files', function() {
    it('sortFiles', function() {
      var files = fileTools.getGlobFiles(testFilesPath + '*');
      var sortedFilesAll = buildTools.sortFiles(files, true);
      var sortedFiles = buildTools.sortFiles(files);
      var sortedFilesWithoutTest = buildTools.sortFiles(files, false, true);
      assert(files.length == sortedFilesAll.length);
      assert(sortedFilesAll.length > sortedFiles.length);
      assert(sortedFiles.length > sortedFilesWithoutTest.length);
      assert(sortedFilesWithoutTest.length > 5);
    });

    it('getSafeFileList', function() {
      var files = ['a1', 'a2', 'a3', 'a4', 'a5', 'b2', 'a4'];
      var expectedFiles = ['"a1"', '"a2"', '"a3"', '"a4"', '"a5"', '"b2"'];
      var safeFiles = buildTools.getSafeFileList(files);
      assert(safeFiles);
      assert.deepEqual(safeFiles, expectedFiles);
    });
  });

});
