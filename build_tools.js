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
let fs = require('fs-extra');

let BuildType = require('./build/types.js');


/**
 * Build Tools.
 * @constructor
 * @struct
 * @final
 */
let BuildTools = function() {};


/**
 * Detects the needed compiler types.
 * @param {!BuildConfig} config
 * @return {!string}
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
  } else if (config.hasClosureStylesheetsFiles()) {
    return BuildType.CLOSURE_STYLESHEETS;
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
 * @param {!array|string} files
 * @param {boolean=} opt_all Show all files and folders.
 * @param {boolean=} opt_exclude_test Exclude test files.
 * @return {array}
 */
BuildTools.sortFiles = function(files, opt_all, opt_exclude_test) {
  if (!Array.isArray(files)) {
    files = [files];
  }
  let fileList = [];
  let knownFile = {};
  for (let i = files.length - 1; i >= 0; i--) {
    let file = files[i];
    if (file.constructor === Array) {
      for (let i2 = file.length - 1; i2 >= 0; i2--) {
        let subFile = file[i2];
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
  let depsConfig = this.scanFiles(config.deps);
  let srcsConfig = this.scanFiles(config.srcs, config.name);
  let soyConfig = this.scanFiles(config.soy);
  let mdConfig = this.scanFiles(config.markdown);

  return {
    closureFiles: [].concat(depsConfig.closureFiles, srcsConfig.closureFiles),
    cssFiles: [].concat(srcsConfig.cssFiles),
    closureStylesheetsFiles: [].concat(srcsConfig.closureStylesheetsFiles),
    jsFiles: [].concat(depsConfig.jsFiles, srcsConfig.jsFiles),
    markdownFiles: [].concat(mdConfig.markdownFiles),
    nodeFiles: [].concat(srcsConfig.nodeFiles),
    soyFiles: [].concat(depsConfig.soyFiles, soyConfig.soyFiles,
      srcsConfig.soyFiles),
    entryPoint: (depsConfig.entryPoint || srcsConfig.entryPoint),
    requireClosureExport: (srcsConfig.requireClosureExport),
    requireClosureLibrary: (depsConfig.requireClosureLibrary ||
      srcsConfig.requireClosureLibrary),
    requireClosureLibraryUI: (depsConfig.requireClosureLibraryUI ||
      srcsConfig.requireClosureLibraryUI),
    requireECMAScript6: (depsConfig.requireECMAScript6 ||
      srcsConfig.requireECMAScript6),
    requireSoyLibrary: (depsConfig.requireSoyLibrary ||
      srcsConfig.requireSoyLibrary || soyConfig.requireSoyLibrary),
    requireSoyi18n: (soyConfig.requireSoyi18n || srcsConfig.requireSoyi18n),
  };
};


/**
 * Scan files for certain file types and return list of files and requirements.
 * @param {!array|string} files
 * @param {string=} opt_entry_point
 * @return {Object}
 */
BuildTools.scanFiles = function(files, opt_entry_point) {
  if (!Array.isArray(files)) {
    files = [files];
  }

  let closureFiles = [];
  let closureStylesheetsFiles = [];
  let cssFiles = [];
  let entryPoint = '';
  let jsFiles = [];
  let markdownFiles = [];
  let nodeFiles = [];
  let soyFiles = [];
  let requireClosureExport = false;
  let requireClosureLibrary = false;
  let requireClosureLibraryUI = false;
  let requireECMAScript6 = false;
  let requireSoyLibrary = false;
  let requireSoyi18n = false;

  for (let i = files.length - 1; i >= 0; i--) {
    let file = files[i];

    // Handling soy files.
    if (file.endsWith('.soy')) {
      let soyContent = fs.readFileSync(file, 'utf8');
      if (soyContent.includes('{i18n}') &&
          soyContent.includes('{/i18n}')) {
        requireSoyi18n = true;
      }
      requireSoyLibrary = true;
      soyFiles.push(file);

    // Handling JavaScript files.
    } else if (file.endsWith('.js')) {
      let fileContent = fs.readFileSync(file, 'utf8');
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
        if (fileContent.includes('goog.require(\'goog.ui') ||
            fileContent.includes('goog.require("goog.ui')) {
          requireClosureLibraryUI = true;
        }
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

    // Handling Closure stylesheets (.gss) file.
    } else if (file.endsWith('.gss')) {
      closureStylesheetsFiles.push(file);

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
    closureStylesheetsFiles: closureStylesheetsFiles,
    jsFiles: jsFiles,
    markdownFiles: markdownFiles,
    nodeFiles: nodeFiles,
    soyFiles: soyFiles,
    requireClosureExport: requireClosureExport,
    requireClosureLibrary: requireClosureLibrary,
    requireClosureLibraryUI: requireClosureLibraryUI,
    requireECMAScript6: requireECMAScript6,
    requireSoyLibrary: requireSoyLibrary,
    requireSoyi18n: requireSoyi18n,
  };
};


/**
 * @param {array} files
 * @return {array}
 */
BuildTools.filterTestFiles = function(files) {
  for (let i = files.length - 1; i >= 0; i--) {
    let file = files[i];
    if (file.indexOf('_test.js') !== -1 ||
        file.indexOf('_testhelper.js') !== -1 ||
        file.indexOf('/demos/') !== -1 ||
        file.indexOf('/deps.js') !== -1) {
      files.splice(i, 1);
    }
  }
  return files;
};


module.exports = BuildTools;
