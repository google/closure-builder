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
let fs = require('fs');
let rollup = require('rollup');

let fileTools = require('../../tools/file.js');


/**
 * @constructor
 * @struct
 * @final
 */
let RollupCompiler = function() {};


/**
 * @param {!string|array} file
 * @param {Object=} opt_options
 * @param {string=} opt_target_file
 * @param {function=} callback
 * @param {boolean=} opt_remote_service
 */
RollupCompiler.compile = function(file, opt_options, opt_target_file,
    callback) {
  if (!file) {
    RollupCompiler.error('No valid file is provided!', callback);
    return;
  } else if (Array.isArray(file) && file.length > 1) {
    RollupCompiler.error('Please only provide on input file!', callback);
    return;
  }

  let options = opt_options || {};
  let entryFile = Array.isArray(file) ? file[0] : file;
  let compilerOptions = {
    'input': entryFile,
  };
  let bundleOptions = {};

  // Handling compiler options
  if (options.plugins) {
    compilerOptions.plugins = options.plugins;
    delete options.plugins;
  }

  // Handling options
  for (let option in options) {
    if (Object.prototype.hasOwnProperty.call(options, option)) {
      bundleOptions[option] = options[option];
    }
  }

  if (opt_target_file) {
    fileTools.mkfile(opt_target_file);
  }

  let bundleEvent = function(bundle) {
    bundle.generate(bundleOptions).then(
      compilerEvent,
      compilerError
    );
  };
  let compilerError = function(error) {
    RollupCompiler.error(error, callback);
  };
  let compilerEvent = function(result) {
    let errors = null;
    let warnings = null;
    let code = result && result.code || null;

    if (opt_target_file) {
      fs.writeFile(opt_target_file, code, (err) => {
        if (err) {
          RollupCompiler.error(err, callback);
        } else {
          if (callback) {
            callback(errors, warnings, opt_target_file, code);
          }
        }
      });
    } else if (callback) {
      callback(errors, warnings, opt_target_file, code);
    }
  };

  rollup.rollup(compilerOptions).then(
    bundleEvent,
    compilerError
  );
};


/**
 * @param {string} msg
 * @param {function=} callback
 */
RollupCompiler.error = function(msg, callback) {
  console.error('[Rollup Compiler Error]', msg);
  if (callback) {
    callback(msg);
  }
};


module.exports =RollupCompiler;
