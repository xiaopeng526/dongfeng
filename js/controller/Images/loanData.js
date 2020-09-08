'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	var typeFlag = localStorage.getItem('typeFlag');
	var typeFlagList = localStorage.getItem('typeFlagList');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	var lendingDemand = '';
	var flag = '';
	var ZILIAO = [{ 'value': '01', text: '必收资料放款' }, { 'value': '02', text: '完整资料放款' }];
	var canZi = true; //资料范围是否可选
	var list = { 'iLendingModes': [] };

	var queryCFapplInfo = function queryCFapplInfo(applCde) {
		var param = { applCde: applCde ,detailFlag:"00"};
		var url = mBank.getApiURL() + 'queryCFapplInfo.do';
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				resolve(data);
			}, function(err){
				reject(err);
			});
		});
	};

	var queryUploadFKdoc = function queryUploadFKdoc(applCde) {
		var param = { applCde: applCde };
		var url = mBank.getApiURL() + 'queryUploadFKdoc.do';
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				mCheck.formatObj(data);
				data.iLendingModes.forEach(function (item) {
					item.text = item.showMsg;
					item.value = item.lendingMode;
				});
				list.iLendingModes = data.iLendingModes;
				resolve(data);
			}, function(err){
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
		mBank.isImmersed();
		var param = {
			'fdLoanTyp': '',
			'docTyp': '2001',
			'type': self.type,
			'contractNo': '',
			'sqzl': '2',
			'applCde': applCde,
			'lendingDemand': ''
		};

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

		back.addEventListener('tap', function () {
			document.activeElement.blur();
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back1();
				}
			});
		});

		mui.back = function () {
			document.activeElement.blur();
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

		queryCFapplInfo(applCde).then(function (data1) {
			queryUploadFKdoc(applCde).then(function (data) {
				appNo.value = applCde;
				//     			contractNo.value = data.contractNo;
				localStorage.setItem('contractNo', data.contractNo);
				param.contractNo = data.contractNo;
				custName.value = data.custName;
				if (data1.session_corTyp == '01') {
					$('#contractNo').parent().hide();
				} else {
					$('#contractNo').val(mCheck.addSeparator(data1.remainingAmount));
				}
				param.lendingDemand = data1.lendingDemand;
				localStorage.setItem('lendingDemand', param.lendingDemand);
				if (data1.lendingDemand == '01') {
					$('#ziliaofanwei').val('必收资料放款');
					lendingDemand = '01';
				} else if (data1.lendingDemand == '02') {
					$('#ziliaofanwei').val('完整资料放款');
					lendingDemand = '02';
				} else {
					$('#ziliaofanwei').val('');
				}
				flag = data1.flag;
				if (data1.flag == 'N') {
					canZi = false;
				} else {
					canZi = true;
				}

				if (data.fd_loan_typ == '' || data.fd_loan_typ == null) {
					fdloanTyp.value = '';
					param.fdLoanTyp = '';
					localStorage.setItem('fdLoanTyp', '');
				} else {
					fdloanTyp.value = mCheck.formatData(data.fd_loan_typ, data.iLendingModes);
					param.fdLoanTyp = data.fd_loan_typ;
					localStorage.setItem('fdLoanTyp', param.fdLoanTyp);
				}

				localStorage.setItem('manualAudit', data.manualAudit);
			},function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		},function(err){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});

		$("#fdloanTyp").on('click', function () {
			var getArrVal=mData.changePro(list.iLendingModes,this.id);
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	                if (item[0].label === fdloanTyp.value) {
						return;
					}
					if (fdloanTyp.value == undefined) {
						fdloanTyp.value = '';
						return;
					}
					fdloanTyp.value = item[0].label;
					param.fdLoanTyp = item[0].value;
					localStorage.setItem('fdLoanTyp', item[0].value);
	            },
	            title: '请选择放款类型',
	            defaultValue:[getArrVal.indSeq],
	            id:this.id
	        });
		});

		$("#ziliaofanwei").on('click', function () {
			if (!canZi) {
				return;
			}
			var getArrVal=mData.changePro(ZILIAO,this.id);
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	                if (item[0].label === ziliaofanwei.value) {
						return;
					}
					if (ziliaofanwei.value == undefined) {
						ziliaofanwei.value = '';
						return;
					}
					ziliaofanwei.value = item[0].label;
					lendingDemand = item[0].value;
//					param.fdLoanTyp = item[0].value;
//					localStorage.setItem('fdLoanTyp', item[0].value);
	            },
	            title: '请选择资料范围',
	            defaultValue:[getArrVal.indSeq],
	            id:this.id
	        });
		});

		var updateLendingDoc = function updateLendingDoc(a, b, c, d) {
			var url = mBank.getApiURL() + 'updateLendingDoc.do';
			var param = {
				'applCde': a,
				'lendingMode': b,
				'flag': c,
				'lendingDemand': d
			};
			return new Promise(function (resolve, reject) {
				mBank.apiSend('post', url, param, function (data) {
					resolve(data);
				}, function (err) {
					reject(err);
				});
			});
		};

		next.addEventListener('tap', function () {
			if (fdloanTyp.value == '' || fdloanTyp.value == undefined) {
				mCheck.alert('放款类型不能为空');
				return false;
			}
			$('#waitingBox').show();
			updateLendingDoc(applCde, param.fdLoanTyp, flag, lendingDemand).then(function (data) {
				mBank.openWindowByLoad('./imageLoanList.html', 'imageLoanList', 'slide-in-right', param);
				$('#waitingBox').hide();
			}, function (err) {
				mCheck.alert(err.em);
				$('#waitingBox').hide();
			});
		});
	});
});