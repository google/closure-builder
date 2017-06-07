/**
 * @fileoverview Closure Builder - Build compilers
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
var cleanCss = require('clean-css');
var fs = require('fs-extra');
var log = require('loglevel');
var marked = require('marked');
var path = require('path');
var validator = require('validator');

var fileTools = require('./tools/file.js');
var memoryTools = require('./tools/memory.js');
var pathTools = require('./tools/path.js');
var remoteTools = require('./tools/remote.js');
var textTools = require('./tools/text.js');

var closureCompiler = require('./compilers/closure-compiler/compiler.js');
var closureStylesheetsCompiler = require(
  './compilers/closure-stylesheets/compiler.js');
var closureTemplatesCompiler = require(
  './compilers/closure-templates/compiler.js');
var nodejsCompiler = require('./compilers/nodejs/compiler.js');
var rollupCompiler = require('./compilers/rollup/compiler.js');



/**
 * Build Compilers.
 * @constructor
 * @struct
 * @final
 */
var BuildCompilers = function() {};


/**
 * Avalible memory to avoid "Out of memory" issues.
 * @type {number}
 */
BuildCompilers.SAFE_MEMORY = memoryTools.getSafeMemory() || 512;


/**
 * Running in test mode ?
 * @type {boolean}
 */
BuildCompilers.TEST_MODE = typeof global.it === 'function';


/**
 * Copy file from src to dest.
 * @param {!string} src
 * @param {!string} dest
 * @param {function=} opt_callback
 */
BuildCompilers.copyFile = function(src, dest, opt_callback) {
  if (!fileTools.access(src)) {
    var message = 'No access to resource ' + src;
    log.error(message);
    if (opt_callback) {
      opt_callback(message, false);
    }
    return;
  }
  var destFile = path.join(dest, pathTools.getFileBase(src));
  if (pathTools.isFile(dest)) {
    destFile = dest;
  }
  var fileEvent = (error) => {
    if (error) {
      var message = 'Resource ' + src + ' failed to copy to ' + destFile;
      log.error(message);
      if (opt_callback) {
        opt_callback(message, false, destFile);
      }
    } else {
      if (opt_callback) {
        opt_callback(false, false, destFile);
      }
    }
  };
  fs.copy(src, destFile, fileEvent);
};


/**
 * Copy file from remote to dest.
 * @param {!string} src
 * @param {!string} dest
 * @param {function=} opt_callback
 */
BuildCompilers.copyRemoteFile = function(src, dest, opt_callback) {
  var destFile = pathTools.getUrlFile(src);
  var completeEvent = function(response) {
    if (!opt_callback) {
      return;
    }
    if (response.statusCode !== 200) {
      opt_callback('Remote Resource' + src + 'failed to download with' +
        'http status: '  + response.statusCode, false, destFile);
    } else {
      opt_callback(false, false, destFile);
    }
  };
  var errorEvent = function(error) {
    if (!opt_callback) {
      return;
    }
    if (error && error.code == 'ENOTFOUND') {
      var warnMessage = 'Resource at ' + error.hostname +
        ' is not reachable!\n' +
        'Please make sure you are online and that the name is correct!\n' +
        '(This message could be ignored if you are working offline!)';
      opt_callback(false, warnMessage, destFile);
    } else {
      opt_callback('Remote resource ' + src + ' failed to copy to ' +
      destFile + ':' + error, false, destFile);
    }
  };
  remoteTools.getFile(src, dest, destFile, completeEvent, errorEvent);
};


/**
 * Copy files from srcs to dest.
 * @param {!string} srcs
 * @param {!string} dest
 * @param {function=} opt_callback
 */
BuildCompilers.copyFiles = function(srcs, dest, opt_callback) {
  if (pathTools.isFile(dest)) {
    fileTools.mkdir(path.dirname(dest));
  } else {
    fileTools.mkdir(dest);
  }
  var errors_ = [];
  var warnings_ = [];
  var files_ = [];
  var numFiles_ = srcs.length;
  var numDone_ = 0;
  var callback = (errors, warnings, files) => {
    if (errors) {
      errors_.push(errors);
    }
    if (warnings) {
      warnings_.push(warnings);
    }
    if (files) {
      files_.push(files);
    }
    numDone_ += 1;
    if (numFiles_ <= numDone_) {
      if (opt_callback) {
        opt_callback(errors_, warnings_, files_);
      }
    }
  };

  for (let i = numFiles_ - 1; i >= 0; i--) {
    if (validator.isURL(srcs[i])) {
      BuildCompilers.copyRemoteFile(srcs[i], dest, callback);
    } else {
      BuildCompilers.copyFile(srcs[i], dest, callback);
    }
  }
};


/**
 * @param {Array} files
 * @param {string=} out
 * @param {object=} opt_options Additional options for the compiler.
 *   opt_options.config = BuildConfig
 *   opt_options.options = Additional compiler options
 * @param {function=} opt_callback
 */
BuildCompilers.compileSoyTemplates = function(files, out,
    opt_options, opt_callback) {
  var options = (opt_options && opt_options.options) ?
    opt_options.options : {};
  var config = (opt_options && opt_options.config) ?
    opt_options.config : false;
  var message = 'Compiling ' + files.length + ' soy files to ' + out;
  if (typeof options.shouldProvideRequireSoyNamespaces === 'undefined') {
    options.shouldProvideRequireSoyNamespaces = true;
  }
  if (typeof options.shouldGenerateJsdoc === 'undefined') {
    options.shouldGenerateJsdoc = true;
  }
  if (config) {
    config.setMessage(message);
    if (config.i18n) {
      options.i18n = config.i18n;
    }
    if (config.requireSoyi18n) {
      options.i18n = true;
      options.use_i18n = config.requireSoyi18n;
    }
  } else {
    log.debug(message);
    log.trace(files);
  }

  fileTools.mkdir(out);
  var compilerEvent = (errors, warnings, files) => {
    if (!errors) {
      var success_message = 'Compiled ' + files.length + ' soy files to ' +
        textTools.getTruncateText(out);
      if (config) {
        config.setMessage(success_message);
      }
    }
    if (opt_callback) {
      opt_callback(errors, warnings, files);
    }
  };

  closureTemplatesCompiler.compile(files, options, out, compilerEvent);
};


/**
 * @param {Array} files
 * @param {string=} output
 * @param {function=} opt_callback
 * @param {BuildConfig=} opt_config
 */
BuildCompilers.compileCssFiles = function(files, out, opt_callback,
    opt_config) {
  var compilerEvent = (errors, minified) => {
    if (errors) {
      var errorsMessage = 'Failed for ' + out + ':' + errors;
      BuildCompilers.errorCssCompiler(errorsMessage);
      if (opt_config) {
        opt_config.setMessage(errorsMessage);
      }
      if (opt_callback) {
        opt_callback(errors, false);
      }
    } else if (minified) {
      fileTools.saveContent(out, minified.styles, opt_callback, opt_config);
    }
  };
  new cleanCss().minify(files, compilerEvent);
};


/**
 * @param {Array} files
 * @param {string=} out
 * @param {object=} opt_options Additional options for the compiler.
 *   opt_options.config = BuildConfig
 *   opt_options.options = Additional compiler options
 * @param {function=} opt_callback
 */
BuildCompilers.compileNodeFiles = function(files, out,
    opt_options, opt_callback) {
  var options = (opt_options && opt_options.options) ? opt_options.options : {};
  var config = (opt_options && opt_options.config) ? opt_options.config : false;
  log.debug('Compiling', files.length, ' node files to', out, '...');
  log.trace(files);

  if (config) {
    if (config.debug) {
      options.debug = config.debug;
    }
  }

  var compilerEvent = (errors, warnings, target_file) => {
    if (errors) {
      if (opt_callback) {
        opt_callback(errors, warnings);
      }
    } else if (target_file) {
      if (opt_callback) {
        opt_callback(errors, warnings, target_file);
      }
    } else {
      if (opt_callback) {
        opt_callback(errors, warnings);
      }
    }
  };

  nodejsCompiler.compile(files, options, out, compilerEvent);
};


/**
 * @param {String} file
 * @param {string=} out
 * @param {object=} opt_options Additional options for the compiler.
 *   opt_options.config = BuildConfig
 *   opt_options.options = Additional compiler options
 * @param {function=} opt_callback
 */
BuildCompilers.compileRollupFile = function(file, out,
    opt_options, opt_callback) {
  var options = (opt_options && opt_options.options) ? opt_options.options : {};
  var config = (opt_options && opt_options.config) ? opt_options.config : false;

  if (!options.moduleName) {
    options.moduleName = config.name;
  }
  if (!options.banner) {
    options.banner = config.banner;
  }
  if (!options.format) {
    options.format = config.format;
  }
  if (config.plugins && config.plugins.length) {
    options.plugins = config.plugins;
  }

  log.debug('Compiling rollup file to', out, '...');
  log.trace(file);

  rollupCompiler.compile(file, options, out, opt_callback);
};


/**
 * @param {!string} file
 * @param {string=} output
 * @param {function=} callback
 * @param {BuildConfig=} config
 */
BuildCompilers.convertMarkdownFile = function(file, out, callback, config) {
  var markdown = fs.readFileSync(file, 'utf8');
  var content = marked(markdown);
  var destFile = path.join(out,
    pathTools.getPathFile(file).replace('.md', '.html'));
  log.debug('Convert markdown file to', destFile, '...');
  log.trace(destFile);
  fileTools.saveContent(destFile, content, callback, config);
};


/**
 * @param {Array} files
 * @param {string=} output
 * @param {function=} callback
 * @param {BuildConfig=} config
 */
BuildCompilers.convertMarkdownFiles = function(files, out, callback, config) {
  var foundError = false;
  var outFiles = [];
  var errorEvent = (error, warning, file) => {
    if (error) {
      foundError = error;
    } else if (file) {
      outFiles.push(file);
    }
  };
  for (var i in files) {
    BuildCompilers.convertMarkdownFile(files[i], out, errorEvent, config);
    if (foundError) {
      break;
    }
  }
  if (callback) {
    callback(foundError, false, outFiles, '');
  }
};


/**
 * @param {Array} files
 * @param {string=} out
 * @param {object=} opt_options Additional options for the compiler.
 *   opt_options.config = BuildConfig
 *   opt_options.options = Additional compiler options
 * @param {function=} opt_callback
 */
BuildCompilers.compileJsFiles = function(files, out,
    opt_options, opt_callback) {
  var options = (opt_options && opt_options.options) ? opt_options.options : {};
  var config = (opt_options && opt_options.config) ? opt_options.config : false;
  log.debug('Compiling', files.length, 'files to', out, '...');
  log.trace(files);
  var useRemoteService = false;
  if (config) {
    if (config.entryPoint) {
      options.dependency_mode = 'STRICT';
      options.entry_point = config.entryPoint;
    }
    if (config.remoteService) {
      useRemoteService = true;
      delete options.entry_point;
      delete options.dependency_mode;
    }
    if (config.requireECMAScript6) {
      options.language_in = 'ECMASCRIPT6';
      options.language_out = 'ES5_STRICT';
    }
    if (config.requireClosureExport) {
      options.generate_exports = true;
    }
    if (config.requireSoyLibrary) {
      options.use_closure_templates = true;
    }
    if (config.requireClosureLibrary) {
      options.use_closure_library = true;
      if (config.requireClosureLibraryUI && !config.remoteService) {
        options.use_closure_library_ui = true;
      }
    }
    if (config.compress) {
      options.compilation_level = 'ADVANCED_OPTIMIZATIONS';
    }
    if (config.externs) {
      options.externs = config.externs;
    }
    if (!config.warn) {
      options.no_warnings = true;
    }
    if (config.outSourceMap) {
      options.create_source_map = config.outSourceMap;
    }
    if (config.jscompOff !== undefined && config.jscompOff.length > 0) {
      options.jscomp_off = config.jscompOff;
    }
    if (config.jscompWarning !== undefined && config.jscompWarning.length > 0) {
      options.jscomp_warning = config.jscompWarning;
    }
    if (config.jscompError !== undefined && config.jscompError.length > 0) {
      options.jscomp_error = config.jscompError;
    }
  }
  var compilerEvent = (errors, warnings, target_file, content) => {
    if (errors) {
      if (opt_callback) {
        opt_callback(errors, warnings);
      }
    } else if (content) {
      fileTools.saveContent(out, content, opt_callback, config, warnings);
    } else {
      if (opt_callback) {
        opt_callback(errors, warnings);
      }
    }
  };
  closureCompiler.compile(files, options, null, compilerEvent,
    useRemoteService);
};


/**
 * @param {Array} files
 * @param {string=} out
 * @param {object=} opt_options Additional options for the compiler.
 *   opt_options.config = BuildConfig
 *   opt_options.options = Additional compiler options
 * @param {function=} opt_callback
 */
BuildCompilers.compileClosureStylesheetsFiles = function(files, out,
    opt_options, opt_callback) {
  var options = (opt_options && opt_options.options) ? opt_options.options : {};
  var config = (opt_options && opt_options.config) ? opt_options.config : false;
  log.debug('Compiling', files.length, 'files to', out, '...');
  log.trace(files);
  if (config) {
    if (config.prefix) {
      options['use_prefix'] = config.prefix;
    }
  }
  var compilerEvent = (errors, warnings, target_file, content) => {
    if (errors) {
      if (opt_callback) {
        opt_callback(errors, warnings);
      }
    } else if (content) {
      fileTools.saveContent(out, content, opt_callback, config, warnings);
    } else {
      if (opt_callback) {
        opt_callback(errors, warnings);
      }
    }
  };
  closureStylesheetsCompiler.compile(files, options, null, compilerEvent);
};


/**
 * @param {string} msg
 */
BuildCompilers.errorCssCompiler = function(msg) {
  log.error('[Css Compiler Error]', msg);
};


module.exports = BuildCompilers;
