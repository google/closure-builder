/**
 * Closure soy test with compiled soy file.
 */
goog.provide('closure_test_soy_file');

goog.require('closure_test_soy');

goog.require('goog.soy');


closure_test_soy_file = function() {
  goog.soy.renderElement(null, closure_test_soy.html, {});
  goog.soy.renderElement(null, closure_test_soy.css, {});
};
