'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	//	{"ec":"0","em":"success","calculationFeeList":[{"feeSeq":"2219062670378","feeDesc":"借款人意外伤害险服务","feeTyp":"01","feeAmt":"18","feeWaive":null,"payAmt":"18","feeTnrTyp":"03","feeTnr":"1","feeTnrEnd":"36","revInd":"Y","isBetfair":"Y"},{"feeSeq":"2219062670379","feeDesc":"账户安全险","feeTyp":"09","feeAmt":"5","feeWaive":null,"payAmt":"5","feeTnrTyp":"03","feeTnr":"1","feeTnrEnd":"36","revInd":"N","isBetfair":"N"},{"feeSeq":"2219062670380","feeDesc":"随车行李险","feeTyp":"09","feeAmt":"5","feeWaive":null,"payAmt":"5","feeTnrTyp":"03","feeTnr":"1","feeTnrEnd":"36","revInd":"N","isBetfair":"N"},{"feeSeq":"2219062670376","feeDesc":"车辆保全保险服务","feeTyp":"01","feeAmt":"17","feeWaive":null,"payAmt":"17","feeTnrTyp":"03","feeTnr":"1","feeTnrEnd":"36","revInd":"Y","isBetfair":"Y"},{"feeSeq":"2219062670377","feeDesc":"钥匙险","feeTyp":"09","feeAmt":"5","feeWaive":null,"payAmt":"5","feeTnrTyp":"03","feeTnr":"1","feeTnrEnd":"36","revInd":"N","isBetfair":"N"}],"sequenceNo":"909036","windowId":"null"} at js/core/bank.js:154
	var FEE_TYP = [{ value: "01", text: "贷款保障服务" }, { value: "02", text: "滞纳金" }, { value: "03", text: "提前还款补偿金" }, { value: "04", text: "展期服务费" }, { value: "05", text: "贷后变更手续费" }, { value: "09", text: "增值服务" }, { value: "10", text: "收款手续费" }];
	var FEE_TNR_TYPE = [{ value: "01", text: "一次性收取" }, { value: "02", text: "分期收取" }, { value: "03", text: "按贷款周期收取" }, { value: "04", text: "首次还款日收取" }];
	var calculationFeeList = [];
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		var queryCalculationFeeList = function queryCalculationFeeList(param) {
			var url = mBank.getApiURL() + 'queryCalculationFeeList.do';
			return new Promise(function (resolve, reject) {
				mBank.apiSend('get', url, param, function (data) {
					resolve(data.calculationFeeList);
				}, function (err) {
					reject(err);
				});
			});
		};
		$('#waitingBox').show();
		queryCalculationFeeList(self.param).then(function (data) {
			$('#waitingBox').hide();
			if (data.length > 0) {
				var str = '';

				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var item = _step.value;

						var str2 = '';
						if (item.isBetfair == 'Y' || item.revInd == 'Y') {
							item.isSelected = true;
							var str3 = '';
							var str4 = '';
							if (item.isBetfair == 'Y') {
								str3 = '<input type="checkbox" checked disabled>';
								str4 = '<b style="display:block">*</b>';
							} else {
								str3 = '<input type="checkbox" checked disabled>';
								str4 = '<b>*</b>';
							}
							str2 = str3 + '\n\t\t\t\t\t\t\t\t<label class="label-checkbox"></label>\n\t\t\t\t\t\t\t\t<span>' + item.feeDesc + '</span>\n\t\t\t\t\t\t\t\t' + str4 + '\n\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t<div class="checked">';
						} else {
							item.isSelected = false;
							str2 = '<input type="checkbox" disabled>\n\t\t\t\t\t\t\t\t<label class="label-checkbox"></label>\n\t\t\t\t\t\t\t\t<span>' + item.feeDesc + '</span>\n\t\t\t\t\t\t\t\t<b>*</b>\n\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t<div>';
						}
						if (item.feeTnrTyp == '02' || item.feeTnrTyp == '03') {
							item.feeAmt = parseInt(item.feeAmt);
						} else if (item.feeTnrTyp == '01' || item.feeTnrTyp == '04') {
							item.feeAmt = parseInt(item.feeAmt / (item.feeTnrEnd - item.feeTnr + 1));
						}
						str += '<li>\n\t\t\t\t\t\t\t\t<p class="fee-sel">\n\t\t\t\t\t\t\t\t\t' + str2 + '\n\t\t\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t\t\t<span>\u8D39\u7528\u7C7B\u578B</span>\n\t\t\t\t\t\t\t\t\t\t<a>' + mCheck.formatData(item.feeTyp, FEE_TYP) + '</a>\n\t\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t\t<div class="flex">\n\t\t\t\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t\t\t\t<span>\u8D77\u6B62\u671F\u6570</span>\n\t\t\t\t\t\t\t\t\t\t\t<a>' + item.feeTnr + '-' + item.feeTnrEnd + '</a>\n\t\t\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t\t\t\t<span>\u8D39\u7528\u6536\u53D6\u7C7B\u578B</span>\n\t\t\t\t\t\t\t\t\t\t\t<a>' + mCheck.formatData(item.feeTnrTyp, FEE_TNR_TYPE) + '</a>\n\t\t\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class="flex">\n\t\t\t\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t\t\t\t<span>\u8D39\u7528\u91D1\u989D</span>\n\t\t\t\t\t\t\t\t\t\t\t<a><small>' + item.feeAmt + '</small> \u5143/\u6708</a>\n\t\t\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t\t\t\t<span>\u5B9E\u9645\u8D39\u7528\u91D1\u989D</span>\n\t\t\t\t\t\t\t\t\t\t\t<a><small>' + item.feeAmt + '</small> \u5143/\u6708</a>\n\t\t\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</li>';
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				calculationFeeList = data;
				list.innerHTML = str;
			}
		}, function (err) {
			mCheck.alert(err.em);
			$('#waitingBox').hide();
		});

		/* 
  	点击checkbox，样式切换
   */
		$('#list').on('tap', '.fee-sel', function () {
			//const items = [...document.getElementsByClassName('fee-sel')];

			var items = [].slice.call(document.getElementsByClassName('fee-sel'));
			var i = items.indexOf(this);
			if (calculationFeeList[i].isBetfair == 'Y') {} else if (calculationFeeList[i].isBetfair == 'N') {

				if (!$(this).find('input').is(':checked')) {
					$(this).find('input').prop('checked', true);
					$(this).next().addClass('checked');
					//					$(this).find('b').show();
					calculationFeeList[i].isSelected = true;
				} else {
					$(this).find('input').removeAttr('checked');
					$(this).next().removeClass('checked');
					//					$(this).find('b').hide();
					calculationFeeList[i].isSelected = false;
				}
			}
		});

		var cfApplFreeSave = function cfApplFreeSave(applCde, arr) {
			var url = mBank.getApiURL() + 'cfApplFreeSave.do';
			var param = {
				'applCde': applCde,
				'calculationFeeList.feeSeq': arr
			};
			return new Promise(function (resolve, reject) {
				mBank.apiSend('post', url, param, function (data) {
					resolve(data);
				}, function (err) {
					reject(err);
				});
			});
		};
		var loanInfo = plus.webview.getWebviewById('loanInfo');
		mui.back = function () {
			var arr = [],
			    sumFeeAmt = 0;
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = calculationFeeList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var item = _step2.value;

					if (item.isSelected) {
						arr.push(item.feeSeq);
						sumFeeAmt += parseFloat(item.feeAmt);
					}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			$('#waitingBox').show();
			cfApplFreeSave(self.param.applCde, arr).then(function (data) {
				$('#waitingBox').hide();
				mui.fire(loanInfo, 'sumFeeAmt', { sumFeeAmt: sumFeeAmt });
				plus.webview.hide(self.id);
				plus.webview.close(self.id);
			}, function (err) {
				mCheck.alert(err.em);
				$('#waitingBox').hide();
			});
		};
		back.addEventListener('tap', function () {
			mui.back();
		});
	});
});