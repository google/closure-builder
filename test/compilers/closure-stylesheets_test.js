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
let assert = require('assert');

let closureStylesheets = require(
  '../../compilers/closure-stylesheets/compiler.js');


describe('Closure Stylesheets::', function() {
  it('Single file', function(done) {
    this.timeout(25000);
    let files = ['test_files/test_1.gss'];
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
    let files = [
      'test_files/test_1.gss',
      'test_files/test_2.gss',
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

  it('css-renaming-prefix', function(done) {
    this.timeout(25000);
    let files = ['test_files/test_1.gss'];
    let options = {
      'css-renaming-prefix': 'test123312-',
    };
    closureStylesheets.compile(files, options, null,
      function(errors, warnings, file, code) {
        assert(!errors);
        assert(!warnings);
        assert(code.includes('body{background-color:#ebeff9}'));
        assert(!code.includes(
          'test123312-body{background-color:#ebeff9}'));
        assert(code.includes(
          '.test123312-dialog{background-color:#ebeff9;'));
        done();
      });
  });

  it('prefix', function(done) {
    this.timeout(25000);
    let files = ['test_files/special/prefix_test.gss'];
    let options = {
      'use_prefix': 'test3122-',
    };
    closureStylesheets.compile(files, options, null,
      function(errors, warnings, file, code) {
        assert(!errors);
        assert(!warnings);
        console.log(code);
        assert(code.includes('background-color:#ebeff9'));
        assert(!code.includes('{$prefix}'));
        assert(code.includes('.test3122-overview .max-width{'));
        assert(code.includes('#test3122-overview .mdl-card__media img{'));
        done();
      });
  });

  it('Expected Error Message', function(done) {
    this.timeout(25000);
    let files = ['test_files/special/error.gss'];
    closureStylesheets.compile(files, null, null,
      function(errors, warnings, file, code) {
        assert(errors.includes('GSS constant not defined'));
        assert(!warnings);
        assert(!code);
        done();
      });
  });
});
