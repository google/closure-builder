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
 *    body: string,
 *    head: (null|string|undefined),
 *    css: (null|string|undefined),
 *    js: (null|string|undefined)
 * }} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object<string, *>=} opt_ijData
 * @return {string}
 * @suppress {checkTypes}
 */
closure_test_soy.html = function(opt_data, opt_ignored, opt_ijData) {
  soy.asserts.assertType(goog.isString(opt_data.body) || (opt_data.body instanceof goog.soy.data.SanitizedContent), 'body', opt_data.body, 'string|goog.soy.data.SanitizedContent');
  var body = /** @type {string|goog.soy.data.SanitizedContent} */ (opt_data.body);
  soy.asserts.assertType(opt_data.head == null || (opt_data.head instanceof goog.soy.data.SanitizedContent) || goog.isString(opt_data.head), 'head', opt_data.head, 'null|string|undefined');
  var head = /** @type {null|string|undefined} */ (opt_data.head);
  soy.asserts.assertType(opt_data.css == null || (opt_data.css instanceof goog.soy.data.SanitizedContent) || goog.isString(opt_data.css), 'css', opt_data.css, 'null|string|undefined');
  var css = /** @type {null|string|undefined} */ (opt_data.css);
  soy.asserts.assertType(opt_data.js == null || (opt_data.js instanceof goog.soy.data.SanitizedContent) || goog.isString(opt_data.js), 'js', opt_data.js, 'null|string|undefined');
  var js = /** @type {null|string|undefined} */ (opt_data.js);
  return '<!DOCTYPE html>\n<html>\n<head>\n<style>* { margin:0; padding:0; }html, body { width:100%; height:100%; }canvas { display:block; }</style>' + ((css) ? closure_test_soy.css({content: css}, null, opt_ijData) : '') + soy.$$filterNoAutoescape(head) + '\n</head>\n<body>\n' + soy.$$filterNoAutoescape(body) + '\n' + ((js) ? js : '') + '</body>\n</html>\n';
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
 * @param {Object<string, *>=} opt_ijData
 * @return {string}
 * @suppress {checkTypes}
 */
closure_test_soy.css = function(opt_data, opt_ignored, opt_ijData) {
  soy.asserts.assertType(goog.isString(opt_data.content) || (opt_data.content instanceof goog.soy.data.SanitizedContent), 'content', opt_data.content, 'string|goog.soy.data.SanitizedContent');
  var content = /** @type {string|goog.soy.data.SanitizedContent} */ (opt_data.content);
  soy.asserts.assertType(opt_data.url == null || (opt_data.url instanceof goog.soy.data.SanitizedContent) || goog.isString(opt_data.url), 'url', opt_data.url, 'null|string|undefined');
  var url = /** @type {null|string|undefined} */ (opt_data.url);
  return '' + ((url) ? '\n<link rel="stylesheet" href="' + soy.$$filterNoAutoescape(url) + '">\n' : '') + ((content) ? '\n<style>\n' + soy.$$filterNoAutoescape(content) + '\n</style>\n' : '');
};
if (goog.DEBUG) {
  closure_test_soy.css.soyTemplateName = 'closure_test_soy.css';
}
