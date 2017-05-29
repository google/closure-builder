/**
 * Closure test require module.
 */
goog.module('closure_test_require_module');

var testModule = goog.require('closure_test_module');


exports = function() {
  return testModule.print('_CLOSURE_TEST_MODULE');
};
