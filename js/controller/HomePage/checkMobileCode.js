"use strict";

define(function (require, exports, module) {
	var mbank = require('../../core/bank');
	var mcheck = require('../../core/check');
	mbank.addVconsole();
	var storeNo = localStorage.getItem("sessionStoreNo");
	var telephone = localStorage.getItem("sessionTel");

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();
		var wait = 60;
		function time(o) {
			if (wait == 0) {
				o.removeAttribute("disabled");
				o.innerHTML = "获取短信验证码";
				wait = 60;
			} else {
				o.setAttribute("disabled", true);
				o.innerHTML = "重新发送(" + wait + ")";
				wait--;
				setTimeout(function () {
					time(o);
				}, 1000);
			}
		}

		verCode.addEventListener('tap', function (event) {
			time(this);
			var regData = {
				"currentBusinessCode": "MS000001",
				"session_mobileNo": telephone
			};
			var url = mbank.getApiURL() + 'passwordMobile.do';
			mbank.apiSend('post', url, regData, function (data) {}, function(err){
				verCode.removeAttribute("disabled");
				verCode.value = "获取验证码";
				wait = 0;
				mcheck.alert(err.em);
			}, true);
		});

		submit.addEventListener('tap', function () {
			document.activeElement.blur();
			var reqData1 = {
				'storeNo': storeNo,
				"newMoblieNo": telephone,
				"newVerifyCode": reTel.value
			};
			var url = mbank.getApiURL() + 'checkMobileCode.do';
			mbank.apiSend('post', url, reqData1, function (data) {
				wait = 0;
				mui.alert("验证成功，请重新登录", "提示", "确定", function () {
					mbank.openWindowByLoad("../login.html", "login", "slide-in-right");
				}, 'div');
			}, function(err){
				mcheck.alert(err.em);
			}, true);
		});
	});
});