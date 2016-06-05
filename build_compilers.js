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
var browserify = require('browserify');
var closureCompiler = require('closurecompiler');
var cleanCss = require('clean-css');
var log = require('loglevel');
var path = require('path');
var fs = require('fs-extra');
var glob = require('glob');
var marked = require('marked');
var soyCompiler = require('soynode');
var validator = require('validator');

var buildTools = require('./build_tools.js');
var remoteTools = require('./tools/remote.js');



/**
 * Build Compilers.
 * @constructor
 * @struct
 * @final
 */
var BuildCompilers = function() {};


/**
 * Avalible memory to avoid "Out of mememory" issues.
 * @type {number}
 */
BuildCompilers.SAFE_MEMORY = buildTools.getSafeMemory() || 512;


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
  if (!buildTools.access(src)) {
    var message = 'No access to resource ' + src;
    log.error(message);
    if (opt_callback) {
      opt_callback(message, false);
    }
    return;
  }
  var destFile = path.join(dest, buildTools.getFileBase(src));
  if (buildTools.isFile(dest)) {
    destFile = dest;
  }
  var fileEvent = function(error) {
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
  fs.copy(src, destFile, fileEvent.bind(this));
};


/**
 * Copy file from remote to dest.
 * @param {!string} src
 * @param {!string} dest
 * @param {function=} opt_callback
 */
BuildCompilers.copyRemoteFile = function(src, dest, opt_callback) {
  var destFile = buildTools.getUrlFile(src);
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
  buildTools.mkdir(buildTools.getFileBase(dest));
  var errors_ = [];
  var warnings_ = [];
  var files_ = [];
  var numFiles_ = srcs.length;
  var numDone_ = 0;
  var callback = function(errors, warnings, files) {
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
  }.bind(this);

  for (var i = numFiles_ - 1; i >= 0; i--) {
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
  var buildConfig = (opt_options && opt_options.config) ?
    opt_options.config : false;
  var message = 'Compiling ' + files.length + ' soy files to ' + out;
  if (buildConfig) {
    buildConfig.setMessage(message);
  } else {
    log.debug(message);
    log.trace(files);
  }
  var options = {
    shouldProvideRequireSoyNamespaces: true
  };
  if (opt_options && opt_options.options) {
    options = opt_options.options;
  }
  options.uniqueDir = false;
  options.outputDir = out;
  buildTools.mkdir(out);
  var compilerEvent = function(errors) {
    if (errors) {
      var error_message = 'Failed for ' + out + ':' + errors;
      this.errorSoyCompiler(error_message);
      if (opt_callback) {
        opt_callback(error_message, false);
      }
    } else {
      var soyFiles = glob.sync(path.join(out, '**/*.soy.js'));
      var success_message = 'Compiled ' + soyFiles.length + ' soy files to ' +
        buildTools.getTruncateText(out);
      if (buildConfig) {
        buildConfig.setMessage(success_message);
      } else {
        this.infoSoyCompiler(success_message);
      }
      if (opt_callback) {
        opt_callback(false, false, soyFiles);
      }
    }
  }.bind(this);

  soyCompiler.setOptions(options);
  soyCompiler.compileTemplateFiles(files, compilerEvent);
};


/**
 * @param {Array} files
 * @param {string=} output
 * @param {function=} opt_callback
 * @param {BuildConfig=} opt_config
 */
BuildCompilers.compileCssFiles = function(files, out, opt_callback,
    opt_config) {
  var compilerEvent = function(errors, minified) {
    if (errors) {
      var errorsMessage = 'Failed for ' + out + ':' + errors;
      this.errorCssCompiler(errorsMessage);
      if (opt_config) {
        opt_config.setMessage(errorsMessage);
      }
      if (opt_callback) {
        opt_callback(errors, false);
      }
    } else if (minified) {
      if (opt_config) {
        opt_config.setMessage('Saving output to ' + out);
      }
      buildTools.saveContent(out, minified.styles, opt_callback, opt_config);
    }
  }.bind(this);
  new cleanCss().minify(files, compilerEvent);
};


/**
 * @param {Array} files
 * @param {string=} output
 * @param {function=} opt_callback
 * @param {BuildConfig=} opt_config
 */
BuildCompilers.compileNodeFiles = function(files, out, opt_callback,
    opt_config) {
  var nodeCompiler = browserify();
  nodeCompiler.add(files);
  buildTools.mkfile(out);
  var bufferEvent = function(errors) {
    if (errors) {
      var error_message = 'Was not able to write file ' + out + ':' + errors;
      this.errorNodeCompiler(error_message);
      if (opt_callback) {
        opt_callback(errors, false);
      }
    } else {
      if (opt_config) {
        opt_config.setMessage('Saving output to ' + out);
      }
    }
  }.bind(this);
  var streamEvent = fs.createWriteStream(out);
  streamEvent.on('error', function(error) {
    var error_message = 'Was not able to write file ' + out + ':' + error;
    this.errorNodeCompiler(error_message);
    if (opt_callback) {
      opt_callback(error, false);
    }
  }.bind(this));
  streamEvent.on('finish', function() {
    if (opt_callback) {
      opt_callback(false, false, out);
    }
  });
  nodeCompiler.bundle(bufferEvent).pipe(streamEvent);
};


/**
 * @param {Array} file
 * @param {string=} output
 * @param {function=} opt_callback
 * @param {BuildConfig=} opt_config
 */
BuildCompilers.convertMarkdownFile = function(file, out, opt_callback,
    opt_config) {
  var markdown = fs.readFileSync(file, 'utf8');
  var content = marked(markdown);
  var destFile = path.join(out,
    buildTools.getPathFile(file).replace('.md', '.html'));
  buildTools.saveContent(destFile, content, opt_callback, opt_config);
};


/**
 * @param {Array} files
 * @param {string=} output
 * @param {function=} opt_callback
 * @param {BuildConfig=} opt_config
 */
BuildCompilers.convertMarkdownFiles = function(files, out, opt_callback,
    opt_config) {
  var foundError = false;
  var outFiles = [];
  var errorEvent = function(error, warning, file) {
    if (error) {
      foundError = error;
    } else if (file) {
      outFiles.push(file);
    }
  }.bind(this);
  for (var i in files) {
    BuildCompilers.convertMarkdownFile(files[i], out, errorEvent, opt_config);
    if (foundError) {
      break;
    }
  }
  if (opt_callback) {
    opt_callback(foundError, false, outFiles, '');
  }
};


/**
 * @param {Array} files
 * @param {string=} output
 * @param {string=} opt_func
 * @param {object=} opt_options
 * @param {function=} opt_callback
 * @param {BuildConfig=} opt_config
 */
BuildCompilers.compileJsFiles = function(files, out, opt_func,
    opt_options, opt_callback, opt_config) {
  log.debug('Compiling', ((opt_func) ? opt_func + ' with' : ''), files.length,
    'files to', out, '...');
  log.trace(files);
  var options = opt_options || {};
  if (!('compilation_level' in options)) {
    options.compilation_level = 'SIMPLE_OPTIMIZATIONS';
  }
  if (!('jscomp_warning' in options)) {
    options.jscomp_warning = ['checkVars', 'conformanceViolations',
      'deprecated', 'externsValidation', 'fileoverviewTags', 'globalThis',
      'misplacedTypeAnnotation', 'missingProvide', 'missingRequire',
      'missingReturn', 'nonStandardJsDocs', 'typeInvalidation', 'uselessCode'];
  }
  options.Xmx = BuildCompilers.SAFE_MEMORY + 'm';
  options.Xms = '64m';

  if (opt_func) {
    options.only_closure_dependencies = true;
    options.manage_closure_dependencies = true;
    options.closure_entry_point = opt_func;
  }
  if (opt_config) {
    if (opt_config.requireECMAScript6) {
      options.language_in = 'ECMASCRIPT6';
      options.language_out = 'ES5_STRICT';
    }
    if (opt_config.requireClosureExport) {
      options.generate_exports = true;
    }
    if (opt_config.compress) {
      options.compilation_level = 'ADVANCED_OPTIMIZATIONS';
    }
    if (opt_config.externs) {
      options.externs = opt_config.externs;
    }
    if (opt_config.jscompOff !== undefined &&
        opt_config.jscompOff.length > 0) {
      options.jscomp_off = opt_config.jscompOff;
    }
    if (opt_config.jscompWarning !== undefined &&
        opt_config.jscompWarning.length > 0) {
      options.jscomp_warning = opt_config.jscompWarning;
    }
    if (opt_config.jscompError !== undefined &&
        opt_config.jscompError.length > 0) {
      options.jscomp_error = opt_config.jscompError;
    }
  }
  var compilerEvent = function(message, result) {
    var warning_message = false;
    if (message && message.match) {
      var errors = 0;
      var warnings = 0;
      var message_reg = /([0-9]+) error\(s\), ([0-9]+) warning\(s\)/;
      var messageInfo = message.match(message_reg);
      if (messageInfo) {
        errors = messageInfo[1];
        warnings = messageInfo[2];
      } else if (message.indexOf('INTERNAL COMPILER ERROR') !== -1) {
        errors = 1;
      } else if (message.toLowerCase().indexOf('error') !== -1) {
        errors = message.toLowerCase().split('error').length - 1;
      } else if (message.toLowerCase().indexOf('warning') !== -1) {
        if (message.indexOf('Java HotSpot\(TM\) Client VM warning') === -1 ||
            message.toLowerCase().split('warning').length > 2) {
          warnings = message.toLowerCase().split('warning').length - 1;
        } else {
          warnings = 0;
        }
      }
      if (errors == 0 && warnings > 0) {
        warning_message = warnings + ' warnings for ' + out + ':' + message;
        this.warnClosureCompiler(warning_message);
      } else if (errors > 0) {
        var error_message = errors + ' errors for ' + out + ':' + message;
        this.errorClosureCompiler(error_message);
        if (opt_callback) {
          opt_callback(error_message, false);
        }
      }
    } else if (message) {
      var unknowErrorMessage = 'Unknown Error: ' + message;
      this.errorClosureCompiler(unknowErrorMessage);
      if (opt_callback) {
        opt_callback(unknowErrorMessage, false);
      }
    }
    if (result) {
      var content = result;
      if (opt_config) {
        opt_config.setMessage('Saving output to ' + out);
        if (opt_config.license) {
          var license = fs.readFileSync(opt_config.license, 'utf8');
          content = license + '\n\n' + result;
        }
      }
      buildTools.saveContent(out, content, opt_callback, opt_config,
          warning_message);
    }
  }.bind(this);
  closureCompiler.compile(buildTools.getSafeFileList(files), options,
      compilerEvent);
};


/**
 * @param {string} msg
 */
BuildCompilers.infoSoyCompiler = function(msg) {
  if (msg) {
    log.info('[Soy Compiler]', msg);
  }
};


/**
 * @param {string} msg
 */
BuildCompilers.infoClosureCompiler = function(msg) {
  if (msg) {
    log.info('[Closure Compiler]', msg);
  }
};


/**
 * @param {string} msg
 */
BuildCompilers.infoCssCompiler = function(msg) {
  if (msg) {
    log.info('[Css Compiler]', msg);
  }
};


/**
 * @param {string} msg
 */
BuildCompilers.warnClosureCompiler = function(msg) {
  log.error('[Closure Compiler Warn]', msg);
};


/**
 * @param {string} msg
 */
BuildCompilers.errorSoyCompiler = function(msg) {
  log.error('[Soy Compiler Error]', msg);
};


/**
 * @param {string} msg
 */
BuildCompilers.errorClosureCompiler = function(msg) {
  log.error('[Closure Compiler Error]', msg);
};


/**
 * @param {string} msg
 */
BuildCompilers.errorCssCompiler = function(msg) {
  log.error('[Css Compiler Error]', msg);
};


/**
 * @param {string} msg
 */
BuildCompilers.errorNodeCompiler = function(msg) {
  log.error('[Node Compiler Error]', msg);
};


module.exports = BuildCompilers;
