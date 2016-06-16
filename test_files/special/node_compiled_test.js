var require = function() {};
var module = {};

/**
 * NodeJs test dummy
 */
var randomString = require('randomstring');

var getRandomString = function() {
  return randomString.generate();
};

module.exports = getRandomString();
