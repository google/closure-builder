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
var path = require('path');
var progressBar = require('progress');
var randomString = require('randomstring');

var BuildType = require('./build_types.js');
var BuildTools = require('./build_tools.js');

/**
 * Build configuration object.
 *
 * @param {object} config
 * @constructor
 * @struct
 * @final
 */
var BuildConfig = function(config) {

  /** @type {!object} */
  this.config = config || {};

  /** @type {!boolean} */
  this.debug = this.config.debug || false;

  /** @type {!boolean} */
  this.trace = this.config.trace || false;

  /** @type {!string} */
  this.name = this.config.name || '';

  /** @type {!object} */
  this.options = this.config.options || {};

  /** @type {!BuildType} */
  this.type = BuildType.UNKNOWN;

  /** @type {!boolean} */
  this.excludeTest = this.options.exclude_test || false;

  /** @private */
  this.bar_ = new progressBar('[:percent] ' + '\u001b[32m' + this.name +
      '\u001b[0m :message \u001b[37m(:elapsed sec)\u001b[0m', {
        renderThrottle: 100, total: 100
      });

  /** @private */
  this.runTime_ = Date.now();

  /** @type {!boolean} */
  this.compress = this.config.compress || false;

  /** @type {!string} */
  this.tempPath = BuildTools.getRandomTempPath();

  /** @type {!array} */
  this.data = this.config.data || [];

  /** @type {!string} */
  this.license = this.config.license || '';

  /** @type {!array} */
  this.deps = BuildTools.sortFiles(this.config.deps || []);

  /** @type {!array} */
  this.resources = BuildTools.sortFiles(this.config.resources || [], true);

  /** @type {!array} */
  this.srcs = BuildTools.sortFiles(this.config.srcs || [], false,
      this.excludeTest);

  /** @type {!array} */
  this.soy = BuildTools.sortFiles(this.config.soy || []);

  /** @type {!string} */
  this.out = this.config.out;

  /** @type {!string} */
  this.outPath = BuildTools.getFilePath(this.out) || this.tempPath;

  /** @type {!string} */
  this.outFile = BuildTools.getPathFile(this.out) || randomString.generate();

  /** @type {!object} */
  this.soyCompilerOptions = this.options.soy || {
    shouldProvideRequireSoyNamespaces: true
  };

  /** @type {!object} */
  this.closureCompilerOptions = this.options.closure || {
    compilation_level: 'SIMPLE_OPTIMIZATIONS'
  };

  /** @type {!string} */
  this.soyPath = (this.out) ? this.out : path.join(this.tempPath, 'soy');

  /** @type {!string} */
  this.closureNamespace = this.config.namespace || '';

  /** @type {!string} */
  this.errors = '';

  // Checking requirements and make sure correct options are set.
  var requirements = BuildTools.getBuildRequirements(this);

  /** @type {boolean} */
  this.requireClosureExport = requirements.requireClosureExport;

  /** @type {boolean} */
  this.requireClosureLibrary = requirements.requireClosureLibrary;

  /** @type {boolean} */
  this.requireECMAScript6 = requirements.requireECMAScript6;

  /** @type {boolean} */
  this.requireSoyLibrary = requirements.requireSoyLibrary;

  /** @private {!array} */
  this.closureFiles_ = requirements.closureFiles;

  /** @private {!array} */
  this.jsFiles_ = requirements.jsFiles;

  /** @private {!array} */
  this.cssFiles_ = requirements.cssFiles;

  /** @private {!array} */
  this.soyFiles_ = requirements.soyFiles;

  /** @private {!array} */
  this.nodeFiles_ = requirements.nodeFiles;

  /** @private {!array} */
  this.resourceFiles_ = this.resources;

  if (!this.type) {
    this.type = BuildTools.detectType(this);
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
BuildConfig.prototype.getSoyFiles = function() {
  return this.soyFiles_;
};

/**
 * @return {!array}
 */
BuildConfig.prototype.getResourceFiles = function() {
  return this.resourceFiles_;
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
BuildConfig.prototype.hasSoyFiles = function() {
  return this.soyFiles_.length || 0;
};

/**
 * @return {!number}
 */
BuildConfig.prototype.hasResourceFiles = function() {
  return this.resourceFiles_.length || 0;
};

/**
 * @return {!string}
 */
BuildConfig.prototype.getOutPath = function() {
  return this.outPath;
};

/**
 * @return {!string}
 */
BuildConfig.prototype.getOutFile = function() {
  return this.outFile;
};

/**
 * @return {!string}
 */
BuildConfig.prototype.getOutFilePath = function() {
  return path.join(this.outPath, this.outFile);
};

/**
 * @return {!BuildType}
 */
BuildConfig.prototype.getType = function() {
  return this.type;
};

/**
 * @param {!string} message
 * @param {number=} opt_percent
 */
BuildConfig.prototype.setMessage = function(message, opt_percent) {
  var messageBlock = {
    'message': message
  };
  if (opt_percent) {
    this.bar_.tick(opt_percent, messageBlock);
  } else {
    this.bar_.tick(messageBlock);
  }
};


module.exports = BuildConfig;
