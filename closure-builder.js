/**
 * @fileoverview Closure Builder - Closure Build system for npm.
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
var log = require('loglevel');
var path = require('path');

var buildConfig = require('./build_config.js');
var buildTools = require('./build_tools.js');
var buildType = require('./build_types.js');
var buildCompilers = require('./build_compilers.js');



/**
 * @constructor
 */
var ClosureBuilder = function() {
  log.info('Prepare Closure Builder');
  this.logLevel = 'info';
  this.modulePath = buildTools.getModulePath();
  this.nameCache = {};
  this.soyLimit = false;
  this.closureLibFiles = path.join(this.modulePath, 'google-closure-library',
      '**.js');
  this.soyLibFile = path.join(this.modulePath, 'soynode', 'node_modules',
      'closure-templates', 'soyutils_usegoog.js');
};


/**
 * @param {!string} loglevel
 */
ClosureBuilder.prototype.setLogLevel = function(loglevel) {
  if (this.logLevel !== loglevel) {
    this.logLevel = loglevel;
    log.warn('Set loglevel to', loglevel);
    log.setLevel(loglevel);
  }
};


/**
 * @param {!object} build_config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.build = function(build_config, opt_callback) {
  if (build_config.enabled === false) {
    return;
  }

  if (build_config.trace) {
    this.setLogLevel('trace');
  } else if (build_config.debug) {
    this.setLogLevel('debug');
  }

  var config = this.getBuildConfig(build_config);
  this.showConfigInformation(config);
 
  // Compiler type handling
  var type = config.getType();
  if (type === buildType.SOY) {
    this.compileSoyTemplates(config, opt_callback);
  } else if (type === buildType.CLOSURE) {
    this.compileClosureFiles(config, [], opt_callback);
  } else if (type === buildType.SOY_CLOSURE) {
    this.compileClosureWithSoyFiles(config, opt_callback);
  } else if (type === buildType.JAVASCRIPT) {
    this.compileJavaScriptFiles(config, opt_callback);
  } else if (type === buildType.CSS) {
    this.compileCssFiles(config, opt_callback);
  } else if (type === buildType.RESOURCES) {
    this.copyResources(config, opt_callback);
  } else {
    log.error('Type', type, 'is unsupported!');
  }
  config.bar.tick(1);
};


/**
 * @param {!buildConfig} config
 */
ClosureBuilder.prototype.showConfigInformation = function(config) {
  log.debug('Type:', config.type);
  log.debug('Closure namespace:', config.closureNamespace);
  log.debug('Require closure library:', config.requireClosureLibrary);
  log.debug('Require soy library:', config.requireSoyLibrary);
  log.debug('License file:', config.license);

  log.debug('Found', config.hasSoyFiles(), 'soy files.');
  log.trace(config.getSoyFiles());

  log.debug('Found', config.hasClosureFiles(), 'closure files.');
  log.trace(config.getClosureFiles());

  log.debug('Found', config.hasCssFiles(), 'css files.');
  log.trace(config.getCssFiles());

  log.debug('Found', config.hasJsFiles(), 'javascript files.');
  log.trace(config.getJavaScriptFiles());

  log.debug('Found', config.hasResourceFiles(), 'resources files.');
  log.trace(config.getResourceFiles());
  config.bar.tick(1);
};


/**
 * Compile soy templates for the given buildConfig.
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileSoyTemplates = function(config, opt_callback) {
  if (this.soyLimit) {
    log.error('\nYou can only run one Soy compiler per file instance!');
    config.bar.terminate();
    return;
  }
  config.bar.tick(1);
  var soyPath = (config.getType() === buildType.SOY_CLOSURE) ?
    config.tempPath : config.outPath;
  this.soyLimit = true;
  buildCompilers.compileSoyTemplates(config.getSoyFiles(), soyPath, {
    config: config,
    options: config.soyCompilerOptions
  }, opt_callback);
};


/**
 * @param {!buildConfig} config
 * @param {array=} opt_files
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileClosureFiles = function(config, opt_files,
    opt_callback) {
  var jsLibs = [];
  config.bar.tick(1);
  if (config.requireClosureLibrary) {
    jsLibs.push('"' + this.closureLibFiles + '"');
  }
  if (config.requireSoyLibrary) {
    jsLibs.push('"' + this.soyLibFile + '"');
  }
  var files = [].concat(config.getClosureFiles(), jsLibs, opt_files || []);
  buildCompilers.compileJsFiles(files, config.getOutFilePath(), config.name,
    config.closureCompilerOptions, opt_callback, config);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileJavaScriptFiles = function(config, opt_callback) {
  config.bar.tick(1);
  var files = config.getJavaScriptFiles();
  buildCompilers.compileJsFiles(files, config.getOutFilePath(), null,
    config.closureCompilerOptions, opt_callback, config);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileClosureWithSoyFiles = function(config,
    opt_callback) {
  config.bar.tick(1);
  var compilerEvent = function(files) {
    config.bar.tick(1);
    this.compileClosureFiles(config, files, opt_callback);
  };
  this.compileSoyTemplates(config, compilerEvent.bind(this));
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileCssFiles = function(config, opt_callback) {
  config.bar.tick(1);
  var files = config.getCssFiles();
  buildCompilers.compileCssFiles(files, config.getOutFilePath(), opt_callback,
      config);
};


/**
 * @param {!object} config
 * @return {!buildConfig}
 */
ClosureBuilder.prototype.getBuildConfig = function(config) {
  log.debug('Get Build configuration for ' + config.name);
  return new buildConfig(config);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.copyResources = function(config, opt_callback) {
  config.bar.tick(1);
  var files = config.getResourceFiles();
  buildCompilers.copyFiles(files, config.outPath);
  config.bar.tick(10);
  log.info(config.name, ':', config.outPath);
  if (opt_callback) {
    opt_callback();
  }
};


/**
 * @return {function}
 */
ClosureBuilder.prototype.globSupport = function() {
  return buildTools.getGlobFiles;
};


module.exports = new ClosureBuilder();
module.exports.ClosureBuilder = ClosureBuilder;
module.exports.buildConfig = buildConfig;
module.exports.buildCompilers = buildCompilers;
module.exports.buildTools = buildTools;
module.exports.buildType = buildType;
