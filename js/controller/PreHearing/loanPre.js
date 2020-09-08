'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var sessionStoreNo = localStorage.getItem('sessionStoreNo');
	var applCde = localStorage.getItem('applCde');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	$('#rangeSpan').css('left', parseFloat($('#input').css('margin-left')) - parseFloat($('#rangeSpan').width()) / 4 + 'px');
	var list = {
		'canClick': true,
		'rangeSpanLeft': parseInt($('#rangeSpan').css('left')),
		'rangeSpanWidth': parseInt($('#rangeSpan').width()),
		'inputWidth': parseInt($('#input').width()),
		'num': 20,
		'svm_mel_ratio': 1
	}; //页面暂存数据
	var param = {
		'calMode': '01'
	};
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
			}, function (err) {
				reject(err);
			});
		});
	};

	//清空页面
	function clearFun(type) {
		//选择车辆类型的时候
		if (type === '01') {
			//品牌清空
			brandInput.innerHTML = '';
			brandInput.classList.add('item-p-after2');
			preListParam.sb_brand_cde = '';
			preListParam.sb_brand_nam = '';
			preListParam.firstScale = '';
			preListParam.contFstPay = '';
			preListParam.applyAmt = '';
			downPayAmount.innerHTML = '';
			loanAmount.innerHTML = '';
		}
		//选择车辆类型或者品牌的时候
		if (type === '01' || type === '02') {
			//子品牌清空
			subBrandInput.value = '';
			preListParam.sub_sb_brand_cde = '';
			preListParam.sub_sb_brand_nam = '';
			//车系清空
			carLineInput.value = '';
			preListParam.svc_class_cde = '';
			preListParam.svc_class_nam = '';
		}
		//选择车辆类型或者品牌或者子品牌的时候
		if (type === '01' || type === '02' || type === '03') {
			carLineInput.value = '';
			preListParam.svc_class_cde = '';
			preListParam.svc_class_nam = '';
		}
		//选择车辆类型或者品牌或者子品牌或者车系的时候
		if (type === '01' || type === '02' || type === '03' || type === '04') {
			yearTypeInput.value = '';
			preListParam.mode_year_cde = ''; //年型清空
			preListParam.mode_year_nam = '';
		}
		//选择车辆类型或者品牌或者子品牌或者车系或者年型的时候
		if (type === '01' || type === '02' || type === '03' || type === '04' || type === '05') {
			carModelInput.innerHTML = '';
			preListParam.svm_mode_cde = '';
			preListParam.svm_mode_nam = '';
		}
		if (type === '01' || type === '02' || type === '03' || type === '04' || type === '05' || type === '06') {
			preListParam.vehDirectPrice = '';
			preListParam.carPrice = '';
			carPriceInput.value = '';
			guidPriceInput.value = '';
			powerTypeInput.value = '';
			preListParam.transmissionType = '';
			firstDateInput.value = '';
			preListParam.firstLicenseTime = '';
		}
	}
	var getApplCde = function getApplCde() {
		var url = mBank.getApiURL() + 'getApplCde.do';
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, {}, function (data) {
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
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		//查询经销商评级、该门店业务范围
		mData.queryriskflagsec(sessionStoreNo).then(function (data) {
			var businessScope = data.co_busiscope.split(',');
			list.carScope = CAR_TYPE.filter(function (item) {
				return businessScope.includes(item.value);
			});
		});
		if (applCde != '') {
			queryDealerAppLoanInfo(applCde).then(function (data) {
				mCheck.assignObj(preListParam, data);
				carTypeInput.value = mCheck.formatData(data.carType, CAR_TYPE);
				isMust(data.carType);
				brandInput.innerHTML = data.sb_brand_nam;
				brandInput.classList.remove('item-p-after2');
//				subBrandInput.value = data.sub_sb_brand_nam;
				carLineInput.value = data.svc_class_nam;
				yearTypeInput.value = data.mode_year_nam;
				carModelInput.innerHTML = data.svm_mode_nam;
				carModelInput.classList.remove('item-p-after');
				guidPriceInput.value = mCheck.addSeparator(data.vehDirectPrice);
				carPriceInput.value = mCheck.addSeparator(data.carPrice);
				//				firstDateInput.value = `${data.firstLicenseTime.substr(0,4)}-${data.firstLicenseTime.substr(4,2)}-${data.firstLicenseTime.substr(6,2)}`;
				firstDateInput.value = data.firstLicenseTime;
//				powerTypeInput.value = mCheck.formatData(data.transmissionType, POWER_TYPE);
				loanAmount.innerHTML = mCheck.addSeparator(data.applyAmt);
				downPayAmount.innerHTML = mCheck.addSeparator(data.contFstPay);

				param.totalPrice = data.carPrice;

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
//					$('#yearTypeInput').siblings('.item-title')[0].innerHTML = '生产年份';
					$('#firstDateInput').parent().show();
				} else {
//					$('#yearTypeInput').siblings('.item-title')[0].innerHTML = '年型';
					$('#firstDateInput').parent().hide();
				}
			},function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		} else if (applCde == '') {
			getApplCde().then(function (data) {
				preListParam.applCde = data.applCde;
				localStorage.setItem('applCde', data.applCde);
				applCde = data.applCde;
			},function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		}

		/*查询系统时间*/
		mData.getSystime().then(function (data) {
			list.sysDate = data.sysTime;
		},function(data){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});
		/*选择车辆类型*/
		carTypeInput.addEventListener('keyup', function () {
			mCheck.checknum(this);
		});
		$("#carTypeInput").parent().on('click', function () {
			document.activeElement.blur();
			var getArrVal=mData.changePro(list.carScope,'carTypeInput');
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	                if (item[0].lable === carTypeInput.value) {
						return;
					}
					clearFun('01');
					if (item[0].value === '02' || item[0].value === '03') {
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
					if (item[0].value === '02') {
//						$('#yearTypeInput').siblings('.item-title')[0].innerHTML = '生产年份';
						$('#firstDateInput').parent().show();
					} else {
//						$('#yearTypeInput').siblings('.item-title')[0].innerHTML = '年型';
						$('#firstDateInput').parent().hide();
					}
					$('#rangeSpan').css('left', parseFloat($('#input').css('margin-left')) - parseFloat($('#rangeSpan').width()) / 4 + 'px');
					input.value = '0';
					if (item[0].value === '01') {
						list.num = 20;
						$('#rangeSpan').html(list.num + '%');
						$('#start').html(list.num + '%');
						$('#end').html('80%');
					} else if (item[0].value === '02') {
						list.num = 30;
						$('#rangeSpan').html(list.num + '%');
						$('#start').html(list.num + '%');
						$('#end').html('60%');
					} else if (item[0].value === '03') {
						list.num = 20;
						$('#rangeSpan').html(list.num + '%');
						$('#start').html(list.num + '%');
						$('#end').html('50%');
					}
					carTypeInput.value = item[0].label;
					preListParam.carType = item[0].value;
					isMust(item[0].value);
	            },
	            title: '请选择车辆类型',
	            defaultValue:[getArrVal.indSeq],
	            id:$(this).children()[1].id
	       });
		});

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
		/*品牌选择*/
		var brandClik = true;
		$("#brandInput").on('click',function(){
			document.activeElement.blur();
			if (preListParam.carType == '') {
				mCheck.alert('车辆类型不能为空');
				return;
			}
			//查询品牌列表
			brandClik = false;
			mData.getCarBrand(preListParam.carType).then(function (data) {
//				if (preListParam.carType == '02' || preListParam.carType == '03') {
//					mBank.openWindowByLoad('../../CommonPage/selectList2.html', 'selectList2', 'slide-in-right', { carModelList: data, carModelSelected: brandInput.innerHTML });
//				} else 
				if (preListParam.carType == '01') {
					var currId=document.querySelector('p').id;
					var getArrVal=mData.changePro(data,currId);
			        weui.picker(getArrVal.proVal, {
			            onChange: function (item) {
			            },
			            onConfirm: function (item) {
			            	if (item[0].label === brandInput.innerHTML) {
								return;
							}
							clearFun('02');
							brandInput.innerHTML = item[0].label;
							brandInput.classList.remove('item-p-after2');
							preListParam.sb_brand_cde = item[0].sb_brand_cde;
							preListParam.sb_brand_nam = item[0].sb_brand_nam;
							brandClik = true;
			            },
			            title: '请选择品牌',
			            defaultValue:[getArrVal.indSeq],
			            id:currId
			        });
				}
			}, function (err) {
				brandClik = true;
				mCheck.toast(err.em);
			});
		});

		window.addEventListener('carBrandReverse', function (event) {
			if (event.detail.text === brandInput.innerHTML) {
				return;
			}
			clearFun('02');
			brandInput.innerHTML = event.detail.text;
			brandInput.classList.remove('item-p-after2');
			preListParam.sb_brand_cde = event.detail.sb_brand_cde;
			preListParam.sb_brand_nam = event.detail.sb_brand_nam;
			brandClik = true;
		});

		/*子品牌选择*/
//		var subbrandClik = true;
//		$("#subBrandInput").parent().on('click',function(){
//			document.activeElement.blur();
//			subbrandClik = false;
//			mData.getSubCarBrand(preListParam.carType, preListParam.sb_brand_cde).then(function (data) {
//				var getArrVal=mData.changePro(data,'subBrandInput');
//	        	weui.picker(getArrVal.proVal, {
//		            onChange: function (item) {
//		            },
//		            onConfirm: function (item) {
//		            	if (item[0].label === subBrandInput.value) {
//							return;
//						}
//						clearFun('03');
//						subBrandInput.value = item[0].label;
//						preListParam.sub_sb_brand_cde = item[0].sub_sb_brand_cde;
//						preListParam.sub_sb_brand_nam = item[0].label;
//						subbrandClik = true;
//		            },
//		            title: '请选择子品牌',
//		            defaultValue:[getArrVal.indSeq],
//		            id:'subBrandInput'
//		        })
//			}, function (err) {
//				subbrandClik = true;
//				mCheck.toast(err.em);
//			});
//		});

		/*车系选择*/
		$("#carLineInput").parent().on('click',function(){
			document.activeElement.blur();
			if (preListParam.sb_brand_cde == '') {
				mCheck.alert('品牌不能为空');
				return;
			}
			var subSbBrandCde = '';
			mData.getCarSeries(preListParam.carType, preListParam.sb_brand_cde, subSbBrandCde).then(function (data) {
				var getArrVal=mData.changePro(data,'carLineInput');
	        	weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		            	if (item[0].label === carLineInput.value) {
							return;
						}
						clearFun('04');
						carLineInput.value = item[0].label;
						preListParam.svc_class_cde = item[0].svc_class_cde;
						preListParam.svc_class_nam = item[0].label;
		            },
		            title: '请选择车系',
		            defaultValue:[getArrVal.indSeq],
		            id:'carLineInput'
		        })
			},function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		});

		/*年型选择*/
		$("#yearTypeInput").parent().on('click',function(){
			document.activeElement.blur();
			if (preListParam.svc_class_cde == '') {
				mCheck.alert('车系不能为空');
				return;
			}
			mData.getCarModeYear(preListParam.carType, preListParam.sb_brand_cde, preListParam.svc_class_cde).then(function (data) {
				var getArrVal=mData.changePro(data,'yearTypeInput');
	        	weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		            	if (item[0].label === yearTypeInput.value) {
							return;
						}
						clearFun('05');
						yearTypeInput.value = item[0].label;
						preListParam.mode_year_cde = item[0].mode_year_cde;
						preListParam.mode_year_nam = item[0].label;
		            },
		            title: "请选择年型",
		            defaultValue:[getArrVal.indSeq],
		            id:'yearTypeInput'
		        })
			},function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		});

		/*车型选择*/
		carModelInput.parentNode.addEventListener('tap', function () {
			document.activeElement.blur();
			if (preListParam.mode_year_cde == '') {
				mCheck.alert('年型不能为空');
				return;
			}
			mData.getCarModel(preListParam.carType, preListParam.svc_class_cde, preListParam.mode_year_cde).then(function (data) {
				mBank.openWindowByLoad('../../CommonPage/selectList.html', 'selectList', 'slide-in-right', { carModelList: data, carModelSelected: carModelInput.innerHTML });
			},function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		});

		window.addEventListener('carModelReverse', function (event) {
			list.carModelList = event.detail;
			clearFun('06');
			carModelInput.innerHTML = event.detail.text;
			carModelInput.classList.remove('item-p-after');
			preListParam.svm_mode_cde = event.detail.svm_mode_cde;
			preListParam.svm_mode_nam = event.detail.text;
			preListParam.transmissionType = event.detail.transmissionType;
			list.svm_mel_ratio = event.detail.svm_mel_ratio;
			$('#rangeSpan').css('left', parseFloat($('#input').css('margin-left')) - parseFloat($('#rangeSpan').width()) / 4 + 'px');
			input.value = '0';
			if (preListParam.carType === '01') {
				if (preListParam.transmissionType === '02') {
					list.num = 15;
					$('#rangeSpan').html(list.num + '%');
					$('#start').html(list.num + '%');
					$('#end').html('80%');
				} else {
					list.num = 20;
					$('#rangeSpan').html(list.num + '%');
					$('#start').html(list.num + '%');
					$('#end').html('80%');
				}
			} else if (preListParam.carType === '02') {
				list.num = 30;
				$('#rangeSpan').html(list.num + '%');
				$('#start').html(list.num + '%');
				$('#end').html('60%');
			} else if (preListParam.carType === '03') {
				list.num = 20;
				$('#rangeSpan').html(list.num + '%');
				$('#start').html(list.num + '%');
				$('#end').html('50%');
			}
			preListParam.vehDirectPrice = event.detail.firmPrice;
//			if (preListParam.carType === '02' || preListParam.carType === '03') {
//				powerTypeInput.value = mCheck.formatData(event.detail.transmissionType, POWER_TYPE);
//			}
			if (preListParam.carType === '01') {
				guidPriceInput.value = mCheck.addSeparator(event.detail.firmPrice);
			}
		});

		/*首次登记日期选择*/
		$('#firstDateInput').parent().on('click', function () {
			document.activeElement.blur();
			var getVal=$("#firstDateInput").val();
			var pickDate=mData.selDate(getVal,list.sysDate);
	        weui.datePicker({
	            start: pickDate.startDate,
	            end: pickDate.endDate,
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	            	var getDateVal=mData.clearDate(item[0].label,item[1].label,item[2].label);
	                firstDateInput.value = getDateVal;
					preListParam.firstLicenseTime = getDateVal;
	            },
	            title: '选择首次登记日期',
	            defaultValue:[pickDate.defY,pickDate.defM,pickDate.defD],
	            id:'firstDateInput'
	        });
	    });

		/*车辆价格*/
		carPriceInput.addEventListener('blur', function () {
			this.value = mCheck.removeSeparator(this.value);
			if (mCheck.addSeparator(this.value) == '0' || mCheck.addSeparator(this.value) == '0.00') {
				this.value = '';
				preListParam.carPrice = '';
				downPayAmount.innerHTML = '';
				loanAmount.innerHTML = '';
				preListParam.contFstPay = '';
				preListParam.applyAmt = '';
				return;
			}
			if (preListParam.carType == '01') {
				if (parseFloat(this.value) > preListParam.vehDirectPrice) {
					mui.alert('车辆价格不得大于厂商指导价*', '提示', '确定', null, 'div');
					carPriceInput.value = '';
					return;
				}
			}
			preListParam.carPrice = carPriceInput.value;
			carPriceInput.value = mCheck.addSeparator(carPriceInput.value);
			param.fstPct = parseFloat(rangeSpan.innerHTML) / 100;
			param.totalPrice = preListParam.carPrice;
			preListParam.firstScale = param.fstPct.toFixed(2);
			preListParam.contFstPay =mCheck.numMulti(preListParam.carPrice,param.fstPct);
			// preListParam.contFstPay = parseFloat(preListParam.carPrice * param.fstPct).toFixed(2);
			preListParam.applyAmt = parseFloat(preListParam.carPrice - preListParam.contFstPay).toFixed(2);
			downPayAmount.innerHTML = mCheck.addSeparator(preListParam.contFstPay);
			loanAmount.innerHTML = mCheck.addSeparator(preListParam.applyAmt);
		});

		var timer = null;
		input.addEventListener('input', function () {
			document.activeElement.blur();
			if (preListParam.carType === '01') {
				rangeSpan.innerHTML = Math.round(Number(this.value) * (80 - list.num) / 100) + list.num + '%';
			} else if (preListParam.carType === '02') {
				rangeSpan.innerHTML = Math.round(Number(this.value) * (60 - list.num) / 100) + list.num + '%';
			} else if (preListParam.carType === '03') {
				rangeSpan.innerHTML = Math.round(Number(this.value) * (50 - list.num) / 100) + list.num + '%';
			}

			$('#rangeSpan').css('left', Number(this.value) * list.inputWidth / 100 + list.rangeSpanLeft - parseFloat($('#rangeSpan').width()) / 4 + 'px');
			param.fstPct = parseFloat(rangeSpan.innerHTML) / 100;
			param.totalPrice = preListParam.carPrice;
			if (param.totalPrice == '' || param.totalPrice == '0' || param.totalPrice == '0.00') {
				return;
			}
			preListParam.firstScale = param.fstPct.toFixed(2);
			preListParam.contFstPay =mCheck.numMulti(preListParam.carPrice,param.fstPct);
			// preListParam.contFstPay = parseFloat(preListParam.carPrice * param.fstPct).toFixed(2);
			preListParam.applyAmt = parseFloat(preListParam.carPrice - preListParam.contFstPay).toFixed(2);
			downPayAmount.innerHTML = mCheck.addSeparator(preListParam.contFstPay);
			loanAmount.innerHTML = mCheck.addSeparator(preListParam.applyAmt);
		});

		var saveDealerAppLoan = function saveDealerAppLoan(param) {
			var url = mBank.getApiURL() + 'saveDealerAppLoan.do';
			return new Promise(function (resolve, reject) {
				mBank.apiSend('post', url, param, function (data) {
					resolve(data);
				}, function (err) {
					reject(err);
				});
			});
		};
		function isEmptyFun() {
			if (carTypeInput.value == '') {
				mCheck.alert('请选择车辆类型');
				return false;
			}
			if (preListParam.carType == '01') {
				if (brandInput.innerHTML == '') {
					mCheck.alert('请选择品牌');
					return false;
				}
				if (carLineInput.value == '') {
					mCheck.alert('请选择车系');
					return false;
				}
				if (yearTypeInput.value == '') {
					mCheck.alert('请选择年型');
					return false;
				}
			}
			//			if(brandInput.innerHTML == ''){
			//				mCheck.alert('请选择品牌');
			//				return false;
			//			}
			//			if(preListParam.carType == '02' || preListParam.carType == '03'){
			//				if(subBrandInput.value == ''){
			//					mCheck.alert('请选择子品牌');
			//					return false;
			//				}
			//			}
			//			if(carLineInput.value == ''){
			//				mCheck.alert('请选择车系');
			//				return false;	
			//			}
			//			if(yearTypeInput.value == ''){
			//				if(preListParam.carType == '02'){
			//					mCheck.alert('请选择生产年份');
			//					return false;
			//				}else if(preListParam.carType == '01' || preListParam.carType == '03'){
			//					mCheck.alert('请选择年型');
			//					return false;
			//				}	
			//			}
			//			if(carModelInput.innerHTML == ''){
			//				mCheck.alert('请选择车型');
			//				return false;
			//			}

			if (preListParam.carType == '02') {
				if (firstDateInput.value == '') {
					mCheck.alert('请选择首次登记日期');
					return false;
				}
			}
			if (carPriceInput.value == '' || carPriceInput.value == '0.00' || carPriceInput.value == '0') {
				mCheck.alert('车辆价格不能为空');
				return false;
			}
			if (loanAmount.innerHTML == '') {
				mCheck.alert('贷款金额不能为空');
				return false;
			}
			return true;
		}
		function back1() {
			var backFlag = localStorage.getItem('backFlag');
			localStorage.removeItem('firstFlag');
			if (backFlag == '01') {
				mBank.openWindowByLoad('../../HomePage/homePage.html', 'homePage', 'slide-in-left');
			} else if (backFlag == '02') {
				mBank.openWindowByLoad('../LendingList/lendingList.html', 'lendingList', 'slide-in-left');
			} else if (backFlag == '03') {
				mBank.openWindowByLoad('../../comPage/loanList.html', 'loanList', 'slide-in-left');
			} else if (backFlag == '04') {
				mBank.openWindowByLoad('../../ConSigning/conSignList.html', 'conSignList', 'slide-in-left');
			} else if (backFlag == '05') {
				mBank.openWindowByLoad('./loanPreList.html', 'loanPreList', 'slide-in-left');
			} else if (backFlag == '06') {
				mBank.openWindowByLoad('../PreList/preList.html', 'preList', 'slide-in-left');
			} else {
				mBank.openWindowByLoad('../../HomePage/homePage.html', 'homePage', 'slide-in-left');
			}
		}
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
		back.addEventListener('tap', function () {
			document.activeElement.blur();
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back1();
				}
			})
		});
		/*保存按钮*/
		save.addEventListener('tap', function () {
			document.activeElement.blur();
			if (!list.canClick) {
				return;
			}
			list.canClick = false;
			if (!self.newPre) {
				//如果不是新建预审,保存前需要查询锁
				mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
					if(dat=='N'){
						list.canClick = true;
						return;
					}
				});
			}
			$('#waitingBox').show();
			saveDealerAppLoan(preListParam).then(function (data) {
				$('#waitingBox').hide();
				if (self.newPre) {
					//如果是新建预审，保存成功之后需要添加锁。
					mData.editLock(applCde, nodeSign, outSts, '999','').then(function(dat){
						if(dat=='N'){
							list.canClick = true;
							return;
						}else{
							self.newPre = false;
						}
					})
					
				} else {
					//如果不是新建预审，保存成功之后需要更新锁。
					mData.updateLock(applCde, nodeSign, outSts, '999').then(function(dat){
						if(dat=='N'){
							list.canClick = true;
							return;
						}
					});
				}
				mCheck.alert('保存成功', function () {
					list.canClick = true;
				});
			}, function (err) {
				$('#waitingBox').hide();
				mCheck.alert(err.em);
				list.canClick = true;
			});
		});
		/*下一步按钮*/
		next.addEventListener('tap', function () {
			document.activeElement.blur();
			if (!list.canClick) {
				return;
			}
			list.canClick = false;
			$('#waitingBox').show();
			if (!self.newPre) {
				//如果不是新建预审,保存前需要查询锁
				mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
					if(dat=='N'){
						list.canClick = true;
						$('#waitingBox').hide();
						return;
					}
				});
			}
			if (!isEmptyFun()) {
				list.canClick = true;
				$('#waitingBox').hide();
				return;
			}
			saveDealerAppLoan(preListParam).then(function (data) {
				$('#waitingBox').hide();
				if (self.newPre) {
					//如果是新建预审，保存成功之后需要添加锁。
					mData.editLock(applCde, nodeSign, outSts, '999').then(function(dat){
						if(dat=='N'){
							list.canClick = true;
							return;
						}else{
							self.newPre = false;
						}
					})
					
				} else {
					//如果不是新建预审，保存成功之后需要更新锁。
					mData.updateLock(applCde, nodeSign, outSts, '999').then(function(dat){
						if(dat=='N'){
							list.canClick = true;
							return;
						}
					});
				}
				list.canClick = true;
				mBank.openWindowByLoad('./appLicant.html', 'appLicant', 'slide-in-right');
			}, function (err) {
				list.canClick = true;
				mCheck.alert(err.em);
				$('#waitingBox').hide();
			});
		});
	});
});