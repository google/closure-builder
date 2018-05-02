/**
 * @fileoverview Closure Builder Test - Text tools
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

let textTools = require('../../tools/text.js');


describe('textTools', function() {
  it('replace', function() {
    let content = 'Hello World';
    assert.equal(textTools.replace(content), content);
    assert.equal(textTools.replace(content, ['Hello', 'Hallo']), 'Hallo World');
    assert.equal(textTools.replace(content, [['H', 'W'], ['e', 'o']]),
      'Wollo World');
  });

  it('filterStrings', function() {
    let content = '1\n2\n123\n321\n3';
    let content2 = '1 2 123 321 3';
    let content3 = '1 2 123 321 3\n';
    assert.equal(textTools.filterStrings(content, ['1']), '2\n3\n');
    assert.equal(textTools.filterStrings(content, ['2']), '1\n3\n');
    assert.equal(textTools.filterStrings(content, ['3']), '1\n2\n');
    assert.equal(textTools.filterStrings(content, ['1', '2', '3']), '');
    assert.equal(textTools.filterStrings(content, ['123']), '1\n2\n321\n3\n');
    assert.equal(textTools.filterStrings(content, ['21']), '1\n2\n123\n3\n');
    assert.equal(textTools.filterStrings(content2, ['1']), '1 2 123 321 3');
    assert.equal(textTools.filterStrings(content3, ['1']), '');
  });
});
