'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(function (require, exports, module) {
	var _commonParam;
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var minAmt = "",
	    maxAmt = "",
	    tnrOpt = "",
	    tnrOptTyp = "",
	    typCde = "",
	    typDesc = "",
	    typFreq = "",
	    typSeq = "",
	    typVer = "";
	var fincLoanIntRate = "";

	var commonParam = (_commonParam = {
		'maxAmt': '',
		'minAmt': '',
		'typFreq': '',
		'fincLoanIntRate': '',
		'applyTnrTyp': '',
		'addFincServerClass': '',
		'addFincKind': '',
		'addFincKindNam': '',
		'fincApplyTnr': ''
	}, _defineProperty(_commonParam, 'fincLoanIntRate', ''), _defineProperty(_commonParam, 'typSeq', ''), _defineProperty(_commonParam, 'addFincPrice', ''), _commonParam);

	var queryPLoanTypIncreList = function queryPLoanTypIncreList(addFincObj, typSeq) {
		var param = { addFincObj: addFincObj, typSeq: typSeq };
		var url = mBank.getApiURL() + 'queryPLoanTypIncreList.do';
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				data.addTypList.forEach(function (item) {
					item.text = item.typDesc;
				});
				resolve(data.addTypList);
			}, function(err){
				reject(err);
			});
		});
	};
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		commonParam.addFincServerClass = self.addFincObj;
		if (self.addFincObj == "01") {
			title.innerHTML = '购置税';
		} else if (self.addFincObj == "02") {
			title.innerHTML = '保险';
		} else if (self.addFincObj == "99") {
			title.innerHTML = '其他服务';
		}

		$("#zrType").on('click', function () {
			queryPLoanTypIncreList(self.addFincObj, self.typSeq).then(function (data) {
				if (data.length > 0) {
					var getArrVal=mData.changePro(data,'zrType');
			        weui.picker(getArrVal.proVal, {
			            onChange: function (item) {
			            },
			            onConfirm: function (item) {
			                zrType.value = item[0].label;
							applyTnr.innerHTML = item[0].tnrOpt;
							commonParam.maxAmt = item[0].maxAmt;
							commonParam.minAmt = item[0].minAmt;
							commonParam.applyTnrTyp = item[0].tnrOptTyp;
							commonParam.typFreq = item[0].typFreq;
							commonParam.addFincKindNam = item[0].typDesc;
							commonParam.addFincKind = item[0].typCde;
							commonParam.fincApplyTnr = item[0].tnrOpt;
							commonParam.typSeq = item[0].typSeq;
			            },
			            title: '请选择增融品种',
			            defaultValue:[getArrVal.indSeq],
			            id:'zrType'
			        });
				}
			},function(err){
				mCheck.callPortFailed(err.ec, err.em);
			});
		});

		money.addEventListener('keyup', function () {
			commonParam.addFincPrice = this.value;
		});

		money.addEventListener('blur', function () {
			this.value = mCheck.addSeparator(this.value);
			mData.getLoanInf(commonParam.typSeq, commonParam.addFincPrice).then(function (data) {
				if (data.priceIntRat.indexOf('.') == 0) {
					data.priceIntRat = '0' + data.priceIntRat;
				}
				commonParam.fincLoanIntRate = data.priceIntRat;
				zhixinglv.innerHTML = (data.priceIntRat * 100).toFixed(4);
			}, function(err){
				mCheck.callPortFailed(err.ec, err.em);
			});
		});

		var loanInfo = plus.webview.getWebviewById('loanInfo');
		submit.addEventListener('tap', function () {
			mui.fire(loanInfo, 'updateAmt', commonParam);
			setTimeout(function () {
				mui.back();
			}, 500);
		});
	});
});