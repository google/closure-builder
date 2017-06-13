/**
 * @fileoverview Closure Builder - Build config
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
let path = require('path');
let ProgressBar = require('progress');

let pathTools = require('./../tools/path.js');
let textTools = require('./../tools/text.js');

let BuildType = require('./types.js');
let BuildTools = require('./../build_tools.js');


/**
 * Build configuration object.
 *
 * @param {object} config
 * @constructor
 * @struct
 * @final
 */
let BuildConfig = function(config) {
  /** @type {!object} */
  this.config = config || {};

  /** @type {!boolean} */
  this.debug = this.config.debug || false;

  /** @type {!boolean} */
  this.trace = this.config.trace || false;

  /** @type {!boolean} */
  this.warn = this.config.warn !== undefined ? this.config.warn : true;

  /** @type {!boolean} */
  this.remoteService = this.config.remote_service || false;

  /** @type {!string} */
  this.name = this.config.name || '';

  /** @type {!object} */
  this.options = this.config.options || {};

  /** @type {!BuildType} */
  this.type = this.config.type || BuildType.UNKNOWN;

  /** @type {!string} */
  this.i18n = this.config.i18n || '';

  /** @type {!boolean} */
  this.excludeTest = this.options.exclude_test || false;

  /** @private */
  this.bar_ = new ProgressBar('\u001b[100m[:percent]\u001b[0m ' +
      '\u001b[32m' + this.name + '\u001b[0m' +
      ' :message \u001b[37m(:elapsed sec)\u001b[0m', {
        renderThrottle: 100, total: 100});

  /** @private */
  this.runTime_ = Date.now();

  /** @private {!boolean} */
  this.showMessages_ = true;

  /** @type {!boolean} */
  this.compress = this.config.compress || false;

  /** @type {!string} */
  this.tempPath = '';

  /** @type {!array} */
  this.data = this.config.data || [];

  /** @type {!string} */
  this.license = this.config.license || '';

  /** @type {!string} */
  this.banner = this.config.banner || '';

  /** @type {!array} */
  this.deps = BuildTools.sortFiles(this.config.deps || []);

  /** @type {!array} */
  this.externs = BuildTools.sortFiles(this.config.externs || []);

  /** @type {!array} */
  this.resources = BuildTools.sortFiles(this.config.resources || [], true);

  /** @type {!array} */
  this.srcs = BuildTools.sortFiles(this.config.srcs || [], false,
      this.excludeTest);

  /** @type {!array} */
  this.soy = BuildTools.sortFiles(this.config.soy || []);

  /** @type {!array} */
  this.markdown = BuildTools.sortFiles(this.config.markdown || []);

  /** @type {!array} */
  this.plugins = this.config.plugins || [];

  /** @type {!string} */
  this.out = this.config.out;

  /** @type {!string} */
  this.outPath = pathTools.getFilePath(this.out) || '';

  /** @type {!string} */
  this.outFile = pathTools.getPathFile(this.out) || textTools.getRandomString();

  /** @type {!string} */
  this.outSourceMap = this.config.out_source_map || '';

  /** @type {!object} */
  this.soyCompilerOptions = this.options.soy || {
    shouldProvideRequireSoyNamespaces: true,
  };

  /** @type {!object} */
  this.closureCompilerOptions = this.options.closure || {
    compilation_level: 'SIMPLE_OPTIMIZATIONS',
  };

  /** @type {!string} */
  this.soyPath = (this.out) ? this.out : path.join(this.tempPath, 'soy');

  /** @type {!string} */
  this.closureNamespace = this.config.namespace || '';

  /** @type {!string} */
  this.errors = '';

  /** @type {!string} */
  this.format = this.config.format || '';

  /** @type {!string} */
  this.appendText = this.config.append || '';

  /** @type {!string} */
  this.prependText = this.config.prepend || '';

  /** @type {array} */
  this.replaceText = this.config.replace || null;

  /** @type {!string} */
  this.prefix = this.config.prefix || '';

  // Checking requirements and make sure correct options are set.
  let requirements = BuildTools.getBuildRequirements(this);

  /** @type {boolean} */
  this.requireClosureExport = requirements.requireClosureExport;

  /** @type {boolean} */
  this.requireClosureLibrary = requirements.requireClosureLibrary;

  /** @type {boolean} */
  this.requireClosureLibraryUI = requirements.requireClosureLibraryUI;

  /** @type {boolean} */
  this.requireECMAScript6 = requirements.requireECMAScript6;

  /** @type {boolean} */
  this.requireSoyLibrary = requirements.requireSoyLibrary;

  /** @type {boolean} */
  this.requireSoyi18n = requirements.requireSoyi18n;

  /** @type {!string} */
  this.entryPoint = this.config.entryPoint || requirements.entryPoint;

  /** @type {!array} */
  this.jscompOff = this.config.jscomp_off || [];

  /** @type {!array} */
  this.jscompWarning = this.config.jscomp_warning || [];

  /** @type {!array} */
  this.jscompError = this.config.jscomp_error || [];

  /** @private {!array} */
  this.closureFiles_ = requirements.closureFiles;

  /** @private {!array} */
  this.jsFiles_ = requirements.jsFiles;

  /** @private {!array} */
  this.cssFiles_ = requirements.cssFiles;

  /** @private {!array} */
  this.closureStylesheetsFiles_ = requirements.closureStylesheetsFiles;

  /** @private {!array} */
  this.soyFiles_ = requirements.soyFiles;

  /** @private {!array} */
  this.nodeFiles_ = requirements.nodeFiles;

  /** @private {!array} */
  this.markdownFiles_ = requirements.markdownFiles;

  /** @private {!array} */
  this.resourceFiles_ = this.resources;

  // Try to detect the correct type if no type was provided.
  if (!this.type) {
    if (this.jsFiles_.length === 1 && (
          this.format === 'amd' ||
          this.format === 'cjs' ||
          this.format === 'es' ||
          this.format === 'iife' ||
          this.format === 'umd')) {
      this.type = BuildType.ROLLUP;
    } else if (this.type === BuildType.UNKNOWN) {
      this.type = BuildTools.detectType(this);
    }
  }
};

/**
 * @return {!array}
 */
BuildConfig.prototype.getClosureFiles = function() {
  return this.closureFiles_;
};

/**
 * @return {!array}
 */
BuildConfig.prototype.getJavaScriptFiles = function() {
  return this.jsFiles_;
};

/**
 * @return {!array}
 */
BuildConfig.prototype.getNodeFiles = function() {
  return this.nodeFiles_;
};

/**
 * @return {!array}
 */
BuildConfig.prototype.getCssFiles = function() {
  return this.cssFiles_;
};

/**
 * @return {!array}
 */
BuildConfig.prototype.getClosureStylesheetsFiles = function() {
  return this.closureStylesheetsFiles_;
};


/**
 * @return {!array}
 */
BuildConfig.prototype.getSoyFiles = function() {
  return this.soyFiles_;
};

/**
 * @return {!array}
 */
BuildConfig.prototype.getMarkdownFiles = function() {
  return this.markdownFiles_;
};

/**
 * @return {!array}
 */
BuildConfig.prototype.getResourceFiles = function() {
  return this.resourceFiles_;
};


/**
 * @return {!string}
 */
BuildConfig.prototype.getTempPath = function() {
  if (!this.tempPath) {
    this.tempPath =pathTools.getRandomTempPath();
  }
  return this.tempPath;
};


/**
 * @return {!string}
 */
BuildConfig.prototype.getOutPath = function() {
  if (!this.outPath) {
    this.outPath = this.getTempPath();
  }
  return this.outPath;
};


/**
 * @return {!string}
 */
BuildConfig.prototype.getOutFilePath = function() {
  return path.join(this.getOutPath(), this.outFile);
};


/**
 * @return {!string}
 */
BuildConfig.prototype.getOutFile = function() {
  return this.outFile;
};


/**
 * @return {!BuildType}
 */
BuildConfig.prototype.getType = function() {
  return this.type;
};


/**
 * @return {!number}
 */
BuildConfig.prototype.hasClosureFiles = function() {
  return this.closureFiles_.length || 0;
};


/**
 * @return {!number}
 */
BuildConfig.prototype.hasJsFiles = function() {
  return this.jsFiles_.length || 0;
};


/**
 * @return {!number}
 */
BuildConfig.prototype.hasNodeFiles = function() {
  return this.nodeFiles_.length || 0;
};


/**
 * @return {!number}
 */
BuildConfig.prototype.hasCssFiles = function() {
  return this.cssFiles_.length || 0;
};


/**
 * @return {!number}
 */
BuildConfig.prototype.hasClosureStylesheetsFiles = function() {
  return this.closureStylesheetsFiles_.length || 0;
};


/**
 * @return {!number}
 */
BuildConfig.prototype.hasSoyFiles = function() {
  return this.soyFiles_.length || 0;
};


/**
 * @return {!number}
 */
BuildConfig.prototype.hasMarkdownFiles = function() {
  return this.markdownFiles_.length || 0;
};


/**
 * @return {!number}
 */
BuildConfig.prototype.hasResourceFiles = function() {
  return this.resourceFiles_.length || 0;
};


/**
 * @param {!boolean} show
 */
BuildConfig.prototype.showMessages = function(show) {
  this.showMessages_ = show;
};


/**
 * @param {!string} message
 * @param {number=} opt_percent
 */
BuildConfig.prototype.setMessage = function(message, opt_percent) {
  if (this.showMessages_) {
    let messageBlock = {
      'message': message,
    };
    if (opt_percent) {
      this.bar_.tick(opt_percent, messageBlock);
    } else {
      this.bar_.tick(messageBlock);
    }
  }
};


module.exports = BuildConfig;
