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
let log = require('loglevel');

let BuildConfig = require('./build/config.js');
let buildCompilers = require('./build_compilers.js');
let buildTools = require('./build_tools.js');
let buildType = require('./build/types.js');
let fileTools = require('./tools/file.js');


/**
 * @constructor
 */
let ClosureBuilder = function() {
  /** @type {string} */
  this.logLevel = 'info';

  /** @type {string} */
  this.selfPath = __dirname;

  /** @type {Object} */
  this.nameCache = {};

  /** @private {boolean} */
  this.showMessages_ = true;

  /** @private {boolean} */
  this.testEnv_ = false;
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
 * @param {!boolean} show
 */
ClosureBuilder.prototype.showMessages = function(show) {
  this.showMessages_ = show;
};


/**
 * @param {!object} build_config
 * @param {function=} opt_callback in the format
 *   function(errors, warnings, files, results) {...}
 */
ClosureBuilder.prototype.build = function(build_config, opt_callback) {
  if (!build_config) {
    log.error('Found no Closure Builder config!');
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

  this.testEnv_ = build_config.testEnv;


  let config = this.getBuildConfig(build_config);
  let type = config.getType();
  if (!type || type === buildType.UNKNOWN) {
    log.error('Unknown Closure Builder config type!');
    log.error('Please set the type or check your build config.');
    return;
  }

  // Show additional status messages
  config.showMessages(this.showMessages_);
  config.setMessage('Collecting file informations ...');

  this.showConfigInformation(config);

  config.setMessage('Compiler Type: ' + type);
  let callback = (errors, warnings, files, results) => {
    if (opt_callback) {
      opt_callback(errors, warnings, files, results);
    }
    if (errors) {
      config.setMessage('\u001b[93m[\u001b[31mErrors!\u001b[93m]\u001b[0m');
      if (!this.testEnv_) {
        process.exit(1);
      }
    } else if (warnings) {
      config.setMessage('\u001b[93m[\u001b[33mWarn\u001b[93m]\u001b[0m', 100);
    } else {
      config.setMessage('\u001b[93m[\u001b[32mDone\u001b[93m]\u001b[0m', 100);
    }
  };

  config.setMessage('Working ...', 10);
  if (type === buildType.SOY) {
    this.compileSoyTemplates(config, callback);
  } else if (type === buildType.CLOSURE) {
    this.compileClosureFiles(config, [], callback);
  } else if (type === buildType.NODEJS) {
    this.compileNodeFiles(config, callback);
  } else if (type === buildType.ROLLUP) {
    this.compileRollupFiles(config, callback);
  } else if (type === buildType.SOY_CLOSURE) {
    this.compileClosureWithSoyFiles(config, callback);
  } else if (type === buildType.JAVASCRIPT) {
    this.compileJavaScriptFiles(config, callback);
  } else if (type === buildType.CSS) {
    this.compileCssFiles(config, callback);
  } else if (type === buildType.CLOSURE_STYLESHEETS) {
    this.compileClosureStylesheetsFiles(config, callback);
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
  log.debug('Require ECMAScript6:', config.requireECMAScript6);
  log.debug('Require closure export:', config.requireClosureExport);
  log.debug('Require closure library:', config.requireClosureLibrary);
  log.debug('Require soy i18n:', config.requireSoyi18n);
  log.debug('Require soy library:', config.requireSoyLibrary);
  log.debug('License file:', config.license);

  log.debug('Found', config.hasSoyFiles(), 'soy files.');
  log.trace(config.getSoyFiles());

  log.debug('Found', config.hasClosureFiles(), 'closure files.');
  log.trace(config.getClosureFiles());

  log.debug('Found', config.hasClosureStylesheetsFiles(),
    'closure stylesheets files.');
  log.trace(config.getClosureStylesheetsFiles());

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
  let soyPath = (config.getType() === buildType.SOY_CLOSURE) ?
    config.getTempPath() : config.getOutPath();
  this.soyLimit = true;
  buildCompilers.compileSoyTemplates(config.getSoyFiles(), soyPath, {
    config: config,
    options: config.soyCompilerOptions,
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
  let files = [].concat(config.getClosureFiles(), opt_files || []);
  buildCompilers.compileJsFiles(files, config.getOutFilePath(), {
    config: config,
    options: config.closureCompilerOptions,
  }, opt_callback);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileJavaScriptFiles = function(config,
    opt_callback) {
  config.setMessage('Compiling JavaScript files ...');
  let files = config.getJavaScriptFiles();
  if (files.length == 0) {
    files = config.getNodeFiles();
  }
  buildCompilers.compileJsFiles(files, config.getOutFilePath(), {
    config: config,
    options: config.closureCompilerOptions,
  }, opt_callback);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileClosureWithSoyFiles = function(config,
    opt_callback) {
  let compilerEvent = (errors, warnings, files) => {
    if (errors) {
      opt_callback(errors, warnings);
    } else if (files) {
      this.compileClosureFiles(config, files, opt_callback);
    }
  };
  this.compileSoyTemplates(config, compilerEvent);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileNodeFiles = function(config, opt_callback) {
  config.setMessage('Compiling Node files ...');
  let files = config.getNodeFiles();
  buildCompilers.compileNodeFiles(files, config.getOutFilePath(), config,
      opt_callback);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileRollupFiles = function(config, opt_callback) {
  config.setMessage('Compiling Rollup files ...');
  let file = config.getJavaScriptFiles()[0];
  buildCompilers.compileRollupFile(file, config.getOutFilePath(), config,
      opt_callback);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileCssFiles = function(config, opt_callback) {
  config.setMessage('Compiling CSS files ...');
  let files = config.getCssFiles();
  buildCompilers.compileCssFiles(files, config.getOutFilePath(), opt_callback,
      config);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.compileClosureStylesheetsFiles = function(
    config, opt_callback) {
  config.setMessage('Compiling Closure Stylesheets files ...');
  let files = config.getClosureStylesheetsFiles();
  buildCompilers.compileClosureStylesheetsFiles(
    files, config.getOutFilePath(), {
      config: config,
      options: config.closureStylesheetsCompilerOptions,
    },
    opt_callback);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.convertMarkdownFiles = function(config, opt_callback) {
  config.setMessage('Converting markdown files ...');
  let files = config.getMarkdownFiles();
  buildCompilers.convertMarkdownFiles(files, config.getOutPath(), opt_callback,
      config);
};


/**
 * @param {!object} config
 * @return {!buildConfig}
 */
ClosureBuilder.prototype.getBuildConfig = function(config) {
  log.debug('Get Build configuration for ' + config.name);
  return new BuildConfig(config);
};


/**
 * @param {!buildConfig} config
 * @param {function=} opt_callback
 */
ClosureBuilder.prototype.copyResources = function(config, opt_callback) {
  config.setMessage('Copying resources ...');
  let files = config.getResourceFiles();
  let errors_ = 0;
  let warnings_ = 0;
  let callback = (errors, warnings) => {
    if (errors && errors.length >= 1) {
      errors_ += 1;
    }
    if (warnings && warnings.length >= 1) {
      config.setMessage(warnings);
      warnings_ += 1;
    }
  };
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
  return fileTools.getGlobFiles;
};


module.exports = new ClosureBuilder();
module.exports.ClosureBuilder = ClosureBuilder;
module.exports.BuildConfig = BuildConfig;
module.exports.buildCompilers = buildCompilers;
module.exports.buildTools = buildTools;
module.exports.buildType = buildType;
