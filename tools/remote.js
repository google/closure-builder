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
var decompress = require('decompress');
var fs = require('fs-extra');
var http = require('follow-redirects').http;
var https = require('follow-redirects').https;
var log = require('loglevel');
var path = require('path');
var progressBar = require('progress');
var validator = require('validator');

var buildTools = require('../build_tools.js');


 /**
 * ClosureCompiler.
 * @constructor
 * @struct
 * @final
 */
var RemoteTools = function() {};


/**
 * Copy file from remote to dest.
 * @param {!string} url
 * @param {!string} dest
 * @param {string=} opt_filename
 * @param {function=} opt_complete_callback
 * @param {function=} opt_error_callback
 */
RemoteTools.getFile = function(url, dest,
    opt_filename, opt_complete_callback, opt_error_callback) {
  buildTools.mkdir(dest);
  var destFilename = opt_filename || buildTools.getUrlFile(url);
  var destFile = path.join(dest, destFilename);

  var completeEvent = function(response) {
    if (response.statusCode !== 200) {
      log.error('ERROR:', url, 'failed to download with http status: ',
        response.statusCode);
    } else {
      var file = fs.createWriteStream(destFile);
      response.pipe(file);
      file.on('finish', function() {
        file.close();
        if (opt_complete_callback) {
          opt_complete_callback(response, file);
        }
      });
      log.debug(url, 'saved as', destFile);
    }
  };

  var errorEvent = function(error) {
    if (error && error.code == 'ENOTFOUND') {
      log.warn('File at ' + error.hostname + ' is not reachable!\n' +
        'Please make sure you are online and that the name is correct!\n' +
        '(This message could be ignored if you are working offline!)');
      return;
    } else {
      log.error('ERROR:', url, 'failed to copy to', destFile, ':', error);
    }
    if (opt_error_callback) {
      opt_error_callback(error);
    }
  };

  var responseEvent = function(response) {
    var len = parseInt(response.headers['content-length'], 10);
    var barText = 'Downloading ' + destFilename + ' [:bar] :percent :etas';
    var bar = new progressBar(barText, {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: len
    });

    response.on('data', function(chunk) {
      try {
        bar.tick(chunk.length);
      } catch (e) {
        return;
      }
    });
  };

  var dataHandler = null;
  var httpCheck = { protocols: ['http'], require_protocol: true };
  var httpsCheck = { protocols: ['https'], require_protocol: true };
  if (validator.isURL(url, httpCheck)) {
    dataHandler = http;
  } else if (validator.isURL(url, httpsCheck)) {
    dataHandler = https;
  }

  if (dataHandler) {
    dataHandler.get(url, completeEvent)
      .on('response', responseEvent)
      .on('end', completeEvent)
      .on('error', errorEvent);
  } else {
    log.error('Invalid remote file: ' + url);
    if (opt_error_callback) {
      opt_error_callback('Invalid file: ' + url);
    }
  }
};


/**
 * Copy file from remote to dest.
 * @param {!array} urls
 * @param {!string} dest
 * @param {string=} opt_filename
 * @param {function=} opt_complete_callback
 * @param {function=} opt_error_callback
 */
RemoteTools.getFiles = function(name, urls, dest,
    opt_complete_callback, opt_error_callback) {
  console.log('Downloading', urls.length, 'files for', name, '...');
  for (var url in urls) {
    RemoteTools.getFile(urls[url], dest, undefined, opt_complete_callback,
      opt_error_callback);
  }
};


/**
 * Copy file from remote to dest.
 * @param {!string} name
 * @param {!string} url
 * @param {!string} dest directory
 * @param {function=} opt_complete_callback
 * @param {function=} opt_error_callback
 */
RemoteTools.getTarGz = function(name, url, dest,
    opt_complete_callback, opt_error_callback) {
  var tempPath = buildTools.getRandomTempPath();
  var filename = buildTools.getUrlFile(url);
  if (filename.indexOf('.tar.gz') == -1) {
    filename = filename + '.tar.gz';
  }
  console.log('Downloading', name, '...');
  RemoteTools.getFile(url, tempPath, filename, function() {
    console.log('Extracting', name, 'please wait ...');
    var input = path.join(tempPath, filename);
    var output = dest;
    decompress(input, output, {
      strip: 1,
      mode: '755',
      filter: file => path.basename(file.path) !== 'tests' &&
        path.basename(file.path).indexOf('_test.') === -1 &&
        path.basename(file.path).indexOf('Test.java') === -1 &&
        path.extname(file.path) !== '.sh' &&
        path.extname(file.path) !== '.bat' &&
        path.extname(file.path) !== '.exe' &&
        path.extname(file.path) !== '.dmg'
    }).then(
      opt_complete_callback);
  }, opt_error_callback);
};


module.exports = RemoteTools;
