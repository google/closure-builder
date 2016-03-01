/**
 * @fileoverview Closure Builder Test - Build config
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
var closureBuilder = require('../closure-builder');

var strucConfig = {
  'debug': true,
  'name': 'test1',
  'sources': [
    'test_files/test1.js'
  ],
  'options': {
    'soy': {},
    'closure': {},
    'exclude_test': true
  },
  jscomp_off: ['1', '2', '3'],
  jscomp_warning: ['2', '3', '1'],
  jscomp_error: ['3', '1', '1']
};

var pathOutConfig = {'out': 'folder1/folder2/'};
var fileOutConfig = {'out': 'folder1/folder2/file1.txt'};
var emptyOutConfig = {'out': ''};


describe('BuildConfig', function() {

  describe('Structure', function() {
    var buildConfig = closureBuilder.getBuildConfig(strucConfig);
    it('this.config', function() {
      assert.equal(buildConfig.config, strucConfig);
    });
    it('this.debug', function() {
      assert.equal(buildConfig.debug, strucConfig.debug);
    });
    it('this.exclude_test', function() {
      assert.equal(buildConfig.excludeTest, strucConfig.options.exclude_test);
    });
    it('this.name', function() {
      assert.equal(buildConfig.name, strucConfig.name);
    });
    it('this.options', function() {
      assert.equal(buildConfig.options, strucConfig.options);
    });
    it('this.jscomp_off', function() {
      assert.equal(buildConfig.jscompOff, strucConfig.jscomp_off);
    });
    it('this.jscomp_warning', function() {
      assert.equal(buildConfig.jscompWarning, strucConfig.jscomp_warning);
    });
    it('this.jscomp_error', function() {
      assert.equal(buildConfig.jscompError, strucConfig.jscomp_error);
    });
  });
  describe('this.out', function() {
    it('path', function() {
      var buildConfig = closureBuilder.getBuildConfig(pathOutConfig);
      assert.equal(buildConfig.outPath, pathOutConfig.out);
      assert(buildConfig.outFile);
    });
    it('file', function() {
      var buildConfig = closureBuilder.getBuildConfig(fileOutConfig);
      assert(buildConfig.outPath);
      assert.equal(buildConfig.outFile, 'file1.txt');
    });
    it('empty', function() {
      var buildConfig = closureBuilder.getBuildConfig(emptyOutConfig);
      assert(buildConfig.outPath);
      assert(buildConfig.outFile);
    });
  });

});
