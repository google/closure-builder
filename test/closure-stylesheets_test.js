/**
 * @fileoverview Closure Compilers - Closure Stylesheets Compiler
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

var closureStylesheets = require(
  '../compilers/closure-stylesheets/compiler.js');



describe('Closure Stylesheets::', function() {

  it('Single file', function(done) {
    this.timeout(25000);
    var files = ['test_files/test_1.gss'];
    closureStylesheets.compile(files, null, null,
      function(errors, warnings, file, code) {
        assert(!errors);
        assert(!warnings);
        assert(code.includes('body{background-color:#ebeff9}'));
        assert(code.includes(
          '.dialog{background-color:#ebeff9;border:1px solid #6b90da}'));
        done();
      });
  });

  it('Two files', function(done) {
    this.timeout(25000);
    var files = [
      'test_files/test_1.gss',
      'test_files/test_2.gss'
    ];
    closureStylesheets.compile(files, null, null,
      function(errors, warnings, file, code) {
        assert(!errors);
        assert(!warnings);
        assert(code.includes('body{background-color:#ebeff9}'));
        assert(code.includes(
          '.dialog{background-color:#ebeff9;border:1px solid #6b90da}'));
        assert(code.includes(
          '.left_hand_nav{position:absolute;width:180px;padding:3px}'));
        assert(code.includes(
          '.left_hand_nav{position:absolute;width:180px;padding:3px}'));
        assert(code.includes(
          '.content{position:absolute;margin-left:186px}'));
        done();
      });
  });

  it('Expected Error Message', function(done) {
    this.timeout(25000);
    var files = ['test_files/special/error.gss'];
    closureStylesheets.compile(files, null, null,
      function(errors, warnings, file, code) {
        assert(errors.includes('GSS constant not defined'));
        assert(!warnings);
        assert(!code);
        done();
      });
  });

});