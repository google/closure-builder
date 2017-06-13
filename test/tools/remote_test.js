/**
 * @fileoverview Closure Builder Test - Remote tools
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
let path = require('path');

let pathTools = require('../../tools/path.js');
let testDirectory = path.join(pathTools.getTempPath('closure-builder-test'),
  'remote-tools/');

let remoteTools = require('../../tools/remote.js');
let resourceUrl= 'raw.githubusercontent.com/google/closure-builder/master/' +
  'test_files/resources/';

remoteTools.getFile('https://' + resourceUrl + 'file.js?test=1&test=2',
    testDirectory);
remoteTools.getFile('http://' + resourceUrl + 'file.html?test=1&test=2',
    testDirectory);
remoteTools.getFile('https://' + resourceUrl + 'file.jpg?test=1&test=2',
    testDirectory);
remoteTools.getFile('https://' + resourceUrl + 'file.gif#test',
    testDirectory);
remoteTools.getFile('https://' + resourceUrl + 'file.png?test=1&test=2',
    testDirectory);
remoteTools.getFile('http://' + resourceUrl + 'file.xml?test=1&test=2',
    testDirectory);
remoteTools.getFile('http://' + resourceUrl + 'file.css#test',
    testDirectory);


/*
TestConfigs.resourcesRemote404Config = {
  name: 'remote_resources_404',
  resources: [
    'https://www.google.de/file_not_exists'
  ],
  out: path.join(testDirectory, 'remote-resources-404')
};
*/
