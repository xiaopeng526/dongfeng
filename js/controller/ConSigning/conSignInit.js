'use strict';

define(function (require, exports, module) {
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	var list = {};
	mui.init();
	var old_back = mui.back;
	/* 
 	查询是否展示连接人
  */
	function queryJointFree(applCde, contNo, fromPage) {
		var _url = mbank.getApiURL() + 'queryJointFree.do';
		mbank.apiSend('post', _url, {
			"applCde": applCde // 合同编号
		}, function (res) {
			if (res.jointFree === 'Y') {
				mui.confirm('请选择是否展示共同借款人信息', ' ', ['展示', '不展示'], function (e) {
					$('#waitingBox').show();
					if (e.index === 1) {
						// 不展示
						saveIsJointFree(applCde, 'N', contNo, fromPage);
					} else {
						//   展示 
						saveIsJointFree(applCde, 'Y', contNo, fromPage);
					}
				}, 'div');
			} else {
				$('#waitingBox').show();
				saveIsJointFree(applCde, 'Y', contNo, fromPage);
			}
		}, function (err) {
			$('#waitingBox').hide();
			mCheck.alert(err.em);
		});
	}
	/* 
 	35.	保存是否显示联借人
  */
	function saveIsJointFree(applCde, isJointFree, contNo, fromPage) {
		var _url = mbank.getApiURL() + 'saveIsJointFree.do';
		mbank.apiSend('post', _url, {
			"applCde": applCde, // 合同编号
			"isJointFree": isJointFree
		}, function (res) {
			// initiateContractDgSign(applCde, contNo,  fromPage); // 发起在线签署
			generatePerContTemplate(applCde, contNo); // 生成合同模板
		}, function (err) {
			$('#waitingBox').hide();
			mCheck.alert(err.em);
		});
	}
	/* 
 	在线签署
  */
	function initiateContractDgSign(applCde, contNo, fromPage) {
		var _url = mbank.getApiURL() + 'initiateContractDgSign.do';
		mbank.apiSend('post', _url, {
			"contNo": contNo // 合同编号
		}, function (res) {
			$('#waitingBox').hide();
			// 页面跳转到合同签署页面
			mbank.openWindowByLoad('conSigning.html', 'conSigning', 'slide-in-right', {
				contNo: contNo, // 合同编号
				fromPage: fromPage,
				applCde: applCde
			});
		}, function (err) {
			$('#waitingBox').hide();
			mCheck.alert(err.em);
		});
	}
	/* 
 	生成合同模板
  */
	function generatePerContTemplate(applCde, contNo) {
		var _url = mbank.getApiURL() + 'generatePerContTemplate.do';
		mbank.apiSend('post', _url, {
			"contNo": contNo, // 合同编号
			"applCde": applCde,
			"docType": '03'
		}, function (res) {
			$('#waitingBox').hide();
			mui.alert('合同正在玩命生成中，请稍后刷新待办列表~', ' ', '回首页', function (e) {
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.removeItem('firstFlag');
						mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
					}
				});
			}, 'div');
		}, function (err) {
			$('#waitingBox').hide();
			mCheck.alert(err.em);
		});
	}

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();
		var applCde = self.applCde; // 申请编号
		var contNo = self.contNo; // 合同编号
		var fromPage = self.fromPage || '';
		/* 点击按钮 */
		$('#btnConfirm').on('tap', 'a', function () {
			if ($(this).index() === 0) {
				// 上一步 返回 合同信息输入界面
				mbank.openWindowByLoad('conSignInfo.html', 'conSignInfo', 'slide-in-left', {
					"applCde": applCde,
					contNo: contNo,
					fromPage: fromPage
				});
			} else {
				// 在线签署 1、保存已录入信息
				queryJointFree(applCde, contNo, fromPage);
			}
		});
		$('#back').on('tap', function () {
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='N'){
					return;
				}else{
					localStorage.removeItem('firstFlag');
					if (fromPage == 'conList') {
						mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
					} else if (fromPage == 'loanList') {
						mbank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
					} else if (fromPage == 'homePage') {
						mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
					} else if (fromPage == 'lendingList') {
						mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
					} else {
						mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
					}
				}
			});
		});
		if (fromPage == 'conList') {
			mui.back = function () {
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'loanList') {
			mui.back = function () {
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						mbank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'homePage') {
			localStorage.removeItem('firstFlag');
			mui.back = function () {
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'lendingList') {
			mui.back = function () {
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
					}
				});
			};
		}
	});
});