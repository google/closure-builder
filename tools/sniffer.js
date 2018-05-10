/**
 * @fileoverview Closure Builder - Sniffer Tools
 *
 * @license Copyright 2018 Google Inc. All Rights Reserved.
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


/**
 * File tools.
 * @constructor
 * @struct
 * @final
 */
let SnifferTools = function() {};


/**
 * @param {!string} content
 * @return {!string}
 */
SnifferTools.getECMAScriptVersion = function(content) {
  if (content.includes(' await ') || content.includes('async function') ||
      content.includes('.padStart(') || content.includes('.padEnd(') ||
      content.includes('Object.getOwnPropertyDescriptors(') ||
      content.includes('Object.getPrototypeOf(async function(){}).construct') ||
      /\w+\.values\(/.test(content) || /\w+\.entries\(/.test(content)) {
    return 'ECMASCRIPT_2017';
  } else if (/\w+\.includes\(/.test(content)) {
    return 'ECMASCRIPT_2016';
  } else if (/(let|const)\s+\w+\s?=/.test(content)) {
    return 'ECMASCRIPT_2015';
  }

  return '';
};


module.exports = SnifferTools;
