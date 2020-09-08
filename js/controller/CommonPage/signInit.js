'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mBank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	var typeFlag = localStorage.getItem('typeFlag');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	var list = {
		'canClick': true,
		'url': ''
	};
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		if (typeFlag == '01') {
			list.url = mBank.getApiURL() + 'initiateAuthSign.do';
			$('.title')[0].innerHTML = '征信授权';
			imgBg.src = '../../images/con02.png';
		} else if (typeFlag == '02') {
			list.url = mBank.getApiURL() + 'initiateApplyFormDgSign.do';
			$('.title')[0].innerHTML = '签署申请表';
			imgBg.src = '../../images/con03.png';
		}

		//点击上一步按钮
		pre.addEventListener('tap', function () {
			if (typeFlag == '01') {
				mBank.openWindowByLoad('../PreHearing/NewPre/appLicant.html', 'appLicant', 'slide-in-left');
			} else if (typeFlag == '02') {
				mBank.openWindowByLoad('../Application/appInfo.html', 'appInfo', 'slide-in-left');
			}
		});
		function initiateDzSign(url, applCde) {
			var param = { 'applCde': applCde };
			return new Promise(function (resolve, reject) {
				mBank.apiSend('post', url, param, function (data) {
					resolve(data);
				}, function (err) {
					reject(err);
				}, true, true);
			});
		};
		//点击在线签署按钮
		sign.addEventListener('tap', function () {
			if (!list.canClick) {
				return;
			}
			list.canClick = false;
			$('#waitingBox').show();
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					list.canClick = true;
					$('#waitingBox').hide();
					return;
				}else{
					signFun();
				}
			});
		});
		function signFun(){
			initiateDzSign(list.url, applCde).then(function (data) {
				list.canClick = true;
				mBank.openWindowByLoad('./signIng.html', 'signIng', 'slide-in-right');
			}, function (err) {
				list.canClick = true;
				if(typeFlag == '01'){
					mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
				}else{
					if(err.ec==''||err.ec=="undefined"){
						mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
					}else{
						mui.confirm(err.em, '提示',['重新发送', '返回首页'], function(e) {
		                    if (e.index == 1) {
								mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
									if(dat=='Y'){
										localStorage.removeItem('firstFlag');
										mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-right');
									}
								});
		                    } else {
		                        signFun();
		                    }
		                },'div');
					}
				}
				
			});
		}

		function back1() {
			var backFlag = localStorage.getItem('backFlag');
			localStorage.removeItem('firstFlag');
			if (backFlag == '01') {
				mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
			} else if (backFlag == '02') {
				mBank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
			} else if (backFlag == '03') {
				mBank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
			} else if (backFlag == '04') {
				mBank.openWindowByLoad('../ConSigning/conSignList.html', 'conSignList', 'slide-in-left');
			} else if (backFlag == '05') {
				mBank.openWindowByLoad('../PreHearing/NewPre/loanPreList.html', 'loanPreList', 'slide-in-left');
			} else if (backFlag == '06') {
				mBank.openWindowByLoad('../PreHearing/PreList/preList.html', 'preList', 'slide-in-left');
			} else {
				mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
			}
		}
		mui.back = function () {
			if ($('#waitingBox').is(':visible')) {
				//如果loading框显示，不能点击手机返回按键
				return;
			}
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back1();
				}
			});
		};

		$('#back').on('tap', function () {
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back1();
				}
			});
		});
	});
});