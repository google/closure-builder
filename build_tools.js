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
var fs = require('fs-extra');
var os = require('os');

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
  } else if (config.hasMarkdownFiles()) {
    return BuildType.MARKDOWN;
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
 * Returns the needed build requirements for the given config.
 * @param {BuildConfig} config
 * @return {Object} Build requirements
 */
BuildTools.getBuildRequirements = function(config) {
  var depsConfig = this.scanFiles(config.deps);
  var srcsConfig = this.scanFiles(config.srcs, config.name);
  var soyConfig = this.scanFiles(config.soy);
  var mdConfig = this.scanFiles(config.markdown);

  return {
    closureFiles: [].concat(depsConfig.closureFiles, srcsConfig.closureFiles),
    cssFiles: [].concat(srcsConfig.cssFiles),
    jsFiles: [].concat(depsConfig.jsFiles, srcsConfig.jsFiles),
    markdownFiles: [].concat(mdConfig.markdownFiles),
    nodeFiles: [].concat(srcsConfig.nodeFiles),
    soyFiles: [].concat(depsConfig.soyFiles, soyConfig.soyFiles,
      srcsConfig.soyFiles),
    entryPoint: (depsConfig.entryPoint || srcsConfig.entryPoint),
    requireClosureExport: (srcsConfig.requireClosureExport),
    requireClosureLibrary: (depsConfig.requireClosureLibrary ||
      srcsConfig.requireClosureLibrary),
    requireECMAScript6: (depsConfig.requireECMAScript6 ||
      srcsConfig.requireECMAScript6),
    requireSoyLibrary: (depsConfig.requireSoyLibrary ||
      srcsConfig.requireSoyLibrary || soyConfig.requireSoyLibrary),
    requireSoyi18n: (soyConfig.requireSoyi18n || srcsConfig.requireSoyi18n)
  };
};


/**
 * Scan files for certain file types and return list of files and requirements.
 * @param {array} files
 * @param {string=} opt_entry_point
 * @return {Object}
 */
BuildTools.scanFiles = function(files, opt_entry_point) {
  var closureFiles = [];
  var cssFiles = [];
  var jsFiles = [];
  var markdownFiles = [];
  var nodeFiles = [];
  var soyFiles = [];
  var entryPoint = '';
  var requireClosureExport = false;
  var requireClosureLibrary = false;
  var requireECMAScript6 = false;
  var requireSoyLibrary = false;
  var requireSoyi18n = false;

  for (var i = files.length - 1; i >= 0; i--) {
    var file = files[i];

    // Handling soy files.
    if (file.endsWith('.soy')) {
      var soyContent = fs.readFileSync(file, 'utf8');
      if (soyContent.includes('{i18n}') &&
          soyContent.includes('{/i18n}')) {
        requireSoyi18n = true;
      }
      requireSoyLibrary = true;
      soyFiles.push(file);

    // Handling JavaScript files.
    } else if (file.endsWith('.js')) {
      var fileContent = fs.readFileSync(file, 'utf8');
      if (fileContent.includes('goog.provide(') ||
          fileContent.includes('goog.require(') ||
          fileContent.includes('goog.module(')) {
        if (fileContent.includes(' * @export')) {
          requireClosureExport = true;
        }
        closureFiles.push(file);
      } else if (fileContent.includes('require(') &&
                 fileContent.includes('module.exports')) {
        nodeFiles.push(file);
      } else {
        jsFiles.push(file);
      }

      // Validating possible entry points.
      if (opt_entry_point) {
        if (fileContent.includes('goog.provide(\'' + opt_entry_point + '\'') ||
            fileContent.includes('goog.module(\'' + opt_entry_point + '\'')) {
          entryPoint = opt_entry_point;
        }
      }

      // Require closure library ?
      if (fileContent.includes('goog.require(\'goog.') ||
          fileContent.includes('goog.require("goog.')) {
        requireClosureLibrary = true;
      }

      // Require soy library ?
      if (fileContent.includes('goog.require(\'soy') ||
          fileContent.includes('goog.require(\'soydata')) {
        requireSoyLibrary = true;
      }

      // ECMAScript6
      if (/(let|const)\s+\w+\s?=/.test(fileContent)) {
        requireECMAScript6 = true;
      }

    // Handling CSS files.
    } else if (file.endsWith('.css')) {
      cssFiles.push(file);

    // Handling Markdown files.
    } else if (file.endsWith('.md')) {
      markdownFiles.push(file);
    }
  }
  return {
    closureFiles: closureFiles,
    cssFiles: cssFiles,
    entryPoint: entryPoint,
    jsFiles: jsFiles,
    nodeFiles: nodeFiles,
    soyFiles: soyFiles,
    markdownFiles: markdownFiles,
    requireClosureExport: requireClosureExport,
    requireClosureLibrary: requireClosureLibrary,
    requireSoyLibrary: requireSoyLibrary,
    requireSoyi18n: requireSoyi18n,
    requireECMAScript6: requireECMAScript6
  };
};


/**
 * @param {string!} file
 * @param {string!} content
 * @param {function=} opt_callback
 * @param {BuildConfig=} opt_config
 * @param {?} opt_warning
 */
BuildTools.saveContent = function(file, content, opt_callback, opt_config,
    opt_warning) {
  var fileEvent = function(error) {
    if (error) {
      var errorMessage = 'Was not able to write file ' + file + ':' + error;
      if (opt_config) {
        opt_config.setMessage(errorMessage);
      }
      if (opt_callback) {
        opt_callback('Was not able to write file ' + file + ':' + error,
          opt_warning);
      }
    } else {
      var successMessage = 'Saved file ' +
        BuildTools.getTruncateText(file) + ' ( ' + content.length + ' )';
      if (opt_config) {
        opt_config.setMessage(successMessage);
      }
      if (opt_callback) {
        opt_callback(false, opt_warning, file, content);
      }
    }
  };
  fs.outputFile(file, content, fileEvent.bind(this));
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
 * @param {array} files
 * @return {array}
 */
BuildTools.getSafeFileList = function(files) {
  var result = [];
  var cache = {};
  for (var file in files) {
    var fileEntry = files[file];
    var safeFileEntry = '"' + fileEntry + '"';
    if (fileEntry && !(fileEntry in cache || safeFileEntry in cache)) {
      if ((fileEntry.charAt(0) === '"' && fileEntry.charAt(0) === '"') ||
          (fileEntry.charAt(0) === '\'' && fileEntry.charAt(0) === '\'')){
        result.push(fileEntry);
      } else {
        result.push(safeFileEntry);
      }
      cache[fileEntry] = true;
    }
  }
  return result;
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
 * @return {number} 90% of the available memory in megabyte and max of 1024.
 */
BuildTools.getSafeMemory = function() {
  var safeMemory = Math.floor(BuildTools.getMemory(true) * 0.9);
  if (safeMemory > 1024) {
    return 1024;
  }
  return safeMemory;
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
