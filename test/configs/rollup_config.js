/**
 * @fileoverview Rollup Closure Builder - Rollup compiler config
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

const pathTools = require('../../tools/path.js');


/**
 * Build Tools.
 * @constructor
 * @struct
 * @final
 */
let config = function() {};


config.test_1 = {
  name: 'rollup_test_1',
  srcs: 'test_files/umd/umd-main.js',
  format: 'umd',
  out: pathTools.getTempTestPath('rollup-test-1'),
};


module.exports = config;
