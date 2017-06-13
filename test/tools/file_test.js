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
let assert = require('assert');
let path = require('path');

let pathTools = require('../../tools/path.js');
let fileTools = require('../../tools/file.js');

let testFilesPath = 'test_files/resources/';
let testDirectory = pathTools.getTempPath('closure-builder-test');


describe('fileTools', function() {
  describe('copyFile', function() {
    it('Copy single file', function(done) {
      let srcFile = path.join(testFilesPath, 'file.jpg');
      let targetFile = testDirectory;
      fileTools.copyFile(srcFile, targetFile, function() {
        assert(pathTools.existFile(srcFile));
        assert(pathTools.existFile(path.join(targetFile, 'file.jpg')));
        done();
      });
    });

    it('Copy single file with different name', function(done) {
      let srcFile = path.join(testFilesPath, 'file.jpg');
      let targetFile = path.join(testDirectory, 'file123.jpg');
      fileTools.copyFile(srcFile, targetFile, function() {
        assert(pathTools.existFile(srcFile));
        assert(pathTools.existFile(targetFile));
        done();
      });
    });

    it('Copy multiple files', function(done) {
      let targetDir = path.join(testDirectory, 'example-files');
      fileTools.copyFile(testFilesPath, targetDir, function() {
        assert(pathTools.existFile(
          path.join(targetDir, 'resources', 'file')));
        assert(pathTools.existFile(
          path.join(targetDir, 'resources', 'file.htm')));
        assert(pathTools.existFile(
          path.join(targetDir, 'resources', 'file.jpg')));
        assert(pathTools.existFile(
          path.join(targetDir, 'resources', 'file_test.js')));
        done();
      });
    });
  });

  describe('findAndReplace', function() {
    let targetDir = path.join(testDirectory, 'find-and-replace');

    it('Find and replace single file', function(done) {
      let testFile = path.join(testFilesPath, 'file.txt');
      fileTools.copyFile(testFile, targetDir, function() {
        let targetFile = path.join(targetDir, 'file.txt');
        fileTools.findAndReplace(targetFile, 'Hello', 'Welcome');
        assert.equal(fileTools.readFile(targetFile), 'Welcome world !');
        done();
      });
    });

    it('Find and replace multiple files', function(done) {
      fileTools.copyFile(testFilesPath, targetDir, function() {
        let testDir = path.join(targetDir, 'resources');
        fileTools.findAndReplace(targetDir, 'o', 'O', true);
        assert.equal(
          fileTools.readFile(path.join(testDir, 'file.xml')), 'xml cOntent');
        assert.equal(
          fileTools.readFile(path.join(testDir, 'file.htm')), 'htm cOntent');
        assert.equal(
          fileTools.readFile(path.join(testDir, 'file.html')), 'html cOntent');
        done();
      });
    });
  });

  it('readFile', function() {
    let testFile = path.join(testFilesPath, 'file.txt');
    let content = fileTools.readFile(testFile);
    assert.equal(content, 'Hello world !');
  });

  it('getDirectories', function() {
    let folders = fileTools.getDirectories(testFilesPath);
    assert(folders[0] == 'folder');
  });

  it('getGlobFiles', function() {
    let files = fileTools.getGlobFiles(testFilesPath + '*');
    assert(files.length >= 9);
  });

  it('mkfile', function() {
    let file = path.join(testDirectory, 'tools', 'example-file');
    fileTools.mkfile(file);
    assert(pathTools.existFile(file));
    assert(!pathTools.existDirectory(file));
  });

  it('mkdir', function() {
    let folder = path.join(testDirectory, 'tools', 'example-folder');
    fileTools.mkdir(folder);
    assert(!pathTools.existFile(folder));
    assert(pathTools.existDirectory(folder));
  });
});
