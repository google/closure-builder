/**
 * @fileoverview Closure Builder - Closure online compiler
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
var https = require('https');
var querystring = require('querystring');



 /**
 * ClosureCompiler.
 * @constructor
 * @struct
 * @final
 */
var ClosureCompiler = function() {};


/**
 * @param {Object} params
 * @param {!string} filename
 * @param {!string} files
 */
ClosureCompiler.remoteCompile = function(params, filename, files) {
  var data = querystring.stringify({
    'compilation_level' : 'SIMPLE_OPTIMIZATIONS',
    'output_format': 'json',
    'output_info': ['compiled_code', 'warnings', 'errors', 'statistics'],
    'js_code': 'var test = "Hello"; function dummmy() {return test;}'
  });

  console.log('FILES:', files);

  var options = {
    host: 'closure-compiler.appspot.com',
    path: '/compile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length
    }
  };

  var request = https.request(options, function(response) {
    console.log('STATUS:', response.statusCode);
    console.log('HEADERS:', JSON.stringify(response.headers));
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
      console.log('BODY:', chunk);
    });
    response.on('end', function() {
      console.log('No more data in response.');
    });
  });

  request.on('error', function(e) {
    console.log('Problem with request:', e.message);
  });

  console.log(data);
  request.write(data);
  request.end();

};


module.exports = ClosureCompiler;
