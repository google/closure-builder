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

var memoryTools = require('../tools/memory.js');

var closureBuilder = require('../closure-builder');
var testConfigs = require('../test/test_configs.js');
var largeMemoryTest = memoryTools.checkAvailableMemory(600);

describe('ClosureBuilder', function() {
  closureBuilder.showMessages(false);

  describe('Structure', function() {
    it('Object', function() {
      assert.equal(typeof closureBuilder, 'object');
    });
    it('build', function() {
      assert.equal(typeof closureBuilder.build, 'function');
    });
    it('showMessages', function() {
      assert.equal(typeof closureBuilder.showMessages, 'function');
    });
  });

  describe('Options', function() {
    it('license', function(done) {
      this.timeout(30000);
      closureBuilder.build(testConfigs.optionLicenseConfig,
        function(errors, warnings, files, content) {
          var license = fs.readFileSync(testConfigs.optionLicenseConfig.license,
            'utf8');
          assert(!errors);
          assert(content);
          assert(content.indexOf(license) != -1);
          done();
        });
    });
  });

  describe('CSS files', function() {
    it('compile', function(done) {
      this.timeout(20000);
      closureBuilder.build(testConfigs.cssConfig, function(errors, warnings,
          files, content) {
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
        assert(!errors);
        assert(content);
        assert.equal(content, expected);
        done();
      });
    });
  });

  describe('Resources files', function() {
    it('copy', function(done) {
      this.timeout(20000);
      closureBuilder.build(testConfigs.resourcesConfig, function(errors) {
        assert(!errors);
        done();
      });
    });
    it('Expected Error message', function(done) {
      this.timeout(20000);
      closureBuilder.build(testConfigs.resourcesNotExistsConfig,
      function(errors) {
        assert(errors);
        done();
      });
    });
  });

  describe('Remote resources files', function() {
    it('downloading', function(done) {
      this.timeout(20000);
      closureBuilder.build(testConfigs.resourcesRemoteConfig, function(errors) {
        assert(!errors);
        done();
      });
    });
  });

  describe('Soy file', function() {
    it('compile', function(done) {
      this.timeout(30000);
      closureBuilder.build(testConfigs.soyTestConfig, function(errors,
          warnings, files) {
        assert(!errors);
        assert(!warnings);
        assert(files);
        done();
      });
    });

  });

  describe('ECMA Script 6', function() {
    it('Const', function(done) {
      this.timeout(40000);
      closureBuilder.build(testConfigs.closureECMAScript6ConstConfig, function(
          errors) {
        assert(!errors);
        done();
      });
    });
    it('Let', function(done) {
      this.timeout(40000);
      closureBuilder.build(testConfigs.closureECMAScript6LetConfig, function(
          errors) {
        assert(!errors);
        done();
      });
    });
    it('No ECMA Script 6', function(done) {
      this.timeout(40000);
      closureBuilder.build(testConfigs.closureNoECMAScript6Config, function(
          errors) {
        assert(!errors);
        done();
      });
    });
  });

  describe('Markdown files', function() {
    it('Convert to HTML', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.markdownConfig, function(errors) {
        assert(!errors);
        done();
      });
    });
  });

  describe('Closure files', function() {
    it('Single file', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureTest1Config, function(errors) {
        assert(!errors);
        done();
      });
    });
    it('Two files', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureTest2Config, function(errors) {
        assert(!errors);
        done();
      });
    });
    it('Group of files', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureTestGroupConfig, function(
          errors, warnings) {
        assert(!errors);
        assert(!warnings);
        done();
      });
    });
    it('Module files', function(done) {
      this.timeout(30000);
      closureBuilder.build(testConfigs.closureTestModuleConfig, function(
          errors, warnings) {
        console.log(errors, warnings);
        assert(!errors);
        assert(!warnings);
        done();
      });
    });
    it('Duplicate input files', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureTestDuplicateConfig, function(
          errors, warnings) {
        assert(!errors);
        assert(!warnings);
        done();
      });
    });
    it('Externs', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.closureTestExternConfig, function(
          errors, warnings) {
        assert(!errors);
        assert(!warnings);
        done();
      });
    });
    it('Expected Error Message', function(done) {
      this.timeout(30000);
      closureBuilder.build(testConfigs.closureTestErrorConfig, function(
          errors, warnings) {
        assert(errors);
        assert(!warnings);
        done();
      });
    });
    it('Expected Warning Message', function(done) {
      this.timeout(30000);
      closureBuilder.build(testConfigs.closureTestWarningConfig, function(
          errors, warnings) {
        assert(!errors);
        assert(warnings);
        done();
      });
    });
    it('Disabled Warning Message', function(done) {
      this.timeout(30000);
      closureBuilder.build(testConfigs.closureTestWarningDisabledConfig,
        function(errors, warnings) {
          assert(!errors);
          assert(!warnings);
          done();
        });
    });
    it('Automatic @export handling', function(done) {
      this.timeout(40000);
      closureBuilder.build(testConfigs.closureTestExportConfig, function(
          errors, warnings, files, content) {
        assert(!errors);
        assert(content);
        assert(content.indexOf(
          'goog.exportSymbol("closure_test_export"') !== -1);
        assert(content.indexOf(
          'goog.exportProperty(closure_test_export.prototype,"visible"'
          ) !== -1);
        assert(content.indexOf(
          'goog.exportProperty(closure_test_export.prototype,"invisible'
          ) === -1);
        done();
      });
    });
  });

  describe('NodeJs', function() {
    it('compile', function(done) {
      this.timeout(30000);
      closureBuilder.build(testConfigs.nodeTestConfig, function(errors,
          warnings, files) {
        assert(!errors);
        assert(!warnings);
        assert(files);
        done();
      });
    });
  });

  describe('NodeJs - Type overwrite', function() {
    it('compile', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.nodeToJsTestConfig, function(errors,
          warnings, files, content) {
        assert(!errors);
        assert(!warnings);
        assert(content);
        done();
      });
    });
  });

  describe('Closure library', function() {
    it('compile', function(done) {
      if (!largeMemoryTest) {
        return done();
      }
      this.timeout(140000);
      closureBuilder.build(testConfigs.closureLibraryConfig, function(errors,
          warnings, files, content) {
        assert(!errors);
        assert(!warnings);
        assert(content);
        assert(content.indexOf('closure_library_test=func') !== -1);
        assert(content.indexOf('goog.ui.Button=func') !== -1);
        assert(content.indexOf('goog.ui.CharPicker=func') !== -1);
        assert(content.indexOf('goog.ui.MenuItem=func') !== -1);
        done();
      });
    });
  });

  describe('Closure library - Remote Service', function() {
    it('compile', function(done) {
      if (!largeMemoryTest) {
        return done();
      }
      this.timeout(140000);
      closureBuilder.build(testConfigs.closureLibraryConfigRemoteService,
        function(errors, warnings, files, content) {
          assert(!errors);
          assert(!warnings);
          assert(content);
          assert(content.indexOf('closure_library_test=func') !== -1);
          assert(content.indexOf('goog.ui.Button=func') !== -1);
          assert(content.indexOf('goog.ui.CharPicker=func') !== -1);
          assert(content.indexOf('goog.ui.MenuItem=func') !== -1);
          done();
        });
    });
  });

});
