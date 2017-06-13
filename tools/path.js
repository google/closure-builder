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
let fs = require('fs-extra');
let log = require('loglevel');
let os = require('os');
let path = require('path');
let pathParse = require('path-parse');
let url = require('url');

let textTools = require('./text.js');


/**
 * Path tools.
 * @constructor
 * @struct
 * @final
 */
let PathTools = function() {};


/**
 * @param {string=} name
 * @param {string=} resource
 * @return {!string}
 */
PathTools.getResourcePath = function(name, resource) {
  let resourcePath = path.join(__dirname, '..', resource || 'third_party');
  if (!PathTools.existDirectory(resourcePath)) {
    log.error('Resource path was not found at', resourcePath);
    return '';
  }
  if (name) {
    resourcePath = path.join(resourcePath, name);
    if (!PathTools.existDirectory(resourcePath)) {
      log.error('Resource path for', name, 'was not found at', resourcePath);
      return '';
    }
  }
  return resourcePath;
};


/**
 * @return {!string}
 */
PathTools.getClosureCompilerPath = function() {
  return PathTools.getResourcePath('closure-compiler', 'runtime');
};


/**
 * @return {!string}
 */
PathTools.getClosureCompilerJar = function() {
  let searchPath = PathTools.getClosureCompilerPath();
  let compilerJar = path.join(searchPath, 'compiler.jar');
  if (!PathTools.existFile(compilerJar)) {
    compilerJar = PathTools.searchFile(
      searchPath, 'closure-compiler-v', '.jar');
  }
  if (!PathTools.existFile(compilerJar)) {
    log.error('Closure compiler jar was not found at', searchPath);
    return '';
  }
  return compilerJar;
};


/**
 * @return {!string}
 */
PathTools.getClosureLibraryPath = function() {
  return PathTools.getResourcePath('closure-library');
};


/**
 * @param {array=} opt_ignore
 * @return {!string}
 */
PathTools.getClosureLibraryFiles = function(opt_ignore = []) {
  let closureLibraryFiles = path.join(PathTools.getClosureLibraryPath(),
    'closure', 'goog');
  if (!PathTools.existDirectory(closureLibraryFiles)) {
    log.error('Closure library files were not found at', closureLibraryFiles);
    return [];
  }

  let closureLibraryFolders = [];
  let closureGoogFolders = PathTools.getDirectories(closureLibraryFiles);
  closureGoogFolders.forEach((folder) => {
    if (opt_ignore.indexOf(folder) === -1) {
      closureLibraryFolders.push(
        path.join(closureLibraryFiles, folder, '**.js'));
    }
  });

  let closureLibrary3rdParty = path.join(PathTools.getClosureLibraryPath(),
    'third_party', 'closure', 'goog');
  if (!PathTools.existDirectory(closureLibrary3rdParty)) {
    log.warn('Closure library 3rd party files were not found at',
      closureLibrary3rdParty);
    return closureLibraryFolders;
  } else {
    closureLibraryFolders.push(path.join(closureLibrary3rdParty, '**.js'));
  }

  return closureLibraryFolders;
};


/**
 * @return {!string}
 */
PathTools.getClosureBaseFile = function() {
  let baseFile = path.join(PathTools.getClosureLibraryPath(), 'closure', 'goog',
    'base.js');
  if (!PathTools.existFile(baseFile)) {
    log.error('Closure base file was not found at', baseFile);
    return '';
  }
  return baseFile;
};


/**
 * @return {!string}
 */
PathTools.getClosureTemplatesPath = function() {
  return PathTools.getResourcePath('closure-templates');
};


/**
 * @return {!string}
 */
PathTools.getClosureTemplatesCompilerPath = function() {
  return PathTools.getResourcePath('closure-templates-compiler', 'runtime');
};


/**
 * @return {!string}
 */
PathTools.getClosureTemplatesCompilerJar = function() {
  let searchPath = PathTools.getClosureTemplatesCompilerPath();
  let compilerJar = path.join(searchPath, 'SoyToJsSrcCompiler.jar');
  if (!PathTools.existFile(compilerJar)) {
    compilerJar = PathTools.searchFile(
      searchPath, 'SoyToJsSrcCompiler', '.jar');
  }
  if (!PathTools.existFile(compilerJar)) {
    log.error('Closure templates compiler jar was not found at', compilerJar);
    return '';
  }
  return compilerJar;
};


/**
 * @return {!string}
 */
PathTools.getClosureSoyUtilsFile = function() {
  let soyUtilsFile = path.join(PathTools.getClosureTemplatesPath(),
    'javascript', 'soyutils_usegoog.js');
  if (!PathTools.existFile(soyUtilsFile)) {
    log.error('soyutils_usegoog.js file was not found at', soyUtilsFile);
    return '';
  }
  return soyUtilsFile;
};


/**
 * @return {!string}
 */
PathTools.getClosureStylesheetsCompilerPath = function() {
  return PathTools.getResourcePath('closure-stylesheets', 'runtime');
};


/**
 * @return {!string}
 */
PathTools.getClosureStylesheetsCompilerJar = function() {
  let searchPath = PathTools.getClosureStylesheetsCompilerPath();
  let compilerJar = path.join(searchPath, 'closure-stylesheets.jar');
  if (!PathTools.existFile(compilerJar)) {
    compilerJar = PathTools.searchFile(
      searchPath, 'closure-stylesheets', '.jar');
  }
  if (!PathTools.existFile(compilerJar)) {
    log.error('Closure stylesheets jar was not found at', searchPath);
    return '';
  }
  return compilerJar;
};


/**
 * @param {string=} opt_name
 * @return {string} Temp dir path.
 */
PathTools.getRandomTempPath = function(opt_name) {
  let name = (opt_name || 'closure-builder') + '-' +
    textTools.getRandomString(7);
  return PathTools.getTempPath(name);
};


/**
 * @param {string=} opt_name
 * @return {string} Temp dir path.
 */
PathTools.getTempPath = function(opt_name) {
  let tempPath = path.join(os.tmpdir(), opt_name || '');
  return tempPath;
};


/**
 * @param {string!} name
 * @return {string} Temp test dir path
 */
PathTools.getTempTestPath = function(name) {
  return path.join(PathTools.getTempPath('closure-builder-test'), name);
};


/**
 * @param {string} file
 * @return {string} file path
 */
PathTools.getFilePath = function(file) {
  return (file && pathParse(file).ext) ? pathParse(file).dir : file;
};


/**
 * @param {string} file_path
 * @return {string} file
 */
PathTools.getPathFile = function(file_path) {
  return (file_path && pathParse(file_path).ext) ?
     pathParse(file_path).base : '';
};


/**
 * @param {string} file_url
 * @return {string} file
 */
PathTools.getUrlFile = function(file_url) {
  return path.basename(url.parse(file_url).pathname);
};


/**
 * @param {string} file
 * @return {string} base folder
 */
PathTools.getFileBase = function(file) {
  return pathParse(file).base;
};


/**
 * @param {!string} directory_path
 * @return {!Object}
 */
PathTools.getDirectories = function(directory_path) {
  return fs.readdirSync(directory_path).filter((file) => {
    return fs.statSync(path.join(directory_path, file)).isDirectory();
  });
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
 * @param {!string} file_path
 * @return {!boolean} File exists.
 */
PathTools.existFile = function(file_path) {
  try {
    return fs.statSync(file_path).isFile();
  } catch (err) {
    return false;
  }
};


/**
 * @param {!string} file_path
 * @return {!boolean} True of possible file.
 */
PathTools.isFile = function(file_path) {
  if (path.extname(file_path)) {
    return true;
  }
  return false;
};


/**
 * @param {!string} file_path
 * @param {!string} name
 * @param {string=} opt_extension
 * @return {string} file_path
 */
PathTools.searchFile = function(file_path, name, opt_extension) {
  let files = fs.readdirSync(file_path);
  let result = '';
  files.forEach(function(file) {
    if (file.includes(name) &&
        (!opt_extension || file.endsWith(opt_extension))) {
      result = path.join(file_path, file);
      return;
    }
  });
  return result;
};


module.exports = PathTools;
