'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var counterParam = {}; //试算需要参数
	var list = {}; //页面暂存参数
	var amountParam = {}; //贷款金额计算参数
	var userRole = localStorage.getItem("sessionUserRole");

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		var InScreen=mBank.isImmersed();
		newPre.addEventListener('tap', function () {
			if (userRole == '01') {
				mCheck.alert('请使用销售顾问、信贷专员或超级信贷员账户创建新预审！');
				return;
			}
			localStorage.setItem('outSts', '100');
			localStorage.setItem('nodeSign', 'YS_SQLR');
			localStorage.setItem('backFlag', '01');
			localStorage.setItem('applCde', '');
			localStorage.setItem('typeFlag', '01');
			mBank.openWindowByLoad('../PreHearing/NewPre/loanPre.html', 'loanPre', 'slide-in-right', {
				'newPre': true //表明只有从这个入口进入的是新预审
			});
		});
		$('#homePage').on('tap', function () {
			// 首页
			localStorage.removeItem('firstFlag');
			mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
		});
		$('#loanPre').on('tap', function () {
			// 贷款管理
			mBank.openWindowByLoad('../comPage/loanManagement.html', 'loanManagement', 'slide-in-right');
		});
		$('#mine').on('tap', function () {
			// 我的
			if(InScreen){
				mBank.openWindowByLoad('../Mine/mine.html', 'mine', 'slide-in-right','',{
					top:'-88px',
					bottom:'0',
				})
			}else{
				mBank.openWindowByLoad('../Mine/mine.html', 'mine', 'slide-in-right','',{
					top:'-64px',
					bottom:'0',
				})
			}
		});
		/*选择车辆类型*/
		$("#carTypeInput").parent().on('click', function () {
			var getArrVal=mData.changePro(CAR_TYPE,'carTypeInput');
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	            	if (item[0].value === counterParam.carType) {
						return;
					}
	
					pgrpInput.value = '';
					loanProInput.value = '';
					applyTerm.value = '';
					defPct.value = '';
					$('#defPct').parent().hide();
	
					carTypeInput.value = item[0].label;
					counterParam.carType = item[0].value;
	
					mData.queryPGrpList(counterParam.carType).then(function (data) {
						list.pGrpList = data;
					},function(err){
						mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
					});
	            },
	            title: '请选择车辆类型',
	            defaultValue:[getArrVal.indSeq],
	            id:'carTypeInput'
	        });
		});

		/*选择产品线*/
		$("#pgrpInput").parent().on('click', function () {
			var getArrVal=mData.changePro(list.pGrpList,'pgrpInput');
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	            	if (item[0].label === pgrpInput.value) {
						return;
					}
					loanProInput.value = '';
					applyTerm.value = '';
					defPct.value = '';
					$('#defPct').parent().hide();
					pgrpInput.value = item[0].label;
					mData.queryLoanProduct(counterParam.carType, item[0].grpCde).then(function (data) {
						list.iLoanProductList = data;
					});
	            },
	            title: '请选择产品线',
	            defaultValue:[getArrVal.indSeq],
	            id:'pgrpInput'
	        });
		});

		/*选择贷款产品*/
		$("#loanProInput").parent().on('click', function () {
			var getArrVal=mData.changePro(list.iLoanProductList,'loanProInput');
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	            	if (loanProInput.value === item[0].label) {
						return;
					}
					mCheck.formatObj(item[0]);
					loanProInput.value = item[0].label;
					applyTerm.value = item[0].tnrOpt;
	
					//判断尾款比例是否显示、是否可编辑
					if (item[0].mtdTyp === '09' || item[0].mtdTyp === '06' && item[0].mtdClass === '02') {
						$('#defPct').parent().show();
						defPct.value = item[0].defPct * 100;
						counterParam.defPct = item[0].defPct;
					} else {
						$('#defPct').parent().hide();
						defPct.value = '';
						counterParam.defPct = '';
					}
					list.loanProInfo = item[0];
					list.minPct = item[0].minPct;
					list.maxPct = item[0].maxPct;
					counterParam.loanType = item[0].typSeq;
					counterParam.mtdTyp = item[0].mtdTyp;
					counterParam.mtdClass = item[0].mtdClass;
	
					downPayRatio.value = '';
					downPayAmount.value = '';
					loanAmount.value = '';
					exeRate.value = '';
	            },
	            title: '请选择贷款产品',
	            defaultValue:[getArrVal.indSeq],
	            id:'loanProInput'
	        });
		});
		defPct.addEventListener('keyup', function () {
			mCheck.checknum(this);
		});
		defPct.addEventListener('blur', function () {
			if (defPct.value == '') {
				return;
			}
			if (list.minPct != '' && list.maxPct != '') {
				if (Number(this.value) > Number(list.maxPct * 100) || Number(this.value) < Number(list.minPct * 100)) {
					mCheck.alert('\u5C3E\u6B3E\u6BD4\u4F8B\u5728' + list.minPct * 100 + '%-' + list.maxPct * 100 + '%\u4E4B\u95F4');
					this.value = '';
					counterParam.defPct = '';
					return;
				}
			}
			if (list.minPct != '' && list.maxPct == '') {
				if (Number(this.value) < Number(list.minPct * 100)) {
					mCheck.alert('\u5C3E\u6B3E\u6BD4\u4F8B\u8981\u5927\u4E8E' + list.minPct * 100 + '%');
					this.value = '';
					counterParam.defPct = '';
					return;
				}
			}
			if (list.minPct == '' && list.maxPct != '') {
				if (Number(this.value) > Number(list.maxPct * 100)) {
					mCheck.alert('\u5C3E\u6B3E\u6BD4\u4F8B\u8981\u5C0F\u4E8E' + list.maxPct * 100 + '%');
					this.value = '';
					counterParam.defPct = '';
					return;
				}
			}
			counterParam.defPct = parseFloat(this.value / 100).toFixed(2);
			this.value = parseFloat(this.value).toFixed(2);
		});

		/*购车总价失去焦点事件*/
		totalPrice.addEventListener('blur', function () {
			downPayRatio.value = '';
			downPayAmount.value = '';
			loanAmount.value = '';
			exeRate.value = '';

			amountParam.totalPrice = this.value;
			counterParam.proPurAmt = this.value;
			this.value = mCheck.addSeparator(totalPrice.value);
		});

		/*选择计算方式*/
		$("#calMethod").parent().on('click', function () {
			var getArrVal=mData.changePro(CAL_METHOD,'calMethod');
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	            	if (calMethod.value === item[0].label) {
						return;
					}
					downPayRatio.value = '';
					downPayAmount.value = '';
					loanAmount.value = '';
					exeRate.value = '';
	
					calMethod.value = item[0].label;
					amountParam.calMode = item[0].value;
	
					if (item[0].value === '01') {
						loanAmount.placeholder = '';
						loanAmount.readOnly = true;
						downPayRatio.placeholder = '请输入';
						downPayRatio.readOnly = false;
					}
					if (item[0].value === '02') {
						downPayRatio.placeholder = '';
						downPayRatio.readOnly = true;
						loanAmount.placeholder = '请输入';
						loanAmount.readOnly = false;
					}
	            },
	            title: '请选择计算方式',
	            defaultValue:[getArrVal.indSeq],
	            id:'calMethod'
	        });
		});

		/*首付比例失去焦点事件*/
		downPayRatio.addEventListener('blur', function () {
			//如果计算方式为01
			if (amountParam.calMode === '01') {
				amountParam.fstPct = this.value / 100;
				mData.cfLoanAmt(amountParam).then(function (data) {
					downPayRatio.value = data.fstPct * 100;
					downPayAmount.value = mCheck.addSeparator(data.fstPay);
					loanAmount.value = mCheck.addSeparator(data.applyAmt);

					counterParam.applyAmt = data.applyAmt;
					counterParam.fstPct = data.fstPct;
					mData.getLoanInf(list.loanProInfo.typSeq, counterParam.applyAmt).then(function (data) {
						if (data.priceIntRat.indexOf('.') == 0) {
							data.priceIntRat = '0' + data.priceIntRat;
						}
						exeRate.value = (data.priceIntRat * 100).toFixed(4);
					});
				});
			}
		});

		/*贷款金额失去焦点事件*/
		loanAmount.addEventListener('blur', function () {
			//如果计算方式为02
			if (amountParam.calMode === '02') {
				amountParam.applyAmt = this.value;
				mData.cfLoanAmt(amountParam).then(function (data) {
					downPayRatio.value = data.fstPct * 100;
					downPayAmount.value = mCheck.addSeparator(data.fstPay);
					loanAmount.value = mCheck.addSeparator(data.applyAmt);

					counterParam.applyAmt = data.applyAmt;
					counterParam.fstPct = data.fstPct;
					mData.getLoanInf(list.loanProInfo.typSeq, counterParam.applyAmt).then(function (data) {
						if (data.priceIntRat.indexOf('.') == 0) {
							data.priceIntRat = '0' + data.priceIntRat;
						}
						exeRate.value = (data.priceIntRat * 100).toFixed(4);
					});
				});
			}
		});

		trial.addEventListener("tap", function () {
			document.activeElement.blur();
			if (loanProInput.value === '') {
				plus.nativeUI.toast('请选择贷款产品');
				return;
			}
			if (totalPrice.value === '') {
				plus.nativeUI.toast('请输入购车总价');
				return;
			}

			if (counterParam.defPct != '') {
				if (!mCheck.checkDefPct(list.loanProInfo.minPct, list.loanProInfo.maxPct, counterParam.defPct)) {
					return;
				}
			}
			if (downPayRatio.value === '') {
				plus.nativeUI.toast('请输入首付比例');
				return;
			}
			if (!mCheck.checkDownPay(list.loanProInfo.fstPct, list.loanProInfo.maxFstPct, counterParam.fstPct)) {
				return;
			}
			if (loanAmount.value === '') {
				plus.nativeUI.toast('请输入贷款金额');
				return;
			}
			if (counterParam.mtdTyp === '09' || counterParam.mtdTyp === '06' && counterParam.mtdClass === '02') {
				if (defPct.value == '') {
					plus.nativeUI.toast('请输入尾款比例');
					return;
				}
			}
			mBank.openWindowByLoad('calculatorDetail.html', 'calculatorDetail', 'slide-in-right', { counterParam: counterParam });
		});
	});
});