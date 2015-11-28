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
var BuildTools = require('../build_tools');

var pathWin = 'C:\\path\\dir\\subdir';
var pathUnix = '/home/user/dir/subdir';
var fileWin = 'C:\\path\\dir\\index.html';
var fileUnix = '/home/user/dir/file.txt';
var fileRemote = 'http://www.example.com:80/dir/subdir/file.xml?test=1&test=2';
var fileRemoteHash = 'https://www.example.com:80/dir/subdir/file.xml#dummy';
var testFilesPath = 'test_files/resources/';


describe('BuildTools', function() {

  describe('Path', function() {
    it('getModulePath', function() {
      var modulePath = BuildTools.getModulePath();
      assert(modulePath.indexOf('node_modules') != -1);
    });
    it('getFilePath', function() {
      assert.equal(BuildTools.getFilePath(pathUnix), pathUnix);
      assert.equal(BuildTools.getFilePath(fileUnix), '/home/user/dir');
      if (os.platform() == 'win32') {
        assert.equal(BuildTools.getFilePath(pathWin), pathWin);
        assert.equal(BuildTools.getFilePath(fileWin), 'C:\\path\\dir');
      }
    });
    it('getPathFile', function() {
      assert.equal(BuildTools.getPathFile(fileUnix), 'file.txt');
      if (os.platform() == 'win32') {
        assert.equal(BuildTools.getPathFile(fileWin), 'index.html');
      }
    });
    it('getTempPath', function() {
      assert.equal(BuildTools.getTempPath(), os.tmpdir());
      assert(BuildTools.getTempPath('test123').indexOf('test123') != -1);
    });
  });

  describe('Url', function() {
    it('getUrlFile', function() {
      assert.equal(BuildTools.getUrlFile(fileRemote), 'file.xml');
      assert.equal(BuildTools.getUrlFile(fileRemoteHash), 'file.xml');
    });
  });

  describe('Files', function() {
    it ('getGlobFiles', function() {
      var files = BuildTools.getGlobFiles(testFilesPath + '*');
      assert(files.length >= 9);
    });
    it('sortFiles', function() {
      var files = BuildTools.getGlobFiles(testFilesPath + '*');
      var sortedFilesAll = BuildTools.sortFiles(files, true);
      var sortedFiles = BuildTools.sortFiles(files);
      var sortedFilesWithoutTest = BuildTools.sortFiles(files, false, true);
      assert(files.length == sortedFilesAll.length);
      assert(sortedFilesAll.length > sortedFiles.length);
      assert(sortedFiles.length > sortedFilesWithoutTest.length);
      assert(sortedFilesWithoutTest.length > 5);
    });
  });
});
