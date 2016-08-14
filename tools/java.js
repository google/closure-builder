/**
 * @fileoverview Closure Builder - Java Tools
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
var childProcess = require('child_process');


/**
 * Path tools.
 * @constructor
 * @struct
 * @final
 */
var JavaTools = function() {};

/**
 * @type {!number};
 */
JavaTools.maxBuffer = 10 * 1024 * 1024;  // 10MB


/**
 * @type {!number};
 */
JavaTools.minBuffer = 1024 * 1024;  // 1MB


/**
 * @return {boolean}
 */
JavaTools.hasJava = function() {
  var result = JavaTools.execJavaSync(['-version']);
  if (result && result.stderr &&
      result.stderr.toString().toLowerCase().includes('java')) {
    return true;
  }
  console.error(result);
  return false;
};


/**
 * @return {string}
 */
JavaTools.getJavaVersion = function() {
  if (JavaTools.hasJava()) {
    var result = JavaTools.execJavaSync(['-version']);
    if (result && result.stderr) {
      var version = result.stderr.toString();
      if (version.toLowerCase().includes('java version')) {
        return version.match(/java version \"?([0-9_.-]+)\"?/)[1];
      } else {
        return 'unknown';
      }
    }
  }
  return '';
};


/**
 * @param {array} args
 * @param {function} callback
 * @param {string=} opt_java
 */
JavaTools.execJava = function(args, callback, opt_java) {
  var javaBin = opt_java || 'java';
  childProcess.execFile(javaBin, args, {
    'maxBuffer': JavaTools.maxBuffer
  }, callback);
};


/**
 * @param {array} args
 * @param {string=} opt_java
 */
JavaTools.execJavaSync = function(args, opt_java) {
  var javaBin = opt_java || 'java';
  return childProcess.spawnSync(javaBin, args, {
    'minBuffer': JavaTools.maxBuffer
  });
};


/**
 * @param {string} jar
 * @param {array} args
 * @param {function} callback (error, stdout, stderr)
 * @param {string=} opt_java
 * @param {boolean=} opt_debug
 */
JavaTools.execJavaJar = function(jar, args, callback, opt_java, opt_debug) {
  var javaBin = opt_java || 'java';
  if (opt_debug) {
    console.log(javaBin, ['-jar', jar].concat(args).join(' '));
  }
  childProcess.execFile(javaBin, ['-jar', jar].concat(args), {
    'maxBuffer': JavaTools.maxBuffer }, callback);
};


module.exports = JavaTools;
