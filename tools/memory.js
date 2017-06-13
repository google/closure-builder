/**
 * @fileoverview Closure Builder - Memory Tools
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
let os = require('os');


 /**
 * File tools.
 * @constructor
 * @struct
 * @final
 */
let MemoryTools = function() {};


/**
 * @param {!number} size in megabyte.
 * @return {!boolean}
 */
MemoryTools.checkAvailableMemory = function(size) {
  return size <= MemoryTools.getMemory();
};


/**
 * @param {boolean=} opt_raw
 * @return {!number} Available memory in megabyte.
 */
MemoryTools.getMemory = function(opt_raw) {
  let memory = os.freemem() / 1000000;
  if (memory > 512 && process.env.C9_PROJECT) {
    memory = 384;
  }
  if (opt_raw) {
    return memory;
  }
  return Math.floor(memory);
};


/**
 * @return {number} 90% of the available memory in megabyte and max of 1024.
 */
MemoryTools.getSafeMemory = function() {
  let safeMemory = Math.floor(MemoryTools.getMemory(true) * 0.9);
  if (safeMemory > 1024) {
    return 1024;
  }
  return safeMemory;
};


module.exports = MemoryTools;
