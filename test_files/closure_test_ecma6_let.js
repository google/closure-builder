/**
 * Closure test with ecma6.
 */
goog.provide('closure_test_ecma6_let');

goog.require('closure_test_2');


closure_test_ecma6_let = function() {
  let test = closure_test_2()  + '_CLOSURE_TEST_2';
  return test;
};
