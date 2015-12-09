/**
 * @fileoverview Closure Builder Test - Compiler
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
var fs = require('fs-extra');
var path = require('path');

var buildTools = require('../build_tools.js');
var closureBuilder = require('../closure-builder');
var glob = closureBuilder.globSupport();
var largeMemoryTest = !buildTools.checkAvailableMemory(600);

var testDirectory = buildTools.getTempPath('closure-builder-test');

var closureLibraryConfig = {
  name: 'closure_library_test',
  srcs: [
    'test_files/closure_library_test.js'
  ],
  out: path.join(testDirectory, 'closure-library')
};
var soyTestConfig = {
  name: 'soy_test',
  srcs: [
    'test_files/test.soy'
  ],
  out: path.join(testDirectory, 'soy')
};
var closureTest1Config = {
  name: 'closure_test_1',
  srcs: [
    'test_files/closure_test_1.js'
  ],
  out: path.join(testDirectory, 'closure-test-1')
};
var closureTest2Config = {
  name: 'closure_test_2',
  srcs: [
    'test_files/closure_test_1.js',
    'test_files/closure_test_2.js'
  ],
  out: path.join(testDirectory, 'closure-test-2')
};
var closureTest3Config = {
  name: 'closure_test_3',
  srcs: glob([
    'test_files/closure_test_*.js'
  ]),
  out: path.join(testDirectory, 'closure-test-3')
};
var closureECMAScript6Config = {
  name: 'closure_test_ecma6',
  srcs: glob([
    'test_files/closure_test_*.js'
  ]),
  out: path.join(testDirectory, 'closure-test-ecma6')
};
var closureNoECMAScript6Config = {
  name: 'closure_test_no_ecma6',
  srcs: glob([
    'test_files/closure_test_1.js',
    'test_files/closure_test_2.js',
    'test_files/closure_test_no_ecma6.js'
  ]),
  out: path.join(testDirectory, 'closure-test-no-ecma6')
};
var optionLicenseConfig = {
  name: 'option_license',
  srcs: [
    'test_files/test1.js'
  ],
  license: 'test_files/license-header.md',
  out: path.join(testDirectory, 'license-files')
};
var cssConfig = {
  name: 'css_files',
  srcs: glob([
    'test_files/*.css',
    'test_files/*.htm'
  ]),
  out: path.join(testDirectory, 'css-files')
};
var resourcesConfig = {
  name: 'resources',
  resources: glob([
    'test_files/resources/**/*.css',
    'test_files/resources/**/*.htm',
    'test_files/resources/**/*.html',
    'test_files/resources/**/*.jpg',
    'test_files/resources/**/*.gif',
    'test_files/resources/**/*.png',
    'test_files/resources/**/*.xml'
  ]),
  out: path.join(testDirectory, 'local-resources')
};
var resourceUrl= 'raw.githubusercontent.com/google/closure-builder/master/' +
  'test_files/resources/';
var resourcesRemoteConfig = {
  name: 'remote_resources',
  resources: [
    'https://' + resourceUrl + 'file.js?test=1&test=2',
    'http://' + resourceUrl + 'file.html?test=1&test=2',
    'https://' + resourceUrl + 'file.jpg?test=1&test=2',
    'https://' + resourceUrl + 'file.gif#test',
    'https://' + resourceUrl + 'file.png?test=1&test=2',
    'http://' + resourceUrl + 'file.xml?test=1&test=2',
    'http://' + resourceUrl + 'file.css#test'
  ],
  out: path.join(testDirectory, 'remote-resources')
};

describe('ClosureBuilder', function() {
  it('Object', function() {
    assert.equal(typeof closureBuilder, 'object');
  });
  it('function', function() {
    assert.equal(typeof closureBuilder.build, 'function');
  });
  describe('Options', function() {
    it('license', function(done) {
      this.timeout(30000);
      closureBuilder.build(optionLicenseConfig, function(out, content) {
        var license = fs.readFileSync(optionLicenseConfig.license, 'utf8');
        assert(content.indexOf(license) != -1);
        done();
      });
    });
  });
  describe('CSS files', function() {
    it('compile', function(done) {
      this.timeout(20000);
      closureBuilder.build(cssConfig, function(out, content) {
        var expected = '.menueliste li a,.submenue li a{text-decoration:none}' +
          'body{margin:0;padding:0;background:#e4e9ec}#container1,#container2' +
          ',#container3{width:900px}#content{background:red;margin:0 5px;min-' +
          'height:1050px}#menu{margin:50px auto;border:1px solid #000}.menuel' +
          'iste li{text-align:center;display:block;margin:25px 0 0;background' +
          ':#7d94a1;list-style:none}.menueliste li a:hover{display:block;bord' +
          'er-left:10px solid #bacbe3;border-right:10px solid #7d94a1;backgro' +
          'und:#60777f}.submenue li{margin:0;padding:0;text-align:left;border' +
          '-bottom:1px solid #60777f;list-style:none}.submenue li a{display:b' +
          'lock;padding:5px 5px 5px .5em;border-left:10px solid #7d94a1;borde' +
          'r-right:10px solid #bacbe3;background:#9aacbb;width:119px}.submenu' +
          'e li a:hover{padding:5px 5px 5px .5em;border-left:10px solid #1c64' +
          'd1;border-right:10px solid #5ba3e0;background:#7d94a1}';
        assert.equal(content, expected);
        done();
      });
    });
  });
  describe('Resources files', function() {
    it('compile', function(done) {
      this.timeout(20000);
      closureBuilder.build(resourcesConfig, function() {
        done();
      });
    });
  });
  describe('Remote resources files', function() {
    it('compile', function(done) {
      this.timeout(20000);
      closureBuilder.build(resourcesRemoteConfig, function() {
        done();
      });
    });
  });
  describe('Soy file', function() {
    it('compile', function(done) {
      this.timeout(20000);
      closureBuilder.build(soyTestConfig, function() {
        done();
      });
    });
  });
  describe('Closure files', function() {
    it('Single file', function(done) {
      this.timeout(20000);
      closureBuilder.build(closureTest1Config, function() {
        done();
      });
    });
    it('Two files', function(done) {
      this.timeout(20000);
      closureBuilder.build(closureTest2Config, function() {
        done();
      });
    });
    it('ECMA Script 6', function(done) {
      this.timeout(20000);
      closureBuilder.build(closureECMAScript6Config, function() {
        done();
      });
    });
    it('No ECMA Script 6', function(done) {
      this.timeout(20000);
      closureBuilder.build(closureNoECMAScript6Config, function() {
        done();
      });
    });
    it('Group of files', function(done) {
      this.timeout(20000);
      closureBuilder.build(closureTest3Config, function() {
        done();
      });
    });
  });
  describe('Closure library', function() {
    it('compile', function(done) {
      this.timeout(120000);
      if (!largeMemoryTest) {
        return done();
      }
      closureBuilder.build(closureLibraryConfig, function() {
        done();
      });
    });
  });
});
