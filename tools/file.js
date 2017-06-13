/**
 * @fileoverview Closure Builder - File Tools
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
let fs = require('fs-extra');
let glob = require('glob');
let mkdirp = require('mkdirp');
let path = require('path');
let rimraf = require('rimraf');
let touch = require('touch');

let textTools = require('./text.js');
let pathTools = require('./path.js');


/**
 * File tools.
 * @constructor
 * @struct
 * @final
 */
let FileTools = function() {};


/**
 * @param {string} path
 * @return {boolean} True if path could be accessed.
 */
FileTools.access = function(path) {
  if (!fs.accessSync) {
    try {
      fs.statSync(path);
    } catch (err) {
      if (err.code == 'ENOENT') {
        return false;
      }
    }
    return true;
  }
  try {
    fs.accessSync(path);
    return true;
  } catch (err) {
    return false;
  }
};


/**
 * Copy file from src to dest.
 * @param {!string} src
 * @param {!string} dest
 * @param {function=} opt_callback
 */
FileTools.copyFile = function(src, dest, opt_callback) {
  if (pathTools.isFile(dest)) {
    FileTools.mkdir(path.dirname(dest));
  } else {
    FileTools.mkdir(dest);
  }
  if (!FileTools.access(src)) {
    let message = 'No access to resource ' + src;
    console.error(message);
    if (opt_callback) {
      opt_callback(message, false);
    }
    return;
  }
  let destFile = path.join(dest, pathTools.getFileBase(src));
  if (pathTools.isFile(dest)) {
    destFile = dest;
  }
  let fileEvent = (error) => {
    if (error) {
      let message = 'Resource ' + src + ' failed to copy to ' + destFile;
      console.error(message);
      console.error(error);
      if (opt_callback) {
        opt_callback(message, false, destFile);
      }
    } else {
      if (opt_callback) {
        opt_callback(false, false, destFile);
      }
    }
  };
  fs.copy(src, destFile, fileEvent.bind(this));
};


/**
 * Copy files from srcs to an single destination.
 * @param {!array} srcs
 * @param {!string} dest
 */
FileTools.copySync = function(srcs, dest) {
  let numFiles_ = srcs.length;
  let fileNames_ = [];
  if (pathTools.isFile(dest)) {
    FileTools.mkdir(path.dirname(dest));
  } else {
    FileTools.mkdir(dest);
  }
  for (let i = numFiles_ - 1; i >= 0; i--) {
    let destFile = path.join(dest, pathTools.getFileBase(srcs[i]));
    if (pathTools.isFile(dest)) {
      destFile = dest;
    }
    if (fileNames_.indexOf(destFile) !== -1) {
      let newFileName = textTools.getRandomString() + '-' +
        pathTools.getFileBase(srcs[i]);
      console.warn('Renamed duplicated filename:', srcs[i], '>', newFileName);
      destFile = path.join(dest, newFileName);
    } else {
      fileNames_.push(destFile);
    }
    fs.copySync(srcs[i], destFile);
  }
};


/**
 * @param {string!} file
 * @param {string!} content
 * @param {function=} opt_callback
 * @param {BuildConfig=} opt_config
 * @param {?} opt_warning
 */
FileTools.saveContent = function(file, content, opt_callback, opt_config,
    opt_warning) {
  let config = opt_config || false;
  if (config) {
    if (config) {
      config.setMessage('Saving output to ' + file);
    }
    if (config.replaceText) {
      content = textTools.replace(content, config.replaceText);
    }
    if (config.prependText) {
      content = config.prependText + '\n' + content;
    }
    if (config.appendText) {
      content = content + '\n' + config.appendText;
    }
    if (config.license) {
      let license = fs.readFileSync(config.license, 'utf8');
      content = license + content;
    }
    if (config.banner) {
      content = config.banner + content;
    }
  }
  let fileEvent = (error) => {
    if (error) {
      let errorMessage = 'Was not able to write file ' + file + ':' + error;
      if (opt_config) {
        opt_config.setMessage(errorMessage);
      }
      if (opt_callback) {
        opt_callback('Was not able to write file ' + file + ':' + error,
          opt_warning);
      }
    } else {
      let successMessage = 'Saved file ' +
        textTools.getTruncateText(file) + ' ( ' + content.length + ' )';
      if (config) {
        config.setMessage(successMessage);
      }
      if (opt_callback) {
        opt_callback(false, opt_warning, file, content);
      }
    }
  };
  fs.outputFile(file, content, fileEvent.bind(this));
};


/**
 * @param {string|array} files Files with glob syntax.
 * @return {array}
 */
FileTools.getGlobFiles = function(files) {
  let fileList = [];
  let filesToGlob = (files.constructor === String) ? [files] : files;
  for (let i = filesToGlob.length - 1; i >= 0; i--) {
    fileList = fileList.concat(glob.sync(filesToGlob[i]));
  }
  return fileList;
};


/**
 * @param {string=} opt_name
 * @return {string} Temp dir path.
 */
FileTools.makeTempDir = function(opt_name) {
  let tempDir = pathTools.getTempPath(opt_name);
  FileTools.mkdir(tempDir);
  return tempDir;
};


/**
 * @param {!(string|array)} files
 * @param {!string} regex
 * @param {!string=} replacement
 * @param {boolean=} opt_recursive
 */
FileTools.findAndReplace = function(files, regex, replacement, opt_recursive) {
  if (typeof files === 'string') {
    files = [files];
  }

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    if (FileTools.isSymbolicLink(file)) {
      console.warn('Will not search in symbolic links:', file);
    } else if (FileTools.isFile(file)) {
      let content = FileTools.readFile(file);
      if (content) {
        FileTools.writeFile(file, content.replace(regex, replacement));
      }
    } else if (FileTools.isDirectory(file) && opt_recursive) {
      let directoryFiles = FileTools.readDir(file);
      for (let i = 0; i < directoryFiles.length; i++) {
        let directoryFile = path.join(file, directoryFiles[i]);
        FileTools.findAndReplace(
          directoryFile, regex, replacement, opt_recursive);
      }
    }
  }
};


/**
 * @param {!string} file
 * @return {!array}
 */
FileTools.readDir = function(file) {
  return fs.readdirSync(file) || [];
};


/**
 * @param {!string} file
 * @return {!string}
 */
FileTools.readFile = function(file) {
  return fs.readFileSync(file, 'utf8') || '';
};


/**
 * @param {!string} file
 * @param {!string} content
 */
FileTools.writeFile = function(file, content) {
  fs.writeFileSync(file, content);
};


/**
 * @param {!string} directory_path
 * @return {Object}
 */
FileTools.getDirectories = function(directory_path) {
  return fs.readdirSync(directory_path).filter((file) => {
    return FileTools.isDirectory(path.join(directory_path, file));
  });
};


/**
 * @param {!string} file
 * @return {!boolean}
 */
FileTools.isFile = function(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (err) {
    return false;
  }
};


/**
 * @param {!string} file
 * @return {!boolean}
 */
FileTools.isDirectory = function(file) {
  try {
    return fs.statSync(file).isDirectory();
  } catch (err) {
    return false;
  }
};


/**
 * @param {!string} file
 * @return {!boolean}
 */
FileTools.isSymbolicLink = function(file) {
  try {
    return fs.statSync(file).isSymbolicLink();
  } catch (err) {
    return false;
  }
};


/**
 * @param {array} files
 * @param {function} opt_callback
 */
FileTools.removeFiles = function(files, opt_callback) {
  if (opt_callback) {
    rimraf(files, {}, opt_callback);
  }
  rimraf.sync(files, {nosort: true, silent: false});
};


/**
 * @param {string} dir_path
 */
FileTools.mkdir = function(dir_path) {
  if (!pathTools.existDirectory(dir_path)) {
    mkdirp.sync(dir_path);
  }
};


/**
 * @param {string} file_path
 */
FileTools.mkfile = function(file_path) {
  let dir_path = path.dirname(file_path);
  FileTools.mkdir(dir_path);
  touch.sync(file_path);
};


module.exports = FileTools;
