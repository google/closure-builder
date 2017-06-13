/**
 * @fileoverview Closure Builder Test - Java tools
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

let javaTools = require('../../tools/java.js');


describe('javaTools', function() {
  let javaString = ['java version "1.8.0_91"\n',
    'Java(TM) SE Runtime Environment (build 1.8.0_91-b14)\n',
    'Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)'];
  let openJdkString = ['openjdk version "1.8.0-xxx-v7"\n',
    'OpenJDK Runtime Environment (build 1.8.0-xxx-v7-132676107-132666263)\n',
    'OpenJDK 64-Bit Server VM (build 25.71-b01, mixed mode)'];
  let unknowString = ['Usage: xxx [-options] class [args...]\n',
    '(to execute a class)...'];
  let emptyString = '';

  describe('hasJava', function() {
    it('Installed Java', function() {
      assert(javaTools.hasJava());
    });
    it('General Java', function() {
      assert(javaTools.hasJava(javaString));
    });
    it('OpenJdk', function() {
      assert(javaTools.hasJava(openJdkString));
    });
    it('Unknown', function() {
      assert(!javaTools.hasJava(unknowString));
    });
    it('Empty', function() {
      assert(!javaTools.hasJava(emptyString));
    });
  });

  describe('getJavaVersion', function() {
    it('Installed Java', function() {
      assert(javaTools.getJavaVersion());
    });
    it('General Java', function() {
      assert(javaTools.getJavaVersion(javaString));
    });
    it('OpenJdk', function() {
      assert(javaTools.getJavaVersion(openJdkString));
    });
    it('Unknown', function() {
      assert(javaTools.getJavaVersion(unknowString) == 'unknown');
    });
    it('Empty', function() {
      assert(!javaTools.getJavaVersion(emptyString));
    });
  });
});
