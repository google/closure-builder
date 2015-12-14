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
var os = require('os');
var buildTools = require('../build_tools');
var path = require('path');

var pathWin = 'C:\\path\\dir\\subdir';
var pathUnix = '/home/user/dir/subdir';
var fileWin = 'C:\\path\\dir\\index.html';
var fileUnix = '/home/user/dir/file.txt';
var fileRemote = 'http://www.example.com:80/dir/subdir/file.xml?test=1&test=2';
var fileRemoteHash = 'https://www.example.com:80/dir/subdir/file.xml#dummy';
var testFilesPath = 'test_files/resources/';
var testDirectory = buildTools.getTempPath('closure-builder-test');


describe('buildTools', function() {

  describe('Path', function() {
    it('getModulePath', function() {
      var modulePath = buildTools.getModulePath();
      assert(modulePath.indexOf('node_modules') != -1);
    });
    it('getFilePath', function() {
      assert.equal(buildTools.getFilePath(pathUnix), pathUnix);
      assert.equal(buildTools.getFilePath(fileUnix), '/home/user/dir');
      if (os.platform() == 'win32') {
        assert.equal(buildTools.getFilePath(pathWin), pathWin);
        assert.equal(buildTools.getFilePath(fileWin), 'C:\\path\\dir');
      }
    });
    it('getPathFile', function() {
      assert.equal(buildTools.getPathFile(fileUnix), 'file.txt');
      if (os.platform() == 'win32') {
        assert.equal(buildTools.getPathFile(fileWin), 'index.html');
      }
    });
    it('getTempPath', function() {
      assert.equal(buildTools.getTempPath(), os.tmpdir());
      assert(buildTools.getTempPath('test123').indexOf('test123') != -1);
    });
    it('getRandomTempPath', function() {
      var path1 = buildTools.getRandomTempPath();
      var path2 = buildTools.getRandomTempPath();
      assert(path1 !== path2);
      assert(path1.indexOf(os.tmpdir()) !== -1);
      assert(path2.indexOf(os.tmpdir()) !== -1);
    });
  });

  describe('Url', function() {
    it('getUrlFile', function() {
      assert.equal(buildTools.getUrlFile(fileRemote), 'file.xml');
      assert.equal(buildTools.getUrlFile(fileRemoteHash), 'file.xml');
    });
  });

  describe('Files', function() {
    it ('getGlobFiles', function() {
      var files = buildTools.getGlobFiles(testFilesPath + '*');
      assert(files.length >= 9);
    });
    it('sortFiles', function() {
      var files = buildTools.getGlobFiles(testFilesPath + '*');
      var sortedFilesAll = buildTools.sortFiles(files, true);
      var sortedFiles = buildTools.sortFiles(files);
      var sortedFilesWithoutTest = buildTools.sortFiles(files, false, true);
      assert(files.length == sortedFilesAll.length);
      assert(sortedFilesAll.length > sortedFiles.length);
      assert(sortedFiles.length > sortedFilesWithoutTest.length);
      assert(sortedFilesWithoutTest.length > 5);
    });
    it('mkfile', function() {
      var file = path.join(testDirectory, 'tools', 'example-file');
      buildTools.mkfile(file);
      assert(buildTools.existFile(file));
      assert(!buildTools.existDirectory(file));
    });
  });

  describe('Directory', function() {
    it('mkdir', function() {
      var folder = path.join(testDirectory, 'tools', 'example-folder');
      buildTools.mkdir(folder);
      assert(!buildTools.existFile(folder));
      assert(buildTools.existDirectory(folder));
    });
  });

  describe('Misc', function() {
    it ('getMemory', function() {
      var memory = buildTools.getMemory();
      assert(memory > 16);
    });
    it ('checkAvailableMemory', function() {
      var largeMemory = buildTools.checkAvailableMemory(
        buildTools.getMemory() + 128);
      var smallMemory = buildTools.checkAvailableMemory(128);
      assert(!largeMemory);
      assert(smallMemory);
    });
  });
});
