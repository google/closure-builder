/**
 * @fileoverview Closure Builder - Node JS compiler (browserify)
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
let fs = require('fs');

let browserify = require('browserify');

let fileTools = require('../../tools/file.js');


/**
 * @constructor
 * @struct
 * @final
 */
let NodejsCompiler = function() {};


/**
 * @param {!string} files
 * @param {Object=} opt_options
 * @param {string=} opt_target_file
 * @param {function=} opt_callback
 * @param {boolean=} opt_remote_service
 */
NodejsCompiler.compile = function(files, opt_options, opt_target_file,
    opt_callback) {
  let compiler = browserify(files, opt_options);

  if (opt_target_file) {
    fileTools.mkfile(opt_target_file);
  }

  let bufferEvent = (errors) => {
    if (errors) {
      NodejsCompiler.error('Was not able to write file ' + opt_target_file +
        ':' + errors, opt_callback);
    }
  };
  let streamEvent = fs.createWriteStream(opt_target_file);
  streamEvent.on('error', (error) => {
    NodejsCompiler.error('Was not able to write file ' + opt_target_file +
      ':' + error, opt_callback);
  });
  streamEvent.on('finish', () => {
    if (opt_callback) {
      opt_callback(false, false, opt_target_file);
    }
  });
  compiler.bundle(bufferEvent).pipe(streamEvent);
};


/**
 * @param {string} msg
 */
NodejsCompiler.info = function(msg) {
  if (msg) {
    console.info('[Node.js Compiler]', msg);
  }
};


/**
 * @param {string} msg
 */
NodejsCompiler.warn = function(msg) {
  console.error('[Node.js Compiler Warn]', msg);
};


/**
 * @param {string} msg
 * @param {function=} opt_callback
 */
NodejsCompiler.error = function(msg, opt_callback) {
  console.error('[Node.js Compiler Error]', msg);
  if (opt_callback) {
    opt_callback(msg);
  }
};


module.exports = NodejsCompiler;
