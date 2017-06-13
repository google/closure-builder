/**
 * @fileoverview Closure Builder Test - Path tools
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
let os = require('os');

let pathTools = require('../../tools/path.js');

let fileMarkdownUnix = '/home/user/dir/file.md';
let fileMarkdownWin = 'C:\\path\\dir\\index.md';
let fileRemote = 'http://www.example.com:80/dir/subdir/file.xml?test=1&test=2';
let fileRemoteHash = 'https://www.example.com:80/dir/subdir/file.xml#dummy';
let fileUnix = '/home/user/dir/file.txt';
let fileWin = 'C:\\path\\dir\\index.html';
let pathUnix = '/home/user/dir/subdir';
let pathWin = 'C:\\path\\dir\\subdir';


describe('pathTools', function() {
  it('getFilePath', function() {
    assert.equal(pathTools.getFilePath(pathUnix), pathUnix);
    assert.equal(pathTools.getFilePath(fileUnix), '/home/user/dir');
    assert.equal(pathTools.getFilePath(fileMarkdownUnix), '/home/user/dir');
    if (os.platform() == 'win32') {
      assert.equal(pathTools.getFilePath(pathWin), pathWin);
      assert.equal(pathTools.getFilePath(fileWin), 'C:\\path\\dir');
      assert.equal(pathTools.getFilePath(fileMarkdownWin), 'C:\\path\\dir');
    }
  });

  it('getPathFile', function() {
    assert.equal(pathTools.getPathFile(fileUnix), 'file.txt');
    assert.equal(pathTools.getPathFile(fileMarkdownUnix), 'file.md');
    if (os.platform() == 'win32') {
      assert.equal(pathTools.getPathFile(fileWin), 'index.html');
      assert.equal(pathTools.getPathFile(fileMarkdownWin), 'index.md');
    }
  });

  it('getTempPath', function() {
    assert.equal(pathTools.getTempPath(), os.tmpdir());
    assert(pathTools.getTempPath('test123').indexOf('test123') != -1);
  });

  it('getRandomTempPath', function() {
    let path1 = pathTools.getRandomTempPath();
    let path2 = pathTools.getRandomTempPath();
    assert(path1 !== path2);
    assert(path1.indexOf(os.tmpdir()) !== -1);
    assert(path2.indexOf(os.tmpdir()) !== -1);
  });

  it('getUrlFile', function() {
    assert.equal(pathTools.getUrlFile(fileRemote), 'file.xml');
    assert.equal(pathTools.getUrlFile(fileRemoteHash), 'file.xml');
  });
});
