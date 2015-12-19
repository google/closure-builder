/**
 * Closure test dummy two
 * global goog
 */

goog.provide('closure_test_export');


/**
 * @constructor
 * @final
 * @export
 */
closure_test_export = function() {
  return 'Hello Workd';
};


/**
 * @export
 * @return {!boolean}
 */
closure_test_export.prototype.visible = function() {
  return true;
};


/**
 * @private
 * @return {!boolean}
 */
closure_test_export.prototype.invisible_ = function() {
  return true;
};
