'use strict';

define(function (require, exports, module) {
	var mData = require('../../core/requestData');
	var mBank = require('../../core/bank');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var loginId = localStorage.getItem('logonId');
	var telephone = localStorage.getItem('sessionTel');
	var wait = 60;
	var test_txt = new RegExp(/^(1[1-9])[0-9]{9}$/);
	function time(o) {
		if (wait == 0) {
			o.removeAttribute("disabled");
			o.innerHTML = "获取验证码";
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
	/* 
 	获取验证码
  */
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
		oldTel.value = telephone;
		/**
   * 手机号格式校验
   */
		function checkphone(Phone) {
			var test_txt = new RegExp(/^(1[1-9])[0-9]{9}$/);
			var matrix = test_txt.test(Phone);
			if (Phone) {
				if (Phone.length == 11 && matrix) {
					return true;
				} else {
					mCheck.toast("请输入您正确的手机号码");
					return false;
				}
			} else {
				mCheck.toast("请输入您正确的手机号码");
				return false;
			}
			return true;
		}

		verCode.addEventListener('tap', function (event) {
			if (newTel.value == "") {
				mCheck.toast("请输入新手机号");
				return false;
			}
			if (!test_txt.test(newTel.value)) {
				mCheck.toast("手机号码格式错误");
				return false;
			}
			if (newTel.value == oldTel.value) {
				mCheck.toast("新手机号不能与原手机号相同");
				return false;
			}
			var url2 = mBank.getApiURL() + 'reCheckMobileNo.do';
			var reData = {
				"session_mobileNo": newTel.value,
				"customerName": localStorage.getItem("sessionStoreNo")
			};
			mBank.apiSend('post', url2, reData, function () {
				time(verCode);
				var reqData = {
					"currentBusinessCode": "MS000004",
					"session_customerNameCN": localStorage.getItem("sessionName"),
					"session_mobileNo": newTel.value
				};
				var url = mBank.getApiURL() + 'passwordMobile.do';
				mBank.apiSend('post', url, reqData, function (data) {}, function(err){
					verCode.removeAttribute("disabled");
					verCode.value = "获取验证码";
					wait = 0;
					mCheck.alert(err.em);
				}, true);
			}, function(err){
				mCheck.callPortFailed(err.ec, err.em);
			}, true);
		});

		submit.addEventListener('tap', function () {
			var regData2 = {
				"salerNo": loginId,
				"salerMobile": newTel.value,
				"newVerifyCode": reTel.value
			};
			var url = mBank.getApiURL() + 'ModifyMobile.do';
			mBank.apiSend('post', url, regData2, function (data) {
				wait = 0;
				mui.alert("手机号修改成功，请重新登录", "提示", "确定", function () {
					mBank.openWindowByLoad("../login.html", "login", "slide-in-right");
				}, 'div');
			}, function(err){
				mCheck.alert(err.em);
			}, true);
		});
	});
});