/**
 * @fileoverview Closure Builder - Rollup compiler
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
var fs = require('fs');
var rollup = require('rollup');

var fileTools = require('../../tools/file.js');



/**
 * @constructor
 * @struct
 * @final
 */
var RollupCompiler = function() {};


/**
 * @param {!string|array} file
 * @param {Object=} opt_options
 * @param {string=} opt_target_file
 * @param {function=} opt_callback
 * @param {boolean=} opt_remote_service
 */
RollupCompiler.compile = function(file, opt_options, opt_target_file,
    opt_callback) {
  if (!file) {
    return RollupCompiler.error('No valid file is provided!', opt_callback);
  } else if (Array.isArray(file) && file.length > 1) {
    return RollupCompiler.error('Please only provide on entry point file!',
      opt_callback);
  }

  var options = opt_options || {};
  var entryFile = Array.isArray(file) ? file[0] : file;
  var compilerOptions = {
    'entry': entryFile
  };
  var bundleOptions = {};

  // Handling compiler options
  if (options.plugins) {
    compilerOptions.plugins = options.plugins;
    delete options.plugins;
  }

  // Handling options
  for (var option in options) {
    bundleOptions[option] = options[option];
  }

  if (opt_target_file) {
    fileTools.mkfile(opt_target_file);
  }
  var compilerError = function(error) {
    RollupCompiler.error(error, opt_callback);
  };
  var compilerEvent = function(bundle) {
    var errors = null;
    var warnings = null;
    var code = null;
    var result = bundle.generate(bundleOptions);

    if (result) {
      code = result.code;
    }

    if (opt_target_file) {
      fs.writeFile(opt_target_file, code, (err) => {
        if (err) {
          RollupCompiler.error(err, opt_callback);
        } else {
          if (opt_callback) {
            opt_callback(errors, warnings, opt_target_file, code);
          }
        }
      });
    } else if (opt_callback) {
      opt_callback(errors, warnings, opt_target_file, code);
    }
  };

  rollup.rollup(compilerOptions).then(
    compilerEvent,
    compilerError
  );
};


/**
 * @param {string} msg
 * @param {function=} opt_callback
 */
RollupCompiler.error = function(msg, opt_callback) {
  console.error('[Rollup Compiler Error]', msg);
  if (opt_callback) {
    opt_callback(msg);
  }
};


module.exports =RollupCompiler;