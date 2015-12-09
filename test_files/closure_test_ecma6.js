/**
 * Closure test with ecma6
 * global goog
 */

goog.provide('closure_test_ecma6');

goog.require('closure_test_2');



closure_test_3 = function() {
  let test = closure_test_2()  + '_CLOSURE_TEST_2'
  return test;
};
