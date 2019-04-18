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
let assert = require('assert');

let closureCompiler = require('../../compilers/closure-compiler/compiler.js');
let memoryTools = require('../../tools/memory.js');

let largeMemoryTest = memoryTools.checkAvailableMemory(600);


describe('Closure Compiler:local:', function() {
  it('Soy file', function(done) {
    if (!largeMemoryTest) {
      return done();
    }
    this.timeout(140000);
    let files = [
      'test_files/special/closure_soy_test.js',
      'test_files/special/closure_soy_test.soy.js',
    ];
    let options = {
      dependency_mode: 'STRICT',
      entry_point: 'closure_test_soy_file',
      use_closure_templates: true,
    };
    closureCompiler.localCompile(files, options, null,
      function(errors, warnings, files, content) {
        assert(!errors);
        assert(!warnings);
        assert(content);
        done();
      });
  });
});
