/**
 * Closure test dummy two.
 */
goog.provide('closure_test_2');

goog.require('closure_test_1');


closure_test_2 = function() {
  return closure_test_1()  + '_CLOSURE_TEST_2';
};
