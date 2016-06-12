/**
 * @fileoverview Closure Builder - Path Tools
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
var fs = require('fs-extra');
var log = require('loglevel');
var path = require('path');


/**
 * Path tools.
 * @constructor
 * @struct
 * @final
 */
var PathTools = function() {};


/**
 * @param {string=} opt_name
 * @return {!string}
 */
PathTools.getResourcePath = function(opt_name) {
  var resourcePath = path.join(__dirname, '..', 'third_party');
  if (!PathTools.existDirectory(resourcePath)) {
    log.error('Resource path was not found at', resourcePath);
    return '';
  }
  if (opt_name) {
    resourcePath = path.join(resourcePath, opt_name);
    if (!PathTools.existDirectory(resourcePath)) {
      log.error('Resource path for', opt_name, 'was not found at',
        resourcePath);
      return '';
    }
  }
  return resourcePath;
};


/**
 * @return {!string}
 */
PathTools.getClosureLibraryPath = function() {
  return PathTools.getResourcePath('closure-library');
};


/**
 * @return {!string}
 */
PathTools.getClosureLibraryFiles = function() {
  var closureLibraryFiles = path.join(PathTools.getClosureLibraryPath(),
    'closure', 'goog');
  if (!PathTools.existDirectory(closureLibraryFiles)) {
    log.error('Closure library files were not found at', closureLibraryFiles);
    return [];
  }
  var closureLibrary3rdParty = path.join(PathTools.getClosureLibraryPath(),
    'third_party', 'closure', 'goog');
  if (!PathTools.existDirectory(closureLibrary3rdParty)) {
    log.warn('Closure library 3rd party files were not found at',
      closureLibrary3rdParty);
    return [
      path.join(closureLibraryFiles, '**.js'),
      path.join(closureLibraryFiles, '!**_test.js')
    ];
  }

  return [
    path.join(closureLibraryFiles, '**.js'),
    path.join(closureLibraryFiles, '!**_test.js'),
    path.join(closureLibrary3rdParty, '**.js'),
    path.join(closureLibrary3rdParty, '!**_test.js')
  ];
};


/**
 * @return {!string}
 */
PathTools.getClosureBaseFile = function() {
  var baseFile = path.join(PathTools.getClosureLibraryPath(), 'closure', 'goog',
    'base.js');
  if (!PathTools.existFile(baseFile)) {
    log.error('Closure base file was not found at', baseFile);
    return '';
  }
  return baseFile;
};


/**
 * @param {string} dir_path
 * @return {boolean} Directory exists.
 */
PathTools.existDirectory = function(dir_path) {
  try {
    return fs.statSync(dir_path).isDirectory();
  } catch (err) {
    return false;
  }
};


/**
 * @param {string} file_path
 * @return {boolean} File exists.
 */
PathTools.existFile = function(file_path) {
  try {
    return fs.statSync(file_path).isFile();
  } catch (err) {
    return false;
  }
};


/**
 * @param {string} file_path
 * @return {boolean} True of possible file.
 */
PathTools.isFile = function(file_path) {
  if (path.extname(file_path)) {
    return true;
  }
  return false;
};


module.exports = PathTools;
