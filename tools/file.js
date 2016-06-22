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
var fs = require('fs-extra');
var glob = require('glob');
var mkdirp = require('mkdirp');
var path = require('path');
var replace = require('replace');
var rimraf = require('rimraf');
var touch = require('touch');

var pathTools = require('./path.js');


/**
 * File tools.
 * @constructor
 * @struct
 * @final
 */
var FileTools = function() {};


/**
 * @param {string} path
 * @return {boolean} True if path could be accessed.
 */
FileTools.access = function(path) {
  if (!fs.accessSync) {
    try {
      fs.statSync(path);
    } catch (err) {
      if (err.code == 'ENOENT') {
        return false;
      }
    }
    return true;
  }
  try {
    fs.accessSync(path);
    return true;
  } catch (err) {
    return false;
  }
};


/**
 * Copy file from src to dest.
 * @param {!string} src
 * @param {!string} dest
 * @param {function=} opt_callback
 */
FileTools.copyFile = function(src, dest, opt_callback) {
  if (pathTools.isFile(dest)) {
    FileTools.mkdir(path.dirname(dest));
  } else {
    FileTools.mkdir(dest);
  }
  if (!FileTools.access(src)) {
    var message = 'No access to resource ' + src;
    console.error(message);
    if (opt_callback) {
      opt_callback(message, false);
    }
    return;
  }
  var destFile = path.join(dest, pathTools.getFileBase(src));
  if (pathTools.isFile(dest)) {
    destFile = dest;
  }
  var fileEvent = function(error) {
    if (error) {
      var message = 'Resource ' + src + ' failed to copy to ' + destFile;
      console.error(message);
      console.error(error);
      if (opt_callback) {
        opt_callback(message, false, destFile);
      }
    } else {
      if (opt_callback) {
        opt_callback(false, false, destFile);
      }
    }
  };
  fs.copy(src, destFile, fileEvent.bind(this));
};


/**
 * Copy files from srcs to dest.
 * @param {!array} srcs
 * @param {!string} dest
 */
FileTools.copySync = function(srcs, dest) {
  var numFiles_ = srcs.length;
  if (pathTools.isFile(dest)) {
    FileTools.mkdir(path.dirname(dest));
  } else {
    FileTools.mkdir(dest);
  }
  for (var i = numFiles_ - 1; i >= 0; i--) {
    var destFile = path.join(dest, pathTools.getFileBase(srcs[i]));
    if (pathTools.isFile(dest)) {
      destFile = dest;
    }
    console.log(destFile);
    fs.copySync(srcs[i], destFile);
  }
};


/**
 * @param {string|array} Files with glob syntax.
 * @return {array}
 */
FileTools.getGlobFiles = function(files) {
  var fileList = [];
  var filesToGlob = (files.constructor === String) ? [files] : files;
  for (var i = filesToGlob.length - 1; i >= 0; i--) {
    fileList = fileList.concat(glob.sync(filesToGlob[i]));
  }
  return fileList;
};


/**
 * @param {string=} opt_name
 * @return {string} Temp dir path.
 */
FileTools.makeTempDir = function(opt_name) {
  var tempDir = pathTools.getTempPath(opt_name);
  FileTools.mkdir(tempDir);
  return tempDir;
};


/**
 * @param {!(string|array)} files
 * @param {!string} regex
 * @param {!string=} replacement
 * @param {boolean=} opt_recursive
 */
FileTools.findAndReplace = function(files, regex, replacement, opt_recursive) {
  replace({
    regex: regex,
    replacement: replacement,
    paths: files,
    recursive: opt_recursive,
    silent: true
  });
};


/**
 * @param {array} files
 * @param {function} opt_callback
 */
FileTools.removeFiles = function(files, opt_callback) {
  if (opt_callback) {
    rimraf(files, {}, opt_callback);
  }
  rimraf.sync(files,  { nosort: true, silent: false });
};


/**
 * @param {string} dir_path
 */
FileTools.mkdir = function(dir_path) {
  if (!pathTools.existDirectory(dir_path)) {
    mkdirp.sync(dir_path);
  }
};


/**
 * @param {string} file_path
 */
FileTools.mkfile = function(file_path) {
  var dir_path = path.dirname(file_path);
  FileTools.mkdir(dir_path);
  touch.sync(file_path);
};


module.exports = FileTools;
