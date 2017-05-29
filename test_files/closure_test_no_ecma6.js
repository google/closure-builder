/**
 * Closure test with ecma6.
 */
goog.provide('closure_test_no_ecma6');

goog.require('closure_test_2');


closure_test_no_ecma6 = function() {
  var test = closure_test_2()  + 'let talk about _CLOSURE_TEST_2'
  return test;
};
