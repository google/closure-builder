/**
 * Closure test duplicate.
 */
goog.provide('closure_test_duplicate');

goog.require('closure_test_2');
goog.require('closure_test_1');


closure_test_duplicate = function() {
  return closure_test_1()  + closure_test_2();
};
