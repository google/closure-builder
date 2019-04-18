// This file was automatically generated from renderer.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace closure_test_soy.
 * @public
 */

goog.provide('closure_test_soy');

goog.require('soy');
goog.require('soydata');
/** @suppress {extraRequire} */
goog.require('goog.asserts');


/**
 * @param {{
 *    body: (null|string|undefined),
 *    head: (null|string|undefined),
 *    css: (null|string|undefined),
 *    js: (null|string|undefined),
 *    style: (null|string|undefined),
 *    canvas: (null|string|undefined)
 * }} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes|uselessCode}
 */
closure_test_soy.html = function(opt_data, opt_ignored) {
  opt_data = opt_data || {};
  goog.asserts.assert(opt_data.body == null || (opt_data.body instanceof goog.soy.data.SanitizedContent) || goog.isString(opt_data.body), "expected param 'body' of type null|string|undefined.");
  var body = /** @type {null|string|undefined} */ (opt_data.body);
  goog.asserts.assert(opt_data.head == null || (opt_data.head instanceof goog.soy.data.SanitizedContent) || goog.isString(opt_data.head), "expected param 'head' of type null|string|undefined.");
  var head = /** @type {null|string|undefined} */ (opt_data.head);
  goog.asserts.assert(opt_data.css == null || (opt_data.css instanceof goog.soy.data.SanitizedContent) || goog.isString(opt_data.css), "expected param 'css' of type null|string|undefined.");
  var css = /** @type {null|string|undefined} */ (opt_data.css);
  goog.asserts.assert(opt_data.js == null || (opt_data.js instanceof goog.soy.data.SanitizedContent) || goog.isString(opt_data.js), "expected param 'js' of type null|string|undefined.");
  var js = /** @type {null|string|undefined} */ (opt_data.js);
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<!DOCTYPE html>\n<html>\n<head>\n<style>* { margin:0; padding:0; }html, body { width:100%; height:100%; }canvas { display:block; }</style>\n' + ((css) ? closure_test_soy.css({content: css}) : '') + ((head) ? soy.$$escapeHtml(head) + '\n' : '') + '</head>\n<body>\n' + ((body) ? soy.$$escapeHtml(body) + '\n' : '') + ((js) ? js : '') + '</body>\n</html>\n');
};
if (goog.DEBUG) {
  closure_test_soy.html.soyTemplateName = 'closure_test_soy.html';
}


/**
 * @param {{
 *    content: string,
 *    url: (null|string|undefined)
 * }} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes|uselessCode}
 */
closure_test_soy.css = function(opt_data, opt_ignored) {
  goog.asserts.assert(goog.isString(opt_data.content) || (opt_data.content instanceof goog.soy.data.SanitizedContent), "expected param 'content' of type string|goog.soy.data.SanitizedContent.");
  var content = /** @type {string|goog.soy.data.SanitizedContent} */ (opt_data.content);
  goog.asserts.assert(opt_data.url == null || (opt_data.url instanceof goog.soy.data.SanitizedContent) || goog.isString(opt_data.url), "expected param 'url' of type null|string|undefined.");
  var url = /** @type {null|string|undefined} */ (opt_data.url);
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(((url) ? '<link rel="stylesheet" href="' + soy.$$escapeHtmlAttribute(soy.$$filterNormalizeUri(url)) + '">\n' : '') + ((content) ? '<style>\n' + soy.$$filterCssValue(content) + '\n</style>\n' : ''));
};
if (goog.DEBUG) {
  closure_test_soy.css.soyTemplateName = 'closure_test_soy.css';
}
