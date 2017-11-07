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
let assert = require('assert');
let fs = require('fs-extra');

let memoryTools = require('../tools/memory.js');

let closureBuilder = require('../closure-builder');
const closureCompilerConfig = require(
  '../test/configs/closure_compiler_config.js');
const cssConfig = require('../test/configs/css_config.js');
const rollupConfig = require('../test/configs/rollup_config.js');
const testConfigs = require('../test/test_configs.js');
let largeMemoryTest = memoryTools.checkAvailableMemory(600);

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
          let license = fs.readFileSync(testConfigs.optionLicenseConfig.license,
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
      closureBuilder.build(cssConfig.general, function(errors, warnings,
          files, content) {
        assert(!errors);
        console.log(content);
        assert(content);
        assert(content.includes('body{margin:0;padding:0;background:#e4e9ec}'));
        assert(content.includes('.submenue li a{display:block;'));
        assert(content.includes(
          '.submenue li a:hover{padding:5px 5px 5px .5em;'));
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

  describe('Closure Stylesheets file', function() {
    it('compile', function(done) {
      this.timeout(30000);
      closureBuilder.build(testConfigs.closureStylesheetsTestConfig, function(
          errors, warnings) {
        assert(!errors);
        assert(!warnings);
        done();
      });
    });
  });

  describe('Closure files', function() {
    it('Single file', function(done) {
      this.timeout(25000);
      closureBuilder.build(closureCompilerConfig.general1, function(errors) {
        assert(!errors);
        done();
      });
    });
    it('Two files', function(done) {
      this.timeout(25000);
      closureBuilder.build(closureCompilerConfig.general2, function(errors) {
        assert(!errors);
        done();
      });
    });
    it('Group of files', function(done) {
      this.timeout(25000);
      closureBuilder.build(closureCompilerConfig.group, function(
          errors, warnings) {
        assert(!errors);
        assert(!warnings);
        done();
      });
    });
    it('Module files', function(done) {
      this.timeout(30000);
      closureBuilder.build(closureCompilerConfig.module, function(
          errors, warnings) {
        assert(!errors);
        assert(!warnings);
        done();
      });
    });
    it('Duplicate input files', function(done) {
      this.timeout(25000);
      closureBuilder.build(closureCompilerConfig.duplicate, function(
          errors, warnings) {
        assert(!errors);
        assert(!warnings);
        done();
      });
    });
    it('Externs', function(done) {
      this.timeout(25000);
      closureBuilder.build(closureCompilerConfig.extern, function(
          errors, warnings) {
        assert(!errors);
        assert(!warnings);
        done();
      });
    });
    it('Expected Error Message', function(done) {
      this.timeout(30000);
      closureBuilder.build(closureCompilerConfig.error, function(
          errors, warnings) {
        assert(errors);
        assert(!warnings);
        done();
      });
    });
    it('Expected Warning Message', function(done) {
      this.timeout(30000);
      closureBuilder.build(closureCompilerConfig.warning, function(
          errors, warnings) {
        assert(!errors);
        assert(warnings);
        done();
      });
    });
    it('Disabled Warning Message', function(done) {
      this.timeout(30000);
      closureBuilder.build(closureCompilerConfig.warningDisabled,
        function(errors, warnings) {
          assert(!errors);
          assert(!warnings);
          done();
        });
    });
    it('Automatic @export handling', function(done) {
      this.timeout(40000);
      closureBuilder.build(closureCompilerConfig.export, function(
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
    it('Type overwrite', function(done) {
      this.timeout(25000);
      closureBuilder.build(testConfigs.nodeToJsTestConfig, function(errors,
          warnings, files, content) {
        assert(!errors);
        assert(content);
        done();
      });
    });
  });

  describe('Rollup', function() {
    it('compile', function(done) {
      this.timeout(5000);
      closureBuilder.build(rollupConfig.test_1, function(errors,
          warnings, file, content) {
        assert(!errors);
        assert(!warnings);
        assert(file);
        assert(content);
        done();
      });
    });
  });

  describe('Closure library', function() {
    it('Compile', function(done) {
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
        assert(content.indexOf('goog.Promise=func') !== -1);
        assert(content.indexOf('goog.Timer=func') !== -1);
        done();
      });
    });
    it('Compile goog.ui', function(done) {
      if (!largeMemoryTest) {
        return done();
      }
      this.timeout(140000);
      closureBuilder.build(testConfigs.closureLibraryUiConfig, function(errors,
          warnings, files, content) {
        assert(!errors);
        assert(content);
        assert(content.indexOf('closure_library_ui_test=func') !== -1);
        assert(content.indexOf('goog.ui.Button=func') !== -1);
        assert(content.indexOf('goog.ui.CharPicker=func') !== -1);
        assert(content.indexOf('goog.ui.MenuItem=func') !== -1);
        done();
      });
    });
  });

  describe('Closure library - Remote Service', function() {
    it('Compile', function(done) {
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
          assert(content.indexOf('goog.Promise=func') !== -1);
          assert(content.indexOf('goog.Timer=func') !== -1);
          done();
        });
    });
    it('Compile goog.ui', function(done) {
      if (!largeMemoryTest) {
        return done();
      }
      this.timeout(140000);
      closureBuilder.build(testConfigs.closureLibraryUiConfigRemoteService,
        function(errors, warnings, files, content) {
          assert(!errors);
          assert(!warnings);
          assert(content);
          assert(content.indexOf('closure_library_ui_test=func') !== -1);
          assert(content.indexOf('goog.ui.Button=func') !== -1);
          assert(content.indexOf('goog.ui.CharPicker=func') !== -1);
          assert(content.indexOf('goog.ui.MenuItem=func') !== -1);
          done();
        });
    });
  });
});
