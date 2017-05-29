/**
 * Closure test group.
 */
goog.provide('closure_test_group');

goog.require('closure_test_2');


closure_test_group = function() {
  return closure_test_2()  + '_CLOSURE_TEST_2';
};
