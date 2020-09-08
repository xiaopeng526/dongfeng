"use strict";

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	mBank.addVconsole();
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
		/*点击联系电话修改跳转到手机号修改页面*/
		changePhone.addEventListener('tap', function () {
			mBank.openWindowByLoad("iphoneModify.html", "iphoneModify", "slide-in-right");
		});
		/*点击密码修改进入到密码修改页面*/
		changePwd.addEventListener('tap', function () {
			mBank.openWindowByLoad("passwordModify.html", "passwordModify", "slide-in-right");
		});
	});
});