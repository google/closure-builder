/**
 * @fileoverview Closure Builder - File Tools
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
var replace = require('replace');



/**
 * File tools.
 * @constructor
 * @struct
 * @final
 */
var FileTools = function() {};


/**
 * @param {array} args
 * @param {function} callback
 * @param {string=} opt_java
 */
FileTools.findAndReplace = function(files, regex, replacement) {
  replace({
    regex: regex,
    replacement: replacement,
    paths: files
  });
};



module.exports = FileTools;
