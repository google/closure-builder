/**
 * NodeJs test dummy
 */
var textTools = require('../../tools/text.js');

var getRandomString = function() {
  return textTools.getRandomString() + 'hello';
};

module.exports = getRandomString();
