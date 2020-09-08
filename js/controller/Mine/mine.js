'use strict';

define(function (require, exports, module) {
	var mData = require('../../core/requestData');
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	mbank.addVconsole();
	var sessionStoreNo = localStorage.getItem('sessionStoreNo');
	var sessionName = localStorage.getItem('sessionName'); //存储登录用户名
	var sessionUserRole = localStorage.getItem("sessionUserRole");
	var sessionStoreName = localStorage.getItem('sessionStoreName');
	var telphone = localStorage.getItem('sessionTel');
	var wgtVer;
	var ROLE = [{ 'value': '01', text: '信贷主管' }, { 'value': '02', text: '信贷专员' }, { 'value': '03', text: '销售顾问' }, { 'value': '04', text: '超级信贷专员' }];
	userName.innerHTML = (sessionName || '') + ' | ' + (mCheck.formatData(sessionUserRole, ROLE) || '');
	companyName.innerHTML = sessionStoreName || '';

	var queryriskflagsec = function queryriskflagsec(a) {
		var url = mbank.getApiURL() + 'queryriskflagsec.do';
		var param = { 'storeNo': a };
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', url, param, function (data) {
				resolve(data);
			},function(err){
				reject(err);
			});
		});
	};

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		var InScreen=mbank.isImmersed();
		queryriskflagsec(sessionStoreNo).then(function (data) {
			carType.innerHTML = '\u65B0\u8F66' + data.co_riskflag + '\u7EA7 | \u5168\u54C1\u724C\u65B0\u8F66\u53CA\u4E8C\u624B\u8F66' + data.co_riskflagsec + '\u7EA7';
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});

		quit.addEventListener('tap', function () {
			var url = mbank.getApiURL() + 'userSignOffAction.do';
			var param = {
				'storeNo': sessionStoreNo,
				'telephone': telphone
			};

			mbank.apiSend('post', url, param, function (data) {
				mbank.openWindowByLoad("../login.html", 'login', 'slide-in-left');
			},function(err){
				mCheck.callPortFailed(err.ec, err.em);
			});
		});

		$('.list').on('tap', 'li', function () {
			var index = $(this).index();
			switch (index) {
				case 0:
					// 安全设置
					mbank.openWindowByLoad('./settings.html', 'settings', 'slide-in-right');
					break;
				case 1:
					// 消息中心
					localStorage.removeItem('firstFlag');
					mbank.openWindowByLoad('../HomePage/message.html', 'message', 'slide-in-right');
					break;
				case 3:
					plus.runtime.openURL('https://www.worisk.com/robot/peugeot/dealer-robot.html');
					break;
			}
		});
		$('#homePage').on('tap', function () {
			// 首页
			localStorage.removeItem('firstFlag');
			mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
		});
		$('#calculator').on('tap', function () {
			//  计算器
			mbank.openWindowByLoad('../Calculator/calculator.html', 'calculator', 'slide-in-left');
		});
		$('#loanPre').on('tap', function () {
			// 贷款管理
			mbank.openWindowByLoad('../comPage/loanManagement.html', 'loanManagement', 'slide-in-left');
		});

		newPre.addEventListener('tap', function () {
			if (sessionUserRole == '01') {
				mCheck.alert('请使用销售顾问、信贷专员或超级信贷员账户创建新预审！');
				return;
			}
			localStorage.setItem('outSts', '100');
			localStorage.setItem('nodeSign', 'YS_SQLR');
			localStorage.setItem('backFlag', '01');
			localStorage.setItem('applCde', '');
			localStorage.setItem('typeFlag', '01');
			mbank.openWindowByLoad('../PreHearing/NewPre/loanPre.html', 'loanPre', 'slide-in-right', {
				'newPre': true //表明只有从这个入口进入的是新预审
			});
		});
		plus.runtime.getProperty(plus.runtime.appid, function (inf) {
			wgtVer = inf.version;
			verCode.innerHTML = wgtVer;
		});
	});
});