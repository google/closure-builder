/**
 * @fileoverview Closure Compilers - Closure Compiler
 *
 * @license Copyright 2017 Google Inc. All Rights Reserved.
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

let fileTools = require('../../tools/file.js');
let memoryTools = require('../../tools/memory.js');

let closureCompiler = require('../../compilers/closure-compiler/compiler.js');

let glob = fileTools.getGlobFiles;
let largeMemoryTest = memoryTools.checkAvailableMemory(600);


describe('Closure Compiler:remote:', function() {
  it('Single file', function(done) {
    this.timeout(25000);
    let files = ['test_files/closure_test_1.js'];
    closureCompiler.remoteCompile(files, null, null,
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
    let files = [
      'test_files/closure_test_1.js',
      'test_files/closure_test_2.js',
    ];
    closureCompiler.remoteCompile(files, null, null,
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

  it('Expected Error Message', function(done) {
    this.timeout(30000);
    let files = ['test_files/special/closure_error.js'];
    let options = {};
    closureCompiler.remoteCompile(files, options, null,
      function(errors, warnings, files, content) {
        assert(errors);
        assert(!warnings);
        assert(!content);
        done();
      });
  });

  it('Expected Warning Message', function(done) {
    this.timeout(30000);
    let files = ['test_files/special/closure_warning.js'];
    let options = {};
    closureCompiler.remoteCompile(files, options, null,
      function(errors, warnings, files, content) {
        assert(!errors);
        assert(warnings);
        assert(content);
        done();
      });
  });

  it('Closure Library', function(done) {
    if (!largeMemoryTest) {
      return done();
    }
    this.timeout(25000);
    let files = ['test_files/closure_library_test.js'];
    let options = {
      use_closure_library: true,
    };
    closureCompiler.remoteCompile(files, options, null,
      function(errors, warnings, files, content) {
        assert(!errors);
        assert(!warnings);
        assert(content);
        done();
      });
  });

  it('Soy file', function(done) {
    this.timeout(25000);
    let files = [
      'test_files/special/closure_soy_test.js',
      'test_files/special/closure_soy_test.soy.js',
    ];
    let options = {
      use_closure_templates: true,
    };
    closureCompiler.remoteCompile(files, options, null,
      function(errors, warnings, files, content) {
        assert(!errors);
        assert(!warnings);
        assert(content);
        done();
      });
  });

  it('Unsupported Closure entry point', function(done) {
    this.timeout(25000);
    let files = glob(['test_files/closure_test_*.js']);
    let options = {
      entry_point: 'closure_test_group',
    };
    closureCompiler.remoteCompile(files, options, null,
      function(errors, warnings, files, content) {
        assert(errors);
        assert(!warnings);
        assert(!content);
        done();
      });
  });

  it('Unsupported @export handling', function(done) {
    this.timeout(40000);
    let files = ['test_files/special/closure_export.js'];
    let options = {
      generate_exports: true,
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
