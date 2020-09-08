'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var sysTime = '';
	var mainAge = '';
	var comAge = '';
	var assAge = '';
	var isisCan = false;

	/*计算年龄*/
	function jsGetAge(strBirthday) {
		var returnAge = 0;
		if (strBirthday != "") {
			var strBirthdayArr = strBirthday.split("-");
			var birthYear = strBirthdayArr[0];
			var birthMonth = strBirthdayArr[1];
			var birthDay = strBirthdayArr[2];
			var nowYear = sysTime.substr(0, 4);
			var nowMonth = sysTime.substr(4, 2);
			var nowDay = sysTime.substr(6, 2);
			if (nowYear == birthYear) {
				return returnAge = 0; //同年 则为0岁
			} else {
				var ageDiff = nowYear - birthYear; //年之差
				if (ageDiff > 0) {
					if (nowMonth == birthMonth) {
						var dayDiff = nowDay - birthDay; //日之差
						if (dayDiff < 0) {
							returnAge = ageDiff - 1;
						} else {
							returnAge = ageDiff;
						}
					} else {
						var monthDiff = nowMonth - birthMonth; //月之差
						if (monthDiff < 0) {
							returnAge = ageDiff - 1;
						} else {
							returnAge = ageDiff;
						}
					}
				} else {
					returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天}
				}
				return returnAge; //返回周岁年龄
			}
		}
	}

	/**
  * 姓名格式校验
  */
	var custNamereg = new RegExp(/^[\u4e00-\u9fa5\u00b7\. a-zA-Z]+$/);
	var list = { //页面暂存数据
		'canClick': true, //控制按钮重复点击
		'listId': 0, //判断页面显示的是哪个申请人的信息，默认是借款人，0-借款人，1-共借人，2-保证人，3-联系人
		'inputColl': document.getElementsByClassName('item-input'),
		'canClickCom': false,
		'canClickAss': false
	};
	var applCde = localStorage.getItem('applCde');
	var typeFlag = localStorage.getItem('typeFlag');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	var carType = localStorage.getItem('carType');
	var noGua = 'N'; //是否免担保，默认为否
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
		'mssInd': 'Y',
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
		'Area': 'CHN',
		'pptyLive': 'N'
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
		//ios10不兼容
		//const items = [...document.getElementsByClassName('app-tab-item')];
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
				data.idtype = '20';
				if (data.idIsPermanent == '') {
					data.idIsPermanent = 'N';
				}
				if (data.liveIsReg == '') {
					data.liveIsReg = 'N';
				}
				if (data.isTemporary == '') {
					data.isTemporary = 'N';
				}
				if (data.pptyLive == '') {
					data.pptyLive = 'N';
				}
				data.Area = 'CHN';
//				data.pptyLive = 'N';
				getValueFun(list.inputColl, applType, data);
				resolve(data);
			}, function (err) {
				reject(err);
			});
		});
	};

	//调用保存申请人方法
	var cfapplInfo = function cfapplInfo(param, interPort) {
		var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
		//保存申请人接口
		var url = '' + mBank.getApiURL() + interPort + '.do';
		return new Promise(function (resolve, reject) {
			if (type != '' && $('#addHandle' + type).hasClass('add')) {
				resolve('没有该申请人');
			} else {
				mBank.apiSend('post', url, param, function (data) {
					resolve(data);
				}, function (err) {
					reject(err);
				});
			}
		});
	};

	//保存联系人方法
	var cfRelInfo = function cfRelInfo(param, interPort) {
		//保存申请人接口
		var url = '' + mBank.getApiURL() + interPort + '.do';
		return new Promise(function (resolve, reject) {
			mBank.apiSend('post', url, param, function (data) {
				resolve(data);
			},function(err){
				reject(err);
			});
		});
	};

	//点击下一步的时候，验证函数
	var checkFun = function checkFun() {};

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			'softinputMode': 'adjustResize'
		});
		mBank.isImmersed();
		getSysTime();
		function getSysTime() {
			var url = mBank.getApiURL() + 'getSysTime.do';
			var param = {};
			mBank.apiSend("get", url, param, function (data) {
				sysTime = data.sysTime;
			}, function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			}, true, false);
		}

		queryMortgage();
		function queryMortgage() {
			var url = mBank.getApiURL() + 'queryMortgage.do';
			var param = {
				'applCde': applCde
			};
			mBank.apiSend('get', url, param, function (data) {
				if (data.mortgage == 'Y' && data.noGuarantee == 'N') {
					//必须录入担保人
					noGua = 'N'; //免担保为否	
				} else {
					noGua = 'Y';
				}
			}, function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			}, true);
		}

		commonParam.applCde = applCde;
		assureParam.applCde = applCde;
		concatParam.applCde = applCde;
		//查询借款人信息
		$('#waitingBox').show(); //为了在页面查询方法调用完成之前不让点击保存下一步按钮
		cfapplQuery(applCde, 'cfapplBasicQuery').then(function (data) {
			isisCan = true;
			$('#waitingBox').hide();
			mCheck.assignObj(mainParam, data);
			if (data.mssInd == 'Y' || data.mssInd == '') {
				$('#isMss').addClass('mssColor');
			} else if (data.mssInd == 'N') {
				$('#isMss').removeClass('mssColor');
			}
			mainAge = jsGetAge(apptStartDate.value);
		}, function (err) {
			isisCan = true;
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});
		//查询共借人信息
		cfapplQuery(applCde, 'cfapplOtherQuery', 'Com', '0').then(function (data) {
			if (data.opTyp == '0') {
				$('#reduceHandleCom').addClass('reduce').siblings('span').removeClass('add');
				$('#commonBox').show();
				list.canClickCom = true;
				$('#commonPersonCon').find('input').map(function (index, item) {
					item.disabled = false;
				});
			} else {
				$('#addHandleCom').addClass('add').siblings('span').removeClass('reduce');
				$('#commonPersonCon').find('input').map(function (index, item) {
					item.disabled = true;
				});
				list.canClickCom = false;
				$('#commonBox').hide();
			}
			mCheck.assignObj(commonParam, data);
			commonParam.opTyp = '0';
			comAge = jsGetAge(apptStartDateCom.value);
		});

		//查询担保人信息
		cfapplQuery(applCde, 'cfapplOtherQuery', 'Ass', '1').then(function (data) {
			if (data.opTyp == '1') {
				$('#reduceHandleAss').addClass('reduce').siblings('span').removeClass('add');
				$('#assureBox').show();
				list.canClickAss = true;
				$('#assurePersonCon').find('input').map(function (index, item) {
					item.disabled = false;
				});
			} else {
				$('#addHandleAss').addClass('add').siblings('span').removeClass('reduce');
				$('#assurePersonCon').find('input').map(function (index, item) {
					item.disabled = true;
				});
				list.canClickAss = false;
				$('#assureBox').hide();
			}
			mCheck.assignObj(assureParam, data);
			assureParam.opTyp = '1';
			assAge = jsGetAge(apptStartDateAss.value);
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
					$('#personCat').find('.df-list')[1].style.display = 'block';
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
		});
		//添加联系人
		addHandleCat.addEventListener('tap', function () {
			document.activeElement.blur();
			if (!$(this).hasClass('add')) {
				return;
			}
			if ($(this).hasClass('add') && $('#reduceHandleCat').hasClass('reduce')) {
				$('#personCat').find('.df-list')[2].style.display = 'block';
				$(this).removeClass('add').siblings('span').addClass('reduce');
				return;
			}
			if ($(this).hasClass('add') && !$('#reduceHandleCat').hasClass('reduce')) {
				$('#personCat').find('.df-list')[1].style.display = 'block';
				$('#reduceHandleCat').addClass('reduce');
				return;
			}
		});
		//删除联系人
		reduceHandleCat.addEventListener('tap', function () {
			document.activeElement.blur();
			if (!$(this).hasClass('reduce')) {
				return;
			}
			if ($(this).hasClass('reduce') && $('#addHandleCat').hasClass('add')) {
				$('#personCat').find('.df-list')[1].style.display = 'none';
				$('#rel2').find('input').map(function (index, item) {
					item.value = '';
				});
				$(this).removeClass('reduce').siblings('span').addClass('add');
				concatParam['iCarRelList.custName'].splice(1, 1);
				concatParam['iCarRelList.apptRelation'].splice(1, 1);
				concatParam['iCarRelList.idtype'].splice(1, 1);
				concatParam['iCarRelList.idNo'].splice(1, 1);
				concatParam['iCarRelList.mobilePhone'].splice(1, 1);
				concatParam['iCarRelList.indivFmlyTel'].splice(1, 1);
				concatParam['iCarRelList.liveAddr'].splice(1, 1);
				concatParam['iCarRelList.seq'].splice(1, 1);
				return;
			}
			if ($(this).hasClass('reduce') && !$('#addHandleCat').hasClass('add')) {
				$('#personCat').find('.df-list')[2].style.display = 'none';
				$('#rel3').find('input').map(function (index, item) {
					item.value = '';
				});
				$('#addHandleCat').addClass('add');
				concatParam['iCarRelList.custName'].splice(2, 1);
				concatParam['iCarRelList.apptRelation'].splice(2, 1);
				concatParam['iCarRelList.idtype'].splice(2, 1);
				concatParam['iCarRelList.idNo'].splice(2, 1);
				concatParam['iCarRelList.mobilePhone'].splice(2, 1);
				concatParam['iCarRelList.indivFmlyTel'].splice(2, 1);
				concatParam['iCarRelList.liveAddr'].splice(2, 1);
				concatParam['iCarRelList.seq'].splice(2, 1);
				return;
			}
		});
		var selectRelFun = function selectRelFun(order, inputColl, param) {
			$(inputColl['relshipownCat' + order]).on('click', function () {
				var _this = this;
				var getArrVal=mData.changePro(RELATION,'relshipownCat' + order);
		        weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		                if (item[0].label == _this.value) {
							return;
						}
						_this.value = item[0].label;
						param['iCarRelList.apptRelation'][order] = item[0].value;
		            },
		            title: '请选择与借款人关系',
		            defaultValue:[getArrVal.indSeq],
		            id:'relshipownCat' + order
		        });
			});
			$(inputColl['idTypeCat' + order]).on('click', function () {
				var _this2 = this;
				var getArrVal=mData.changePro(CARD_TYPE,'idTypeCat' + order);
		        weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		                if (item[0].label == _this2.value) {
							return;
						}
						_this2.value = item[0].label;
						param['iCarRelList.idtype'][order] = item[0].value;
		            },
		            title: '请选择证件类型',
		            defaultValue:[getArrVal.indSeq],
		            id:'idTypeCat' + order
		        });
			});
			$(inputColl['homeAddressCat' + order]).on('click', function () {
				var _this3 = this;
				var getArrVal=mData.changePro(CITY_DATA,'homeAddressCat' + order,3);
				var defPCA=getArrVal.indSeq.split(',');
				weui.picker(getArrVal.proVal, {
			       onConfirm: function(item) {
						_this3.value = item[0].label + ' ' + item[1].label + ' ' + item[2].label;
						param['iCarRelList.liveAddr'][order] = item[0].value + ',' + item[1].value + ',' + item[2].value + ',' + (inputColl['homeAddressdetCat' + order].value || '');
			       },
		           title: '请选择区域',
		           defaultValue:[defPCA[0],defPCA[1],defPCA[2]],
		           id:'homeAddressCat' + order
		     	})
			});
			inputColl['homeAddressdetCat' + order].addEventListener('blur', function () {
				if (inputColl['homeAddressCat' + order].value != '') {
					var str = param['iCarRelList.liveAddr'][order];
					var arr = str.split(',');
					param['iCarRelList.liveAddr'][order] = arr[0] + ',' + arr[1] + ',' + arr[2] + ',' + this.value;
				}
			});
			inputColl['custNameCat' + order].addEventListener('blur', function () {
				if (!custNamereg.test(this.value)) {
					mCheck.alert('请输入正确的姓名');
					this.value = '';
					return false;
				}
				param['iCarRelList.custName'][order] = this.value;
			});
			inputColl['idNumberCat' + order].addEventListener('blur', function () {
				param['iCarRelList.idNo'][order] = this.value;
			});
			inputColl['mobileCat' + order].addEventListener('blur', function () {
				param['iCarRelList.mobilePhone'][order] = this.value;
			});
			inputColl['homePhoneCat' + order].addEventListener('blur', function () {
				param['iCarRelList.indivFmlyTel'][order] = this.value;
			});
		};

		selectRelFun(0, list.inputColl, concatParam);
		selectRelFun(1, list.inputColl, concatParam);
		selectRelFun(2, list.inputColl, concatParam);

		//借款人添加手机号
		addMobile.addEventListener('tap', function () {
			document.activeElement.blur();
			if ($('#mobile2').parent().is(':hidden')) {
				$('#mobile2').parent().show();
			}
		});
		//借款人删除手机号
		removeMobile.addEventListener('tap', function () {
			document.activeElement.blur();
			if ($('#mobile2').parent().is(':visible')) {
				$('#mobile2').parent().hide();
				mobile2.value = '';
				mainParam.mobilePhone = mobile.value;
			}
		});
		mobile2.addEventListener('keyup', function () {
			this.value = this.value.replace(/[^\d]/g, "");
		});
		mobile2.addEventListener('blur', function () {
			mainParam.mobilePhone = mobile.value + ',' + mobile2.value;
		});

		//借款人是否接收还款提醒短信
		isMss.addEventListener('tap', function () {
			document.activeElement.blur();
			if ($('#isMss').hasClass('mssColor')) {
				$('#isMss').removeClass('mssColor');
				mainParam.mssInd = 'N';
			} else {
				$('#isMss').addClass('mssColor');
				mainParam.mssInd = 'Y';
			}
		});
		window.addEventListener('idReverse', function (event) {
			var typ = event.detail.applTyp;
			var inputColl = list.inputColl;
			if (typ == 'Com') {
				if(event.detail.frontSrc.indexOf("data:image/jpeg;base64")==0 || event.detail.frontSrc.indexOf("data:image/png;base64")==0){
					commonParam.idNo = event.detail.idNo;
					commonParam.custName = event.detail.custName;
					commonParam.indivSex = event.detail.sex;
					commonParam.Birth = event.detail.Birth;
				}
				if(event.detail.reverSrc.indexOf("data:image/jpeg;base64")==0 ||event.detail.reverSrc.indexOf("data:image/png;base64")==0){
					if (!event.detail.endDate || event.detail.endDate.indexOf('长期') > 0 || event.detail.endDate.indexOf('永久') > 0 || event.detail.endDate.indexOf('长') > 0 || event.detail.endDate.indexOf('期') > 0) {
						commonParam.idIsPermanent = 'Y';
						commonParam.endDate = '';
						commonParam.idStartDt = event.detail.endDate.split("-")[0].replace(/\./g, "");
					} else {
						commonParam.idIsPermanent = 'N';
						commonParam.idStartDt = event.detail.endDate.split("-")[0].replace(/\./g, "");
						commonParam.endDate = event.detail.endDate.split("-")[1].replace(/\./g, "");
					}
				}else{
					if (event.detail.endDate==""){
						commonParam.idIsPermanent = 'N';
					}
				}
			} else {
				if(event.detail.frontSrc.indexOf("data:image/jpeg;base64")==0 || event.detail.frontSrc.indexOf("data:image/png;base64")==0){
					assureParam.idNo = event.detail.idNo;
					assureParam.custName = event.detail.custName;
					assureParam.indivSex = event.detail.sex;
					assureParam.Birth = event.detail.Birth;
				}
				if(event.detail.reverSrc.indexOf("data:image/jpeg;base64")==0 ||event.detail.reverSrc.indexOf("data:image/png;base64")==0){
					if (!event.detail.endDate || event.detail.endDate.indexOf('长期') > 0 || event.detail.endDate.indexOf('永久') > 0 || event.detail.endDate.indexOf('长') > 0 || event.detail.endDate.indexOf('期') > 0) {
						assureParam.idIsPermanent = 'Y';
						assureParam.idStartDt = event.detail.endDate.split("-")[0].replace(/\./g, "");
						assureParam.endDate = '';
					} else {
						assureParam.idIsPermanent = 'N';
						assureParam.idStartDt = event.detail.endDate.split("-")[0].replace(/\./g, "");
						assureParam.endDate = event.detail.endDate.split("-")[1].replace(/\./g, "");
					}
				}else{
					if (event.detail.endDate==""){
						assureParam.idIsPermanent = 'N';
					}
				}
			}
			if (typ == '') {
				mainAge = jsGetAge(inputColl['apptStartDate' + typ].value);
			} else if (typ == 'Com') {
				comAge = jsGetAge(inputColl['apptStartDate' + typ].value);
			} else if (typ == 'Ass') {
				assAge = jsGetAge(inputColl['apptStartDate' + typ].value);
			}
			if(event.detail.frontSrc.indexOf("data:image/jpeg;base64")==0 ||event.detail.frontSrc.indexOf("data:image/png;base64")==0){
				inputColl['idNumber' + typ].value = event.detail.idNo;
				inputColl['custName' + typ].value = event.detail.custName;
				inputColl['indivSex' + typ].value = event.detail.sex == '0' ? '男' : '女';
				inputColl['apptStartDate' + typ].value = mCheck.timeFormat(event.detail.Birth);
			}
			if(event.detail.reverSrc.indexOf("data:image/jpeg;base64")==0 ||event.detail.reverSrc.indexOf("data:image/png;base64")==0){
				if (!event.detail.endDate || event.detail.endDate.indexOf('长期') > 0 || event.detail.endDate.indexOf('永久') > 0 || event.detail.endDate.indexOf('长') > 0 || event.detail.endDate.indexOf('期') > 0) {
					inputColl['idStart' + typ].value = event.detail.endDate.split("-")[0].replace(/\./g, "-");
					$('#idDate' + typ).parent().hide();
					$('#isOrNot' + typ).find('.yes').addClass('selected').siblings('span').removeClass('selected');
				} else {
					$('#idStart' + typ).parent().show();
					$('#idDate' + typ).parent().show();
					inputColl['idStart' + typ].value = event.detail.endDate.split("-")[0].replace(/\./g, "-");
					inputColl['idDate' + typ].value = event.detail.endDate.split("-")[1].replace(/\./g, "-");
					$('#isOrNot' + typ).find('.no').addClass('selected').siblings('span').removeClass('selected');
				}
			}			
		});
		var selectAppFun = function selectAppFun() {
			var applTyp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
			var param = arguments[1];
			var inputColl = arguments[2];

			if (applTyp != '') {
				var deletePer = function deletePer(a, aprFlag, opTyp) {
					mData.deletePreLoanOtherAppt(applCde, aprFlag, '2').then(function (data) {
						cfapplQuery(applCde, 'cfapplOtherQuery', applTyp, opTyp).then(function (data) {
							if (applTyp == 'Com') {
								mCheck.assignObj(commonParam, data);
								$('#commonPersonCon').find('input').map(function (index, item) {
									item.disabled = true;
								});
								$('#commonBox').hide();
								commonParam.opTyp = '0';
							} else {
								mCheck.assignObj(assureParam, data);
								$('#assurePersonCon').find('input').map(function (index, item) {
									item.disabled = true;
								});
								$('#assureBox').hide();
								assureParam.opTyp = '1';
							}
							$(a).removeClass('reduce').siblings('span').addClass('add');
						});
					});
				};

				//共借人和保证人可以点击
				var cemera = document.getElementById('cemera' + applTyp);
				var addHandle = document.getElementById('addHandle' + applTyp);
				var reduceHandle = document.getElementById('reduceHandle' + applTyp);
				var _mobile = document.getElementById('mobile' + applTyp);
				$(inputColl['relshipown' + applTyp]).on('click', function () {
					var _this4 = this;
					document.activeElement.blur();
					var getArrVal=mData.changePro(RELATION,'relshipown' + applTyp);
			        weui.picker(getArrVal.proVal, {
			            onChange: function (item) {
			            },
			            onConfirm: function (item) {
			                if (item[0].label == _this4.value) {
								return;
							}
							_this4.value = item[0].label;
							param.apptRelation = item[0].value;
			            },
			            title: '请选择与借款人关系',
			            defaultValue:[getArrVal.indSeq],
			            id:'relshipown' + applTyp
			        });
				});
				cemera.parentNode.addEventListener('tap', function () {
					document.activeElement.blur();
					if (applTyp == 'Com') {
						if (!list.canClickCom) {
							return;
						}
					}
					if (applTyp == 'Ass') {
						if (!list.canClickAss) {
							return;
						}
					}
					if ($(addHandle).hasClass('add')) {
						return;
					}
					mBank.openWindowByLoad('../CommonPage/scanIdCard.html', 'scanIdCard', 'slide-in-right', {
						applTyp: applTyp, viewId: self.id
					});
				});

				addHandle.addEventListener('tap', function () {
					document.activeElement.blur();
					if (!$(this).hasClass('add')) {
						return;
					}
					$(this).removeClass('add').siblings('span').addClass('reduce');
					if (applTyp == 'Com') {

						$('#commonBox').show();
						$('#commonPersonCon').find('input').map(function (index, item) {
							item.disabled = false;
						});
						list.canClickCom = true;
						mobileCom.disabled = false;
					} else {
						$('#assureBox').show();
						$('#assurePersonCon').find('input').map(function (index, item) {
							item.disabled = false;
						});

						list.canClickAss = true;
						mobileAss.disabled = false;
					}
				});

				reduceHandle.addEventListener('tap', function () {
					var me = this;
					var aprFlag = void 0,
					    opTyp = void 0;
					var btnArray = ['否', '是'];
					document.activeElement.blur();
					if (!$(this).hasClass('reduce')) {
						return;
					}
					mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
						if(dat=='N'){
							return;
						}else{
							if (applTyp == 'Com') {
								var str = '';
								if (carType == '01') {
									str = '确定要删除共同借款人吗？如果您更换或删除共同借款人，本申请将自动转为人工办理，并可能被拒绝。';
								} else if (carType == '02' || carType == '03') {
									str = '确定要删除共同借款人吗？如果您更换或删除共同借款人，预审结论自动作废。';
								}
								mui.confirm(str, "提示", btnArray, function (e) {
									if (e.index == 1) {
										aprFlag = '02';
										opTyp = '0';
										deletePer(me, aprFlag, opTyp);
									} else {
										return;
									}
								}, 'div');
							} else if (applTyp == 'Ass') {
								if (noGua == 'N') {
									mCheck.alert('选择免抵押，且非免担保，须录入保证人');
									return;
								}
								mui.confirm('确定要删除保证人吗', "提示", btnArray, function (e) {
									if (e.index == 1) {
										aprFlag = '03';
										opTyp = '1';
										deletePer(me, aprFlag, opTyp);
									} else {
										return;
									}
								}, 'div');
							}
						}
					});
					
				});

				_mobile.addEventListener('blur', function () {
					if (applTyp == 'Com') {
						if (!list.canClickCom) {
							return;
						}
					}
					if (applTyp == 'Ass') {
						if (!list.canClickAss) {
							return;
						}
					}
					param.mobilePhone = this.value;
				});
			}
			$(inputColl['industry' + applTyp]).on('click', function () {
				var _this5 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(EMP_INDUSTRY,'industry' + applTyp);
		        weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		                _this5.value = item[0].label;
						param.belongsIndus = item[0].value;
		            },
		            title: '请选择所属行业',
		            defaultValue:[getArrVal.indSeq],
		            id:'industry' + applTyp
		        });
			});
			$(inputColl['workName' + applTyp]).on('click', function () {
				var _this6 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(POSITION,'workName' + applTyp);
		        weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		                _this6.value = item[0].label;
						param.marriage = item[0].value;
		            },
		            title: '请选择职务',
		            defaultValue:[getArrVal.indSeq],
		            id:'workName' + applTyp
		        });
			});
			$(inputColl['workNature' + applTyp]).on('click', function () {
				var _this7 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(POSITION_OPT,'workNature' + applTyp);
		        weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		                _this7.value = item[0].label;
						param.positionOpt = item[0].value;
						$(_this7).attr('data-value', item[0].value);
						if ($(_this7).attr('data-value') == '40' || $(_this7).attr('data-value') == '50') {
							$(_this7).parent().nextAll().find('.item-title').removeClass('must-input');
						} else {
							$(_this7).parent().nextAll().find('.item-title').not('.no-must').addClass('must-input');
						}
		            },
		            title: '请选择工作性质',
		            defaultValue:[getArrVal.indSeq],
		            id:'workNature' + applTyp
		        });
			});
			$(inputColl['companyNature' + applTyp]).on('click', function () {
				var _this8 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(INDIV_EMP_TYP,'companyNature' + applTyp);
		        weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		                _this8.value = item[0].label;
						param.companynature = item[0].value;
		            },
		            title: '请选择现单位性质',
		            defaultValue:[getArrVal.indSeq],
		            id:'companyNature' + applTyp
		        });
			});
			inputColl['monthlyIn' + applTyp].addEventListener('keyup', function () {
				mCheck.checknum(this);
			});
			inputColl['monthlyIn' + applTyp].addEventListener('blur', function () {
				if (mCheck.removeSeparator(this.value) == param.indivMthInc) {
					return;
				}
				param.indivMthInc = mCheck.removeSeparator(this.value);
				this.value = mCheck.addSeparator(this.value);
			});
			//			inputColl['monthlyIn'+applTyp].addEventListener('blur', function(){
			//				
			//			})
			inputColl['companyName' + applTyp].addEventListener('blur', function () {
				param.indivEmpName = this.value;
			});
			inputColl['department' + applTyp].addEventListener('blur', function () {
				param.indivBranch = this.value;
			});
			inputColl['officePhone' + applTyp].addEventListener('blur', function () {
				param.indivEmpTel = this.value;
			});
			inputColl['workAge' + applTyp].addEventListener('blur', function () {
				param.indivEmpYrs = this.value;
			});
			inputColl['homePhone' + applTyp].addEventListener('blur', function () {
				param.indivFmlyTel = this.value;
			});

			$(inputColl['education' + applTyp]).on('click', function () {
				var _this9 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(EDU_TYP,'education' + applTyp);
		        weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		                if (item[0].label == _this9.value) {
							return;
						}
						_this9.value = item[0].label;
						param.indivEdu = item[0].value;
		            },
		            title: '请选择最高学历',
		            defaultValue:[getArrVal.indSeq],
		            id:'education' + applTyp
		        });
			});
			$(inputColl['married' + applTyp]).on('click', function () {
				var _this10 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(MARR_STS,'married' + applTyp);
		        weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		                if (item[0].label == _this10.value) {
							return;
						}
						_this10.value = item[0].label;
						param.indivMarital = item[0].value;
		            },
		            title: '请选择婚姻状况',
		            defaultValue:[getArrVal.indSeq],
		            id:'married' + applTyp
		        });
			});
			$(inputColl['housing' + applTyp]).on('click', function () {
				var _this11 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(LIVE_INFO,'housing' + applTyp);
		        weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		                if (item[0].label == _this11.value) {
							return;
						}
						_this11.value = item[0].label;
						param.liveInfo = item[0].value;
						//如果是租房，户籍地址不能等于现住房地址
						if (param.liveInfo == '03') {
							param.liveIsReg = 'N';
							$('#domiAddress' + applTyp).parent().show();
							$('#domiAddressdet' + applTyp).parent().show();
							$('#isDomiAddress' + applTyp).find('.no').addClass('selected').siblings('span').removeClass('selected');
							inputColl['domiAddress' + applTyp].value = '';
							inputColl['domiAddressdet' + applTyp].value = '';
							param.domicile = '';
						}
						//如果现住房情况是自置或按揭，则有自有房产地址,等于现住房地址
						if (param.liveInfo == '04' || param.liveInfo == '05') {
							$('#selfAddressBox' + applTyp).show();
							param.pptyLive = 'N';
							$('#isSelfAddress' + applTyp).find('.no').addClass('selected').siblings('span').removeClass('selected');
							$('#selfAddress' + applTyp).parent().show();
							$('#selfAddressdet' + applTyp).parent().show();
							inputColl['selfAddress' + applTyp].value = '';
							inputColl['selfAddressdet' + applTyp].value = '';
							param.pptyAddr = '';
						} else {
							$('#selfAddressBox' + applTyp).hide();
							param.pptyLive = 'N';
							$('#isSelfAddress' + applTyp).find('.no').addClass('selected').siblings('span').removeClass('selected');
							$('#selfAddress' + applTyp).parent().hide();
							$('#selfAddressdet' + applTyp).parent().hide();
							inputColl['selfAddress' + applTyp].value = '';
							inputColl['selfAddressdet' + applTyp].value = '';
							param.pptyAddr = '';
						}
		            },
		            title: '请选择居住状况',
		            defaultValue:[getArrVal.indSeq],
		            id:'housing' + applTyp
		        });
			});
			$(inputColl['homeAddress' + applTyp]).on('click', function () {
				var _this12 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(CITY_DATA,'homeAddress' + applTyp,3);
				var defPCA=getArrVal.indSeq.split(',');
				weui.picker(getArrVal.proVal, {
			       onConfirm: function(item) {
						_this12.value = item[0].label + ' ' + item[1].label + ' ' + item[2].label;
						param.liveAddr = item[0].value + ',' + item[1].value + ',' + item[2].value + ',' + (inputColl['homeAddressdet' + applTyp].value || '');
						if (param.liveIsReg == 'Y') {
							//如果户籍所在地等于现住房地址
							inputColl['domiAddress' + applTyp].value = inputColl['homeAddress' + applTyp].value;
							param.domicile = param.liveAddr;
						}
						if (param.pptyLive == 'Y') {
							////如果自有房地址等于现住房地址
							inputColl['selfAddress' + applTyp].value = inputColl['homeAddress' + applTyp].value;
							param.pptyAddr = param.liveAddr;
						}
			       },
		           title: '请选择区域',
		           defaultValue:[defPCA[0],defPCA[1],defPCA[2]],
		           id:'homeAddress' + applTyp
		     	});
			});
			inputColl['homeAddressdet' + applTyp].addEventListener('blur', function () {
				if (inputColl['homeAddress' + applTyp].value != '') {
					var arr = param.liveAddr.split(',');
					param.liveAddr = arr[0] + ',' + arr[1] + ',' + arr[2] + ',' + (inputColl['homeAddressdet' + applTyp].value || '');
					if (param.liveIsReg == 'Y') {
						//如果户籍所在地等于现住房地址
						inputColl['domiAddressdet' + applTyp].value = inputColl['homeAddressdet' + applTyp].value;
						param.domicile = param.liveAddr;
					}
					if (param.pptyLive == 'Y') {
						////如果自有房地址等于现住房地址
						inputColl['selfAddressdet' + applTyp].value = inputColl['homeAddressdet' + applTyp].value;
						param.pptyAddr = param.liveAddr;
					}
				}
			});

			$(inputColl['companyAddress' + applTyp]).on('click', function () {
				var _this13 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(CITY_DATA,'companyAddress' + applTyp,3);
				var defPCA=getArrVal.indSeq.split(',');
				weui.picker(getArrVal.proVal, {
			       onConfirm: function(item) {
						_this13.value = item[0].label + ' ' + item[1].label + ' ' + item[2].label;
						param.woekAddress = item[0].value + ',' + item[1].value + ',' + item[2].value + ',' + (inputColl['companyAddressdet' + applTyp].value || '');
			       },
		           title: '请选择区域',
		           defaultValue:[defPCA[0],defPCA[1],defPCA[2]],
		           id:'companyAddress' + applTyp
		     	});
			});

			inputColl['companyAddressdet' + applTyp].addEventListener('blur', function () {
				if (inputColl['companyAddress' + applTyp].value != '') {
					var arr = param.woekAddress.split(',');
					param.woekAddress = arr[0] + ',' + arr[1] + ',' + arr[2] + ',' + (inputColl['companyAddressdet' + applTyp].value || '');
				}
			});

			inputColl['homeAddressdetnum' + applTyp].addEventListener('keyup', function () {
				param.liveAddrNo = this.value;
			});
			mui('#isDomiAddress' + applTyp).on('tap', 'span', function () {
				document.activeElement.blur();
				if ($('#addHandle' + applTyp).hasClass('add') && applTyp != '') {
					return;
				}
				if (param.liveInfo == '03') {
					return;
				}
				if ($(this).hasClass('selected')) {
					return;
				}
				$(this).addClass('selected').siblings('span').removeClass('selected');
				if ($(this).hasClass('yes')) {
					param.liveIsReg = 'Y';
					$('#domiAddress' + applTyp).parent().hide();
					$('#domiAddressdet' + applTyp).parent().hide();
					param.domicile = param.liveAddr;
					inputColl['domiAddress' + applTyp].value = inputColl['homeAddress' + applTyp].value;
					inputColl['domiAddressdet' + applTyp].value = inputColl['homeAddressdet' + applTyp].value;
				} else if ($(this).hasClass('no')) {
					param.liveIsReg = 'N';
					$('#domiAddress' + applTyp).parent().show();
					$('#domiAddressdet' + applTyp).parent().show();
					inputColl['domiAddress' + applTyp].value = '';
					inputColl['domiAddressdet' + applTyp].value = '';
					param.domicile = '';
				}
			});

			$(inputColl['domiAddress' + applTyp]).on('click', function () {
				var _this14 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(CITY_DATA,'domiAddress' + applTyp,3);
				var defPCA=getArrVal.indSeq.split(',');
				weui.picker(getArrVal.proVal, {
			       onConfirm: function(item) {
						_this14.value = item[0].label + ' ' + item[1].label + ' ' + item[2].label;
						param.domicile = item[0].value + ',' + item[1].value + ',' + item[2].value + ',' + (inputColl['domiAddressdet' + applTyp].value || '');
			       },
		           title: '请选择区域',
		           defaultValue:[defPCA[0],defPCA[1],defPCA[2]],
		           id:'domiAddress' + applTyp
		     	});
			});
			inputColl['domiAddressdet' + applTyp].addEventListener('blur', function () {
				document.activeElement.blur();
				if (inputColl['domiAddress' + applTyp].value != '') {
					var arr = param.domicile.split(',');
					param.domicile = arr[0] + ',' + arr[1] + ',' + arr[2] + ',' + (inputColl['domiAddressdet' + applTyp].value || '');
				}
			});
			mui('#isSelfAddress' + applTyp).on('tap', 'span', function () {
				document.activeElement.blur();
				if ($('#addHandle' + applTyp).hasClass('add') && applTyp != '') {
					return;
				}
				if ($(this).hasClass('selected')) {
					return;
				}
				$(this).addClass('selected').siblings('span').removeClass('selected');
				if ($(this).hasClass('yes')) {
					param.pptyLive = 'Y';
					$('#selfAddress' + applTyp).parent().hide();
					$('#selfAddressdet' + applTyp).parent().hide();
					param.pptyAddr = param.liveAddr;
					inputColl['selfAddress' + applTyp].value = inputColl['homeAddress' + applTyp].value;
					inputColl['selfAddressdet' + applTyp].value = inputColl['homeAddressdet' + applTyp].value;
				} else {
					param.pptyLive = 'N';
					$('#selfAddress' + applTyp).parent().show();
					$('#selfAddressdet' + applTyp).parent().show();
					inputColl['selfAddress' + applTyp].value = '';
					inputColl['selfAddressdet' + applTyp].value = '';
					param.pptyAddr = '';
				}
			});

			$(inputColl['selfAddress' + applTyp]).on('click', function () {
				var _this15 = this;
				document.activeElement.blur();
				var getArrVal=mData.changePro(CITY_DATA,'selfAddress' + applTyp,3);
				var defPCA=getArrVal.indSeq.split(',');
				weui.picker(getArrVal.proVal, {
			       onConfirm: function(item) {
						_this15.value = item[0].label + ' ' + item[1].label + ' ' + item[2].label;
						param.pptyAddr = item[0].value + ',' + item[1].value + ',' + item[2].value + ',' + (inputColl['selfAddressdet' + applTyp].value || '');
			       },
		           title: '请选择区域',
		           defaultValue:[defPCA[0],defPCA[1],defPCA[2]],
		           id:'selfAddress' + applTyp
		     	});
			});
			inputColl['selfAddressdet' + applTyp].addEventListener('blur', function () {
				document.activeElement.blur();
				if (inputColl['selfAddress' + applTyp].value != '') {
					var arr = param.pptyAddr.split(',');
					param.pptyAddr = arr[0] + ',' + arr[1] + ',' + arr[2] + ',' + (inputColl['selfAddressdet' + applTyp].value || '');
				}
			});
		};
		selectAppFun('', mainParam, list.inputColl);
		selectAppFun('Com', commonParam, list.inputColl);
		selectAppFun('Ass', assureParam, list.inputColl);

		function isEmpty2() {
			if (mobile2.value != '') {
				if (!mCheck.checkCellnum2(mobile2.value)) {
					mCheck.alert('借款人移动电话格式错误');
					return false;
				}
				if (mobile.value == mobile2.value) {
					mCheck.alert('借款人移动电话不能相同');
					return false;
				}
			}
			if (homePhone.value != '') {
				if (!mCheck.checkHomeTell(homePhone.value)) {
					mCheck.alert('借款人家庭电话格式错误');
					return false;
				}
			}
			if (officePhone.value != '') {
				if (!mCheck.checkOffTel(officePhone.value)) {
					mCheck.alert('借款人办公电话格式错误');
					return false;
				}
			}

			if ($('#reduceHandleCom').hasClass('reduce')) {
				if (idNumber.value != '' && idNumberCom.value != '') {
					if (idNumber.value == idNumberCom.value) {
						mCheck.alert('借款人和共借人证件号码不能相同');
						return false;
					}
				}

				if (mobileCom.value != '') {
					if (!mCheck.checkCellnum2(mobileCom.value)) {
						mCheck.alert('共借人移动电话格式错误');
						return false;
					}
				}

				if (homePhoneCom.value != '') {
					if (!mCheck.checkHomeTell(homePhoneCom.value)) {
						mCheck.alert('共借人家庭电话格式错误');
						return false;
					}
				}
				if (mobileCom.value != '') {
					if (mobile.value == mobileCom.value) {
						mCheck.alert('借款人和共借人移动电话不能相同');
						return false;
					}
					if (mobile2.value != '') {
						if (mobile2.value == mobileCom.value) {
							mCheck.alert('借款人和共借人移动电话不能相同');
							return false;
						}
					}
				}
				if (relshipownCom.value != '' && marriedCom.value != '') {
					if (commonParam.apptRelation == '06' && commonParam.indivMarital != '20') {
						mCheck.alert('共借人为借款人配偶，婚姻状况必须选择已婚');
						return false;
					}
				}

				if (officePhoneCom.value != '') {
					if (!mCheck.checkOffTel(officePhoneCom.value)) {
						mCheck.alert('共借人办公电话格式错误');
						return false;
					}
				}
			}
			if ($('#reduceHandleAss').hasClass('reduce')) {
				if (idNumber.value != '' && idNumberAss.value != '') {
					if (idNumber.value == idNumberAss.value) {
						mCheck.alert('借款人和保证人证件号码不能相同');
						return false;
					}
				}

				if (mobileAss.value != '') {
					if (!mCheck.checkCellnum2(mobileAss.value)) {
						mCheck.alert('保证人移动电话格式错误');
						return false;
					}
				}

				if (mobileAss.value != '') {
					if (mobile.value != '') {
						if (mobile.value == mobileAss.value) {
							mCheck.alert('借款人和保证人移动电话不能相同');
							return false;
						}
					}

					if (mobile2.value != '') {
						if (mobile2.value == mobileAss.value) {
							mCheck.alert('借款人和保证人移动电话不能相同');
							return false;
						}
					}
				}
				if (relshipownAss.value != '' && marriedAss.value != '') {
					if (assureParam.apptRelation == '06' && assureParam.indivMarital != '20') {
						mCheck.alert('保证人为借款人配偶，婚姻状况必须选择已婚');
						return false;
					}
				}

				if (homePhoneAss.value != '') {
					if (!mCheck.checkHomeTell(homePhoneAss.value)) {
						mCheck.alert('保证人家庭电话格式错误');
						return false;
					}
				}

				if (officePhoneAss.value != '') {
					if (!mCheck.checkOffTel(officePhoneAss.value)) {
						mCheck.alert('保证人办公电话格式错误');
						return false;
					}
				}
			}
			if ($('#reduceHandleCom').hasClass('reduce') && $('#reduceHandleAss').hasClass('reduce')) {
				if (idNumberCom.value != '' && idNumberAss.value != '' && idNumberCom.value == idNumberAss.value) {
					mCheck.alert('共借人和保证人证件号码不能相同');
					return false;
				}
				if (mobileCom.value != '' && mobileAss.value != '') {
					if (mobileCom.value == mobileAss.value) {
						mCheck.alert('共借人和保证人移动电话不能相同');
						return false;
					}
				}
			}
			if (mobileCat0.value != '') {
				if (!mCheck.checkCellnum2(mobileCat0.value)) {
					mCheck.alert('联系人移动电话格式错误');
					return false;
				}
				if (mobileCat1.value != '' && mobileCat0.value == mobileCat1.value) {
					mCheck.alert('联系人移动电话不能相同');
					return false;
				}
				if (mobileCat2.value != '' && mobileCat0.value == mobileCat2.value) {
					mCheck.alert('联系人移动电话不能相同');
					return false;
				}
			}
			if (homePhoneCat0.value != '') {
				if (!mCheck.checkHomeTell(homePhoneCat0.value)) {
					mCheck.alert('联系人家庭电话格式错误');
					return false;
				}
			}

			if (!$('#rel2').is(':hidden')) {
				if (mobileCat1.value != '') {
					if (!mCheck.checkCellnum2(mobileCat1.value)) {
						mCheck.alert('联系人移动电话格式错误');
						return false;
					}
					if (mobileCat0.value != '' && mobileCat0.value == mobileCat2.value) {
						mCheck.alert('联系人移动电话不能相同');
						return false;
					}
					if (mobileCat2.value != '' && mobileCat1.value == mobileCat2.value) {
						mCheck.alert('联系人移动电话不能相同');
						return false;
					}
				}

				if (homePhoneCat1.value != '') {
					if (!mCheck.checkHomeTell(homePhoneCat1.value)) {
						mCheck.alert('联系人家庭电话格式错误');
						return false;
					}
				}
			}
			if (!$('#rel3').is(':hidden')) {
				if (mobileCat2.value != '') {
					if (!mCheck.checkCellnum2(mobileCat2.value)) {
						mCheck.alert('联系人移动电话格式错误');
						return false;
					}
					if (mobileCat0.value != '' && mobileCat0.value == mobileCat2.value) {
						mCheck.alert('联系人移动电话不能相同');
						return false;
					}
					if (mobileCat1.value != '' && mobileCat1.value == mobileCat2.value) {
						mCheck.alert('联系人移动电话不能相同');
						return false;
					}
				}
				if (homePhoneCat2.value != '') {
					if (!mCheck.checkHomeTell(homePhoneCat2.value)) {
						mCheck.alert('联系人家庭电话格式错误');
						return false;
					}
				}
			}

			for (var i = 0; i < concatParam['iCarRelList.apptRelation'].length; i++) {
				if (concatParam['iCarRelList.mobilePhone'][i] != '') {
					if (mobile.value != '') {
						if (mobile.value == concatParam['iCarRelList.mobilePhone'][i]) {
							mCheck.alert('借款人和联系人移动电话不能相同');
							return false;
						}
					}
					if (mobile2.value != '') {
						if (mobile2.value == concatParam['iCarRelList.mobilePhone'][i]) {
							mCheck.alert('借款人和联系人移动电话不能相同');
							return false;
						}
					}
					if (mobileCom.value != '') {
						if (mobileCom.value == concatParam['iCarRelList.mobilePhone'][i]) {
							mCheck.alert('共借人和联系人移动电话不能相同');
							return false;
						}
					}
					if (mobileAss.value != '') {
						if (mobileAss.value == concatParam['iCarRelList.mobilePhone'][i]) {
							mCheck.alert('保证人和联系人移动电话不能相同');
							return false;
						}
					}
				}
			}

			if (mainParam.indivMarital == '20') {
				if (commonParam.apptRelation == '06' && assureParam.apptRelation == '06') {
					mCheck.alert('共借人和保证人与借款人关系不能同时选择配偶');
					return false;
				}
				if (commonParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][0] == '06' || commonParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][1] == '06' || commonParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][2] == '06') {
					mCheck.alert('共借人和联系人与借款人关系不能同时选择配偶');
					return false;
				}
				if (assureParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][0] == '06' || assureParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][1] == '06' || assureParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][2] == '06') {
					mCheck.alert('保证人和联系人与借款人关系不能同时选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][0] == '06' && concatParam['iCarRelList.apptRelation'][1] == '06') {
					mCheck.alert('联系人与借款人关系不能同时选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][0] == '06' && concatParam['iCarRelList.apptRelation'][2] == '06') {
					mCheck.alert('联系人与借款人关系不能同时选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][1] == '06' && concatParam['iCarRelList.apptRelation'][2] == '06') {
					mCheck.alert('联系人与借款人关系不能同时选择配偶');
					return false;
				}
			}

			if (mainParam.indivMarital != '20') {
				if (commonParam.apptRelation == '06') {
					mCheck.alert('借款人未婚，共借人与借款人关系不能选择配偶');
					return false;
				}
				if (assureParam.apptRelation == '06') {
					mCheck.alert('借款人未婚，保证人与借款人关系不能选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][0] == '06') {
					mCheck.alert('借款人未婚，联系人与借款人关系不能选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][1] == '06') {
					mCheck.alert('借款人未婚，联系人与借款人关系不能选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][2] == '06') {
					mCheck.alert('借款人未婚，联系人与借款人关系不能选择配偶');
					return false;
				}
			}
			if (mainAge < 22 && mainParam.indivMarital != '20') {
				//如果借款人未满22岁
				if (commonParam.apptRelation != '01' && assureParam.apptRelation != '01' && concatParam['iCarRelList.apptRelation'][0] != '01' && concatParam['iCarRelList.apptRelation'][1] != '01' && concatParam['iCarRelList.apptRelation'][2] != '01') {
					mCheck.alert('借款人未婚并小于22岁，共借人、保证人、联系人中需要有一个父母');
					return false;
				}
			}
			if (commonParam.idIsPermanent == 'Y' && comAge < 45) {
				mCheck.alert('共借人，年龄小于45岁，证件不能永久有效！');
				return false;
			}
			if (assureParam.idIsPermanent == 'Y' && assAge < 45) {
				mCheck.alert('保证人，年龄小于45岁，证件不能永久有效！');
				return false;
			}
			return true;
		}

		function isEmpty() {
			if (mobile2.value != '') {
				if (!mCheck.checkCellnum2(mobile2.value)) {
					mCheck.alert('借款人移动电话格式错误');
					return false;
				}
				if (mobile.value == mobile2.value) {
					mCheck.alert('借款人移动电话不能相同');
					return false;
				}
			}
			if (homePhone.value != '') {
				if (!mCheck.checkHomeTell(homePhone.value)) {
					mCheck.alert('借款人家庭电话格式错误');
					return false;
				}
			}
			if (education.value == '') {
				mCheck.alert('请选择借款人最高学历');
				return false;
			}
			if (married.value == '') {
				mCheck.alert('请选择借款人婚姻状况');
				return false;
			}
			if (housing.value == '') {
				mCheck.alert('请选择借款人居住状况');
				return false;
			}
			if (homeAddress.value == '' || homeAddressdet.value == '' || homeAddress.value == 'undefined' || homeAddressdet.value == 'undefined') {
				mCheck.alert('借款人居住地址不能为空');
				return false;
			}
			if (homeAddressdetnum.value == '' || homeAddressdetnum.value == 'undefined') {
				mCheck.alert('借款人居住门牌号不能为空');
				return false;
			}

			if (domiAddress.value == '' || domiAddressdet.value == '' || domiAddress.value == 'undefined' || domiAddressdet.value == 'undefined') {
				mCheck.alert('借款人户籍地址不能为空');
				return false;
			}

			if (!$('#selfAddressBox').is(':hidden')) {
				if (selfAddress.value == '' || selfAddressdet.value == '' || selfAddress.value == 'undefined' || selfAddressdet.value == 'undefined') {
					mCheck.alert('借款人自有房地址不能为空');
					return false;
				}
			}

			if (workNature.value == '') {
				mCheck.alert('请选择借款人工作性质');
				return false;
			}
			if (mainParam.positionOpt == '10' || mainParam.positionOpt == '20') {
				if (monthlyIn.value == '' || monthlyIn.value == 'undefined') {
					mCheck.alert('借款人月均收入不能为空');
					return false;
				}
				if (companyName.value == '' || companyName.value == 'undefined') {
					mCheck.alert('借款人现单位名称不能为空');
					return false;
				}
				if (workAge.value == '' || workAge.value == 'undefined') {
					mCheck.alert('借款人现单位工龄不能为空');
					return false;
				}
				if (mainAge - workAge.value <= 0) {
					mCheck.alert('借款人现单位工龄不能大于本人年龄，请重新输入');
					return false;
				}
				if (companyNature.value == '') {
					mCheck.alert('请选择借款人现单位性质');
					return false;
				}
				if (industry.value == '') {
					mCheck.alert('请选择借款人所属行业');
					return false;
				}
				if (workName.value == '') {
					mCheck.alert('请选择借款人职务');
					return false;
				}
				if (companyAddress.value == '' || companyAddressdet.value == '' || companyAddress.value == 'undefined' || companyAddressdet.value == 'undefined') {
					mCheck.alert('请选择借款人现单位地址');
					return false;
				}
				if (officePhone.value != '') {
					if (!mCheck.checkOffTel(officePhone.value)) {
						mCheck.alert('借款人办公电话格式错误');
						return false;
					}
				}
			}

			if ($('#reduceHandleCom').hasClass('reduce')) {
				if (relshipownCom.value == '') {
					mCheck.alert('请选择共借人与借款人关系');
					return false;
				}
				if (idNumberCom.value == '' || idNumberCom.value == 'undefined') {
					mCheck.alert('共借人证件号码不能为空');
					return false;
				}

				if (idNumber.value == idNumberCom.value) {
					mCheck.alert('借款人和共借人证件号码不能相同');
					return false;
				}
				if (commonParam.idIsPermanent == 'N' && idStartCom.value == '') {
					mCheck.alert('共借人证件开始日不能为空');
					return false;
				}
				if (commonParam.idIsPermanent == 'N' && idDateCom.value == '') {
					mCheck.alert('共借人证件到期日不能为空');
					return false;
				}
				if (mobileCom.value == '' || mobileCom.value == 'undefined') {
					mCheck.alert('共借人移动电话不能为空');
					return false;
				}
				if (!mCheck.checkCellnum2(mobileCom.value)) {
					mCheck.alert('共借人移动电话格式错误');
					return false;
				}
				if (homePhoneCom.value != '') {
					if (!mCheck.checkHomeTell(homePhoneCom.value)) {
						mCheck.alert('共借人家庭电话格式错误');
						return false;
					}
				}
				if (mobile.value == mobileCom.value || mobile2.value == mobileCom.value) {
					mCheck.alert('借款人和共借人移动电话不能相同');
					return false;
				}
				if (educationCom.value == '') {
					mCheck.alert('请选择共借人最高学历');
					return false;
				}
				if (marriedCom.value == '') {
					mCheck.alert('请选择共借人婚姻状况');
					return false;
				}
				if (relshipownCom.value != '' && marriedCom.value != '') {
					if (commonParam.apptRelation == '06' && commonParam.indivMarital != '20') {
						mCheck.alert('共借人为借款人配偶，婚姻状况必须选择已婚');
						return false;
					}
				}
				if (housingCom.value == '') {
					mCheck.alert('请选择共借人居住状况');
					return false;
				}
				if (homeAddressCom.value == '' || homeAddressdetCom.value == '' || homeAddressCom.value == 'undefined' || homeAddressdetCom.value == 'undefined') {
					mCheck.alert('共借人居住地址不能为空');
					return false;
				}
				if (homeAddressdetnumCom.value == '' || homeAddressdetnumCom.value == 'undefined') {
					mCheck.alert('共借人居住门牌号不能为空');
					return false;
				}
				if (domiAddressCom.value == '' || domiAddressdetCom.value == '' || domiAddressCom.value == 'undefined' || domiAddressdetCom.value == 'undefined') {
					mCheck.alert('共借人户籍地址不能为空');
					return false;
				}
				if (!$('#selfAddressBoxCom').is(':hidden')) {
					if (selfAddressCom.value == '' || selfAddressdetCom.value == '' || selfAddressCom.value == 'undefined' || selfAddressdetCom.value == 'undefined') {
						mCheck.alert('共借人自有房地址不能为空');
						return false;
					}
				}
				if (workNatureCom.value == '') {
					mCheck.alert('请选择共借人工作性质');
					return false;
				}
				if (commonParam.positionOpt == '10' || commonParam.positionOpt == '20') {
					if (monthlyInCom.value == '' || monthlyInCom.value == 'undefined') {
						mCheck.alert('共借人月均收入不能为空');
						return false;
					}
					if (companyNameCom.value == '' || companyNameCom.value == 'undefined') {
						mCheck.alert('共借人现单位名称不能为空');
						return false;
					}
					if (workAgeCom.value == '' || workAgeCom.value == 'undefined') {
						mCheck.alert('共借人现单位工龄不能为空');
						return false;
					}
					if (comAge - workAgeCom.value <= 0) {
						mCheck.alert('共借人现单位工龄不能大于本人年龄，请重新输入');
						return false;
					}
					if (companyNatureCom.value == '') {
						mCheck.alert('请选择共借人现单位性质');
						return false;
					}
					if (industryCom.value == '') {
						mCheck.alert('请选择共借人所属行业');
						return false;
					}
					if (workNameCom.value == '') {
						mCheck.alert('请选择共借人职务');
						return false;
					}
					if (companyAddressCom.value == '' || companyAddressdetCom.value == '' || companyAddressCom.value == 'undefined' || companyAddressdetCom.value == 'undefined') {
						mCheck.alert('请选择共借人现单位地址');
						return false;
					}
					if (officePhoneCom.value != '') {
						if (!mCheck.checkOffTel(officePhoneCom.value)) {
							mCheck.alert('共借人办公电话格式错误');
							return false;
						}
					}
				}
			}
			if (!$('#reduceHandleAss').hasClass('reduce')) {
				if (noGua == 'N') {
					mCheck.alert('选择免抵押，且非免担保，须录入保证人');
					return false;
				}
			}
			if ($('#reduceHandleAss').hasClass('reduce')) {
				if (relshipownAss.value == '') {
					mCheck.alert('请选择保证人与借款人关系');
					return false;
				}
				if (idNumberAss.value == '' || idNumberAss.value == 'undefined') {
					mCheck.alert('保证人证件号码不能为空');
					return false;
				}
				if (idNumber.value == idNumberAss.value) {
					mCheck.alert('借款人和保证人证件号码不能相同');
					return false;
				}
				if (assureParam.idIsPermanent == 'N' && idStartAss.value == '') {
					mCheck.alert('保证人证件开始日不能为空');
					return false;
				}
				if (assureParam.idIsPermanent == 'N' && idDateAss.value == '') {
					mCheck.alert('保证人证件到期日不能为空');
					return false;
				}
				if (mobileAss.value == '' || mobileAss.value == 'undefined') {
					mCheck.alert('保证人移动电话不能为空');
					return false;
				}
				if (!mCheck.checkCellnum2(mobileAss.value)) {
					mCheck.alert('保证人移动电话格式错误');
					return false;
				}
				if (mobile.value == mobileAss.value || mobile2.value == mobileAss.value) {
					mCheck.alert('借款人和保证人移动电话不能相同');
					return false;
				}
				if (homePhoneAss.value != '') {
					if (!mCheck.checkHomeTell(homePhoneAss.value)) {
						mCheck.alert('保证人家庭电话格式错误');
						return false;
					}
				}

				if (educationAss.value == '') {
					mCheck.alert('请选择保证人最高学历');
					return false;
				}
				if (marriedAss.value == '') {
					mCheck.alert('请选择保证人婚姻状况');
					return false;
				}
				if (relshipownAss.value != '' && marriedAss.value != '') {
					if (assureParam.apptRelation == '06' && assureParam.indivMarital != '20') {
						mCheck.alert('保证人为借款人配偶，婚姻状况必须选择已婚');
						return false;
					}
				}
				if (housingAss.value == '') {
					mCheck.alert('请选择保证人居住状况');
					return false;
				}
				if (homeAddressAss.value == '' || homeAddressdetAss.value == '' || homeAddressAss.value == 'undefined' || homeAddressdetAss.value == 'undefined') {
					mCheck.alert('保证人居住地址不能为空');
					return false;
				}
				if (homeAddressdetnumAss.value == '' || homeAddressdetnumAss.value == 'undefined') {
					mCheck.alert('保证人居住门牌号不能为空');
					return false;
				}
				if (domiAddressAss.value == '' || domiAddressdetAss.value == '' || domiAddressAss.value == 'undefined' || domiAddressdetAss.value == 'undefined') {
					mCheck.alert('保证人户籍地址不能为空');
					return false;
				}

				if (!$('#selfAddressBoxAss').is(':hidden')) {
					if (selfAddressAss.value == '' || selfAddressdetAss.value == '' || selfAddressAss.value == 'undefined' || selfAddressdetAss.value == 'undefined') {
						mCheck.alert('保证人自有房地址不能为空');
						return false;
					}
				}
				if (workNatureAss.value == '') {
					mCheck.alert('请选择保证人工作性质');
					return false;
				}
				if (assureParam.positionOpt == '10' || assureParam.positionOpt == '20') {
					if (monthlyInAss.value == '' || monthlyInAss.value == 'undefined') {
						mCheck.alert('保证人月均收入不能为空');
						return false;
					}
					if (companyNameAss.value == '' || companyNameAss.value == 'undefined') {
						mCheck.alert('保证人现单位名称不能为空');
						return false;
					}
					if (workAgeAss.value == '' || workAgeAss.value == 'undefined') {
						mCheck.alert('保证人现单位工龄不能为空');
						return false;
					}
					if (assAge - workAgeAss.value <= 0) {
						mCheck.alert('保证人现单位工龄不能大于本人年龄，请重新输入');
						return false;
					}
					if (companyNatureAss.value == '') {
						mCheck.alert('请选择保证人现单位性质');
						return false;
					}
					if (industryAss.value == '') {
						mCheck.alert('请选择保证人所属行业');
						return false;
					}
					if (workNameAss.value == '') {
						mCheck.alert('请选择保证人职务');
						return false;
					}
					if (companyAddressAss.value == '' || companyAddressdetAss.value == '' || companyAddressAss.value == 'undefined' || companyAddressdetAss.value == 'undefined') {
						mCheck.alert('请选择保证人现单位地址');
						return false;
					}
					if (officePhoneAss.value != '') {
						if (!mCheck.checkOffTel(officePhoneAss.value)) {
							mCheck.alert('保证人办公电话格式错误');
							return false;
						}
					}
				}
			}
			if ($('#reduceHandleCom').hasClass('reduce') && $('#reduceHandleAss').hasClass('reduce')) {
				if (idNumberCom.value == idNumberAss.value) {
					mCheck.alert('共借人和保证人证件号码不能相同');
					return false;
				}
				if (mobileCom.value == mobileAss.value) {
					mCheck.alert('共借人和保证人移动电话不能相同');
					return false;
				}
			}
			if (relshipownCat0.value == '') {
				mCheck.alert('请选择联系人与主借人关系');
				return false;
			}
			if (idNumberCat0.value != '' && idTypeCat0.value == '身份证') {
				if (!mCheck.checkIdNumber(idNumberCat0.value)) {
					mCheck.alert('联系人证件号码有误');
					return false;
				}
			}
			if (custNameCat0.value == '' || custNameCat0.value == 'undefined') {
				mCheck.alert('联系人姓名不能为空');
				return false;
			}
			if (mobileCat0.value == '' || mobileCat0.value == 'undefined') {
				mCheck.alert('联系人移动电话不能为空');
				return false;
			}
//			if(!mCheck.checkCellnum2(mobileCat0.value)){
//				mCheck.alert('联系人移动电话格式错误');
//				return false;
//			}
			if (homePhoneCat0.value != '') {
				if (!mCheck.checkHomeTell(homePhoneCat0.value)) {
					mCheck.alert('联系人家庭电话格式错误');
					return false;
				}
			}
			if (homeAddressCat0.value == '' || homeAddressdetCat0.value == '' || homeAddressCat0.value == 'undefined' || homeAddressdetCat0.value == 'undefined') {
				mCheck.alert('联系人居住地址不能为空');
				return false;
			}
			if (!$('#reduceHandleCom').hasClass('reduce')) {
				if ($('#addHandleCat').hasClass('add') && !$('#reduceHandleCat').hasClass('reduce')) {
					mCheck.alert("由于没有共借人，所以至少要有两个联系人");
					return false;
				}
			}
			for (var i = 1; i < 3; i++) {
				if ($('#rel' + (i + 1))[0].style.display == 'block') {
					if ($('#relshipownCat' + i).val() == '') {
						mCheck.alert('请选择联系人与主借人关系');
						return false;
					}
					if ($('#idNumberCat' + i).val() != '' && $('#idTypeCat' + i).val() == '身份证') {
						if (!mCheck.checkIdNumber($('#idNumberCat' + i).val())) {
							mCheck.alert('联系人证件号码有误');
							return false;
						}
					}
					if ($('#custNameCat' + i).val() == '' || $('#custNameCat' + i).val() == 'undefined') {
						mCheck.alert('联系人姓名不能为空');
						return false;
					}
					if ($('#mobileCat' + i).val() == '' || $('#mobileCat' + i).val() == 'undefined') {
						mCheck.alert('联系人移动电话不能为空');
						return false;
					}
					if (!mCheck.checkCellnum2($('#mobileCat' + i).val())) {
						mCheck.alert('联系人移动电话格式错误');
						return false;
					}
					if ($('#mobileCat' + (i - 1)).val() == $('#mobileCat' + i).val()) {
						mCheck.alert('联系人移动电话不能相同');
						return false;
					}
					if ($('#homePhoneCat' + i).val() != '') {
						if (!mCheck.checkHomeTell($('#homePhoneCat' + i).val())) {
							mCheck.alert('联系人家庭电话格式错误');
							return false;
						}
					}
					if ($('#homeAddressCat' + i).val() == '' || $('#homeAddressdetCat' + i).val() == '') {
						mCheck.alert('联系人居住地址不能为空');
						return false;
					}
				}
			}
			for (var _i = 0; _i < concatParam['iCarRelList.apptRelation'].length; _i++) {
				if (concatParam['iCarRelList.apptRelation'][_i] == '06') {
					if (concatParam['iCarRelList.idtype'][_i] == '' || concatParam['iCarRelList.idtype'][_i] == undefined) {
						mCheck.alert('联系人为配偶，证件类型不能为空');
						return false;
					}
					if (concatParam['iCarRelList.idNo'][_i] == '' || concatParam['iCarRelList.idNo'][_i] == undefined) {
						mCheck.alert('联系人为配偶，证件号码不能为空');
						return false;
					}
				}
				//联系人证件类型为身份证，证件号码不能同借款人、共借人、保证人相同
				if (concatParam['iCarRelList.idtype'][_i] == '20') {
					if (concatParam['iCarRelList.idNo'][_i] != '') {
						if (mainParam.idNo == concatParam['iCarRelList.idNo'][_i]) {
							mCheck.alert('借款人和联系人证件号码不能相同');
							return false;
						}
						if (commonParam.idNo == concatParam['iCarRelList.idNo'][_i]) {
							mCheck.alert('共借人和联系人证件号码不能相同');
							return false;
						}
						if (assureParam.idNo == concatParam['iCarRelList.idNo'][_i]) {
							mCheck.alert('保证人和联系人证件号码不能相同');
							return false;
						}
					}
				}
				if (concatParam['iCarRelList.mobilePhone'][_i] != '') {
					if (mobile.value != '') {
						if (mobile.value == concatParam['iCarRelList.mobilePhone'][_i]) {
							mCheck.alert('借款人和联系人移动电话不能相同');
							return false;
						}
					}
					if (mobile2.value != '') {
						if (mobile2.value == concatParam['iCarRelList.mobilePhone'][_i]) {
							mCheck.alert('借款人和联系人移动电话不能相同');
							return false;
						}
					}
					if (mobileCom.value != '') {
						if (mobileCom.value == concatParam['iCarRelList.mobilePhone'][_i]) {
							mCheck.alert('共借人和联系人移动电话不能相同');
							return false;
						}
					}
					if (mobileAss.value != '') {
						if (mobileAss.value == concatParam['iCarRelList.mobilePhone'][_i]) {
							mCheck.alert('保证人和联系人移动电话不能相同');
							return false;
						}
					}
				}
			}
			if (mainParam.indivMarital == '20') {
				if (commonParam.apptRelation != '06' && assureParam.apptRelation != '06' && concatParam['iCarRelList.apptRelation'][0] != '06' && concatParam['iCarRelList.apptRelation'][1] != '06' && concatParam['iCarRelList.apptRelation'][2] != '06') {
					mCheck.alert('借款人已婚，共借人、保证人、联系人必须有一个为其配偶');
					return false;
				}
				if (commonParam.apptRelation == '06' && assureParam.apptRelation == '06') {
					mCheck.alert('共借人和保证人与借款人关系不能同时选择配偶');
					return false;
				}
				if (commonParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][0] == '06' || commonParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][1] == '06' || commonParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][2] == '06') {
					mCheck.alert('共借人和联系人与借款人关系不能同时选择配偶');
					return false;
				}
				if (assureParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][0] == '06' || assureParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][1] == '06' || assureParam.apptRelation == '06' && concatParam['iCarRelList.apptRelation'][2] == '06') {
					mCheck.alert('保证人和联系人与借款人关系不能同时选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][0] == '06' && concatParam['iCarRelList.apptRelation'][1] == '06') {
					mCheck.alert('联系人与借款人关系不能同时选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][0] == '06' && concatParam['iCarRelList.apptRelation'][2] == '06') {
					mCheck.alert('联系人与借款人关系不能同时选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][1] == '06' && concatParam['iCarRelList.apptRelation'][2] == '06') {
					mCheck.alert('联系人与借款人关系不能同时选择配偶');
					return false;
				}
			}
			if (mainParam.indivMarital != '20') {
				if (commonParam.apptRelation == '06') {
					mCheck.alert('借款人未婚，共借人与借款人关系不能选择配偶');
					return false;
				}
				if (assureParam.apptRelation == '06') {
					mCheck.alert('借款人未婚，保证人与借款人关系不能选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][0] == '06') {
					mCheck.alert('借款人未婚，联系人与借款人关系不能选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][1] == '06') {
					mCheck.alert('借款人未婚，联系人与借款人关系不能选择配偶');
					return false;
				}
				if (concatParam['iCarRelList.apptRelation'][2] == '06') {
					mCheck.alert('借款人未婚，联系人与借款人关系不能选择配偶');
					return false;
				}
			}
			if (mainParam.indivMarital == '20') {
				if (commonParam.apptRelation == '06') {
					if (mainParam.indivSex == commonParam.indivSex) {
						mCheck.alert('借款人已婚，共借人为借款人配偶，性别不能相同');
						return false;
					}
				}
				if (assureParam.apptRelation == '06') {
					if (mainParam.indivSex == assureParam.indivSex) {
						mCheck.alert('借款人已婚，保证人为借款人配偶，性别不能相同');
						return false;
					}
				}
			}
			if (mainAge < 22 && mainParam.indivMarital != '20') {
				//如果借款人未满22岁
				if (commonParam.apptRelation != '01' && assureParam.apptRelation != '01' && concatParam['iCarRelList.apptRelation'][0] != '01' && concatParam['iCarRelList.apptRelation'][1] != '01' && concatParam['iCarRelList.apptRelation'][2] != '01') {
					mCheck.alert('借款人未婚并小于22岁，共借人、保证人、联系人中需要有一个父母');
					return false;
				}
			}
			if (commonParam.idIsPermanent == 'Y' && comAge < 45) {
				mCheck.alert('共借人，年龄小于45岁，证件不能永久有效！');
				return false;
			}
			if (assureParam.idIsPermanent == 'Y' && assAge < 45) {
				mCheck.alert('保证人，年龄小于45岁，证件不能永久有效！');
				return false;
			}
			return true;
		}

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
		mui.back = function () {
			document.activeElement.blur();
			if ($('#waitingBox').is(':visible')) {
				//如果loading框显示，不能点击手机返回按键
				return;
			}
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=="Y"){
					$('#waitingBox').hide();
					back1();
				}
			});
		};
		back.addEventListener('tap', function () {
			document.activeElement.blur();
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=="Y"){
					$('#waitingBox').hide();
					back1();
				}
			});
		});
		//上一步
		pre.addEventListener('tap', function () {
			document.activeElement.blur();
			mBank.openWindowByLoad('./loanInfo.html', 'loanInfo', 'slide-in-left');
		});
		//点击保存
		save.addEventListener('tap', function () {
			document.activeElement.blur();
			if (!list.canClick) {
				//如果为false, 不能点击
				return;
			}
			list.canClick = false;
			$('#waitingBox').show();
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					$('#waitingBox').hide();
					list.canClick = true;
					return;
				}else{
					for (var i = 0; i < concatParam['iCarRelList.apptRelation'].length; i++) {
						if (concatParam['iCarRelList.idtype'][i] == null) {
							concatParam['iCarRelList.idtype'][i] = '';
						}
						if (concatParam['iCarRelList.idNo'][i] == null) {
							concatParam['iCarRelList.idNo'][i] = '';
						}
						if (concatParam['iCarRelList.indivFmlyTel'][i] == null) {
							concatParam['iCarRelList.indivFmlyTel'][i] = '';
						}
					}
					if (!isEmpty2()) {
						list.canClick = true;
						$('#waitingBox').hide();
						return;
					}
					mainParam.temp = '0';
					commonParam.temp = '0';
					assureParam.temp = '0';
					concatParam.temp = '0';
					//怎样防止连续点击调用保存接口
					//查询锁
					Promise.all([cfapplInfo(mainParam, 'cfapplBasicInfo'), cfapplInfo(commonParam, 'cfapplOtherInfo', 'Com'), cfapplInfo(assureParam, 'cfapplOtherInfo', 'Ass'), cfRelInfo(concatParam, 'cfapplRelInfo')]).then(function (data) {
						list.canClick = true;
						$('#waitingBox').hide();
						mCheck.alert('保存成功', function () {});
					}, function (err) {
						list.canClick = true;
						mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
					});
				}
			});
		});
		//点击下一步
		next.addEventListener('tap', function () {
			document.activeElement.blur();
			if (!list.canClick) {
				//如果为false, 不能点击
				return;
			}
			list.canClick = false;
			$('#waitingBox').show();
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					$('#waitingBox').hide();
					list.canClick = true;
					return;
				}else{
					for (var i = 0; i < concatParam['iCarRelList.apptRelation'].length; i++) {
						if (concatParam['iCarRelList.idtype'][i] == null) {
							concatParam['iCarRelList.idtype'][i] = '';
						}
						if (concatParam['iCarRelList.idNo'][i] == null) {
							concatParam['iCarRelList.idNo'][i] = '';
						}
						if (concatParam['iCarRelList.indivFmlyTel'][i] == null) {
							concatParam['iCarRelList.indivFmlyTel'][i] = '';
						}
					}
					if (!isEmpty()) {
						$('#waitingBox').hide();
						list.canClick = true;
						return;
					}
					mainParam.temp = '';
					commonParam.temp = '';
					assureParam.temp = '';
					concatParam.temp = '';
					Promise.all([cfapplInfo(mainParam, 'cfapplBasicInfo'), cfapplInfo(commonParam, 'cfapplOtherInfo', 'Com'), cfapplInfo(assureParam, 'cfapplOtherInfo', 'Ass'), cfRelInfo(concatParam, 'cfapplRelInfo')]).then(function (data) {
						mData.updateLock(applCde, nodeSign, outSts,'').then(function(dat){
							if(dat=='N'){
								list.canClick = true;
								$('#waitingBox').hide();
								return;
							}else{
								list.canClick = true;
								mData.interFace('post', 'isValidDgSign', { 'keyValue': applCde, 'docType': '02' }).then(function (data) {
									if (data.flag == 'N') {
										mBank.openWindowByLoad('../CommonPage/signInit.html', 'signInit', 'slide-in-right');
									} else if (data.flag == 'Y') {
										mBank.openWindowByLoad('../Images/imageList.html', 'imageList', 'slide-in-right');
									}
								}, function (err) {
									mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
								});
							}
						});
					}, function (err) {
						list.canClick = true;
						mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
					});	
				}
			});
		});
	});
});