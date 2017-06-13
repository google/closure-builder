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
let assert = require('assert');

let buildTools = require('../build_tools');
let fileTools = require('../tools/file.js');

let testFilesPath = 'test_files/resources/';


describe('buildTools', function() {
  describe('Files', function() {
    it('sortFiles', function() {
      let files = fileTools.getGlobFiles(testFilesPath + '*');
      let sortedFilesAll = buildTools.sortFiles(files, true);
      let sortedFiles = buildTools.sortFiles(files);
      let sortedFilesWithoutTest = buildTools.sortFiles(files, false, true);
      assert(files.length == sortedFilesAll.length);
      assert(sortedFilesAll.length > sortedFiles.length);
      assert(sortedFiles.length > sortedFilesWithoutTest.length);
      assert(sortedFilesWithoutTest.length > 5);
    });
  });
});
