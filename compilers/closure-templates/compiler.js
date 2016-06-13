/**
 * @fileoverview Closure Builder - Closure Templates compiler
 *
 * @license Copyright 2016 Google Inc. All Rights Reserved.
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

var fileTools = require('../../tools/file.js');
var javaTools = require('../../tools/java.js');
var pathTools = require('../../tools/path.js');



 /**
 * ClosureTemplates.
 * @constructor
 * @struct
 * @final
 */
var ClosureTemplates = function() {};


/**
 * @param {!string} files
 * @param {Object=} opt_options
 * @param {string=} opt_target_dir
 * @param {function=} opt_callback
 */
ClosureTemplates.compile = function(files, opt_options, opt_target_dir,
    opt_callback) {
  if (!files) {
    return;
  }
  var i = 0;
  var i18nFunction = null;
  var compiler = pathTools.getClosureTemplatesCompilerJar();
  var compilerOptions = [];
  var options = opt_options || {};
  var targetDir = opt_target_dir || pathTools.getRandomTempPath(
    'closure-builder-templates');
  var outputFiles = [];

  // Output Path Format
  if (!options.outputPathFormat) {
    options.outputPathFormat = targetDir +
      '/{INPUT_DIRECTORY}{INPUT_FILE_NAME}.js';
  }

  // Handling files
  var dupFile = {};
  for (i = 0; i < files.length; i++) {
    if (!dupFile[files[i]]) {
      compilerOptions.push('--srcs', files[i]);
      outputFiles.push(path.join(targetDir, files[i] + '.js'));
    }
    dupFile[files[i]] = true;
  }

  // Handling custom i18n
  if (options.i18n) {
    options.shouldGenerateGoogMsgDefs = true;
    options.shouldProvideRequireSoyNamespaces = true;
    options.googMsgsAreExternal = true;
    options.bidiGlobalDir = 1;
    i18nFunction = options.i18n;
    delete options.i18n;
  }

  // Handling options
  for (var option in options) {
    if (options[option] === true) {
      compilerOptions.push('--' + option);
    } else {
      compilerOptions.push('--' + option, options[option]);
    }
  }

  var compilerEvent = function(error, stdout, stderr) {
    var errorMsg = stderr || error || stdout;
    var errors = null;
    var warnings = null;
    var numErrors = 0;
    var numWarnings = 0;
    if (errorMsg) {
      var parsedErrorMessage = ClosureTemplates.parseErrorMessage(errorMsg);
      numErrors = parsedErrorMessage.errors;
      numWarnings = parsedErrorMessage.warnings;
    }

    if (numErrors == 0 && numWarnings > 0) {
      warnings = errorMsg;
      ClosureTemplates.warn(warnings);
    } else if (numErrors > 0) {
      errors = errorMsg;
      ClosureTemplates.error(errors);
      outputFiles = null;
    }

    if (i18nFunction && !numErrors) {
      fileTools.findAndReplace(
        outputFiles,
        /goog\.getMsg\(/g,
        i18nFunction + '('
      );
    }

    if (opt_callback) {
      opt_callback(errors, warnings, outputFiles);
    }
  };

  javaTools.execJavaJar(compiler, compilerOptions, compilerEvent);
};


/**
 * @param {string} message
 * @return {Object} with number of detected errors and warnings
 */
ClosureTemplates.parseErrorMessage = function(message) {
  var errors = 0;
  var warnings = 0;
  if (message) {
    if (message.indexOf('INTERNAL COMPILER ERROR') !== -1 ||
        message.indexOf('NullPointerException') !== -1) {
      errors = 1;
    } else if (message.toLowerCase().indexOf('error') !== -1) {
      errors = message.toLowerCase().split('error').length - 1;
    } else if (message.toLowerCase().split('exception') !== -1) {
      errors = 1;
    } else if (message.toLowerCase().indexOf('warning') !== -1) {
      if (message.indexOf('Java HotSpot\(TM\) Client VM warning') === -1 ||
          message.toLowerCase().split('warning').length > 2) {
        warnings = message.toLowerCase().split('warning').length - 1;
      } else {
        warnings = 0;
      }
    } else {
      errors = 1;
    }
  }
  return {
    errors: errors,
    warnings: warnings
  };
};


/**
 * @param {string} msg
 */
ClosureTemplates.info = function(msg) {
  if (msg) {
    console.info('[Closure Templates]', msg);
  }
};


/**
 * @param {string} msg
 */
ClosureTemplates.warn = function(msg) {
  console.error('[Closure Templates Warn]', msg);
};


/**
 * @param {string} msg
 */
ClosureTemplates.error = function(msg) {
  console.error('[Closure Templates Error]', msg);
};


module.exports = ClosureTemplates;
