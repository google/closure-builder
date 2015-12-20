/**
 * Closure test dummy two
 */

goog.provide('closure_test_export');



/**
 * @constructor
 * @final
 * @export
 */
closure_test_export = function() {
  /** @type {!string} */
  this.teset = 'Hello Workd';
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
