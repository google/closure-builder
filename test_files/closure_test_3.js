/**
 * Closure test dummy two
 * global goog
 */

goog.provide('closure_test_3');

goog.require('closure_test_2');



closure_test_3 = function() {
  return closure_test_2()  + '_CLOSURE_TEST_2';
};
