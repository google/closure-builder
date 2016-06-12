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

var largeMemoryTest = buildTools.checkAvailableMemory(600);
var onlineStatus = true;


describe('Closure Compiler::', function() {

  // Remote compiler tests
  describe('Remote Compiler:', function() {

    if (onlineStatus) {

      it('Single file', function(done) {
        this.timeout(25000);
        var files = ['test_files/closure_test_1.js'];
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
        var files = [
          'test_files/closure_test_1.js',
          'test_files/closure_test_2.js'
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
        var files =  ['test_files/special/closure_error.js'];
        var options = {};
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
        var files =  ['test_files/special/closure_warning.js'];
        var options = {};
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
        var files =  ['test_files/closure_library_test.js'];
        var options = {
          use_closure_library: true
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
        var files =  [
          'test_files/special/closure_soy_test.js',
          'test_files/special/closure_soy_test.soy.js'
        ];
        var options = {
          use_closure_templates: true
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
        var files = glob(['test_files/closure_test_*.js']);
        var options = {
          entry_point: 'closure_test_group'
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
        var files =  ['test_files/special/closure_export.js'];
        var options = {
          generate_exports: true
        };
        closureCompiler.remoteCompile(files, options, null,
          function(errors, warnings, files, content) {
            assert(errors);
            assert(!warnings);
            assert(!content);
            done();
          });
      });

    } else {
      console.warn('Skipping online tests...');
    }

  });

  // Local compiler tests
  describe('Local Compiler:', function() {

    it('Single file', function(done) {
      this.timeout(25000);
      var files = ['test_files/closure_test_1.js'];
      var options = {
        dependency_mode: 'STRICT',
        entry_point: 'closure_test_1'
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, file, content) {
          assert(!errors);
          assert(!warnings);
          assert(content);
          assert.equal(content,
            'var closure_test_1=function(){return"_CLOSURE_TEST_1"};\n');
          done();
        });
    });

    it('Two files', function(done) {
      this.timeout(25000);
      var files = [
        'test_files/closure_test_1.js',
        'test_files/closure_test_2.js'
      ];
      var options = {
        dependency_mode: 'STRICT',
        entry_point: 'closure_test_2'
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, file, content) {
          assert(!errors);
          assert(!warnings);
          assert(content);
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
        dependency_mode: 'STRICT',
        entry_point: 'closure_test_group'
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, files, content) {
          assert(!errors);
          assert(!warnings);
          assert(content);
          assert.equal(content,
            'var closure_test_1=function(){return"_CLOSURE_TEST_1"};' +
            'var closure_test_2=function(){return closure_test_1()+' +
            '"_CLOSURE_TEST_2"};var closure_test_group=function(){' +
            'return closure_test_2()+"_CLOSURE_TEST_2"};\n');
          done();
        });
    });

    it('Duplicate input files', function(done) {
      this.timeout(25000);
      var files = glob([
        'test_files/closure_test_*.js',
        'test_files/closure_test_duplicate.js'
      ]);
      var options = {
        dependency_mode: 'STRICT',
        entry_point: 'closure_test_duplicate'
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, files, content) {
          assert(!errors);
          assert(!warnings);
          assert(content);
          done();
        });
    });

    it('Externs', function(done) {
      this.timeout(25000);
      var files =  glob(['test_files/closure_test_*.js']);
      var options = {
        externs: ['test_files/externs.js'],
        dependency_mode: 'STRICT',
        entry_point: 'closure_test_extern'
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, files, content) {
          assert(!errors);
          assert(!warnings);
          assert(content);
          assert.equal(content,
            'var closure_test_extern=function(){return global_extern};\n');
          done();
        });
    });

    /**it('Module files', function(done) {
      this.timeout(30000);
      var files =  glob(['test_files/closure_test_*.js']);
      var options = {
        dependency_mode: 'STRICT',
        entry_point: 'closure_test_require_module',
        use_closure_basefile: true
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, files, content) {
          assert(!errors);
          assert(!warnings);
          assert(content);
          done();
        });
    });*/

    it('Expected Error Message', function(done) {
      this.timeout(30000);
      var files =  ['test_files/special/closure_error.js'];
      var options = {
        dependency_mode: 'STRICT',
        entry_point: 'closure_test_error'
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, files, content) {
          assert(errors);
          assert(!warnings);
          assert(!content);
          done();
        });
    });

    it('Expected Warning Message', function(done) {
      this.timeout(30000);
      var files =  ['test_files/special/closure_warning.js'];
      var options = {
        dependency_mode: 'STRICT',
        entry_point: 'closure_test_warning'
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, files, content) {
          assert(!errors);
          assert(warnings);
          assert(content);
          done();
        });
    });

    it('Automatic @export handling', function(done) {
      this.timeout(40000);
      var files =  ['test_files/special/closure_export.js'];
      var options = {
        dependency_mode: 'STRICT',
        generate_exports: true,
        entry_point: 'closure_test_export'
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, files, content) {
          assert(!errors);
          assert(!warnings);
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

    describe('ECMA Script 6', function() {
      it('Const', function(done) {
        this.timeout(40000);
        var files = glob(['test_files/closure_test_*.js']);
        var options = {
          dependency_mode: 'STRICT',
          entry_point: 'closure_test_ecma6_const',
          language_in: 'ECMASCRIPT6',
          language_out: 'ES5_STRICT'
        };
        closureCompiler.localCompile(files, options, null,
          function(errors, warnings, files, content) {
            assert(!errors);
            assert(!warnings);
            assert(content);
            done();
          });
      });
      it('Let', function(done) {
        this.timeout(40000);
        this.timeout(40000);
        var files = glob(['test_files/closure_test_*.js']);
        var options = {
          dependency_mode: 'STRICT',
          entry_point: 'closure_test_ecma6_let',
          language_in: 'ECMASCRIPT6',
          language_out: 'ES5_STRICT'
        };
        closureCompiler.localCompile(files, options, null,
          function(errors, warnings, files, content) {
            assert(!errors);
            assert(!warnings);
            assert(content);
            done();
          });
      });
      it('No ECMA Script 6', function(done) {
        this.timeout(40000);
        var files = [
          'test_files/closure_test_1.js',
          'test_files/closure_test_2.js',
          'test_files/closure_test_no_ecma6.js'
        ];
        var options = {
          dependency_mode: 'STRICT',
          entry_point: 'closure_test_no_ecma6'
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

    it('Closure Library', function(done) {
      if (!largeMemoryTest) {
        return done();
      }
      this.timeout(140000);
      var files =  ['test_files/closure_library_test.js'];
      var options = {
        dependency_mode: 'STRICT',
        entry_point: 'closure_library_test',
        use_closure_library: true
      };
      closureCompiler.localCompile(files, options, null,
        function(errors, warnings, files, content) {
          assert(!errors);
          assert(!warnings);
          assert(content);
          done();
        });
    });

    it('Soy file', function(done) {
      if (!largeMemoryTest) {
        return done();
      }
      this.timeout(140000);
      var files =  [
        'test_files/special/closure_soy_test.js',
        'test_files/special/closure_soy_test.soy.js'
      ];
      var options = {
        dependency_mode: 'STRICT',
        entry_point: 'closure_test_soy_file',
        use_closure_templates: true
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

});


