/**
 * @fileoverview Closure Builder - Text Tools
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


/**
 * File tools.
 * @constructor
 * @struct
 * @final
 */
let TextTools = function() {};


/**
 * @param {!string} content
 * @param {Array} replacements
 * @return {!string}
 */
TextTools.replace = function(content, replacements) {
  if (!content || !replacements) {
    return content;
  }
  if (Array.isArray(replacements[0])) {
    for (let replacement of replacements) {
      content = content.replace(replacement[0], replacement[1]);
    }
  } else {
    content = content.replace(replacements[0], replacements[1]);
  }
  return content;
};


/**
 * Trucate a text in the middle.
 * @param {!string} text
 * @param {number=} opt_max_length
 * @param {string=} opt_seperator
 * @return {!string}
 */
TextTools.getTruncateText = function(text, opt_max_length, opt_seperator) {
  let max_length = opt_max_length || 40;
  if (text.length <= max_length) {
    return text;
  }
  let seperator = opt_seperator || '…';
  let textFront = text.substr(0, Math.ceil(max_length/2) - seperator.length);
  let textEnd = text.substr(text.length - Math.floor(max_length/2));
  return textFront + seperator + textEnd;
};


/**
 * @param {number=} opt_max_length
 * @return {string}
 */
TextTools.getRandomString = function(opt_max_length) {
  let salt = 1475236985346785342347650023;
  return (Math.floor(Math.random() * salt).toString(36) +
    Math.abs(Math.floor(Math.random() * salt) ^ Date.now()).toString(36)
  ).substring(0, opt_max_length || 8);
};


module.exports = TextTools;
