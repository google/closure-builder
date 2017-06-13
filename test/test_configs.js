/**
 * @fileoverview Closure Builder - Build compilers
 *
 * @license Copyright 2015 Google Inc. All Rights Reserved.
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
let path = require('path');

let closureBuilder = require('../closure-builder');
let pathTools = require('../tools/path.js');
let glob = closureBuilder.globSupport();
let testDirectory = pathTools.getTempPath('closure-builder-test');

let resourceUrl= 'raw.githubusercontent.com/google/closure-builder/master/' +
  'test_files/resources/';


/**
 * Build Tools.
 * @constructor
 * @struct
 * @final
 */
let TestConfigs = function() {};


TestConfigs.closureLibraryConfig = {
  name: 'closure_library_test',
  srcs: [
    'test_files/closure_library_test.js',
  ],
  out: path.join(testDirectory, 'closure-library'),
};


TestConfigs.closureLibraryUiConfig = {
  name: 'closure_library_ui_test',
  srcs: [
    'test_files/closure_library_ui_test.js',
  ],
  out: path.join(testDirectory, 'closure-library'),
};


TestConfigs.closureLibraryConfigRemoteService = {
  name: 'closure_library_test',
  srcs: [
    'test_files/closure_library_test.js',
  ],
  remote_service: true,
  out: path.join(testDirectory, 'closure-library'),
};


TestConfigs.closureLibraryUiConfigRemoteService = {
  name: 'closure_library_ui_test',
  srcs: [
    'test_files/closure_library_ui_test.js',
  ],
  remote_service: true,
  out: path.join(testDirectory, 'closure-library'),
};


TestConfigs.soyTestConfig = {
  name: 'soy_test',
  srcs: [
    'test_files/test.soy',
  ],
  out: path.join(testDirectory, 'soy'),
};


TestConfigs.soyTesti18nConfig = {
  name: 'soy_test_i18n',
  srcs: [
    'test_files/test.soy',
    'test_files/special/soy_test_i18n.soy',
  ],
  out: path.join(testDirectory, 'soyi18n'),
};


TestConfigs.soyTestConfigBroken = {
  name: 'closure_test_soy_broken',
  srcs: [
    'test_files/special/closure_soy_broken.js',
    'test_files/special/broken.soy',
  ],
  out: path.join(testDirectory, 'closure-soy-broken'),
};


TestConfigs.closureStylesheetsTestConfig = {
  name: 'closure_stylesheet_test',
  srcs: [
    'test_files/test_1.gss',
    'test_files/test_2.gss',
  ],
  out: path.join(testDirectory, 'closure-stylesheet-test'),
};


TestConfigs.markdownConfig = {
  name: 'markdown_test',
  markdown: [
    'test_files/test.md',
  ],
  out: path.join(testDirectory, 'markdown'),
};


TestConfigs.closureECMAScript6ConstConfig = {
  name: 'closure_test_ecma6_const',
  srcs: glob([
    'test_files/closure_test_*.js',
  ]),
  out: path.join(testDirectory, 'closure-test-ecma6-const'),
};


TestConfigs.closureECMAScript6LetConfig = {
  name: 'closure_test_ecma6_let',
  srcs: glob([
    'test_files/closure_test_*.js',
  ]),
  out: path.join(testDirectory, 'closure-test-ecma6-let'),
};


TestConfigs.closureNoECMAScript6Config = {
  name: 'closure_test_no_ecma6',
  srcs: glob([
    'test_files/closure_test_1.js',
    'test_files/closure_test_2.js',
    'test_files/closure_test_no_ecma6.js',
  ]),
  out: path.join(testDirectory, 'closure-test-no-ecma6'),
};


TestConfigs.nodeTestConfig = {
  name: 'node_test',
  srcs: glob([
    'test_files/special/node_test.js',
  ]),
  out: path.join(testDirectory, 'node-test', 'node_bundle.js'),
};


TestConfigs.nodeToJsTestConfig = {
  name: 'node_test_type',
  type: closureBuilder.buildType.JAVASCRIPT,
  srcs: glob([
    'test_files/special/node_compiled_test.js',
  ]),
  out: path.join(testDirectory, 'node-test', 'node_compiled_bundle.js'),
};

TestConfigs.optionLicenseConfig = {
  name: 'option_license',
  srcs: [
    'test_files/test1.js',
  ],
  license: 'test_files/license-header.md',
  out: path.join(testDirectory, 'license-files'),
};


TestConfigs.resourcesConfig = {
  name: 'resources',
  resources: glob([
    'test_files/resources/**/*.css',
    'test_files/resources/**/*.htm',
    'test_files/resources/**/*.html',
    'test_files/resources/**/*.jpg',
    'test_files/resources/**/*.gif',
    'test_files/resources/**/*.png',
    'test_files/resources/**/*.xml',
  ]),
  out: path.join(testDirectory, 'local-resources'),
};


TestConfigs.resourcesNotExistsConfig = {
  name: 'resources_none_exists',
  resources: [
    'test_files/resources/not_exists.css',
    'test_files/resources/not_exists.htm',
    'test_files/resources/not_exists.html',
    'test_files/resources/not_exists.jpg',
    'test_files/resources/not_exists.gif',
    'test_files/resources/not_exists.png',
    'test_files/resources/not_exists.xml',
  ],
  out: path.join(testDirectory, 'local-resources'),
  testEnv: true,
};


TestConfigs.resourcesRemoteConfig = {
  name: 'remote_resources',
  resources: [
    'https://' + resourceUrl + 'file.js?test=1&test=2',
    'http://' + resourceUrl + 'file.html?test=1&test=2',
    'https://' + resourceUrl + 'file.jpg?test=1&test=2',
    'https://' + resourceUrl + 'file.gif#test',
    'https://' + resourceUrl + 'file.png?test=1&test=2',
    'http://' + resourceUrl + 'file.xml?test=1&test=2',
    'http://' + resourceUrl + 'file.css#test',
  ],
  out: path.join(testDirectory, 'remote-resources'),
};


TestConfigs.resourcesRemote404Config = {
  name: 'remote_resources_404',
  resources: [
    'https://www.google.de/file_not_exists',
  ],
  out: path.join(testDirectory, 'remote-resources-404'),
};


module.exports = TestConfigs;
