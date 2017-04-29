/**
 * @fileoverview Rollup Compiler
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
var assert = require('assert');
var path = require('path');

var fileTools = require('../../tools/file.js');
var pathTools = require('../../tools/path.js');

var rollupCompiler = require('../../compilers/rollup/compiler.js');

var testDirectory = pathTools.getTempPath('roller-compiler-test');


describe('Rollup Compiler::', function() {

  it('Single file - direct output', function(done) {
    this.timeout(25000);
    var file = ['test_files/umd/umd-main.js'];
    var options = {
      format: 'umd',
      moduleName: 'MainDirect'
    };
    rollupCompiler.compile(file, options, null,
      (errors, warnings, file, content) => {
        assert(!file);
        assert(!errors);
        assert(!warnings);
        assert(content);
        assert(content.includes(options.moduleName));
        assert(content.includes('Hello'));
        assert(content.includes('World'));
        done();
      });
  });

  it('Single file - write output to file', function(done) {
    this.timeout(25000);
    var file = ['test_files/umd/umd-main.js'];
    var outputFile = path.join(testDirectory, 'node_test_bundle.js');
    var options = {
      format: 'umd',
      moduleName: 'MainFile'
    };
    rollupCompiler.compile(file, options, outputFile,
      (errors, warnings, file, content) => {
        assert(content);
        assert(file);
        assert(!errors);
        assert(!warnings);
        var result = fileTools.readFile(file);
        assert(result);
        assert(result.includes(options.moduleName));
        assert(result.includes('Hello'));
        assert(result.includes('World'));
        done();
      });
  });

  it('Expected Error Message', function(done) {
    this.timeout(25000);
    var file = ['test_files/umd/umd-error.js'];
    var options = {
      format: 'umd',
      moduleName: 'MainError'
    };
    rollupCompiler.compile(file, options, null,
      (errors, warnings, file, content) => {
        assert(!content);
        assert(!warnings);
        assert(errors);
        assert(errors.code == 'UNRESOLVED_IMPORT');
        done();
      });
  });

});
