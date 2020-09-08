'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var METHOD = [{ 'text': '密码保护', 'value': '1' }, { 'text': '短信验证', 'value': '2' }];
	var list = {
		'privateQno': '',
		'way': '1'
	};
	var param1 = {
		'privateQuestionNo': '',
		'privateQuestionAnswer': '',
		'hostCustNo': '',
		'mobileNo': ''
	};
	var param2 = {
		'storeNo': '',
		'newMoblieNo': '',
		'newVerifyCode': ''
	};

	var time = function time(o, wait) {
		if (wait == 0) {
			o.disabled = false;
			o.innerHTML = '获取短信验证码';
			wait = 60;
		} else {
			o.disabled = true;
			o.innerHTML = '\u91CD\u65B0\u53D1\u9001(' + wait + ')';
			wait--;
			setTimeout(function () {
				time(o, wait);
			}, 1000);
		}
	};

	$("#verMethod").on('click', function () {
		var _this = this;
		var getArrVal=mData.changePro(METHOD,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                if (_this.value == item[0].label) {
					return;
				}
				verMethod.value = item[0].label;
				list.way = item[0].value;
				if (item[0].value == '1') {
					$('#verMess').hide();
					$('#proPass').show();
				} else if (item[0].value == '2') {
					$('#verMess').show();
					$('#proPass').hide();
				}
            },
            title: '请选择验证方式',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
		mesVerCde.addEventListener('blur', function () {
			param2.newVerifyCode = this.value;
		});

		function checkMobileCode() {
			var url = mBank.getApiURL() + 'checkMobileCode.do';
			mBank.apiSend('post', url, param2, function () {
				mBank.openWindowByLoad('../Mine/passwordModify2.html', 'passwordModify2', 'slide-in-right', {
					"dealerCode": dealerCde.value,
					"phoneNum": phoneNum.value
				});
			},function(err){
				mCheck.callPortFailed(err.ec, err.em);
			});
		}

		getMesVerCde.addEventListener('tap', function () {
			if (phoneNum.value == '') {
				return;
			}
			time(this, 60);
			var param = {
				'currentBusinessCode': 'MS000003',
				'session_mobileNo': phoneNum.value,
				'actionFlag': 1,
				'customerName': dealerCde.value
			};
			var url = mBank.getApiURL() + 'passwordMobile.do';
			mBank.apiSend('post', url, param, function (data) {}, function(err){mCheck.callPortFailed(err.ec, err.em);}, true);
		});
		function queryPrivateQ() {
			var url = mBank.getApiURL() + 'queryPrivateQ.do';
			mBank.apiSend('get', url, {}, function (data) {
				if (data.QueryPrivateQ.length > 0) {
					var quesitionArr = [];
					for (var i = 0; i < data.QueryPrivateQ.length; i++) {
						quesitionArr[i] = { "text": data.QueryPrivateQ[i].privateQname, "value": data.QueryPrivateQ[i].privateQno };
					}
					var getArrVal=mData.changePro(quesitionArr,"problem");
			        weui.picker(getArrVal.proVal, {
			            onChange: function (item) {
			            },
			            onConfirm: function (item) {
			                problem.value = item[0].label;
							list.privateQno = item[0].value;
							param1.privateQuestionNo = item[0].value;
							param1.privateQuestionAnswer = '';
							answer.value = '';
			            },
			            title: '请选择问题',
			            defaultValue:[getArrVal.indSeq],
			            id:'problem'
			        });
				}
			}, function(err){
				mCheck.callPortFailed(err.ec, err.em);
			}, true);
		}

		dealerCde.addEventListener('blur', function () {
			param1.hostCustNo = this.value;
			param2.storeNo = this.value;
		});

		phoneNum.addEventListener('blur', function () {
			param1.mobileNo = this.value;
			param2.newMoblieNo = this.value;
		});

		$("#problem").on('click', function () {
			queryPrivateQ();
		});

		answer.addEventListener('blur', function () {
			param1.privateQuestionAnswer = this.value;
		});

		function getPrivateQAnswer() {
			var url = mBank.getApiURL() + 'getPrivateQAnswer.do';
			mBank.apiSend('post', url, param1, function (data) {
				mBank.openWindowByLoad('../Mine/passwordModify2.html', 'passwordModify2', 'slide-in-right', {
					"dealerCode": dealerCde.value,
					"phoneNum": phoneNum.value
				});
			},function(err){
				mCheck.callPortFailed(err.ec, err.em);
			});
		}

		next.addEventListener('tap', function () {
			document.activeElement.blur();
			if (list.way == '1') {
				getPrivateQAnswer();
			} else if (list.way == '2') {
				checkMobileCode();
			}
		});
	});
});