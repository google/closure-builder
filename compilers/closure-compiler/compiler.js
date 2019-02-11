/**
 * @fileoverview Closure Builder - Closure compilers (online/local)
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
let dnsSync = require('dns-sync');
let fs = require('fs-extra');
let https = require('https');
let querystring = require('querystring');

let javaTools = require('../../tools/java.js');
let pathTools = require('../../tools/path.js');
let textTools = require('../../tools/text.js');


/**
 * @constructor
 * @struct
 * @final
 */
let ClosureCompiler = function() {};


/**
 * @type {boolean}
 */
ClosureCompiler.DEBUG = false;

/**
 * @type {string}
 */
ClosureCompiler.REMOTE_SERVICE = 'closure-compiler.appspot.com';

/**
 * @type {!array}
 */
ClosureCompiler.IGNORED_WARNINGS = [
  'Java HotSpot(TM) Client VM warning',
  'com.google.javascript.jscomp.PhaseOptimizer$NamedPass',
  'Skipping pass ambiguateProperties',
  'Skipping pass checkAccessControls',
  'Skipping pass checkConformance',
  'Skipping pass checkTypes',
  'Skipping pass devirtualizePrototypeMethods',
  'Skipping pass disambiguateProperties',
  'Skipping pass inferTypes',
  'Skipping pass inlineProperties',
  'Skipping pass resolveTypes',
];


/**
 * @param {!array} files
 * @param {Object=} opt_options
 * @param {string=} opt_target_file
 * @param {function=} opt_callback
 * @param {boolean=} opt_remote_service
 */
ClosureCompiler.compile = function(files, opt_options, opt_target_file,
    opt_callback, opt_remote_service) {
  if (!files || files.length == 0) {
    ClosureCompiler.error('No valid files are provided!', opt_callback);
    return;
  }

  if (javaTools.hasJava() && !opt_remote_service) {
    ClosureCompiler.localCompile(files, opt_options, opt_target_file,
      opt_callback);
  } else if (dnsSync.resolve(ClosureCompiler.REMOTE_SERVICE)) {
    ClosureCompiler.remoteCompile(files, opt_options, opt_target_file,
      opt_callback);
  } else {
    ClosureCompiler.localCompileJs(files, opt_options, opt_target_file,
      opt_callback);
  }
};


/**
 * @param {!string} files
 * @param {Object=} opt_options
 * @param {string=} opt_target_file
 * @param {function=} opt_callback
 */
ClosureCompiler.localCompile = function(files, opt_options, opt_target_file,
    opt_callback) {
  if (!files) {
    ClosureCompiler.error('No valid files are provided!', opt_callback);
    return;
  }
  if (!javaTools.hasJava()) {
    ClosureCompiler.error('Java (JRE) is needed!', opt_callback);
    return;
  }

  let compilerOptions = [];
  let options = opt_options || {};
  let showWarnings = true;

  // Compilation level
  if (!options.compilation_level) {
    options.compilation_level = 'SIMPLE_OPTIMIZATIONS';
  }

  // Handling warnings
  if (options.no_warnings) {
    showWarnings = false;
    delete options.jscomp_warnings;
    delete options.no_warnings;
  } else {
    // Compiler warnings
    if (!options.jscomp_warning) {
      options.jscomp_warning = ['checkVars', 'conformanceViolations',
        'deprecated', 'externsValidation', 'fileoverviewTags', 'globalThis',
        'misplacedTypeAnnotation', 'missingProvide', 'missingRequire',
        'missingReturn', 'nonStandardJsDocs', 'typeInvalidation',
        'uselessCode'];
    }
  }

  // Handling compiler error
  if (options.jscomp_error) {
    for (let i = 0; i < options.jscomp_error.length; i++) {
      compilerOptions.push('--jscomp_error', options.jscomp_error[i]);
    }
    delete options.jscomp_warning;
  }

  // Handling compiler off
  if (options.jscomp_off) {
    for (let i = 0; i < options.jscomp_off.length; i++) {
      compilerOptions.push('--jscomp_off', options.jscomp_off[i]);
    }
    delete options.jscomp_warning;
  }

  // Handling compiler warnings
  if (options.jscomp_warning) {
    for (let i = 0; i < options.jscomp_warning.length; i++) {
      compilerOptions.push('--jscomp_warning', options.jscomp_warning[i]);
    }
    delete options.jscomp_warning;
  }

  // Handling files
  let dupFile = {};
  for (let i = 0; i < files.length; i++) {
    if (!dupFile[files[i]]) {
      compilerOptions.push('--js', files[i]);
    }
    dupFile[files[i]] = true;
  }

  // Handling externs files
  if (options.externs) {
    for (let i = 0; i < options.externs.length; i++) {
      compilerOptions.push('--externs', options.externs[i]);
    }
    delete options.externs;
  }

  // Handling generate_exports
  if (options.generate_exports && !options.use_closure_basefile) {
    options.use_closure_basefile = true;
  }

  // Closure templates
  if (options.use_closure_templates) {
    compilerOptions.push('--js=' + pathTools.getClosureSoyUtilsFile());
    if (!options.use_closure_library) {
      options.use_closure_library = true;
    }
    delete options.use_closure_templates;
  }

  // Include Closure base file
  if (options.use_closure_basefile || options.use_closure_library) {
    let baseFile = pathTools.getClosureBaseFile();
    if (baseFile) {
      compilerOptions.push('--js', baseFile);
    }
    delete options.use_closure_basefile;
  }

  // Include Closure library files
  if (options.use_closure_library) {
    let ignoreList = [];
    if (options.use_closure_library_ui) {
      delete options.use_closure_library_ui;
    } else {
      ignoreList.push('ui');
    }
    let closureLibraryFolder = undefined;
    if (typeof options.use_closure_library === 'string') {
      closureLibraryFolder = options.use_closure_library;
    }
    let closureLibraryFolders = pathTools.getClosureLibraryFolders(
      ignoreList, closureLibraryFolder);
    for (let i = 0; i < closureLibraryFolders.length; i++) {
      compilerOptions.push('--js=' + closureLibraryFolders[i]);
    }
    delete options.use_closure_library;
  }

  // Handling options
  for (let option in options) {
    if (Object.prototype.hasOwnProperty.call(options, option)) {
      if (Array.isArray(options[option])) {
        options[option].forEach((option_val) => {
          compilerOptions.push('--' + option, option_val);
        });
      } else {
        compilerOptions.push('--' + option, options[option]);
      }
    }
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
      errorMsg = textTools.filterStrings(errorMsg,
        ClosureCompiler.IGNORED_WARNINGS);
      let parsedErrorMessage = ClosureCompiler.parseErrorMessage(errorMsg);
      numErrors = parsedErrorMessage.errors;
      numWarnings = parsedErrorMessage.warnings;
    }

    if (numErrors == 0 && numWarnings > 0 && showWarnings) {
      warnings = errorMsg;
      ClosureCompiler.warn(warnings);
    } else if (numErrors > 0) {
      errors = errorMsg;
      ClosureCompiler.error(errors);
      code = null;
    }

    if (opt_callback) {
      opt_callback(errors, warnings, opt_target_file, code);
    }
  };

  javaTools.execJar(
    pathTools.getClosureCompilerJar(),
    compilerOptions,
    compilerEvent,
    null,
    ClosureCompiler.DEBUG);
};


/**
 * @param {!string} files
 * @param {Object=} opt_options
 * @param {string=} opt_target_file
 * @param {function=} opt_callback
 */
ClosureCompiler.localCompileJs = function(files, opt_options, opt_target_file,
    opt_callback) {
  if (!files) {
    ClosureCompiler.error('No valid files are provided!', opt_callback);
    return;
  }
  console.error('Not supported yet ...');
};


/**
 * @param {!string} files
 * @param {Object=} opt_options
 * @param {string=} opt_target_file
 * @param {function=} opt_callback
 * @deprecated
 */
ClosureCompiler.remoteCompile = function(files,
    opt_options, opt_target_file, opt_callback) {
  if (!files) {
    ClosureCompiler.error('No valid files are provided!', opt_callback);
    return;
  }
  if (!dnsSync.resolve(ClosureCompiler.REMOTE_SERVICE)) {
    ClosureCompiler.error('No network connection to remote service!');
    return;
  }

  // Handling options (true = critical / false = ignore)
  let unsupportedOptions = {
    'entry_point': true,
    'language_in': false,
    'language_out': false,
    'generate_exports': true,
  };
  let option;
  for (option in opt_options) {
    if (option in unsupportedOptions) {
      if (unsupportedOptions[option]) {
        ClosureCompiler.error(option + ' is unsupported by the ' +
          'closure-compiler webservice!', opt_callback);
        return;
      } else {
        ClosureCompiler.warn(option + ' is unsupported by the ' +
          'closure-compiler webservice!');
        delete opt_options[option];
      }
    }
  }

  let options = opt_options || {};
  let data = {
    'compilation_level': 'SIMPLE_OPTIMIZATIONS',
    'output_format': 'json',
    'output_info': ['compiled_code', 'warnings', 'errors', 'statistics'],
    'js_code': [],
  };
  let showWarnings = true;

  // Closure templates
  if (options.use_closure_templates) {
    let closureSoyUtilsFile = pathTools.getClosureSoyUtilsFile();
    if (closureSoyUtilsFile) {
      data['js_code'].push(fs.readFileSync(closureSoyUtilsFile).toString());
      if (!options.use_closure_library) {
        options.use_closure_library = true;
      }
    }
    delete options.use_closure_templates;
  }

  // Handling files
  for (let i = 0; i < files.length; i++) {
    let fileContent = fs.readFileSync(files[i]).toString();
    if (fileContent) {
      data['js_code'].push(fileContent);
    }
  }

  // Handling externs files
  if (options.externs) {
    let externsCode = '';
    for (let i = 0; i < options.externs.length; i++) {
      externsCode += fs.readFileSync(options.externs[i]).toString();
    }
    if (externsCode) {
      data['js_externs'] = externsCode;
    }
    delete options.externs;
  }

  // Handling warnings
  if (options.no_warnings) {
    showWarnings = false;
    delete options.no_warnings;
  }

  // Handling options
  for (option in options) {
    if (Object.prototype.hasOwnProperty.call(options, option)) {
      data[option] = options[option];
    }
  }

  let dataString = querystring.stringify(data);
  let httpOptions = {
    host: ClosureCompiler.REMOTE_SERVICE,
    path: '/compile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': dataString.length,
    },
  };

  let request = https.request(httpOptions, function(response) {
    let data = '';
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
      data += chunk;
    });
    response.on('end', function() {
      let result = JSON.parse(data);
      let code = result.compiledCode;
      let errorMsg = result.errors;
      let warningMsg = result.warnings;
      let serverErrorMsg = result.serverErrors;
      let errors = null;
      let warnings = null;
      if (serverErrorMsg) {
        errors = ClosureCompiler.parseJsonError(serverErrorMsg);
        ClosureCompiler.error(errors || errorMsg);
        code = '';
      } else if (errorMsg) {
        errors = ClosureCompiler.parseJsonError(errorMsg);
        ClosureCompiler.error(errors);
        code = '';
      } else if (warningMsg && showWarnings) {
        warnings = ClosureCompiler.parseJsonError(warningMsg);
        ClosureCompiler.warn(warnings);
      }
      if (code) {
        code += '\n';
      }
      if (opt_callback) {
        opt_callback(errors, warnings, opt_target_file, code);
      }
    });
  });

  request.on('error', function(e) {
    ClosureCompiler.error('HTTP request error:' + e.message, opt_callback);
  });

  request.write(dataString);
  request.end();
};


/**
 * @param {string} data
 * @return {!string}
 */
ClosureCompiler.parseJsonError = function(data) {
  let message = '';
  for (let i=0; i<data.length; i++) {
    let msg = data[i].error || data[i].warning;
    let type = (data[i].error) ? 'ERROR' : 'WARNING';
    if (data.file && data.file !== 'Input_0') {
      message += data.file + ':' + data.lineno + ': ' + type + ' - ' +
        msg + '\n';
    } else if (data[i].line) {
      message += type + ' - ' + msg + ' : ' + data[i].line + '\n';
    } else {
      message += type + ' - ' + msg + '\n';
    }
  }
  return message;
};


/**
 * @param {string} message
 * @return {Object} with number of detected errors and warnings
 */
ClosureCompiler.parseErrorMessage = function(message) {
  let errors = 0;
  let warnings = 0;
  if (message && message.match) {
    let message_reg = /([0-9]+) error\(s\), ([0-9]+) warning\(s\)/;
    let messageInfo = message.match(message_reg);
    if (messageInfo) {
      errors = messageInfo[1];
      warnings = messageInfo[2];
    } else if (message.includes('INTERNAL COMPILER ERROR') ||
               message.includes('NullPointerException')) {
      errors = 1;
    } else if (message.toLowerCase().includes('error')) {
      errors = message.toLowerCase().split('error').length - 1;
    } else if (message.toLowerCase().includes('warning')) {
      warnings = message.toLowerCase().split('warning').length - 1;
    }
  } else if (message) {
    errors = 1;
  }
  // Ignore closure library specific warnings.
  if (warnings == 1 && errors == 0 &&
      message.includes('third_party') &&
      message.includes('closure-library') &&
      message.includes('closure') &&
      message.includes('goog') &&
      message.includes('deprecated:')) {
    warnings = 0;
  }
  return {
    errors: errors,
    warnings: warnings,
  };
};


/**
 * @param {string} msg
 */
ClosureCompiler.info = function(msg) {
  if (msg) {
    console.info('[Closure Compiler]', msg);
  }
};


/**
 * @param {string} msg
 */
ClosureCompiler.warn = function(msg) {
  console.error('\x1b[1m\x1b[33m[Closure Compiler Warn]\x1b[0m', msg);
};


/**
 * @param {string} msg
 * @param {function=} opt_callback
 */
ClosureCompiler.error = function(msg, opt_callback) {
  console.error('\x1b[1m\x1b[31m[Closure Compiler Error]\x1b[0m', msg);
  if (opt_callback) {
    opt_callback(msg);
  }
};


module.exports = ClosureCompiler;
