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

var buildTools = require('../build_tools.js');
var closureBuilder = require('../closure-builder');
var testConfigs = require('../test/test_configs.js');
var largeMemoryTest = buildTools.checkAvailableMemory(600);

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
      closureBuilder.build(testConfigs.optionLicenseConfig,
        function(errors, warnings, out, content) {
          var license = fs.readFileSync(testConfigs.optionLicenseConfig.license,
            'utf8');
          assert(content.indexOf(license) != -1);
          done();
        });
    });
  });
  describe('CSS files', function() {
    it('compile', function(done) {
      this.timeout(20000);
      closureBuilder.build(testConfigs.cssConfig, function(errors, warnings,
          out, content) {
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
      closureBuilder.build(testConfigs.resourcesConfig, function() {
        done();
      });
    });
  });
  describe('Remote resources files', function() {
    it('compile', function(done) {
      this.timeout(20000);
      closureBuilder.build(testConfigs.resourcesRemoteConfig, function() {
        done();
      });
    });
  });
  describe('Soy file', function() {
    it('compile', function(done) {
      this.timeout(30000);
      closureBuilder.build(testConfigs.soyTestConfig, function() {
        done();
      });
    });
  });
  describe('Closure files', function() {
    it('Single file', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureTest1Config, function() {
        done();
      });
    });
    it('Two files', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureTest2Config, function() {
        done();
      });
    });
    it('ECMA Script 6', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureECMAScript6Config, function() {
        done();
      });
    });
    it('No ECMA Script 6', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureNoECMAScript6Config, function() {
        done();
      });
    });
    it('Group of files', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureTest3Config, function() {
        done();
      });
    });
    it('Expected Error Message', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureTestErrorConfig, function(
          errors, warnings) {
        assert(errors);
        assert(!warnings);
        done();
      });
    });
    it('Expected Warning Message', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureTestWarningConfig, function(
          errors, warnings) {
        assert(!errors);
        assert(warnings);
        done();
      });
    });
  });
  describe('Closure library', function() {
    it('compile', function(done) {
      if (!largeMemoryTest) {
        return done();
      }
      this.timeout(120000);
      closureBuilder.build(testConfigs.closureLibraryConfig, function() {
        done();
      });
    });
  });
});
