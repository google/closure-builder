/**
 * @fileoverview Closure Builder - Remote Tools
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
var log = require('loglevel');
var fs = require('fs-extra');
var http = require('follow-redirects').http;
var https = require('follow-redirects').https;
//var querystring = require('querystring');
var validator = require('validator');



 /**
 * ClosureCompiler.
 * @constructor
 * @struct
 * @final
 */
var RemoteTools = function() {};


/**
 * Copy file from remote to dest.
 * @param {!string} src
 * @param {!string} dest
 * @param {function=} opt_complete_callback
 * @param {function=} opt_error_callback
 */
RemoteTools.getFile = function(src, dest, opt_complete_callback,
    opt_error_callback) {
  var httpCheck = { protocols: ['http'], require_protocol: true };
  var httpsCheck = { protocols: ['https'], require_protocol: true };
  var completeEvent = function(response) {
    if (response.statusCode !== 200) {
      log.error(src + 'failed to download with http status: '  +
        response.statusCode);
    } else {
      var file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', function() {
        file.close();
      });
      log.debug(src, 'saved as', dest);
    }
    if (opt_complete_callback) {
      opt_complete_callback(response);
    }
  };
  var errorEvent = function(error) {
    if (error && error.code == 'ENOTFOUND') {
      log.warn('File at ' + error.hostname + ' is not reachable!\n' +
        'Please make sure you are online and that the name is correct!\n' +
        '(This message could be ignored if you are working offline!)');
      return;
    } else {
      log.error(src + ' failed to copy to ' + dest + ':' + error);
    }
    if (opt_error_callback) {
      opt_error_callback(error);
    }
  };

  if (validator.isURL(src, httpCheck)) {
    http.get(src, completeEvent).on('error', errorEvent);
  } else if (validator.isURL(src, httpsCheck)) {
    https.get(src, completeEvent).on('error', errorEvent);
  } else {
    log.error('Invalid remote file: ' + src);
    if (opt_error_callback) {
      opt_error_callback('Invalid file: ' + src);
    }
  }
};



module.exports = RemoteTools;
