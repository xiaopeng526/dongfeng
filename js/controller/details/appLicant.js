'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	var applCde = localStorage.getItem('applCde');
	mBank.addVconsole();
	var list = { //页面暂存数据
		'listId': 0, //判断页面显示的是哪个申请人的信息，默认是借款人，0-借款人，1-共借人，2-保证人
		'inputColl': document.getElementsByClassName('item-input'),
		'personColl': document.getElementsByClassName('content')
	};

	var getValueFun = function getValueFun(inputColl, applType, data) {
		if (applType != '') {
			inputColl['relshipown' + applType].value = mCheck.formatData(data.apptRelation, RELATION);
		} else {
//			inputColl['homeAddressdet' + applType].value = data.liveAddr;
//			inputColl['homeAddressdetnum' + applType].value = data.liveAddrNo;
//			inputColl['homeAddress' + applType].value = mCheck.formatCity(data.liveProvince + ',' + data.liveCity + ',' + data.liveArea, CITY_DATA);
			inputColl['domiPlace' + applType].value = mCheck.formatCity(data.regProvince + ',' + data.regCity + ',' + data.regArea, CITY_DATA);
		}
		inputColl['idNumber' + applType].value = data.certNo;
		inputColl['custName' + applType].value = data.custName;
		if (data.sex == '0') {
			inputColl['indivSex' + applType].value = '男';
		} else if (data.sex == '1') {
			inputColl['indivSex' + applType].value = '女';
		} else {
			inputColl['indivSex' + applType].value = '';
		}
		inputColl['apptStartDate' + applType].value = mCheck.timeFormat(data.Birth);
		if (data.idIsPermanent == 'Y') {
			$('#idDate' + applType).parent().hide();
			$('#isOrNot' + applType).find('.yes').addClass('selected').siblings('span').removeClass('selected');
		} else {
			$('#isOrNot' + applType).find('.no').addClass('selected').siblings('span').removeClass('selected');
		}
		inputColl['idStart' + applType].value = mCheck.timeFormat(data.idStartDt);
		inputColl['idDate' + applType].value = mCheck.timeFormat(data.idEndDt);
		inputColl['mobile' + applType].value = data.mobileNo;
		inputColl['education' + applType].value = mCheck.formatData(data.education, EDU_TYP);
		inputColl['married' + applType].value = mCheck.formatData(data.marriage, MARR_STS);
		inputColl['idType' + applType].value = mCheck.formatData(data.idtype, CARD_TYPE);
		inputColl['nationality' + applType].value = mCheck.formatData(data.nationalTyp, COUNTRY);
		//住宅信息
		inputColl['housing' + applType].value = mCheck.formatData(data.liveInfo, LIVE_INFO);

		//单位信息
		inputColl['workNature' + applType].value = mCheck.formatData(data.worknature, POSITION_OPT);
		if (data.worknature == '40' || data.worknature == '50') {
			$('#workNature' + applType).parent().nextAll().find('.item-title').removeClass('must-input');
		} else {
			$('#workNature' + applType).parent().nextAll().find('.item-title').not('.no-must').addClass('must-input');
		}
		inputColl['companyName' + applType].value = data.companyname;
		inputColl['companyNature' + applType].value = mCheck.formatData(data.companynature, INDIV_EMP_TYP);
		inputColl['industry' + applType].value = mCheck.formatData(data.industry, EMP_INDUSTRY);
		inputColl['workName' + applType].value = mCheck.formatData(data.position, POSITION);
	};
	//页签切换点击事件
	mui('#appTab').on('tap', '.app-tab-item', function () {
		document.activeElement.blur();
		//const items = [...document.getElementsByClassName('app-tab-item')];
		var items = [].slice.call(document.getElementsByClassName('app-tab-item'));
		if (items.indexOf(this) === list.listId) {
			return;
		}
		list.listId = items.indexOf(this);
		$('.app-tab-bg')[0].style.left = list.listId * 33.3 + '%';
		$('.content').not($('.content')[list.listId]).each(function () {
			$(this).hide();
		});
		$('.content')[list.listId].style.display = 'block';
	});

	var queryDealerAppLoanApptInfo = function queryDealerAppLoanApptInfo(applCde) {
		var applType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
		var aprFlag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '01';

		var url = mBank.getApiURL() + 'queryDealerAppLoanApptInfo.do';
		var param = { applCde: applCde, aprFlag: aprFlag };
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				mCheck.formatObj(data);
				//				data.idtype = '20';
				if (data.idIsPermanent == '') {
					data.idIsPermanent = 'N';
				}
				//				data.nationalTyp = 'CHN';
				getValueFun(list.inputColl, applType, data);
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
		//查询借款人信息
		queryDealerAppLoanApptInfo(applCde, '', '01').then(function (data) {},function(err){
			mCheck.callPortFailed(err.ec,err.em,"#waitingBox");
		});
		//查询共借人信息
		queryDealerAppLoanApptInfo(applCde, 'Com', '02').then(function (data) {
			if (data.aprFlag == '02') {
				$('#reduceHandleCom').addClass('reduce').siblings('span').removeClass('add');
				$('#commonBox').show();
			} else {
				$('#addHandleCom').addClass('add').siblings('span').removeClass('reduce');
				$('#commonBox').hide();
			}
		},function(err){
			mCheck.callPortFailed(err.ec,err.em,"#waitingBox");
		});

		//查询担保人信息
		queryDealerAppLoanApptInfo(applCde, 'Ass', '03').then(function (data) {
			if (data.aprFlag == '03') {
				$('#reduceHandleAss').addClass('reduce').siblings('span').removeClass('add');
				$('#assureBox').show();
			} else {
				$('#addHandleAss').addClass('add').siblings('span').removeClass('reduce');
				$('#assureBox').hide();
			}
		},function(err){
			mCheck.callPortFailed(err.ec,err.em,"#waitingBox");
		});

		back.addEventListener('tap', function () {
			mui.back();
		});
		var loanPre = plus.webview.getWebviewById("loanPre2");
		iconBack.addEventListener('tap', function () {
			plus.webview.hide(loanPre);
			plus.webview.close(loanPre);
			setTimeout(function () {
				plus.webview.hide(self.id);
				plus.webview.close(self.id);
			}, 500);
		});
	});
});