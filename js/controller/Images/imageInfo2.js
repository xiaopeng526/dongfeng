'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		mBank.isImmersed();
	});
});