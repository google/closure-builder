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
let childProcess = require('child_process');


/**
 * Path tools.
 * @constructor
 * @struct
 * @final
 */
let JavaTools = function() {};


/**
 * @type {!number};
 */
JavaTools.maxBuffer = 10 * 1024 * 1024; // 10MB


/**
 * @type {!number};
 */
JavaTools.minBuffer = 1 * 1024 * 1024; // 1MB


/**
 * @param {string=} opt_version_string
 * @return {boolean}
 */
JavaTools.hasJava = function(opt_version_string) {
  let version = JavaTools.getJavaVersionString(opt_version_string)
    .toLowerCase();
  if (version &&
      version.includes('java') ||
      version.includes('jdk')) {
    return true;
  }
  console.error('Unknown Java Version:', version);
  return false;
};


/**
 * @param {string=} opt_version_string
 * @return {string}
 */
JavaTools.getJavaVersion = function(opt_version_string) {
  if (JavaTools.hasJava()) {
    let version = JavaTools.getJavaVersionString(opt_version_string)
      .toLowerCase();
    if (version.includes('java version')) {
      return version.match(/java version "?([0-9_.-]+)"?/)[1];
    } else if (version.includes('jdk version')) {
      return version.match(/jdk version "?([0-9_.-]+)"?/)[1];
    } else if (version) {
      return 'unknown';
    }
  }
  return '';
};


/**
 * @param {array|string=} opt_version_string
 * @return {!string}
 */
JavaTools.getJavaVersionString = function(opt_version_string) {
  if (opt_version_string !== undefined) {
    return opt_version_string.toString();
  }
  let javaString = JavaTools.execJavaSync(['-version']);
  if (javaString && javaString.stderr) {
    return javaString.stderr.toString();
  }
  console.error('Unknown Java version string', javaString);
  return '';
};


/**
 * @param {array} args
 * @param {function} callback
 * @param {string=} opt_java
 */
JavaTools.execJava = function(args, callback, opt_java) {
  let javaBin = opt_java || 'java';
  childProcess.execFile(javaBin, args, {
    'maxBuffer': JavaTools.maxBuffer,
  }, callback);
};


/**
 * @param {array} args
 * @param {string=} opt_java
 * @return {Object}
 */
JavaTools.execJavaSync = function(args, opt_java) {
  let javaBin = opt_java || 'java';
  return childProcess.spawnSync(javaBin, args, {
    'minBuffer': JavaTools.maxBuffer,
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
  let javaBin = opt_java || 'java';
  let javaFlags = ['-XX:+TieredCompilation', '-XX:TieredStopAtLevel=1'];
  if (process.arch.includes('64')) {
    javaFlags.push('-d64');
  }
  javaFlags = javaFlags.concat(['-jar', jar]).concat(args);
  if (opt_debug) {
    console.log(javaBin, javaFlags.join(' '));
  }
  childProcess.execFile(javaBin, javaFlags, {
    'maxBuffer': JavaTools.maxBuffer}, callback);
};


module.exports = JavaTools;
