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
let path = require('path');

let fileTools = require('../../tools/file.js');
let javaTools = require('../../tools/java.js');
let pathTools = require('../../tools/path.js');


/**
 * @constructor
 * @struct
 * @final
 */
let ClosureTemplates = function() {};


/**
 * @type {boolean}
 */
ClosureTemplates.DEBUG = false;


/**
 * @param {!array} files
 * @param {Object=} opt_options
 * @param {string=} opt_target_dir
 * @param {function=} opt_callback
 */
ClosureTemplates.compile = function(files, opt_options, opt_target_dir,
    opt_callback) {
  if (!files) {
    ClosureTemplates.error('No valid files are provided!', opt_callback);
    return;
  }

  if (!javaTools.hasJava()) {
    ClosureTemplates.error('Java (JRE) is needed!', opt_callback);
    return;
  }

  let compiler = pathTools.getClosureTemplatesCompilerJar();
  let compilerOptions = [];
  let i18nFunction = null;
  let options = opt_options || {};
  let outputFiles = [];
  let showWarnings = true;
  let targetDir = opt_target_dir || pathTools.getRandomTempPath(
    'closure-builder-templates');

  // Pre-convert custom {i18n} tag.
  if (options.use_i18n) {
    fileTools.copySync(files, targetDir);
    fileTools.findAndReplace(
      [targetDir],
      /{i18n}/g,
      '{msg desc=""}',
      true
    );
    fileTools.findAndReplace(
      [targetDir],
      /{\/i18n}/g,
      '{/msg}',
      true
    );

    files = fileTools.getGlobFiles(targetDir + '/**/*.soy');
    delete options.use_i18n;
  }

  // Output Path Format
  if (!options.outputPathFormat) {
    options.outputPathFormat = path.join(targetDir,
      '{INPUT_DIRECTORY}{INPUT_FILE_NAME}.js');
  }

  // Handling files
  let dupFile = {};
  for (let i = 0; i < files.length; i++) {
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
  for (let option in options) {
    if (options[option] === true) {
      compilerOptions.push('--' + option);
    } else {
      compilerOptions.push('--' + option, options[option]);
    }
  }

  // Handling warnings
  if (options.no_warnings) {
    showWarnings = false;
    delete options.no_warnings;
  }

  let compilerEvent = (error, stdout, stderr) => {
    let errorMsg = stderr || error || stdout;
    let errors = null;
    let warnings = null;
    let numErrors = 0;
    let numWarnings = 0;

    // Handling Error messages
    if (errorMsg) {
      let parsedErrorMessage = ClosureTemplates.parseErrorMessage(errorMsg);
      numErrors = parsedErrorMessage.errors;
      numWarnings = parsedErrorMessage.warnings;
    }

    if (numErrors == 0 && numWarnings > 0 && showWarnings) {
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

  javaTools.execJavaJar(compiler, compilerOptions, compilerEvent, null,
    ClosureTemplates.DEBUG);
};


/**
 * @param {string} message
 * @return {Object} with number of detected errors and warnings
 */
ClosureTemplates.parseErrorMessage = function(message) {
  let errors = 0;
  let warnings = 0;
  if (message) {
    if (message.includes('INTERNAL COMPILER ERROR') ||
        message.includes('NullPointerException') ||
        message.includes('java.lang.NoSuchMethodError')) {
      errors = 1;
    } else if (message.toLowerCase().includes('exception')) {
      errors = 1;
    } else if (message.toLowerCase().includes('error')) {
      errors = message.toLowerCase().split('error').length - 1;
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
 * @param {function=} opt_callback
 */
ClosureTemplates.error = function(msg, opt_callback) {
  console.error('[Closure Templates Error]', msg);
  if (opt_callback) {
    opt_callback(msg);
  }
};


module.exports = ClosureTemplates;
