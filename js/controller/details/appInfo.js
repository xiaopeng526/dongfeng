'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	var applCde = localStorage.getItem('applCde');
	mBank.addVconsole();
	var list = { //页面暂存数据
		'canClick': true, //控制按钮重复点击
		'listId': 0, //判断页面显示的是哪个申请人的信息，默认是借款人，0-借款人，1-共借人，2-保证人，3-联系人
		'inputColl': document.getElementsByClassName('item-input')
	};
	var mainParam = { //借款人参数
		'temp': '0',
		'applCde': '',
		'idtype': '20',
		'idNo': '',
		'idIsPermanent': 'N',
		'isTemporary': 'N', //是否临时身份证
		'idStartDt': '',
		'endDate': '',
		'custName': '',
		'indivSex': '',
		'indivMarital': '',
		'Birth': '',
		'mobilePhone': '',
		'mssInd': '',
		'indivFmlyTel': '',
		'indivEdu': '',
		'liveIsReg': 'N',
		'domicile': '',
		'liveInfo': '',
		'liveAddr': '',
		'liveAddrNo': '',
		'pptyAddr': '',
		'positionOpt': '',
		'indivMthInc': '',
		'indivEmpName': '',
		'indivBranch': '',
		'marriage': '',
		'companynature': '',
		'indivEmpYrs': '',
		'belongsIndus': '',
		'woekAddress': '',
		'indivEmpTel': '',
		'Area': 'CHN'
	};
	var commonParam = Object.assign({ 'apptRelation': '', 'opTyp': '0' }, mainParam);
	var assureParam = Object.assign({ 'apptRelation': '', 'opTyp': '1' }, mainParam);
	var concatParam = {
		'applCde': '',
		'temp': '0',
		'iCarRelList.custName': [],
		'iCarRelList.apptRelation': [],
		'iCarRelList.idtype': [],
		'iCarRelList.idNo': [],
		'iCarRelList.mobilePhone': [],
		'iCarRelList.indivFmlyTel': [],
		'iCarRelList.liveAddr': [],
		'iCarRelList.seq': []
	};

	//页签切换点击事件
	mui('#appTab').on('tap', '.app-tab-item', function () {
		document.activeElement.blur();
		//		const items = [...document.getElementsByClassName('app-tab-item')];
		var items = [].slice.call(document.getElementsByClassName('app-tab-item'));
		if (items.indexOf(this) === list.listId) {
			return;
		}
		list.listId = items.indexOf(this);
		$('.app-tab-bg')[0].style.left = list.listId * 25 + '%';
		$('.content').not($('.content')[list.listId]).each(function () {
			$(this).hide();
		});
		$('.content')[list.listId].style.display = 'block';
	});
	var getValueFun = function getValueFun(inputColl, applType, data) {
		
		if (applType != '') {
			inputColl['relshipown' + applType].value = mCheck.formatData(data.apptRelation, RELATION);
		}
		inputColl['idNumber' + applType].value = data.idNo;
		inputColl['custName' + applType].value = data.custName;
		if (data.indivSex == '0') {
			inputColl['indivSex' + applType].value = '男';
		} else if (data.indivSex == '1') {
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
		inputColl['idDate' + applType].value = mCheck.timeFormat(data.endDate);
		var mobileArr = data.mobilePhone.split(',');
		inputColl['mobile' + applType].value = mobileArr[0];
		if (applType == '') {
			if (mobileArr[1]) {
				$('#mobile2').parent().show();
				mobile2.value = mobileArr[1];
			} else {
				$('#mobile2').parent().hide();
				mobile2.value = '';
			}
		}
		inputColl['homePhone' + applType].value = data.indivFmlyTel;
		inputColl['education' + applType].value = mCheck.formatData(data.indivEdu, EDU_TYP);
		inputColl['married' + applType].value = mCheck.formatData(data.indivMarital, MARR_STS);
		inputColl['idType' + applType].value = mCheck.formatData(data.idtype, CARD_TYPE);
		inputColl['nationality' + applType].value = mCheck.formatData(data.Area, COUNTRY);
		//住宅信息
		inputColl['housing' + applType].value = mCheck.formatData(data.liveInfo, LIVE_INFO);
		if (data.liveInfo == '04' || data.liveInfo == '05') {
			$('#selfAddressBox' + applType).show();
		} else {
			$('#selfAddressBox' + applType).hide();
		}
		if (data.liveAddr != '') {
			var liveArr = data.liveAddr.split(',');
			inputColl['homeAddress' + applType].value = mCheck.formatCity(liveArr[0] + ',' + liveArr[1] + ',' + liveArr[2], CITY_DATA);
			if (liveArr[3]) {
				inputColl['homeAddressdet' + applType].value = liveArr[3];
			}
		} else {
			inputColl['homeAddress' + applType].value = '';
			inputColl['homeAddressdet' + applType].value = '';
		}
		inputColl['homeAddressdetnum' + applType].value = data.liveAddrNo;
		if (data.liveIsReg == 'Y') {
			$('#isDomiAddress' + applType).find('.yes').addClass('selected').siblings('span').removeClass('selected');
			$('#domiAddress' + applType).parent().hide();
			$('#domiAddressdet' + applType).parent().hide();
		} else {
			$('#isDomiAddress' + applType).find('.no').addClass('selected').siblings('span').removeClass('selected');
			$('#domiAddress' + applType).parent().show();
			$('#domiAddressdet' + applType).parent().show();
		}

		if (data.domicile != '') {
			var domiArr = data.domicile.split(',');
			inputColl['domiAddress' + applType].value = mCheck.formatCity(domiArr[0] + ',' + domiArr[1] + ',' + domiArr[2], CITY_DATA);
			if (domiArr[3]) {
				inputColl['domiAddressdet' + applType].value = domiArr[3];
			}
		} else {
			inputColl['domiAddress' + applType].value = '';
			inputColl['domiAddressdet' + applType].value = '';
		}

		if (data.pptyLive == 'Y') {
			$('#isSelfAddress' + applType).find('.yes').addClass('selected').siblings('span').removeClass('selected');
			$('#selfAddress' + applType).parent().hide();
			$('#selfAddressdet' + applType).parent().hide();
		} else {
			$('#isSelfAddress' + applType).find('.no').addClass('selected').siblings('span').removeClass('selected');
			$('#selfAddress' + applType).parent().show();
			$('#selfAddressdet' + applType).parent().show();
		}

		if (data.pptyAddr != '') {
			var selfArr = data.pptyAddr.split(',');
			inputColl['selfAddress' + applType].value = mCheck.formatCity(selfArr[0] + ',' + selfArr[1] + ',' + selfArr[2], CITY_DATA);
			if (selfArr[3]) {
				inputColl['selfAddressdet' + applType].value = selfArr[3];
			}
		} else {
			inputColl['selfAddress' + applType].value = '';
			inputColl['selfAddressdet' + applType].value = '';
		}

		//单位信息
		inputColl['workNature' + applType].value = mCheck.formatData(data.positionOpt, POSITION_OPT);
		if (data.positionOpt == '40' || data.positionOpt == '50') {
			$('#workNature' + applType).parent().nextAll().find('.item-title').removeClass('must-input');
		} else {
			$('#workNature' + applType).parent().nextAll().find('.item-title').not('.no-must').addClass('must-input');
		}
		if (data.indivMthInc == '') {
			inputColl['monthlyIn' + applType].value = '';
		} else {
			inputColl['monthlyIn' + applType].value = mCheck.addSeparator(data.indivMthInc);
		}
		inputColl['companyName' + applType].value = data.indivEmpName;
		inputColl['department' + applType].value = data.indivBranch;
		inputColl['workAge' + applType].value = data.indivEmpYrs;
		inputColl['companyNature' + applType].value = mCheck.formatData(data.companynature, INDIV_EMP_TYP);
		inputColl['industry' + applType].value = mCheck.formatData(data.belongsIndus, EMP_INDUSTRY);
		inputColl['workName' + applType].value = mCheck.formatData(data.marriage, POSITION);
		inputColl['officePhone' + applType].value = data.indivEmpTel;
		if (data.woekAddress != '') {
			var woekArr = data.woekAddress.split(',');
			inputColl['companyAddress' + applType].value = mCheck.formatCity(woekArr[0] + ',' + woekArr[1] + ',' + woekArr[2], CITY_DATA);
			if (woekArr[3]) {
				inputColl['companyAddressdet' + applType].value = woekArr[3];
			}
		} else {
			inputColl['companyAddress' + applType].value = '';
			inputColl['companyAddressdet' + applType].value = '';
		}
	};
	var cfapplQuery = function cfapplQuery(applCde, interPort) {
		var applType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
		var opTyp = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
		//查询申请人信息接口
		var url = '' + mBank.getApiURL() + interPort + '.do';
		var param = { 'applCde': applCde, 'opTyp': opTyp };
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				mCheck.formatObj(data);
				//				data.idtype = '20';
				if (data.idIsPermanent == '') {
					data.idIsPermanent = 'N';
				}
				data.liveIsReg = 'N';
				data.isTemporary = 'N';
				//				data.Area = 'CHN';
				getValueFun(list.inputColl, applType, data);
				resolve(data);
			}, function(err){
				reject(err);
			});
		});
	};

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({ "popGesture": "none" }); //窗口无侧滑返回功能
		mBank.isImmersed();
		commonParam.applCde = applCde;
		assureParam.applCde = applCde;
		concatParam.applCde = applCde;
		//查询借款人信息
		cfapplQuery(applCde, 'cfapplBasicQuery').then(function (data) {
			mCheck.assignObj(mainParam, data);
			if (data.mssInd == 'Y') {
				$('#isMss').addClass('mssColor');
			} else {
				$('#isMss').removeClass('mssColor');
			}
		},function(err){
			mCheck.callPortFailed(err.ec,err.em,"#waitingBox");
		});
		//查询共借人信息
		cfapplQuery(applCde, 'cfapplOtherQuery', 'Com', '0').then(function (data) {
			if (data.opTyp == '0') {
				$('#reduceHandleCom').addClass('reduce').siblings('span').removeClass('add');
				$('#commonBox').show();
			} else {
				$('#addHandleCom').addClass('add').siblings('span').removeClass('reduce');
				$('#commonPersonCon').find('input').map(function (index, item) {
					item.disabled = true;
				});
				$('#commonBox').hide();
			}
			mCheck.assignObj(commonParam, data);
		},function(err){
			mCheck.callPortFailed(err.ec,err.em,"#waitingBox");
		});

		//查询担保人信息
		cfapplQuery(applCde, 'cfapplOtherQuery', 'Ass', '1').then(function (data) {
			if (data.opTyp == '1') {
				$('#reduceHandleAss').addClass('reduce').siblings('span').removeClass('add');
				$('#assureBox').show();
			} else {
				$('#addHandleAss').addClass('add').siblings('span').removeClass('reduce');
				$('#assurePersonCon').find('input').map(function (index, item) {
					item.disabled = true;
				});
				$('#assureBox').hide();
			}
			mCheck.assignObj(assureParam, data);
		},function(err){
			mCheck.callPortFailed(err.ec,err.em,"#waitingBox");
		});

		//查询联系人信息
		var cfRelQuery = function cfRelQuery(applCde) {
			var url = mBank.getApiURL() + 'cfapplRelQuery.do';
			var param = { applCde: applCde };
			return new Promise(function (resolve, reject) {
				mBank.apiSend('get', url, param, function (data) {
					data.iCarRelList.forEach(function (item) {
						mCheck.formatObj(item);
					});
					var iCarRelList = data.iCarRelList;
					resolve(iCarRelList);
				}, function(err){
					reject(err);
				});
			});
		};
		cfRelQuery(applCde).then(function (iCarRelList) {
			mCheck.formateData(iCarRelList, 'iCarRelList', concatParam);
			if (iCarRelList.length == 1) {
				$('#addHandleCat').addClass('add').siblings('span').removeClass('reduce');
				$('#personCat').find('.df-list')[1].style.display = 'none';
			} else if (iCarRelList.length == 2 || iCarRelList.length == 3) {
				if (iCarRelList.length == 2) {
					$('#personCat').find('.df-list')[1].style.display = 'block';
					$('#addHandleCat').addClass('add');
					$('#reduceHandleCat').addClass('reduce');
				} else if (iCarRelList.length == 3) {
					$('#personCat').find('.df-list')[2].style.display = 'block';
					$('#reduceHandleCat').addClass('reduce').siblings('span').removeClass('add');
				}
			}
			for (var i = 0; i < iCarRelList.length; i++) {
				list.inputColl['relshipownCat' + i].value = mCheck.formatData(iCarRelList[i].apptRelation, RELATION);
				list.inputColl['custNameCat' + i].value = iCarRelList[i].custName;
				list.inputColl['idTypeCat' + i].value = mCheck.formatData(iCarRelList[i].idtype, CARD_TYPE);
				list.inputColl['idNumberCat' + i].value = iCarRelList[i].idNo;
				list.inputColl['mobileCat' + i].value = iCarRelList[i].mobilePhone;
				list.inputColl['homePhoneCat' + i].value = iCarRelList[i].indivFmlyTel;
				if (iCarRelList[i].liveAddr == '') {
					list.inputColl['homeAddressCat' + i].value = '';
					list.inputColl['homeAddressdetCat' + i].value = '';
				} else {
					var liveArr = iCarRelList[i].liveAddr.split(',');
					list.inputColl['homeAddressCat' + i].value = mCheck.formatCity(liveArr[0] + ',' + liveArr[1] + ',' + liveArr[2], CITY_DATA);
					if (liveArr[3]) {
						list.inputColl['homeAddressdetCat' + i].value = liveArr[3];
					}
				}
			}
		},function(err){
			mCheck.callPortFailed(err.ec,err.em,"#waitingBox");
		});
		next.addEventListener('tap', function () {
			mBank.openWindowByLoad('./imageList.html', 'imageList2', 'slide-in-right');
		});

		var loanInfo = plus.webview.getWebviewById("loanInfo2");
		var appInfo = plus.webview.getWebviewById("appInfo2");
		var imageList = plus.webview.getWebviewById('imageList2');
		var imageInfo = plus.webview.getWebviewById('imageInfo2');
		var arr = [loanInfo, appInfo, imageList, imageInfo];
		iconBack.addEventListener('tap', function () {
			for (var i = 0; i < arr.length; i++) {
				if (self != arr[i]) {
					plus.webview.hide(arr[i]);
					plus.webview.close(arr[i]);
				}
			}
			setTimeout(function () {
				plus.webview.hide(self.id);
				plus.webview.close(self.id);
			}, 500);
		});
	});
});