/**
 * @fileoverview Closure Builder - Build tools
 *
 * @license Copyright 2015 Google Inc. All Rights Reserved.
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
var os = require('os');
var url = require('url');
var path = require('path');
var pathParse = require('path-parse');
var fs = require('fs-extra');
var glob = require('glob');
var mkdirp = require('mkdirp');
var touch = require('touch');
var randomstring = require('randomstring');

var BuildType = require('./build_types.js');



/**
 * Build Tools.
 * @constructor
 * @struct
 * @final
 */
var BuildTools = function() {};


/**
 * Detects the needed compiler types.
 * @param {BuildConfig} config
 */
BuildTools.detectType = function(config) {
  if (config.hasSoyFiles() > 0) {
    if (config.hasClosureFiles() === 0) {
      return BuildType.SOY;
    } else {
      return BuildType.SOY_CLOSURE;
    }
  } else if (config.hasClosureFiles()) {
    return BuildType.CLOSURE;
  } else if (config.hasNodeFiles()) {
    return BuildType.NODEJS;
  } else if (config.hasJsFiles()) {
    return BuildType.JAVASCRIPT;
  } else if (config.hasCssFiles()) {
    return BuildType.CSS;
  } else if (config.hasResourceFiles()) {
    return BuildType.RESOURCES;
  } else {
    return BuildType.UNKNOWN;
  }
};


/**
 * @param {array} files
 * @param {boolean=} opt_all Show all files and folders.
 * @param {boolean=} opt_exclude_test Exclude test files.
 * @return {array}
 */
BuildTools.sortFiles = function(files, opt_all, opt_exclude_test) {
  var fileList = [];
  var knownFile = {};
  for (var i = files.length - 1; i >= 0; i--) {
    var file = files[i];
    if (file.constructor === Array) {
      for (var i2 = file.length - 1; i2 >= 0; i2--) {
        var subFile = file[i2];
        if (!knownFile[subFile] &&
            (opt_all || subFile.indexOf('.') !== -1)) {
          fileList.push(subFile);
          knownFile[subFile] = true;
        }
      }
    } else {
      if (!knownFile[file] &&
          (opt_all || file.indexOf('.') !== -1)) {
        fileList.push(file);
        knownFile[file] = true;
      }
    }
  }
  if (opt_exclude_test) {
    return BuildTools.filterTestFiles(fileList);
  }
  return fileList;
};


/**
 * @param {BuildConfig} config
 */
BuildTools.getBuildRequirements = function(config) {
  var depsConfig = this.scanFiles(config.deps);
  var srcsConfig = this.scanFiles(config.srcs);
  var soyConfig = this.scanFiles(config.soy);

  return {
    closureFiles: [].concat(depsConfig.closureFiles, srcsConfig.closureFiles),
    jsFiles: [].concat(depsConfig.jsFiles, srcsConfig.jsFiles),
    cssFiles: [].concat(srcsConfig.cssFiles),
    soyFiles: [].concat(depsConfig.soyFiles, soyConfig.soyFiles,
      srcsConfig.soyFiles),
    nodeFiles: [].concat(srcsConfig.nodeFiles),
    requireClosureExport: (srcsConfig.requireClosureExport),
    requireClosureLibrary: (depsConfig.requireClosureLibrary ||
      srcsConfig.requireClosureLibrary),
    requireSoyLibrary: (depsConfig.requireSoyLibrary ||
      srcsConfig.requireSoyLibrary || soyConfig.requireSoyLibrary),
    requireECMAScript6: (depsConfig.requireECMAScript6 ||
      srcsConfig.requireECMAScript6)
  };
};


/**
 * Scan files for certain file types and return list of files and requirements.
 * @param {array} files
 * @return {Object}
 */
BuildTools.scanFiles = function(files) {
  var closureFiles = [];
  var jsFiles = [];
  var cssFiles = [];
  var soyFiles = [];
  var nodeFiles = [];
  var requireClosureLibrary = false;
  var requireClosureExport = false;
  var requireSoyLibrary = false;
  var requireECMAScript6 = false;

  for (var i = files.length - 1; i >= 0; i--) {
    var file = files[i];
    if (file.indexOf('.soy') !== -1 && file.indexOf('.soy.js') === -1) {
      soyFiles.push(file);
      requireSoyLibrary = true;
    } else if (file.indexOf('.js') !== -1) {
      var fileContent = fs.readFileSync(file, 'utf8');
      if (fileContent.indexOf('goog.provide(') !== -1 ||
          fileContent.indexOf('goog.require(') !== -1) {
        if (fileContent.indexOf(' * @export') !== -1) {
          requireClosureExport = true;
        }
        closureFiles.push(file);
      } else if (fileContent.indexOf('require(' !== -1) &&
        fileContent.indexOf('module.exports') !== -1) {
        nodeFiles.push(file);
      } else {
        jsFiles.push(file);
      }
      if (fileContent.indexOf('goog.require(\'goog.') !== -1 ||
          fileContent.indexOf('goog.require("goog.') !== -1) {
        requireClosureLibrary = true;
      }
      if (/(let|const)\s+\w+\s?=/.test(fileContent)) {
        requireECMAScript6 = true;
      }
    } else if (file.indexOf('.css') !== -1) {
      cssFiles.push(file);
    }
  }
  return {
    closureFiles: closureFiles,
    jsFiles: jsFiles,
    cssFiles: cssFiles,
    soyFiles: soyFiles,
    nodeFiles: nodeFiles,
    requireClosureExport: requireClosureExport,
    requireClosureLibrary: requireClosureLibrary,
    requireSoyLibrary: requireSoyLibrary,
    requireECMAScript6: requireECMAScript6
  };
};


/**
 * @param {array} files
 * @return {array}
 */
BuildTools.filterTestFiles = function(files) {
  for (var i = files.length - 1; i >= 0; i--) {
    var file = files[i];
    if (file.indexOf('_test.js') !== -1 ||
        file.indexOf('_testhelper.js') !== -1 ||
        file.indexOf('/demos/') !== -1 ||
        file.indexOf('/deps.js') !== -1) {
      files.splice(i, 1);
    }
  }
  return files;
};


/**
 * @param {string|array} Files with glob syntax.
 * @return {array}
 */
BuildTools.getGlobFiles = function(files) {
  var fileList = [];
  var filesToGlob = (files.constructor === String) ? [files] : files;
  for (var i = filesToGlob.length - 1; i >= 0; i--) {
    fileList = fileList.concat(glob.sync(filesToGlob[i]));
  }
  return fileList;
};


/**
 * @return {string} Node module path.
 */
BuildTools.getModulePath = function() {
  return path.join(path.dirname(module.filename), 'node_modules');
};


/**
 * @param {string} file
 * @return {string} file path
 */
BuildTools.getFilePath = function(file) {
  return (file && pathParse(file).ext) ? pathParse(file).dir : file;
};


/**
 * @param {string} file_path
 * @return {string} file
 */
BuildTools.getPathFile = function(file_path) {
  return (file_path && pathParse(file_path).ext) ?
     pathParse(file_path).base : '';
};


/**
 * @param {string} file
 * @return {string} base folder
 */
BuildTools.getFileBase = function(file) {
  return pathParse(file).base;
};


/**
 * @param {string} file_url
 * @return {string} file
 */
BuildTools.getUrlFile = function(file_url) {
  return path.basename(url.parse(file_url).pathname);
};


/**
 * @param {string=} opt_name
 * @return {string} Temp dir path.
 */
BuildTools.getRandomTempPath = function(opt_name) {
  var name = (opt_name || 'closure-builder') + randomstring.generate(7);
  return BuildTools.getTempPath(name);
};


/**
 * @param {string=} opt_name
 * @return {string} Temp dir path.
 */
BuildTools.getTempPath = function(opt_name) {
  var tempPath = path.join(os.tmpdir(), opt_name || '');
  BuildTools.mkdir(tempPath);
  return tempPath;
};


/**
 * @param {!number} size in megabyte.
 * @return {!boolean}
 */
BuildTools.checkAvailableMemory = function(size) {
  return size <= BuildTools.getMemory();
};


/**
 * @param {boolean=} opt_raw
 * @return {!number} Available memory in megabyte.
 */
BuildTools.getMemory = function(opt_raw) {
  var memory = os.freemem() / 1000000;
  if (memory > 512 && process.env.C9_PROJECT) {
    memory = 384;
  }
  if (opt_raw) {
    return memory;
  }
  return Math.floor(memory);
};


/**
 * @return {number} 90% of the available memory in megabyte.
 */
BuildTools.getSafeMemory = function() {
  return Math.floor(BuildTools.getMemory(true) * 0.9);
};


/**
 * @param {string} dir_path
 * @return {boolean} Directory exists.
 */
BuildTools.existDirectory = function(dir_path) {
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
BuildTools.existFile = function(file_path) {
  try {
    return fs.statSync(file_path).isFile();
  } catch (err) {
    return false;
  }
};


/**
 * @param {string} dir_path
 */
BuildTools.mkdir = function(dir_path) {
  if (!BuildTools.existDirectory(dir_path)) {
    mkdirp.sync(dir_path);
  }
};


/**
 * @param {string} file_path
 */
BuildTools.mkfile = function(file_path) {
  var dir_path = path.dirname(file_path);
  BuildTools.mkdir(dir_path);
  touch.sync(file_path);
};


/**
 * Trucate a text in the middle.
 * @param {!string} text
 * @param {number=} opt_max_length
 * @param {string=} opt_seperator
 * @return {!string}
 */
BuildTools.getTruncateText = function(text, opt_max_length, opt_seperator) {
  var max_length = opt_max_length || 40;
  if (text.length <= max_length) {
    return text;
  }
  var seperator = opt_seperator || '…';
  var textFront = text.substr(0, Math.ceil(max_length/2) - seperator.length);
  var textEnd = text.substr(text.length - Math.floor(max_length/2));
  return textFront + seperator + textEnd;
};

module.exports = BuildTools;
