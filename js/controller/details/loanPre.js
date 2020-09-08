'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	$('#rangeSpan').css('left', parseFloat($('#input').css('margin-left')) - parseFloat($('#rangeSpan').width()) / 4 + 'px');
	var list = {
		'rangeSpanLeft': parseInt($('#rangeSpan').css('left')),
		'rangeSpanWidth': parseInt($('#rangeSpan').width()),
		'inputWidth': parseInt($('#input').width()),
		'num': 20,
		'svm_mel_ratio': 1
	}; //页面暂存数据
	var param = {
		'calMode': '01'
	};
	function isMust(cartype) {
		if (cartype == '01') {
			$('#brandInput').siblings('.item-title').addClass('must-input');
			$('#carLineInput').siblings('.item-title').addClass('must-input');
			$('#yearTypeInput').siblings('.item-title').addClass('must-input');
			$('#carModelInput').siblings('.item-title').addClass('must-input');
		} else {
			$('#brandInput').siblings('.item-title').removeClass('must-input');
			$('#carLineInput').siblings('.item-title').removeClass('must-input');
			$('#yearTypeInput').siblings('.item-title').removeClass('must-input');
			$('#carModelInput').siblings('.item-title').removeClass('must-input');
		}
	}
	var preListParam = {
		'applCde': '',
		'carType': '',
		'sb_brand_cde': '',
		'sb_brand_nam': '',
		'sub_sb_brand_cde': '',
		'sub_sb_brand_nam': '',
		'svc_class_cde': '',
		'svc_class_nam': '',
		'mode_year_cde': '',
		'mode_year_nam': '',
		'svm_mode_cde': '',
		'svm_mode_nam': '',
		'vehDirectPrice': '',
		'carPrice': '',
		'transmissionType': '',
		'firstLicenseTime': '',
		'firstScale': '',
		'contFstPay': '',
		'applyAmt': ''
	}; //预审参数

	var queryDealerAppLoanInfo = function queryDealerAppLoanInfo(applCde) {
		var url = mBank.getApiURL() + 'queryDealerAppLoanInfo.do';
		var param = { applCde: applCde };
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				mCheck.formatObj(data);
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
		queryDealerAppLoanInfo(applCde).then(function (data) {
			mCheck.assignObj(preListParam, data);
			carTypeInput.value = mCheck.formatData(data.carType, CAR_TYPE);
			isMust(data.carType);
			brandInput.value = data.sb_brand_nam;
//			subBrandInput.value = data.sub_sb_brand_nam;
			carLineInput.value = data.svc_class_nam;
			yearTypeInput.value = data.mode_year_nam;
			carModelInput.innerHTML = data.svm_mode_nam;
			carModelInput.classList.remove('item-p-after');
			guidPriceInput.value = mCheck.addSeparator(data.vehDirectPrice);
			carPriceInput.value = mCheck.addSeparator(data.carPrice);
			firstDateInput.value = data.firstLicenseTime;
//			powerTypeInput.value = mCheck.formatData(data.transmissionType, POWER_TYPE);
			loanAmount.innerHTML = mCheck.addSeparator(data.applyAmt);
			downPayAmount.innerHTML = mCheck.addSeparator(data.contFstPay);

			if (data.carType === '01') {
				list.num = 20;
				$('#rangeSpan').html(list.num + '%');
				$('#start').html(list.num + '%');
				$('#end').html('80%');
			} else if (data.carType === '02') {
				list.num = 30;
				$('#rangeSpan').html(list.num + '%');
				$('#start').html(list.num + '%');
				$('#end').html('60%');
			} else if (data.carType === '03') {
				list.num = 20;
				$('#rangeSpan').html(list.num + '%');
				$('#start').html(list.num + '%');
				$('#end').html('50%');
			}
			if (preListParam.carType === '01' && preListParam.transmissionType === '02') {
				list.num = 15;
				$('#rangeSpan').html(list.num + '%');
				$('#start').html(list.num + '%');
				$('#end').html('80%');
			}
			if (data.firstScale != '') {
				if (preListParam.carType == '01') {
					input.value = Math.round((data.firstScale * 100 - list.num) * 100 / (80 - list.num));
				} else if (preListParam.carType == '02') {
					input.value = Math.round((data.firstScale * 100 - list.num) * 100 / (60 - list.num));
				} else if (preListParam.carType == '03') {
					input.value = Math.round((data.firstScale * 100 - list.num) * 100 / (50 - list.num));
				}

				rangeSpan.innerHTML = Math.round(data.firstScale * 100) + '%';
				$('#rangeSpan').css('left', Number(input.value) * list.inputWidth / 100 + list.rangeSpanLeft - parseFloat($('#rangeSpan').width()) / 4 + 'px');
			}

			if (data.carType === '02' || data.carType === '03') {
				$("#brandInput").parent().hide();//品牌
				$("#carLineInput").parent().hide();//车系
				$("#yearTypeInput").parent().hide();//年型
				$("#carModelInput").parent().hide();//车型
				$('#guidPriceInput').parent().hide();//指导价
			} else {
				$("#brandInput").parent().show();//品牌
				$("#carLineInput").parent().show();//车系
				$("#yearTypeInput").parent().show();//年型
				$("#carModelInput").parent().show();//车型
				$('#guidPriceInput').parent().show();//指导价
			}
			if (data.carType === '02') {
//				$('#yearTypeInput').siblings('.item-title')[0].innerHTML = '生产年份';
				$('#firstDateInput').parent().show();
			} else {
//				$('#yearTypeInput').siblings('.item-title')[0].innerHTML = '年型';
				$('#firstDateInput').parent().hide();
			}
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});
		/*下一步按钮*/
		next.addEventListener('tap', function () {
			mBank.openWindowByLoad('./appLicant.html', 'appLicant2', 'slide-in-right');
		});
	});
});