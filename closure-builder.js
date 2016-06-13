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

var buildConfig = require('./build_config.js');
var buildTools = require('./build_tools.js');
var buildType = require('./build_types.js');
var buildCompilers = require('./build_compilers.js');


/**
 * @constructor
 */
var ClosureBuilder = function() {

  /** @type {boolean} */
  this.error = false;

  /** @type {string} */
  this.logLevel = 'info';

  /** @type {string} */
  this.modulePath = buildTools.getModulePath();

  /** @type {string} */
  this.selfPath = __dirname;

  /** @type {Object} */
  this.nameCache = {};

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
 * @param {function=} opt_callback in the format
 *   function(errors, warnings, files, results) {...}
 */
ClosureBuilder.prototype.build = function(build_config, opt_callback) {

  if (this.error) {
    return;
  }

  if (!build_config) {
    log.error('No Closure Builder config!');
    return;
  }

  if (build_config.enabled === false) {
    log.warn('Closure Builder config is disabled!');
    return;
  }

  if (build_config.trace) {
    this.setLogLevel('trace');
  } else if (build_config.debug) {
    this.setLogLevel('debug');
  } else {
    this.setLogLevel(this.logLevel);
  }

  var config = this.getBuildConfig(build_config);
  var type = config.getType();
  if (!type) {
    log.error('Invalid Closure Builder config!');
    return;
  }

  config.setMessage('Collecting file informations ...');
  this.showConfigInformation(config);

  config.setMessage('Compiler Type: ' + type);
  var callback = function(errors, warnings, files, results) {
    if (opt_callback) {
      opt_callback(errors, warnings, files, results);
    }
    if (errors) {
      config.setMessage('\u001b[93m[\u001b[31mErrors!\u001b[93m]\u001b[0m');
    } else if (warnings) {
      config.setMessage('\u001b[93m[\u001b[33mWarn\u001b[93m]\u001b[0m', 100);
    } else {
      config.setMessage('\u001b[93m[\u001b[32mDone\u001b[93m]\u001b[0m', 100);
    }
  }.bind(this);

  config.setMessage('Working ...', 10);
  if (type === buildType.SOY) {
    this.compileSoyTemplates(config, callback);
  } else if (type === buildType.CLOSURE) {
    this.compileClosureFiles(config, [], callback);
  } else if (type === buildType.NODEJS) {
    this.compileNodeFiles(config, callback);
  } else if (type === buildType.SOY_CLOSURE) {
    this.compileClosureWithSoyFiles(config, callback);
  } else if (type === buildType.JAVASCRIPT) {
    this.compileJavaScriptFiles(config, callback);
  } else if (type === buildType.CSS) {
    this.compileCssFiles(config, callback);
  } else if (type === buildType.MARKDOWN) {
    this.convertMarkdownFiles(config, callback);
  } else if (type === buildType.RESOURCES) {
    this.copyResources(config, callback);
  } else {
    callback('Type ' + type + ' is unsupported!');
  }
};


/**
 * @param {!buildConfig} config
 */
ClosureBuilder.prototype.showConfigInformation = function(config) {
  log.debug('Type:', config.type);
  log.debug('Closure namespace:', config.closureNamespace);
  log.debug('Require closure library:', config.requireClosureLibrary);
  log.debug('Require closure export:', config.requireClosureExport);
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

  log.debug('Found', config.hasMarkdownFiles(), 'markdown files.');
  log.trace(config.getMarkdownFiles());

  log.debug('Found', config.hasResourceFiles(), 'resources files.');
  log.trace(config.getResourceFiles());
};


/**
 * Compile soy templates for the given buildConfig.
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileSoyTemplates = function(config, opt_callback) {
  config.setMessage('Compiling soy templates');
  var soyPath = (config.getType() === buildType.SOY_CLOSURE) ?
    config.getTempPath() : config.getOutPath();
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
  config.setMessage('Compiling Closure Files');
  var files = [].concat(config.getClosureFiles(), opt_files || []);
  buildCompilers.compileJsFiles(files, config.getOutFilePath(), config.name,
    config.closureCompilerOptions, opt_callback, config);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileJavaScriptFiles = function(config,
    opt_callback) {
  config.setMessage('Compiling JavaScript files ...');
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
  var compilerEvent = function(errors, warnings, files) {
    if (errors) {
      opt_callback(errors, warnings);
    } else if (files) {
      this.compileClosureFiles(config, files, opt_callback);
    }
  };
  this.compileSoyTemplates(config, compilerEvent.bind(this));
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileNodeFiles = function(config, opt_callback) {
  config.setMessage('Compiling Node files ...');
  var files = config.getNodeFiles();
  buildCompilers.compileNodeFiles(files, config.getOutFilePath(), opt_callback,
      config);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileCssFiles = function(config, opt_callback) {
  config.setMessage('Compiling CSS files ...');
  var files = config.getCssFiles();
  buildCompilers.compileCssFiles(files, config.getOutFilePath(), opt_callback,
      config);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.convertMarkdownFiles = function(config, opt_callback) {
  config.setMessage('Converting markdown files ...');
  var files = config.getMarkdownFiles();
  buildCompilers.convertMarkdownFiles(files, config.getOutPath(), opt_callback,
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
  config.setMessage('Copying resources ...');
  var files = config.getResourceFiles();
  var errors_ = 0;
  var warnings_ = 0;
  var callback = function(errors, warnings) {
    if (errors && errors.length >= 1) {
      errors_ += 1;
    }
    if (warnings && warnings.length >= 1) {
      config.setMessage(warnings);
      warnings_ += 1;
    }
  }.bind(this);
  buildCompilers.copyFiles(files, config.out, callback);
  if (files.length == 1) {
    config.setMessage('Copied resource file to ' + config.out, 100);
  } else {
    config.setMessage('Copied resources files to ' + config.out, 100);
  }
  if (opt_callback) {
    opt_callback(errors_, warnings_);
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
