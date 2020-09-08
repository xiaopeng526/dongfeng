'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	var sessionStoreNo = localStorage.getItem('sessionStoreNo');
	var count = 0; // 判断车架号搜索是否被点击过
	//页面暂存数据
	var list = {
		'sessionRiskflag': '',
		'zrPrice': 0, //独立增融增融金额
		'isMarket': false, //默认没有查看选择保险超市
		'amountParam': {}, //贷款金额计算参数
		'iLoanProductList': {
			typDesc: '', //贷款品种名称
			typCde: '', //贷款品种代码
			addFincInd: '', //是否允许增融
			addFincObj: '', //增融标的
			addFincTyp: '', //增融方式1、随车贷2、独立增融
			mtdTyp: '', //还款方式种类
			mtdClass: '', //还款方式细分
			defPct: '', //尾款比例
			maxPct: '', //最大尾款比例
			minPct: '', //最小尾款比例
			minAmt: '', //最小贷款金额
			maxAmt: '', //最大贷款金额
			maxFstPct: '', //最大首付比例
			fstPct: '', //最小首付比例
			typFreq: '', //还款间隔
			typVer: '', //贷款品种版本号
			tnrOptTyp: '', //申请期限类型M
			tnrOpt: '',//申请期限
			otherAmtLimitType: '',//其他金额上限类型
			otherAmtLimitRatio: '',//其他金额上限比例
			otherAmtLimitAmt: ''//其他金额上限金额
		}
	};

	//预审参数
	var loanParam = {
		'temp': '0',
		'applCde': '',
		'carType': '',
		'goodsKind': '',
		'sb_brand_nam': '',
		'sub_sb_brand_nam': '',
		'sub_sb_brand_cde': '',
		'goodsModel': '',
		'svm_mode_nam': '',
		'carSeries': '',
		'svc_class_nam': '',
		'mode_year_cde': '',
		'mode_year_nam': '',
		'firmPrice': '',
		'carPrice': '',
		'transmissionType': '',
		'registerTime': '',
		'distance': '',
		'VIN': '',
		'CltFrm': '',
		'gmCity': '',
		'licCity': '',
		'grpCde': '',
		'grpName': '',
		'gpsInd': '',
		'typSeq': '',
		'typCde': '',
		'typdesc': '',
		'minAmt': '',
		'lt_fstpct': '',
		'lt_fstpcp': '',
		'typVer': '',
		'addFincInd': '',
		'addFincTyp': '',
		'addFincObj': '',
		'calMode': '',
		'fstPct': '',
		'fstPay': '',
		'applyAmt': '',
		'applyTnr': '',
		'loanIntRate': '',
		'noGuarantee': 'N',
		'cstLevel': '',
		'mtdDesc': '',
		'typFreq': '',
		'mtdCde': '',
		'applyTnrTyp': 'M',
		'restPct': '',
		'dueDay': '',
		'sumFeeAmt': '',
		'totalPrice': '',
		'sumApplyAmt': '',
		'sumFstPct': '',
		'wholeFstPay': '',
		'salerName': '',
		'salerTel': '',
		'XDName': '',
		'XDTel': '',
		'deaName': '',
		'riskGrade': '',
		'cfState': '',
		'purtax': '',
		'insurancetax': '',
		'otherServer': '',
		'gpsFinc': '',
		'decorateFinc': '',
		'loyalCust': 'N',
		'electrombile': 'N', //是否电动车
		'luxury': 'N', //是否豪华车
		'tenFlag': 'N', //二手车期限是否超过十年
		'isSuperFinancial': 'N', //是否增融
		'dueDayOpt': 'DD', //还款日类型
		'mortgage': 'N', //默认免抵押为否
		//独立增融
		'addFincServerList.typSeq': [],
		'addFincServerList.typFreq': [],
		'addFincServerList.addFincServerClass': [],
		'addFincServerList.addFincKind': [],
		'addFincServerList.addFincKindNam': [],
		'addFincServerList.addFincPrice': [],
		'addFincServerList.applyTnrTyp': [],
		'addFincServerList.fincApplyTnr': [],
		'addFincServerList.fincLoanIntRate': [],
		'addFincServerList.minAmt': [],
		'addFincServerList.maxAmt': [],
		'smp_fld_sellprice': '', // 二手车评估价
		'vheUseChar': '' ,// 使用性质
		'length_Quality_Update': '', //个人工修改标识
		'carLength': '', //车长
		'totalQuality': '', //总质量
		'car_type_grade': '', //车型级别
		'car_series_type': '', //车系类型
		'fuel_type': '' ,//燃料类型
		'otherAmtLimitType':'',//其他金额上限类型
		'otherAmtLimitRatio':'',//其他金额上限比例
		'otherAmtLimitAmt':''//其他金额上限金额
	};

	// 品牌、子品牌、车系、生产年份、车型 默认 置灰且不可编辑；
	function isNotEdit(carType) {
		if (carType == '02') {
			if (count === 0) {
				$('#brandInput').addClass('disabled'); // 品牌
				$('#subBrandInput').attr('disabled', 'disabled').addClass('disabled'); // 子品牌
				$('#carLineInput').attr('disabled', 'disabled').addClass('disabled'); // 车系
				$('#yearTypeInput').attr('disabled', 'disabled').addClass('disabled'); // 生产年份
				$('#carModelInput').addClass('disabled'); // 车型
			} else {
				$('#brandInput').removeClass('disabled'); // 品牌
				$('#subBrandInput').removeAttr('disabled').removeClass('disabled'); // 子品牌
				$('#carLineInput').removeAttr('disabled').removeClass('disabled'); // 车系
				$('#yearTypeInput').removeAttr('disabled').removeClass('disabled'); // 生产年份
				$('#carModelInput').removeClass('disabled'); // 车型
			}
		}
	}

	function insert(carType) {
		if (carType == '02') {
			$('#buyCityInput').parent().insertAfter($('#carTypeInput').parent());
			$('#licCityInput').parent().insertAfter($('#buyCityInput').parent());
			$('#carPriceInput').parent().insertAfter($('#assessPrice').parent());
			//插入车长，车重
			$('#carLengthInput').parent().insertAfter($('#useNature').parent());
			$('#carTotalInput').parent().insertAfter($('#carLengthInput').parent());
			
		} else {}
	}
	var isMortgage = function isMortgage(sessionRiskflag, mortgage, noGuarantee, riskGrade, cfState) {
		if (mortgage == "Y" && noGuarantee == "Y") {
			$('#isOrNotUnmor').parent().show();
			$('#isOrNotAssure').parent().show();
		} else {
			if (sessionRiskflag == 'A') {
				if (mortgage == 'N') {
					$('#isOrNotAssure').parent().hide();
				}
			} else if (sessionRiskflag == 'B') {
				if (mortgage == 'N') {
					$('#isOrNotAssure').parent().hide();
					$('#cusQuaInput').parent().hide();
				} else if (mortgage == 'Y') {
					if (noGuarantee == 'Y') {
						$('#cusQuaInput').parent().hide();
					} else if (noGuarantee == 'N') {
						$('#cusQuaInput').parent().show();
					}
				}
			} else if (sessionRiskflag == 'C' || sessionRiskflag == 'D') {
				if (mortgage == 'N') {
					$('#isOrNotUnmor').parent().hide();
					$('#isOrNotAssure').parent().hide();
				}
			}
		}
	};

	var cfapplInfoQuery = function cfapplInfoQuery(applCde) {
		var url = mBank.getApiURL() + 'cfapplInfoQuery.do';
		var param = { applCde: applCde };
		return new Promise(function (resolve, reject) {
			mBank.apiSend('post', url, param, function (data) {
				mCheck.formatObj(data);
				mCheck.assignObj(loanParam, data);
				mCheck.formateData(data.addFincServerList, 'addFincServerList', loanParam);
				resolve(data);
			}, function(err){
				reject(err);
			});
		});
	};
	//根据车辆类型显示隐藏信息
	var showFun = function showFun(type) {
		//isNotEdit(type);
		//二手车
		if (type === '02') {
			$('#firstDateInput').parent().show();
			$('#frameNoInput').parent().show();
			$('#mileageInput').parent().show();
			// $('#isOrNotElc').parent().show();
			// $('#isOrNotLuy').parent().show();
			$('#assessPrice').parent().show();
			$('#useNature').parent().show();
			$('#yearTypeInput').siblings('.item-title')[0].innerHTML = '生产年份';
		} else {
			$('#firstDateInput').parent().hide();
			$('#frameNoInput').parent().hide();
			$('#mileageInput').parent().hide();
			$('#isOrNotElc').parent().hide();
			$('#isOrNotLuy').parent().hide();
			$('#assessPrice').parent().hide();
			$('#useNature').parent().hide();
			$('#yearTypeInput').siblings('.item-title')[0].innerHTML = '年型';
		}
		//全品牌
		if (type === '03') {
			$('#customerSourceInput').parent().show();
		} else {
			$('#customerSourceInput').parent().hide();
		}

		//二手车和全品牌新车
		if (type === '02' || type === '03') {
			
			$('#subBrandInput').parent().show();
			$('#powerTypeInput').parent().show();
			$('#buyCityInput').parent().show();
			$('#isOrNotUnmor').parent().hide();
			$('#carLengthInput').parent().show();
			$('#carTotalInput').parent().show();
		} else {
			$('#subBrandInput').parent().hide();
			$('#powerTypeInput').parent().hide();
			$('#buyCityInput').parent().hide();
			$('#isOrNotUnmor').parent().show();
			$('#carLengthInput').parent().hide();
			$('#carTotalInput').parent().hide();
		}
	};

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({ "popGesture": "none" }); //窗口无侧滑返回功能
		mBank.isImmersed();
		//查询经销商评级、该门店业务范围
		mData.queryriskflagsec(sessionStoreNo, applCde).then(function (data) {
			var businessScope = data.co_busiscope.split(',');
			list.carScope = CAR_TYPE.filter(function (item) {
				return businessScope.includes(item.value);
			});
			list.sessionRiskflag = data.co_riskflag;
		});
		loanParam.applCde = applCde;
		cfapplInfoQuery(applCde).then(function (data) {
			if (data.coRiskflag != '') {
				list.sessionRiskflag = data.coRiskflag;
			}
			showFun(data.carType);
			carTypeInput.value = mCheck.formatData(data.carType, CAR_TYPE);
			brandInput.value = data.sb_brand_nam;
			subBrandInput.value = data.sub_sb_brand_nam;
			carLineInput.value = data.svc_class_nam;
			yearTypeInput.value = data.mode_year_nam;
			carModelInput.innerHTML = data.svm_mode_nam;
			carModelInput.classList.remove('item-p-after');
			guidPriceInput.value = mCheck.addSeparator(loanParam.firmPrice);
			carPriceInput.value = mCheck.addSeparator(data.carPrice);
			customerSourceInput.value = mCheck.formatData(data.CltFrm, CUS_SOURCE);
			powerTypeInput.value = mCheck.formatData(data.transmissionType, POWER_TYPE);
			firstDateInput.value = mCheck.timeFormat(loanParam.registerTime);
			if (data.smp_fld_sellprice) {
				// 车辆评估价
				assessPrice.value = mCheck.addSeparator(data.smp_fld_sellprice);
			} else {
				assessPrice.value = '';
			}
			useNature.value = mCheck.formatData(data.vheUseChar, USE_NATURE); // 使用性质 
			insert(data.carType);

			frameNoInput.value = data.VIN;
			mileageInput.value = data.distance;
			carPrice2Input.value = mCheck.addSeparator(data.totalPrice);
			// if (data.electrombile == 'Y') {
			// 	$('#isOrNotElc').find('.yes').addClass('selected').siblings('span').removeClass('selected');
			// } else {
			// 	$('#isOrNotElc').find('.no').addClass('selected').siblings('span').removeClass('selected');
			// }
			//是否显示豪华车
			// if (data.luxury == 'Y') {
			// 	$('#isOrNotLuy').find('.yes').addClass('selected').siblings('span').removeClass('selected');
			// } else {
			// 	$('#isOrNotLuy').find('.no').addClass('selected').siblings('span').removeClass('selected');
			// }
			buyCityInput.value = mCheck.formatCity(data.gmCity, CITY_DATA);
			licCityInput.value = mCheck.formatCity(data.licCity, CITY_DATA);

			productLineInput.value = data.grpName;
			loanProductsInput.value = data.typdesc;

			if (data.mtdTyp == '09' || data.mtdTyp == '06' && data.mtdClass == '02') {
				$('#wkbl').parent().show();
				$('#wkbl').val(data.restPct * 100);
			} else {
				$('#wkbl').parent().hide();
				$('#wkbl').val('');
			}
			if (data.loyalCustShow == 'Y') {
				$('#isOrNotLoyal').parent().show();
			} else {
				$('#isOrNotLoyal').parent().hide();
			}
			if (data.loyalCust == 'Y') {
				$('#isOrNotLoyal').find('.yes').addClass('selected').siblings('span').removeClass('selected');
			} else {
				$('#isOrNotLoyal').find('.no').addClass('selected').siblings('span').removeClass('selected');
			}
			if (data.addFincInd == 'Y') {
				$('#isOrNotZr').parent().show();
				$('#zrType').parent().show();
				$('.follow-list').show();
			} else {
				$('#isOrNotZr').parent().hide();
				$('#zrType').parent().hide();
				$('.follow-list').hide();
			}
			if (data.isSuperFinancial == 'Y') {
				$('#isOrNotZr').find('.yes').addClass('selected').siblings('span').removeClass('selected');
				$('#zrType').parent().show();
				if (data.addFincTyp == '01') {
					$('#zrType').find('span').text('随车贷');
					$('#downPayRatioInput').siblings('.item-title').text('首付比例');
					$('#downPaymoneyInput').siblings('.item-title').text('首付金额');
					$('#LoanMoneyInput').siblings('.item-title').text('贷款金额');
					$('.follow-list').show();
					$('#total1').show();
					//随车贷显示
					$('.ince-list').hide();
					$('.ince2-list').hide();
					if(data.carType == '01'){
						GPSInput.readOnly = true;
						otherSerInput.readOnly = true;
					}else{
						if(data.otherAmtLimitType == "" || data.otherAmtLimitType == null){
							otherSerInput.readOnly = true;
						}
					}
					purchaseInput.value = mCheck.addSeparator(data.purtax);
					insuranceInput.value = mCheck.addSeparator(data.insurancetax);
					otherSerInput.value = mCheck.addSeparator(data.otherServer);
					//新增GPS和装饰
					GPSInput.value = mCheck.addSeparator(data.gpsFinc);
					decorateInput.value = mCheck.addSeparator(data.decorateFinc);
					carPrice2Input.value = mCheck.addSeparator(data.totalPrice);
				} else if (data.addFincTyp == '02') {
					$('#downPayRatioInput').siblings('.item-title').text('车辆首付比例');
					$('#downPaymoneyInput').siblings('.item-title').text('车辆首付金额');
					$('#LoanMoneyInput').siblings('.item-title').text('车辆贷款金额');
					$('#zrType').find('span').text('独立增融');
					//独立增融显示
					$('.ince-list').show();
					$('.ince2-list').show();
					//随车贷隐藏
					$('.follow-list').hide();
					$('#total1').hide();
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = data.addFincServerList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var item = _step.value;

							if (item.addFincServerClass == '01') {
								purchase2Input.value = mCheck.addSeparator(item.addFincPrice);
							} else if (item.addFincServerClass == '02') {
								insurance2Input.value = mCheck.addSeparator(item.addFincPrice);
							} else if (item.addFincServerClass == '99') {
								otherSer2Input.value = mCheck.addSeparator(item.addFincPrice);
							}
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

					loanMoney3Input.value = mCheck.addSeparator(data.sumApplyAmt);
					carPrice3Input.value = mCheck.addSeparator(data.totalPrice);
					downPaymoney3Input.value = parseFloat(data.sumFstPct * 100).toFixed(2);
				}
			} else {
				$('#zrType').parent().hide();
				$('.follow-list').hide();
				$('#isOrNotZr').find('.no').addClass('selected').siblings('span').removeClass('selected');
			}
			calMethod.value = mCheck.formatData(data.calMode, CAL_METHOD);
			//			if(data.calMode == '01'){
			//				downPayRatioInput.disabled = false;
			//			}else if(data.calMode == '02'){
			//				downPayRatioInput.disabled = true;
			//			}

			list.amountParam.totalPrice = loanParam.totalPrice;
			list.amountParam.calMode = data.calMode;
			list.amountParam.fstPct = loanParam.fstPct;
			list.amountParam.applyAmt = loanParam.applyAmt;
			downPayRatioInput.value = loanParam.fstPct == '' ? '' : parseFloat(loanParam.fstPct * 100).toFixed(2);
			downPaymoneyInput.value = mCheck.addSeparator(loanParam.fstPay);
			loanMoneyInput.value = mCheck.addSeparator(data.applyAmt);
			rateInput.value = data.loanIntRate == '' ? '' : parseFloat(data.loanIntRate * 100).toFixed(4);
			applytermInput.value = data.applyTnr;
			paymentMethodInput.value = data.mtdDesc;
			reypayDay.value = mCheck.formatData(data.dueDayOpt, REPAY);
			if (data.dueDayOpt == 'OT') {
				$('#reypayDayDetail').parent().show();
				reypayDayDetail.value = mCheck.formatData(data.dueDay, GD_DAY);
			} else {
				$('#reypayDayDetail').parent().hide();
			}
			isMortgage(list.sessionRiskflag, data.mortgage, data.noGuarantee, data.riskGrade, data.cfState);
			if (data.mortgage == 'Y') {
				$('#isOrNotUnmor').find('.yes').addClass('selected').siblings('span').removeClass('selected');
			} else {
				$('#isOrNotUnmor').find('.no').addClass('selected').siblings('span').removeClass('selected');
			}
			if (data.noGuarantee == 'Y') {
				$('#isOrNotAssure').find('.yes').addClass('selected').siblings('span').removeClass('selected');
			} else {
				$('#isOrNotAssure').find('.no').addClass('selected').siblings('span').removeClass('selected');
			}
			cusQuaInput.value = mCheck.formatData(data.cstLevel, CUSTOMER_QUA);
			if (data.sumFeeAmt != '') {
				list.isMarket = true;
			}
			if (data.sumFeeAmt == '') {
				marketInput.value = '';
			} else {
				marketInput.value = mCheck.addSeparator(data.sumFeeAmt);
			}
			//车长
			if (data.carLength) {
				carLengthInput.value = data.carLength;
			} else {
				carLengthInput.value = '';
			}
			//车重
			if (data.totalQuality) {
				carTotalInput.value = data.totalQuality;
			} else {
				carTotalInput.value = '';
			}
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});

		marketInput.addEventListener('tap', function () {
			var param = {
				'loanSeq': loanParam.typSeq,
				'applyTnr': loanParam.applyTnr,
				'applyTnrTyp': loanParam.applyTnrTyp,
				'applyAmt': loanParam.applyAmt,
				'applCde': applCde
			};
			mBank.openWindowByLoad('../details/insuranceSupermaket.html', 'insuranceSupermaket', 'slide-in-right', { param: param });
		});
		next.addEventListener('tap', function () {
			mBank.openWindowByLoad('./appInfo.html', 'appInfo2', 'slide-in-right');
		});
	});
});