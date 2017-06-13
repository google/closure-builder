/**
 * @fileoverview Closure Compilers - Closure Templates Compiler
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
let fs = require('fs');

let closureTemplates = require('../../compilers/closure-templates/compiler.js');


describe('Closure Templates::', function() {
  it('Single file', function(done) {
    this.timeout(25000);
    let files = ['test_files/soy_test_1.soy'];
    closureTemplates.compile(files, null, null,
      function(errors, warnings, files) {
        assert(!errors);
        assert(!warnings);
        let content = fs.readFileSync(files[0]).toString();
        assert(content.indexOf('soy_test_1.helloName') !== -1);
        assert(content.indexOf('goog.provide(\'soy_test_1\');') === -1);
        done();
      });
  });

  it('Two files', function(done) {
    this.timeout(25000);
    let files = [
      'test_files/soy_test_1.soy',
      'test_files/soy_test_2.soy',
    ];
    closureTemplates.compile(files, null, null,
      function(errors, warnings, files) {
        assert(!errors);
        assert(!warnings);
        let content1 = fs.readFileSync(files[0]).toString();
        let content2 = fs.readFileSync(files[1]).toString();
        assert(content1.indexOf('soy_test_1.helloName') !== -1);
        assert(content1.indexOf('goog.provide(\'soy_test_1\');') === -1);
        assert(content2.indexOf('soy_test_2.helloName') !== -1);
        assert(content2.indexOf('soy_test_2.helloNames') !== -1);
        assert(content2.indexOf('goog.provide(\'soy_test_2\');') === -1);
        done();
      });
  });

  it('shouldProvideRequireSoyNamespaces', function(done) {
    this.timeout(25000);
    let files = ['test_files/soy_test_1.soy'];
    let options = {
      shouldProvideRequireSoyNamespaces: true,
    };
    closureTemplates.compile(files, options, null,
      function(errors, warnings, files) {
        assert(!errors);
        assert(!warnings);
        let content = fs.readFileSync(files[0]).toString();
        assert(content.indexOf('soy_test_1.helloName') !== -1);
        assert(content.indexOf('goog.provide(\'soy_test_1\');') !== -1);
        done();
      });
  });

  describe('shouldGenerateGoogMsgDefs', function() {
    it('bidiGlobalDir', function(done) {
      this.timeout(25000);
      let files = ['test_files/soy_test_3.soy'];
      let options = {
        shouldGenerateGoogMsgDefs: true,
        bidiGlobalDir: 1,
      };
      closureTemplates.compile(files, options, null,
        function(errors, warnings, files) {
          assert(!errors);
          assert(!warnings);
          let content = fs.readFileSync(files[0]).toString();
          assert(content.indexOf('var soy_test_3 = {}') !== -1);
          assert(content.indexOf('goog.getMsg(') !== -1);
          done();
        });
    });

    it('useGoogIsRtlForBidiGlobalDir', function(done) {
      this.timeout(25000);
      let files = ['test_files/soy_test_3.soy'];
      let options = {
        shouldGenerateGoogMsgDefs: true,
        shouldProvideRequireSoyNamespaces: true,
        useGoogIsRtlForBidiGlobalDir: true,
      };
      closureTemplates.compile(files, options, null,
        function(errors, warnings, files) {
          assert(!errors);
          assert(!warnings);
          let content = fs.readFileSync(files[0]).toString();
          assert(content.indexOf('goog.provide(\'soy_test_3\');') !== -1);
          assert(content.indexOf('goog.require(\'goog.i18n.bidi\');') !== -1);
          assert(content.indexOf('goog.getMsg(') !== -1);
          assert(content.indexOf('MSG_EXTERNAL_') === -1);
          done();
        });
    });

    it('googMsgsAreExternal', function(done) {
      this.timeout(25000);
      let files = ['test_files/soy_test_3.soy'];
      let options = {
        shouldGenerateGoogMsgDefs: true,
        shouldProvideRequireSoyNamespaces: true,
        googMsgsAreExternal: true,
        useGoogIsRtlForBidiGlobalDir: true,
      };
      closureTemplates.compile(files, options, null,
        function(errors, warnings, files) {
          assert(!errors);
          assert(!warnings);
          let content = fs.readFileSync(files[0]).toString();
          assert(content.indexOf('goog.provide(\'soy_test_3\');') !== -1);
          assert(content.indexOf('goog.require(\'goog.i18n.bidi\');') !== -1);
          assert(content.indexOf('goog.getMsg(') !== -1);
          assert(content.indexOf('MSG_EXTERNAL_') !== -1);
          done();
        });
    });

    it('googMsgsAreExternal - bidiGlobalDir', function(done) {
      this.timeout(25000);
      let files = ['test_files/soy_test_3.soy'];
      let options = {
        shouldGenerateGoogMsgDefs: true,
        shouldProvideRequireSoyNamespaces: true,
        googMsgsAreExternal: true,
        bidiGlobalDir: 1,
      };
      closureTemplates.compile(files, options, null,
        function(errors, warnings, files) {
          assert(!errors);
          assert(!warnings);
          let content = fs.readFileSync(files[0]).toString();
          assert(content.indexOf('goog.provide(\'soy_test_3\');') !== -1);
          assert(content.indexOf('goog.require(\'goog.i18n.bidi\');') === -1);
          assert(content.indexOf('goog.getMsg(') !== -1);
          assert(content.indexOf('MSG_EXTERNAL_') !== -1);
          done();
        });
    });
  });


  it('Custom i18n function', function(done) {
    this.timeout(25000);
    let files = ['test_files/soy_test_3.soy'];
    let options = {
      i18n: 'i18nTest',
    };
    closureTemplates.compile(files, options, null,
      function(errors, warnings, files) {
        assert(!errors);
        assert(!warnings);
        let content = fs.readFileSync(files[0]).toString();
        assert(content.includes('goog.provide(\'soy_test_3\');'));
        assert(!content.includes('goog.require(\'goog.i18n.bidi\');'));
        assert(!content.includes('goog.getMsg('));
        assert(content.includes('i18nTest('));
        assert(content.includes('MSG_EXTERNAL_'));
        done();
      });
  });

/*
  it('Custom i18n tags', function(done) {
    this.timeout(25000);
    var files = ['test_files/special/soy_test_i18n.soy'];
    var options = {
      use_i18n: true
    };
    closureTemplates.compile(files, options, null,
      function(errors, warnings, files) {
        assert(!errors);
        assert(!warnings);
        var content = fs.readFileSync(files[0]).toString();
        assert(content.indexOf('goog.provide(\'soy_test_i18n\');') !== -1);
        assert(content.indexOf('{i18n}') === -1);
        assert(content.indexOf('{/i18n}') === -1);
        assert(content.indexOf('goog.getMsg(') === -1);
        assert(content.indexOf('i18nTest(') !== -1);
        assert(content.indexOf('MSG_EXTERNAL_') !== -1);
        done();
      });
  });
*/
});
