'use strict';

define(function (require, exports, module) {
	var mData = require('../../core/requestData');
	var mBank = require('../../core/bank');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var reg = '^(?![a-zA-Z0-9]+$)(?![^a-zA-Z/D]+$)(?![^0-9/D]+$).{8,20}$';
	var loginId = localStorage.getItem('logonId');
	var passwordSeed = '';
	passwordSeed = passwdSeed();
	/*生成密码因子随机数*/
	function passwdSeed() {
		var DATE = new Date();
		var YEAR = DATE.getFullYear().toString();
		var MONTH = DATE.getMonth() + 1 < 10 ? '0' + (DATE.getMonth() + 1) : DATE.getMonth() + 1;
		var DAY = DATE.getDate() < 10 ? '0' + DATE.getDate() : DATE.getDate().toString();
		var HOURS = DATE.getHours() < 10 ? '0' + DATE.getHours() : DATE.getHours().toString();
		var MINUTES = DATE.getMinutes() < 10 ? '0' + DATE.getMinutes() : DATE.getMinutes().toString();
		var SECONDS = DATE.getSeconds() < 10 ? '0' + DATE.getSeconds() : DATE.getSeconds().toString();
		var time = void 0;
		if (DATE.getMilliseconds() < 10) {
			time = '00' + DATE.getMilliseconds();
		} else if (DATE.getMilliseconds() < 100) {
			time = '0' + DATE.getMilliseconds();
		} else {
			time = DATE.getMilliseconds().toString();
		}
		var random = Math.random().toString().split('.')[1].substr(0, 15);
		return YEAR + MONTH + DAY + HOURS + MINUTES + SECONDS + time + random;
	};

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
		if (plus.os.name == 'Android') {
			plus.pluginPGKeyboard.clearKeyboard("pwd2");
			plus.pluginPGKeyboard.clearKeyboard("pwd3");
		}

		userPWDSoftKey1.addEventListener("blur", function () {
			event.preventDefault();
			if (plus.os.name == 'Android') {
				plus.pluginPGKeyboard.hideKeyboard("pwd2");
			}
		});
		userPWDSoftKey1.addEventListener("click", function (event) {
			event.preventDefault();
			plus.pluginPGKeyboard.hideKeyboard("pwd2");
			plus.pluginPGKeyboard.clearKeyboard("pwd2");
			userPWDSoftKey1.name = "";userPWDSoftKey1.value = "";
			plus.pluginPGKeyboard.openAESKeyboard("pwd2", "false", 0, 20, "false", "false", "true", reg, "", passwordSeed, function (result) {
				if (result.status) {
					if (plus.os.name == 'iOS') {
						var json = result.payload;
						var obj = $.parseJSON(json);
						userPWDSoftKey1.value = obj.cipherText == null ? "" : obj.text;
						userPWDSoftKey1.name = obj.cipherText == null ? "" : obj.cipherText;
					} else {
						var msg = result.message;
						if (msg == 0) {
							var error = result.payload;
							nativeUI.errorMSG(error, function () {});
						} else if (msg == 1) {
							var height = result.payload;
						} else if (msg == 2) {
							var json = result.payload;
							var obj = $.parseJSON(json);
							userPWDSoftKey1.value = obj.cipherText == null ? "" : obj.text;
							userPWDSoftKey1.name = obj.cipherText == null ? "" : obj.cipherText;
						} else if (msg == 3) {
							var id = result.payload;
						}
					}
				} else {
					mCheck.toast("调用密码键盘失败!");
				}
			}, function (result) {
				mCheck.toast(result);
			});
		}, false);
		userPWDSoftKey2.addEventListener("blur", function () {
			event.preventDefault();
			if (plus.os.name == 'Android') {
				plus.pluginPGKeyboard.hideKeyboard("pwd3");
			}
		});
		userPWDSoftKey2.addEventListener("click", function (event) {
			event.preventDefault();
			plus.pluginPGKeyboard.hideKeyboard("pwd3");
			plus.pluginPGKeyboard.clearKeyboard("pwd3");
			userPWDSoftKey2.name = "";userPWDSoftKey2.value = "";
			plus.pluginPGKeyboard.openAESKeyboard("pwd3", "false", 0, 20, "false", "false", "true", reg, "", passwordSeed, function (result) {
				if (result.status) {
					if (plus.os.name == 'iOS') {
						var json = result.payload;
						var obj = $.parseJSON(json);
						userPWDSoftKey2.value = obj.cipherText == null ? "" : obj.text;
						userPWDSoftKey2.name = obj.cipherText == null ? "" : obj.cipherText;
					} else {
						var msg = result.message;
						if (msg == 0) {
							var error = result.payload;
							nativeUI.errorMSG(error, function () {});
						} else if (msg == 1) {
							var height = result.payload;
						} else if (msg == 2) {
							var json = result.payload;
							var obj = $.parseJSON(json);
							userPWDSoftKey2.value = obj.cipherText == null ? "" : obj.text;
							userPWDSoftKey2.name = obj.cipherText == null ? "" : obj.cipherText;
						} else if (msg == 3) {
							var id = result.payload;
						}
					}
				} else {
					mCheck.toast("调用密码键盘失败!");
				}
			}, function (result) {
				mCheck.toast(result);
			});
		}, false);
		submit.addEventListener('tap', function () {
			document.activeElement.blur();

			if (userPWDSoftKey1.value == "" || userPWDSoftKey2.value == "") {
				mCheck.toast("新密码不能为空");
				return false;
			}
			if (userPWDSoftKey1.name != userPWDSoftKey2.name) {
				mCheck.toast("您输入的两次新密码不一致，请重新输入");
				return false;
			}
			if (plus.pluginPGKeyboard.checkMatch("pwd2") == null || plus.pluginPGKeyboard.checkMatch("pwd2") == "null") {
				if (!plus.pluginPGKeyboard.checkMatch("pwd3")) {
					mCheck.toast("密码格式有误，请输入8-20位的字母、数字和特殊字符的组合");
					return false;
				}
			}
			if (plus.pluginPGKeyboard.checkMatch("pwd3") == null || plus.pluginPGKeyboard.checkMatch("pwd3") == "null") {
				if (!plus.pluginPGKeyboard.checkMatch("pwd2")) {
					mCheck.toast("密码格式有误，请输入8-20位的字母、数字和特殊字符的组合");
					return false;
				}
			}

			var regData = {
				"customerName": self.dealerCode,
				"mobileNo": self.phoneNum,
				"confirmPassword": userPWDSoftKey2.name,
				"passwdSeed": passwordSeed
			};
			var url = mBank.getApiURL() + 'newpassword.do';
			mBank.apiSend('post', url, regData, function (data) {
				mCheck.alert('新密码设置成功!', function () {
					mBank.openWindowByLoad("../login.html", "login", "slide-in-right");
				});
			}, function(err){
				mCheck.callPortFailed(err.ec, err.em);
			}, true);
		});
	});
});