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
let decompress = require('decompress');
let fs = require('fs-extra');
let http = require('follow-redirects').http;
let https = require('follow-redirects').https;
let log = require('loglevel');
let path = require('path');
let process = require('process');
let ProgressBar = require('progress');
let validator = require('validator');

let pathTools = require('./path.js');
let fileTools = require('./file.js');


/**
 * Remote tools.
 * @constructor
 * @struct
 * @final
 */
let RemoteTools = function() {};


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
  fileTools.mkdir(dest);
  let destFilename = opt_filename || pathTools.getUrlFile(url);
  let destFile = path.join(dest, destFilename);

  let completeEvent = (response) => {
    if (response.statusCode !== 200) {
      log.error('ERROR:', url, 'failed to download with http status: ',
        response.statusCode);
    } else {
      let file = fs.createWriteStream(destFile);
      file.on('finish', function() {
        file.end();
        if (opt_complete_callback) {
          opt_complete_callback(response, file);
        }
      });
      response.pipe(file);
      log.debug(url, 'saved as', destFile);
    }
  };

  let errorEvent = (error) => {
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

  let responseEvent = (response) => {
    let len = parseInt(response.headers['content-length'], 10);
    let barText = 'Downloading ' + destFilename + ' [:bar] :percent :etas';
    let bar = new ProgressBar(barText, {
      complete: '=',
      incomplete: ' ',
      renderThrottle: 500,
      total: len,
      width: 20,
    });

    response.on('data', function(chunk) {
      try {
        bar.tick(chunk.length);
      } catch (e) {
        return;
      }
    });
  };

  let dataHandler = null;
  let httpCheck = {protocols: ['http'], require_protocol: true};
  let httpsCheck = {protocols: ['https'], require_protocol: true};
  if (validator.isURL(url, httpCheck)) {
    dataHandler = http;
  } else if (validator.isURL(url, httpsCheck)) {
    dataHandler = https;
  }

  if (dataHandler) {
    dataHandler.get(url, completeEvent)
      .on('response', responseEvent)
      .on('error', errorEvent);
  } else {
    log.error('Invalid remote file: ' + url);
    if (opt_error_callback) {
      opt_error_callback('Invalid file: ' + url);
    }
  }
};


/**
 * @return {!boolean}
 */
RemoteTools.hasProxySettings = function() {
  return process.env.http_proxy;
};


/**
 * Copy file from remote to dest.
 * @param {!string} name
 * @param {!array} urls
 * @param {!string} dest
 * @param {function=} complete_callback
 * @param {function=} error_callback
 */
RemoteTools.getFiles = function(name, urls, dest,
    complete_callback, error_callback) {
  console.log('Downloading', urls.length, 'files for', name, '...');
  for (let url in urls) {
    if (Object.prototype.hasOwnProperty.call(urls, url)) {
      RemoteTools.getFile(urls[url], dest, undefined, complete_callback,
        error_callback);
    }
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
  let tempPath = pathTools.getRandomTempPath();
  let filename = pathTools.getUrlFile(url);
  if (!filename.endsWith('.tar.gz')) {
    filename = filename + '.tar.gz';
  }
  console.log('Downloading', name, '...');
  RemoteTools.getFile(url, tempPath, filename, function() {
    console.log('Extracting', name, 'please wait ...');
    let input = path.join(tempPath, filename);
    let output = dest;
    decompress(input, output, {
      strip: 1,
      mode: '755',
      filter: (file) => path.basename(file.path) !== 'tests' &&
        !path.basename(file.path).includes('_test.') &&
        !path.basename(file.path).includes('Test.java') &&
        path.extname(file.path) !== '.sh' &&
        path.extname(file.path) !== '.bat' &&
        path.extname(file.path) !== '.exe' &&
        path.extname(file.path) !== '.dmg',
    }).then(
      opt_complete_callback);
  }, opt_error_callback);
};


/**
 * Copy file from remote to dest.
 * @param {!string} name
 * @param {!string} url
 * @param {!string} dest directory
 * @param {function=} opt_complete_callback
 * @param {function=} opt_error_callback
 */
RemoteTools.getZip = function(name, url, dest,
    opt_complete_callback, opt_error_callback) {
  let tempPath = pathTools.getRandomTempPath();
  let filename = pathTools.getUrlFile(url);
  if (!filename.endsWith('.zip')) {
    filename = filename + '.zip';
  }
  console.log('Downloading', name, '...');
  RemoteTools.getFile(url, tempPath, filename, function() {
    console.log('Extracting', name, 'please wait ...');
    let input = path.join(tempPath, filename);
    let output = dest;
    decompress(input, output, {
      strip: 1,
      mode: '755',
      filter: (file) => path.basename(file.path) !== 'tests' &&
        !path.basename(file.path).includes('_test.') &&
        !path.basename(file.path).includes('Test.java') &&
        path.extname(file.path) !== '.sh' &&
        path.extname(file.path) !== '.bat' &&
        path.extname(file.path) !== '.exe' &&
        path.extname(file.path) !== '.dmg',
    }).then(
      opt_complete_callback);
  }, opt_error_callback);
};


module.exports = RemoteTools;
