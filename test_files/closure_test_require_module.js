/**
 * Closure test require module.
 */
goog.provide('closure_test_require_module');

goog.require('closure_test_module');



closure_test_require_module = function() {
  return closure_test_module.print('_CLOSURE_TEST_MODULE');
};
