/**
 * @fileoverview Closure Builder Test - Sniffer tools
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

let SnifferTools = require('../../tools/sniffer.js');


describe('snifferTools', function() {
  it('getECMAScriptVersion', function() {
    assert.equal(SnifferTools.getECMAScriptVersion(
      '// Nothing ...\nvar test = 1;\n'
    ), '');
    assert.equal(SnifferTools.getECMAScriptVersion('//2015\nlet test = 1;\n'),
      'ECMASCRIPT_2015');
    assert.equal(SnifferTools.getECMAScriptVersion('//2015\nconst test = 1;\n'),
      'ECMASCRIPT_2015');
    assert.equal(SnifferTools.getECMAScriptVersion('\narray.includes(\'t\')\n'),
      'ECMASCRIPT_2016');
    assert.equal(SnifferTools.getECMAScriptVersion(
      '\nlet test = async function() {...};\n'), 'ECMASCRIPT_2017');
    assert.equal(SnifferTools.getECMAScriptVersion(
      '\nlet test = async function test\n'), 'ECMASCRIPT_2017');
    assert.equal(SnifferTools.getECMAScriptVersion(
      '\nlet test = test123.padStart(3);\n'), 'ECMASCRIPT_2017');
    assert.equal(SnifferTools.getECMAScriptVersion(
      '\nlet test = test123.padEnd(3);\n'), 'ECMASCRIPT_2017');
  });
});
