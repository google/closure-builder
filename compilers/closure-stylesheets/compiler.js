/**
 * @fileoverview Closure Builder - Closure Stylesheets compiler
 *
 * @license Copyright 2017 Google Inc. All Rights Reserved.
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
let fileTools = require('../../tools/file.js');
let javaTools = require('../../tools/java.js');
let pathTools = require('../../tools/path.js');


/**
 * @constructor
 * @struct
 * @final
 */
let ClosureStylesheets = function() {};


/**
 * @type {boolean}
 */
ClosureStylesheets.DEBUG = false;


/**
 * @param {!array} files
 * @param {Object=} opt_options
 * @param {string=} opt_target_file
 * @param {function=} opt_callback
 */
ClosureStylesheets.compile = function(files, opt_options, opt_target_file,
    opt_callback) {
  if (!files) {
    ClosureStylesheets.error('No valid files are provided!', opt_callback);
    return;
  }

  if (!javaTools.hasJava()) {
    ClosureStylesheets.error('Java (JRE) is needed!', opt_callback);
    return;
  }

  let compiler = pathTools.getClosureStylesheetsCompilerJar();
  let compilerOptions = [];
  let options = opt_options || {};
  let showWarnings = true;

  // Pre-convert custom {$prefix} tag.
  if (options.use_prefix) {
    let targetDir = pathTools.getRandomTempPath('closure-builder-templates');
    fileTools.copySync(files, targetDir);
    fileTools.findAndReplace(
      [targetDir],
      /\{\$prefix\}/g,
      options.use_prefix,
      true
    );
    files = fileTools.getGlobFiles(targetDir + '/**/*');
    delete options.use_prefix;
  }

  // Handling options
  for (let option in options) {
    if (options[option] === true) {
      compilerOptions.push('--' + option);
    } else {
      compilerOptions.push('--' + option, options[option]);
    }
  }

  // Handling files
  let dupFile = {};
  for (let i = 0; i < files.length; i++) {
    if (!dupFile[files[i]]) {
      compilerOptions.push(files[i]);
    }
    dupFile[files[i]] = true;
  }

  let compilerEvent = (error, stdout, stderr) => {
    let code = stdout;
    let errorMsg = stderr || error;
    let errors = null;
    let warnings = null;
    let numErrors = 0;
    let numWarnings = 0;

    // Handling Error messages
    if (errorMsg) {
      let parsedErrorMessage = ClosureStylesheets.parseErrorMessage(errorMsg);
      numErrors = parsedErrorMessage.errors;
      numWarnings = parsedErrorMessage.warnings;
    }

    if (numErrors == 0 && numWarnings > 0 && showWarnings) {
      warnings = errorMsg;
      ClosureStylesheets.warn(warnings);
    } else if (numErrors > 0) {
      errors = errorMsg;
      ClosureStylesheets.error(errors);
      code = null;
    }

    if (opt_callback) {
      opt_callback(errors, warnings, opt_target_file, code);
    }
  };

  javaTools.execJavaJar(compiler, compilerOptions, compilerEvent, null,
    ClosureStylesheets.DEBUG);
};


/**
 * @param {string} message
 * @return {Object} with number of detected errors and warnings
 */
ClosureStylesheets.parseErrorMessage = function(message) {
  let errors = 0;
  let warnings = 0;
  if (message) {
    if (message.includes('INTERNAL COMPILER ERROR') ||
        message.includes('NullPointerException') ||
        message.includes('java.lang.NoSuchMethodError')) {
      errors = 1;
    } else if (message.toLowerCase().includes('error')) {
      errors = message.toLowerCase().split('error').length - 1;
    } else if (message.toLowerCase().split('exception') !== -1) {
      errors = 1;
    } else if (message.toLowerCase().includes('warning')) {
      if (!message.includes('Java HotSpot(TM) Client VM warning') ||
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
    warnings: warnings,
  };
};


/**
 * @param {string} msg
 */
ClosureStylesheets.info = function(msg) {
  if (msg) {
    console.info('[Closure Stylesheets]', msg);
  }
};


/**
 * @param {string} msg
 */
ClosureStylesheets.warn = function(msg) {
  console.error('[Closure Stylesheets Warn]', msg);
};


/**
 * @param {string} msg
 * @param {function=} opt_callback
 */
ClosureStylesheets.error = function(msg, opt_callback) {
  console.error('[Closure Stylesheets Error]', msg);
  if (opt_callback) {
    opt_callback(msg);
  }
};


module.exports = ClosureStylesheets;
