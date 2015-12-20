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
var http = require('follow-redirects').http;
var https = require('follow-redirects').https;
var soyCompiler = require('soynode');
var validator = require('validator');

var buildTools = require('./build_tools.js');



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
 * Copy file from src to dest.
 * @param {!string} src
 * @param {!string} dest
 * @param {function=} opt_callback
 */
BuildCompilers.copyFile = function(src, dest, opt_callback) {
  var destFile = path.join(dest, buildTools.getFileBase(src));
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
  var destFile = path.join(dest, buildTools.getUrlFile(src));
  var httpCheck = { protocols: ['http'], require_protocol: true };
  var httpsCheck = { protocols: ['https'], require_protocol: true };
  var completeEvent = function(response) {
    if (response.statusCode !== 200) {
      log.error('Remote Resource', src, 'failed to download');
      throw 'HTTP Error: ' + response.statusCode;
    }
    var file = fs.createWriteStream(destFile);
    response.pipe(file);
    file.on('finish', function() {
      file.close();
    });
    if (opt_callback) {
      opt_callback(false, false, destFile);
    }
    log.debug('Remote Resource', src, 'copied to', destFile);
  };
  var errorEvent = function(error) {
    var message = 'Remote resource ' + src + ' failed to copy to ' + destFile +
      ':' + error;
    log.error(message);
    if (opt_callback) {
      opt_callback(message, false, destFile);
    }
  };

  if (validator.isURL(src, httpCheck)) {
    http.get(src, completeEvent).on('error', errorEvent);
  } else if (validator.isURL(src, httpsCheck)) {
    https.get(src, completeEvent).on('error', errorEvent);
  } else {
    var message = 'Invalid remote file: ' + src;
    log.error(message);
    if (opt_callback) {
      opt_callback(message, false, destFile);
    }
  }
};


/**
 * Copy files from srcs to dest.
 * @param {!string} srcs
 * @param {!string} dest
 * @param {function=} opt_callback
 */
BuildCompilers.copyFiles = function(srcs, dest, opt_callback) {
  buildTools.mkdir(dest);
  var errors_ = [];
  var warnings_ = [];
  var files_ = [];
  var numFiles_ = srcs.length;
  var numDone_ = 0;

  var callback = function(errors, warnings, files) {
    if (numFiles_ <= numDone_) {
      if (opt_callback) {
        opt_callback(errors_, warnings_, files_);
      }
    }
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
  }.bind(this);

  for (var i = numFiles_ - 1; i >= 0; i--) {
    if (validator.isURL(srcs)) {
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
      var content = minified.styles;
      fs.outputFile(out, content, function(error) {
        if (error) {
          var error_message = 'Was not able to write file ' + out + ':' + error;
          this.errorCssCompiler(error_message);
          if (opt_callback) {
            opt_callback(error, false);
          }
        } else {
          var success_message = 'Saved file ' +
            buildTools.getTruncateText(out) + ' ( ' + content.length + ' )';
          if (opt_config) {
            opt_config.setMessage(success_message);
          } else {
            this.infoCssCompiler(success_message);
          }
          if (opt_callback) {
            opt_callback(false, false, out, content);
          }
        }
      }.bind(this));
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
  if (!('jscomp_error' in options)) {
    options.jscomp_error = 'checkVars';
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
  }
  var compilerEvent = function(message, result) {
    var warning_message = false;
    if (message) {
      var errors = 0;
      var warnings = 0;
      var message_reg = /([0-9]+) error\(s\), ([0-9]+) warning\(s\)/;
      var message_info = message.match(message_reg);
      if (message_info) {
        errors = message_info[1];
        warnings = message_info[2];
      } else if (message.indexOf('INTERNAL COMPILER ERROR') !== -1) {
        errors = message;
      }
      if (errors == 0 && warnings > 0) {
        warning_message = warnings + ' warnings for ' + out + ':' + message;
        this.warnClosureCompiler(warning_message);
      } else {
        var error_message = errors + ' errors for ' + out + ':' + message;
        this.errorClosureCompiler(message);
        if (opt_callback) {
          opt_callback(error_message, false);
        }
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
      fs.outputFile(out, content, function(error) {
        if (error) {
          var error_message = 'Was not able to write file ' + out + ':' + error;
          this.errorClosureCompiler(error_message);
          if (opt_callback) {
            opt_callback(error_message, warning_message);
          }
        } else {
          var success_message = 'Saved file ' +
            buildTools.getTruncateText(out) + ' ( ' + content.length + ' )';
          if (opt_config) {
            opt_config.setMessage(success_message, 50);
          } else {
            this.infoClosureCompiler(success_message);
          }
          if (opt_callback) {
            opt_callback(false, warning_message, out, content);
          }
        }
      }.bind(this));
    }
  }.bind(this);
  closureCompiler.compile(files, options, compilerEvent);
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
