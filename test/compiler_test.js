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
var closureBuilder = require('../closure-builder');
var fs = require('fs-extra');
var glob = closureBuilder.globSupport();
var os = require('os');
var memoryLimit = 600 * 100000000; // 600 MB
var largeMemoryTest = (os.freemem() >= memoryLimit);

var closureLibraryConfig = {
  name: 'closure_library_test',
  srcs: [
    'test_files/closure_library_test.js'
  ]
};
var optionLicenseConfig = {
  name: 'option_license',
  srcs: [
    'test_files/test1.js'
  ],
  license: 'test_files/license-header.md'
};
var cssConfig = {
  name: 'css_files',
  srcs: glob([
    'test_files/*.css',
    'test_files/*.htm'
  ])
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
  ])
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
      this.timeout(20000);
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
  describe('Closure library', function() {
    it('compile', function(done) {
      this.timeout(60000);
      if (!largeMemoryTest) {
        return done();
      }
      closureBuilder.build(closureLibraryConfig, function() {
        done();
      });
    });
  });
});
