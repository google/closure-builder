/**
 * @fileoverview Closure Compilers - Closure Compiler
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
var assert = require('assert');
var buildTools = require('../build_tools.js');
var closureCompiler = require('../compilers/closure-compiler/compiler.js');
var glob = buildTools.getGlobFiles;

describe('Closure Compiler', function() {

  // Remote compiler tests
  describe('Remote Compiler', function() {
    it('Single file', function(done) {
      this.timeout(25000);
      closureCompiler.remoteCompile(['test_files/closure_test_1.js'], null, null,
        function(errors, warnings, file, content) {
          assert(!errors);
          assert(!warnings);
          assert.equal(content,
            'var closure_test_1=function(){return"_CLOSURE_TEST_1"};\n');
          done();
      });
    });
    it('Two files', function(done) {
      this.timeout(25000);
      closureCompiler.remoteCompile(['test_files/closure_test_1.js',
        'test_files/closure_test_2.js'], null, null,
        function(errors, warnings, file, content) {
          assert(!errors);
          assert(!warnings);
          assert.equal(content,
            'var closure_test_1=function(){return"_CLOSURE_TEST_1"},' +
            'closure_test_2=function(){return closure_test_1()+' +
            '"_CLOSURE_TEST_2"};\n');
          done();
      });
    });
    it('Group of files', function(done) {
      this.timeout(25000);
      var files = glob(['test_files/closure_test_*.js']);
      var options = {
        only_closure_dependencies: true,
        manage_closure_dependencies: true,
        closure_entry_point: 'closure_test_group'
      };
      closureCompiler.remoteCompile(files, options, null,
        function(errors, warnings, files, content) {
          assert(errors);
          assert(!warnings);
          assert(!content);
          done();
        });
    });

  });


  // Local compiler tests
  describe('Local Compiler', function() {
    it('Single file', function(done) {
      this.timeout(25000);
      closureCompiler.localCompile(['test_files/closure_test_1.js'], null, null,
        function(errors, warnings, file, content) {
          assert(!errors);
          assert(!warnings);
          assert.equal(content,
            'var closure_test_1=function(){return"_CLOSURE_TEST_1"};\n');
          done();
        });
    });
    it('Two files', function(done) {
      this.timeout(25000);
      var files = ['test_files/closure_test_1.js',
        'test_files/closure_test_2.js'];
      closureCompiler.localCompile(files, null, null,
        function(errors, warnings, file, content) {
          assert(!errors);
          assert(!warnings);
          assert.equal(content,
            'var closure_test_1=function(){return"_CLOSURE_TEST_1"};' +
            'var closure_test_2=function(){return closure_test_1()+' +
            '"_CLOSURE_TEST_2"};\n');
          done();
        });
    });
    it('Group of files', function(done) {
      this.timeout(25000);
      var files = glob(['test_files/closure_test_*.js']);
      var options = {
        only_closure_dependencies: true,
        manage_closure_dependencies: true,
        closure_entry_point: 'closure_test_group'
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, files, content) {
          assert(!errors);
          assert(!warnings);
          assert.equal(content, 
            'var closure_test_1=function(){return"_CLOSURE_TEST_1"};' +
            'var closure_test_2=function(){return closure_test_1()+' +
            '"_CLOSURE_TEST_2"};var closure_test_group=function(){' +
            'return closure_test_2()+"_CLOSURE_TEST_2"};\n');
          done();
        });
    });

  });

});


