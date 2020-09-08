'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	var sysTime = '';
	var SaveFlag = '0'; //"0"表示保存，"1"表示下一步
	var CoBorrower = '1';var SponsorMark = '1'; //"1"表示无值，"0"表示有值

	var list = { /*页面暂存数据*/
		'canClick': true,
		'listId': 0, /*判断页面显示的是哪个申请人的信息，默认是借款人，0-借款人，1-共借人，2-保证人*/
		'inputColl': document.getElementsByClassName('item-input'), /*每一个输入项*/
		'personColl': document.getElementsByClassName('content'), /*借款人、共借人、保证人页面*/
		'sysTime': ''
	};

	var mainAge = '';
	var comAge = '';
	var assAge = '';
	/*年龄计算*/
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

	//默认共借人、担保人页面不能编辑
	$('#personCom').find('input').map(function (index, item) {
		item.disabled = true;
	});
	$('#personAss').find('input').map(function (index, item) {
		item.disabled = true;
	});

	var mainParam = { //预审主借人参数
		'applCde': '',
		'custName': '',
		'Birth': '',
		'certNo': '',
		'mobileNo': '',
		'education': '',
		'marriage': '',
		'sex': '',
		'idtype': '20',
		'nationalTyp': 'CHN',
		'idIsPermanent': 'N',
		'idStartDt': '',
		'idEndDt': '',
		'liveProvince': '',
		'liveCity': '',
		'liveArea': '',
		'liveAddr': '',
		'liveAddrNo': '',
		'liveInfo': '',
		'regProvince': '',
		'regCity': '',
		'regArea': '',
		'worknature': '',
		'companyname': '',
		'companynature': '',
		'industry': '',
		'position': '',
		'aprFlag': '01'
	};

	var commonParam = Object.assign({ 'apptRelation': '' }, mainParam, { 'aprFlag': '02' });
	var assureParam = Object.assign({ 'apptRelation': '' }, mainParam, { 'aprFlag': '03' });
	//	console.log(JSON.stringify(mainParam));
	/*页面获取值*/
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
			$('#isOrNot' + applType).find('.yes').addClass('selected').siblings('span').removeClass('selected');
			$('#idDate' + applType).parent().hide();
		} else {
			$('#isOrNot' + applType).find('.no').addClass('selected').siblings('span').removeClass('selected');
		}
		inputColl['idDate' + applType].value = mCheck.timeFormat(data.idEndDt);
		inputColl['idStart' + applType].value = mCheck.timeFormat(data.idStartDt);
		inputColl['mobile' + applType].value = data.mobileNo;
		inputColl['education' + applType].value = mCheck.formatData(data.education, EDU_TYP);
		inputColl['married' + applType].value = mCheck.formatData(data.marriage, MARR_STS);
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
	/*查询页面信息*/
	var queryDealerAppLoanApptInfo = function queryDealerAppLoanApptInfo(applCde) {
		var applType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
		var aprFlag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '01';

		var url = mBank.getApiURL() + 'queryDealerAppLoanApptInfo.do';
		var param = { applCde: applCde, aprFlag: aprFlag };
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				mCheck.formatObj(data);
				data.idtype = '20';
				if (data.idIsPermanent == '') {
					data.idIsPermanent = 'N';
				}
				data.nationalTyp = 'CHN';
				getValueFun(list.inputColl, applType, data);
				resolve(data);
			},function(err){
				reject(err);
			});
		});
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

	//共借人页面添加按钮点击事件
	addHandleCom.addEventListener('tap', function () {
		document.activeElement.blur();
		CoBorrower = "0";
		if (!$(this).hasClass('add')) {
			return;
		}
		//新预审第一次进入的时候可以点击添加按钮
		$('#addHandleCom').removeClass('add');
		$('#personCom').find('input').map(function (index, item) {
			item.disabled = false;
		});
		$('#reduceHandleCom').addClass('reduce');
		$('#commonBox').show();
	});
	//共借人页面删除按钮点击事件
	reduceHandleCom.addEventListener('tap', function () {
		document.activeElement.blur();
		CoBorrower = "1";
		if (!$(this).hasClass('reduce')) {
			return;
		}
		mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
			if(dat=='N'){
				return;
			}else{
				mData.deletePreLoanOtherAppt(applCde, '02', '1').then(function (data) {
					queryDealerAppLoanApptInfo(applCde, 'Com', '02').then(function (data) {
						mCheck.assignObj(commonParam, data);
						$('#addHandleCom').addClass('add');
						$('#personCom').find('input').map(function (index, item) {
							item.disabled = true;
						});
						$('#reduceHandleCom').removeClass('reduce');
						$('#commonBox').hide();
						commonParam.aprFlag = '02';
					},function(err){
						mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
					});
				},function(err){
					mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
				});
			}
		});
	});
	//担保人页面添加按钮点击事件
	addHandleAss.addEventListener('tap', function () {
		document.activeElement.blur();
		SponsorMark = "0";
		if (!$(this).hasClass('add')) {
			return;
		}
		//新预审第一次进入的时候可以点击添加按钮
		$('#addHandleAss').removeClass('add');
		$('#personAss').find('input').map(function (index, item) {
			item.disabled = false;
		});
		$('#reduceHandleAss').addClass('reduce');
		$('#assureBox').show();
	});
	//担保人页面删除按钮点击事件
	reduceHandleAss.addEventListener('tap', function () {
		document.activeElement.blur();
		SponsorMark = "1";
		if (!$(this).hasClass('reduce')) {
			return;
		}
		mData.deletePreLoanOtherAppt(applCde, '03', '1').then(function (data) {
			queryDealerAppLoanApptInfo(applCde, 'Ass', '03').then(function (data) {
				mCheck.assignObj(assureParam, data);
				$('#addHandleAss').addClass('add');
				$('#personAss').find('input').map(function (index, item) {
					item.disabled = true;
				});
				$('#reduceHandleAss').removeClass('reduce');
				$('#assureBox').hide();
				assureParam.aprFlag = '03';
			},function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		},function(err){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});
	});

	mobile.addEventListener('blur', function () {
		mainParam.mobileNo = this.value;
	});
	mobileCom.addEventListener('blur', function () {
		commonParam.mobileNo = this.value;
	});
	mobileAss.addEventListener('blur', function () {
		assureParam.mobileNo = this.value;
	});
	//主借人最高学历选择
	$("#education").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(EDU_TYP,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                education.value = item[0].label;
				mainParam.education = item[0].value;
            },
            title: '请选择学历',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//共借人最高学历选择
	$("#educationCom").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(EDU_TYP,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                educationCom.value = item[0].label;
				commonParam.education= item[0].value;
            },
            title: '请选择学历',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//担保人最高学历选择
	$("#educationAss").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(EDU_TYP,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                educationAss.value = item[0].label;
				assureParam.education= item[0].value;
            },
            title: '请选择学历',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//主借人婚姻状况选择
	$("#married").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(MARR_STS,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                married.value = item[0].label;
				mainParam.marriage = item[0].value;
            },
            title: '请选择婚姻状况',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//共借人婚姻状况选择
	$("#marriedCom").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(MARR_STS,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                marriedCom.value = item[0].label;
				commonParam.marriage = item[0].value;
            },
            title: '请选择婚姻状况',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//担保人婚姻状况选择
	$("#marriedAss").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(MARR_STS,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                marriedAss.value = item[0].label;
				assureParam.marriage = item[0].value;
            },
            title: '请选择婚姻状况',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//主借人户籍地址选择
	$('#domiPlace').on('click', function () {
		var getArrVal=mData.changePro(CITY_DATA,this.id,3);
		var defPCA=getArrVal.indSeq.split(',');
		weui.picker(getArrVal.proVal, {
	       onConfirm: function(item) {
				domiPlace.value = item[0].label + ' ' + item[1].label + ' ' + item[2].label;
				mainParam.regProvince = item[0].value;
				mainParam.regCity = item[1].value;
				mainParam.regArea = item[2].value;
	       },
           title: '请选择区域',
           defaultValue:[defPCA[0],defPCA[1],defPCA[2]],
           id:this.id
     	})
    });

	//主借人居住状况选择
	$("#housing").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(LIVE_INFO,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                housing.value = item[0].label;
				mainParam.liveInfo = item[0].value;
            },
            title: '请选择居住状况',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//共借人居住状况选择
	$("#housingCom").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(LIVE_INFO,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                housingCom.value = item[0].label;
				commonParam.liveInfo = item[0].value;
            },
            title: '请选择居住状况',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//担保人居住状况选择
	$("#housingAss").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(LIVE_INFO,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                housingAss.value = item[0].label;
				assureParam.liveInfo = item[0].value;
            },
            title: '请选择居住状况',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//主借人居住地址选择
//	$('#homeAddress').on('click', function () {
//		document.activeElement.blur();
//		var getArrVal=mData.changePro(CITY_DATA,this.id,3);
//		var defPCA=getArrVal.indSeq.split(',');
//		weui.picker(getArrVal.proVal, {
//	       onConfirm: function(item) {
//				homeAddress.value = item[0].label + ' ' + item[1].label + ' ' + item[2].label;
//				mainParam.liveProvince = item[0].value;
//				mainParam.liveCity = item[1].value;
//				mainParam.liveArea = item[2].value;
//	       },
//         title: '请选择区域',
//         defaultValue:[defPCA[0],defPCA[1],defPCA[2]],
//         id:this.id
//     	})
//  });
//	homeAddressdet.addEventListener('blur', function () {
//		mainParam.liveAddr = this.value;
//	});

//	homeAddressdetnum.addEventListener('blur', function () {
//		mainParam.liveAddrNo = this.value;
//	});

	companyName.addEventListener('blur', function () {
		mainParam.companyname = this.value;
	});
	companyNameCom.addEventListener('blur', function () {
		commonParam.companyname = this.value;
	});
	companyNameAss.addEventListener('blur', function () {
		assureParam.companyname = this.value;
	});

	//共借人与主借人关系选择
	$("#relshipownCom").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(RELATION,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                relshipownCom.value = item[0].label;
				commonParam.apptRelation = item[0].value;
            },
            title: '请选择与主借人关系',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//担保人与主借人关系选择
	$("#relshipownAss").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(RELATION,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                relshipownAss.value = item[0].label;
				assureParam.apptRelation = item[0].value;
            },
            title: '请选择与主借人关系',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//主借人工作性质选择
	$("#workNature").on('click',function(){
		var _this = this;
		document.activeElement.blur();
		var getArrVal=mData.changePro(POSITION_OPT,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                workNature.value = item[0].label;
				mainParam.worknature = item[0].value;
				$(_this).attr('data-value', item[0].value);
				if ($(_this).attr('data-value') == '40' || $(_this).attr('data-value') == '50') {
					$(_this).parent().nextAll().find('.item-title').removeClass('must-input');
				} else {
					$(_this).parent().nextAll().find('.item-title').addClass('must-input');
				}
            },
            title: '请选择工作性质',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//共借人工作性质选择
	$("#workNatureCom").on('click',function(){
		var _this2 = this;
		document.activeElement.blur();
		var getArrVal=mData.changePro(POSITION_OPT,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                workNatureCom.value = item[0].label;
				commonParam.worknature = item[0].value;
				$(_this2).attr('data-value', item[0].value);
				if ($(_this2).attr('data-value') == '40' || $(_this2).attr('data-value') == '50') {
					$(_this2).parent().nextAll().find('.item-title').removeClass('must-input');
				} else {
					$(_this2).parent().nextAll().find('.item-title').addClass('must-input');
				}
            },
            title: '请选择工作性质',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//担保人工作性质选择
	$("#workNatureAss").on('click',function(){
		var _this3 = this;
		document.activeElement.blur();
		var getArrVal=mData.changePro(POSITION_OPT,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                workNatureAss.value = item[0].label;
				assureParam.worknature = item[0].value;
				$(_this3).attr('data-value', item[0].value);
				if ($(_this3).attr('data-value') == '40' || $(_this3).attr('data-value') == '50') {
					$(_this3).parent().nextAll().find('.item-title').removeClass('must-input');
				} else {
					$(_this3).parent().nextAll().find('.item-title').addClass('must-input');
				}
            },
            title: '请选择工作性质',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//主借人现单位性质选择
	$("#companyNature").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(INDIV_EMP_TYP,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                companyNature.value = item[0].label;
				mainParam.companynature = item[0].value;
            },
            title: '请选择现单位性质',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//共借人现单位性质选择
	$("#companyNatureCom").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(INDIV_EMP_TYP,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                companyNatureCom.value = item[0].label;
				commonParam.companynature = item[0].value;
            },
            title: '请选择现单位性质',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//担保人现单位性质选择
	$("#companyNatureAss").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(INDIV_EMP_TYP,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                companyNatureAss.value = item[0].label;
				assureParam.companynature = item[0].value;
            },
            title: '请选择现单位性质',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//主借人所属行业选择
	$("#industry").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(EMP_INDUSTRY,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                industry.value = item[0].label;
				mainParam.industry = item[0].value;
            },
            title: '请选择所属行业',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//共借人所属行业选择
	$("#industryCom").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(EMP_INDUSTRY,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                industryCom.value = item[0].label;
				commonParam.industry = item[0].value;
            },
            title: '请选择所属行业',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//担保人所属行业选择
	$("#industryAss").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(EMP_INDUSTRY,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                industryAss.value = item[0].label;
				assureParam.industry = item[0].value;
            },
            title: '请选择所属行业',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//主借人职务选择
	$("#workName").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(POSITION,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                workName.value = item[0].label;
				mainParam.position = item[0].value;
            },
            title: '请选择职务',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//共借人职务选择
	$("#workNameCom").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(POSITION,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                workNameCom.value = item[0].label;
				commonParam.position = item[0].value;
            },
            title: '请选择职务',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	//担保人职务选择
	$("#workNameAss").on('click',function(){
		document.activeElement.blur();
		var getArrVal=mData.changePro(POSITION,this.id);
        weui.picker(getArrVal.proVal, {
            onChange: function (item) {
            },
            onConfirm: function (item) {
                workNameAss.value = item[0].label;
				assureParam.position = item[0].value;
            },
            title: '请选择职务',
            defaultValue:[getArrVal.indSeq],
            id:this.id
        });
	});

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			'softinputMode': 'adjustResize'
		});
		mBank.isImmersed();
		mainParam.applCde = applCde;
		commonParam.applCde = applCde;
		assureParam.applCde = applCde;
		//		mData.getSystime().then(data => {
		//			list.sysTime = data.sysTime;
		//			sysTime = data.sysTime;
		//		})
		getSysTime();
		function getSysTime() {
			var url = mBank.getApiURL() + 'getSysTime.do';
			var param = {};
			mBank.apiSend("get", url, param, function (data) {
				sysTime = data.sysTime;
			}, function(err){
				reject(err);
			}, true, false);
		}

		camera.parentNode.addEventListener('tap', function () {
			document.activeElement.blur();
			mBank.openWindowByLoad('../../CommonPage/scanIdCard.html', 'scanIdCard', 'slide-in-right', {
				applTyp: '', viewId: self.id
			});
		});
		cameraCom.parentNode.addEventListener('tap', function () {
			document.activeElement.blur();
			if ($('#addHandleCom').hasClass('add')) {
				return;
			}
			mBank.openWindowByLoad('../../CommonPage/scanIdCard.html', 'scanIdCard', 'slide-in-right', {
				applTyp: 'Com', viewId: self.id
			});
		});
		cameraAss.parentNode.addEventListener('tap', function () {
			document.activeElement.blur();
			if ($('#addHandleAss').hasClass('add')) {
				return;
			}
			mBank.openWindowByLoad('../../CommonPage/scanIdCard.html', 'scanIdCard', 'slide-in-right', {
				applTyp: 'Ass', viewId: self.id
			});
		});

		window.addEventListener('idReverse', function (event) {
			var typ = event.detail.applTyp;
			var inputColl = list.inputColl;
			if (typ == '') {
				if (jsGetAge(mCheck.timeFormat(event.detail.Birth), sysTime) < 18) {
					mCheck.alert('借款人年龄小于18岁请到PC端申请');
					return;
				}
				if(event.detail.frontSrc.indexOf("data:image/jpeg;base64")==0 ||event.detail.frontSrc.indexOf("data:image/png;base64")==0){
					mainAge = jsGetAge(mCheck.timeFormat(event.detail.Birth));
					mainParam.certNo = event.detail.idNo;
					mainParam.custName = event.detail.custName;
					mainParam.sex = event.detail.sex;
					mainParam.Birth = event.detail.Birth;
				}
				if(event.detail.reverSrc.indexOf("data:image/jpeg;base64")==0 ||event.detail.reverSrc.indexOf("data:image/png;base64")==0){
					if (!event.detail.endDate || event.detail.endDate.indexOf('长期') > 0 || event.detail.endDate.indexOf('永久') > 0 || event.detail.endDate.indexOf('长') > 0 || event.detail.endDate.indexOf('期') > 0) {
						mainParam.idIsPermanent = 'Y';
						mainParam.idEndDt = '';
					    mainParam.idStartDt = event.detail.endDate.split("-")[0].replace(/\./g, "");
					} else {
						mainParam.idIsPermanent = 'N';
						mainParam.idEndDt = event.detail.endDate.split("-")[1].replace(/\./g, "");
						mainParam.idStartDt = event.detail.endDate.split("-")[0].replace(/\./g, "");
					}
				}else{
					if (event.detail.endDate==""){
						mainParam.idIsPermanent = 'N';
					}
				}
			} else if (typ == 'Com') {
				if(event.detail.frontSrc.indexOf("data:image/jpeg;base64")==0 ||event.detail.frontSrc.indexOf("data:image/png;base64")==0){
					comAge = jsGetAge(mCheck.timeFormat(event.detail.Birth));
					commonParam.certNo = event.detail.idNo;
					commonParam.custName = event.detail.custName;
					commonParam.sex = event.detail.sex;
					commonParam.Birth = event.detail.Birth;
				}
				if(event.detail.reverSrc.indexOf("data:image/jpeg;base64")==0 ||event.detail.reverSrc.indexOf("data:image/png;base64")==0){
					if (!event.detail.endDate || event.detail.endDate.indexOf('长期') > 0 || event.detail.endDate.indexOf('永久') > 0 || event.detail.endDate.indexOf('长') > 0 || event.detail.endDate.indexOf('期') > 0) {
						commonParam.idIsPermanent = 'Y';
						commonParam.idEndDt = '';
						commonParam.idStartDt = event.detail.endDate.split("-")[0].replace(/\./g, "");
					} else {
						commonParam.idIsPermanent = 'N';
						commonParam.idEndDt = event.detail.endDate.split("-")[1].replace(/\./g, "");
						commonParam.idStartDt = event.detail.endDate.split("-")[0].replace(/\./g, "");
					}
				}else{
					if (event.detail.endDate==""){
						commonParam.idIsPermanent = 'N';
					}
				}
				
			} else if (typ == 'Ass') {
				if(event.detail.frontSrc.indexOf("data:image/jpeg;base64")==0 ||event.detail.frontSrc.indexOf("data:image/png;base64")==0){
					assAge = jsGetAge(mCheck.timeFormat(event.detail.Birth));
					assureParam.certNo = event.detail.idNo;
					assureParam.custName = event.detail.custName;
					assureParam.sex = event.detail.sex;
					assureParam.Birth = event.detail.Birth;
				}
				if(event.detail.reverSrc.indexOf("data:image/jpeg;base64")==0 || event.detail.reverSrc.indexOf("data:image/png;base64")==0){
					if (!event.detail.endDate || event.detail.endDate.indexOf('长期') > 0 || event.detail.endDate.indexOf('永久') > 0 || event.detail.endDate.indexOf('长') > 0 || event.detail.endDate.indexOf('期') > 0) {
						assureParam.idIsPermanent = 'Y';
						assureParam.idEndDt = '';
						assureParam.idStartDt = event.detail.endDate.split("-")[0].replace(/\./g, "");
					} else {
						assureParam.idIsPermanent = 'N';
						assureParam.idEndDt = event.detail.endDate.split("-")[1].replace(/\./g, "");
						assureParam.idStartDt = event.detail.endDate.split("-")[0].replace(/\./g, "");
					}
				}else{
					if (event.detail.endDate==""){
						assureParam.idIsPermanent = 'N';
					}
				}
				
			}
			if(event.detail.frontSrc.indexOf("data:image/jpeg;base64")==0 ||event.detail.frontSrc.indexOf("data:image/png;base64")==0){
				inputColl['idNumber' + typ].value = event.detail.idNo;
				inputColl['custName' + typ].value = event.detail.custName;
				inputColl['apptStartDate' + typ].value = mCheck.timeFormat(event.detail.Birth);
				inputColl['indivSex' + typ].value = event.detail.sex == '0' ? '男' : '女';
			}
			if(event.detail.reverSrc.indexOf("data:image/jpeg;base64")==0 || event.detail.reverSrc.indexOf("data:image/png;base64")==0){
				if (!event.detail.endDate || event.detail.endDate.indexOf('长期') > 0 || event.detail.endDate.indexOf('永久') > 0 || event.detail.endDate.indexOf('长') > 0 || event.detail.endDate.indexOf('期') > 0) {
					$('#idDate' + typ).parent().hide();
					inputColl['idStart' + typ].value = event.detail.endDate.split("-")[0].replace(/\./g, "-");
					$('#isOrNot' + typ).find('.yes').addClass('selected').siblings('span').removeClass('selected');
				} else {
					$('#idDate' + typ).parent().show();
					$('#idStart' + typ).parent().show();
					inputColl['idStart' + typ].value = event.detail.endDate.split("-")[0].replace(/\./g, "-");
					inputColl['idDate' + typ].value = event.detail.endDate.split("-")[1].replace(/\./g, "-");
					$('#isOrNot' + typ).find('.no').addClass('selected').siblings('span').removeClass('selected');
				}
			}
			
		});

		//查询方法
		//查询借款人信息
		queryDealerAppLoanApptInfo(applCde, '', '01').then(function (data) {
			mCheck.assignObj(mainParam, data);
			mainParam.aprFlag = '01';
			mainAge = jsGetAge(apptStartDate.value);
		},function(err){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});
		//查询共借人信息
		queryDealerAppLoanApptInfo(applCde, 'Com', '02').then(function (data) {
			if (data.aprFlag == '02') {
				$('#reduceHandleCom').addClass('reduce').siblings('span').removeClass('add');
				$('#personCom').find('input').map(function (index, item) {
					item.disabled = false;
				});
				$('#commonBox').show();
			} else {
				$('#addHandleCom').addClass('add').siblings('span').removeClass('reduce');
				$('#personCom').find('input').map(function (index, item) {
					item.disabled = true;
				});
				$('#commonBox').hide();
			}
			mCheck.assignObj(commonParam, data);
			commonParam.aprFlag = '02';

			comAge = jsGetAge(apptStartDateCom.value);
		},function(err){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});

		//查询担保人信息
		queryDealerAppLoanApptInfo(applCde, 'Ass', '03').then(function (data) {
			if (data.aprFlag == '03') {
				$('#reduceHandleAss').addClass('reduce').siblings('span').removeClass('add');
				$('#personAss').find('input').map(function (index, item) {
					item.disabled = false;
				});
				$('#assureBox').show();
			} else {
				$('#addHandleAss').addClass('add').siblings('span').removeClass('reduce');
				$('#personAss').find('input').map(function (index, item) {
					item.disabled = true;
				});
				$('#assureBox').hide();
			}
			mCheck.assignObj(assureParam, data);
			assureParam.aprFlag = '03';
			assAge = jsGetAge(apptStartDateAss.value);
		},function(err){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});

		//调用保存申请人方法
		var saveDealerAppLoanPerson = function saveDealerAppLoanPerson(param) {
			var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
			//保存申请人接口
			var param = Object.assign(param, { 'SaveFlagBit': SaveFlag }, { 'CoBorrowerBit': CoBorrower }, { 'SponsorMarkBit': SponsorMark });
			var url = mBank.getApiURL() + 'saveDealerAppLoanPerson.do';
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

		function isEmpty2() {

			if (mobile.value != '' && !mCheck.checkCellnum2(mobile.value)) {
				mCheck.alert('借款人移动电话格式错误');
				return false;
			}
			if (idNumber.value != '') {
				if (!mCheck.checkIdNumber(idNumber.value)) {
					mCheck.alert('借款人证件号码有误');
					return false;
				}
			}

			if ($('#reduceHandleCom').hasClass('reduce')) {
				if (idNumberCom.value != '') {
					if (!mCheck.checkIdNumber(idNumberCom.value)) {
						mCheck.alert('共借人证件号码有误');
						return false;
					}
				}
				if (idNumber.value != '' && idNumberCom.value != '') {
					if (idNumber.value == idNumberCom.value) {
						mCheck.alert('借款人和共借人证件号码不能相同');
						return false;
					}
				}

				if (mobileCom.value != '' && !mCheck.checkCellnum2(mobileCom.value)) {
					mCheck.alert('共借人移动电话格式错误');
					return false;
				}
				if (mobile.value != '' && mobileCom.value != '') {
					if (mobile.value == mobileCom.value) {
						mCheck.alert('借款人和共借人移动电话不能相同');
						return false;
					}
				}
			}
			if ($('#reduceHandleAss').hasClass('reduce')) {
				if (idNumberAss.value != '') {
					if (!mCheck.checkIdNumber(idNumberAss.value)) {
						mCheck.alert('保证人证件号码有误');
						return false;
					}
				}
				if (idNumber.value != '' && idNumberAss.value != '') {
					if (idNumber.value == idNumberAss.value) {
						mCheck.alert('借款人和保证人证件号码不能相同');
						return false;
					}
				}

				if (mobileAss.value != '' && !mCheck.checkCellnum2(mobileAss.value)) {
					mCheck.alert('保证人移动电话格式错误');
					return false;
				}
				if (mobile.value != '' && mobileAss.value != '') {
					if (mobile.value == mobileAss.value) {
						mCheck.alert('借款人和保证人移动电话不能相同');
						return false;
					}
				}
			}
			if ($('#reduceHandleCom').hasClass('reduce') && $('#reduceHandleAss').hasClass('reduce')) {
				if (idNumberCom.value != '' && idNumberAss.value != '') {
					if (idNumberCom.value == idNumberAss.value) {
						mCheck.alert('共借人和保证人证件号码不能相同');
						return false;
					}
				}
				if (mobileCom.value != '' && mobileAss.value != '') {
					if (mobileCom.value == mobileAss.value) {
						mCheck.alert('共借人和保证人移动电话不能相同');
						return false;
					}
				}
			}

			if (mainParam.marriage == '20') {

				if (commonParam.apptRelation == '06' && assureParam.apptRelation == '06') {
					mCheck.alert('共借人和保证人与借款人关系不能同时选择配偶');
					return false;
				}
			}

			if (mainParam.marriage != '20') {
				if (commonParam.apptRelation == '06') {
					mCheck.alert('借款人未婚，共借人与借款人关系不能选择配偶');
					return false;
				}
				if (assureParam.apptRelation == '06') {
					mCheck.alert('借款人未婚，保证人与借款人关系不能选择配偶');
					return false;
				}
			}
			if (commonParam.apptRelation == '06' && commonParam.marriage != '20') {
				mCheck.alert('共借人为借款人的配偶，婚姻状况必须选择已婚');
				return false;
			}
			if (assureParam.apptRelation == '06' && assureParam.marriage != '20') {
				mCheck.alert('保证人为借款人的配偶，婚姻状况必须选择已婚');
				return false;
			}
			if (mainParam.idIsPermanent == 'Y' && mainAge < 45) {
				mCheck.alert('借款人，年龄小于45岁，证件不能永久有效！');
				return false;
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
			if (idNumber.value == '' || idNumber.value == "undefined") {
				mCheck.alert('借款人证件号码不能为空');
				return false;
			}
			if (!mCheck.checkIdNumber(idNumber.value)) {
				mCheck.alert('借款人证件号码有误');
				return false;
			}
			if (mainParam.idIsPermanent == 'N' && idStart.value == '') {
				mCheck.alert('借款人证件开始日不能为空');
				return false;
			}
			if (mainParam.idIsPermanent == 'N' && idDate.value == '') {
				mCheck.alert('借款人证件到期日不能为空');
				return false;
			}
			if (mobile.value == '' || mobile.value == "undefined") {
				mCheck.alert('借款人移动电话不能为空');
				return false;
			}
			if (!mCheck.checkCellnum2(mobile.value)) {
				mCheck.alert('借款人移动电话格式错误');
				return false;
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
//			if (homeAddress.value == '' || homeAddressdet.value == '') {
//				mCheck.alert('借款人居住地址不能为空');
//				return false;
//			}
//			if (homeAddressdetnum.value == '' || homeAddressdetnum.value == 'undefined') {
//				mCheck.alert('借款人居住门牌号不能为空');
//				return false;
//			}

			if (domiPlace.value == '' || domiPlace.value == 'undefined') {
				mCheck.alert('借款人户籍地址不能为空');
				return false;
			}

			if (workNature.value == '') {
				mCheck.alert('请选择借款人工作性质');
				return false;
			}
			if (mainParam.worknature == '10' || mainParam.worknature == '20') {
				if (companyName.value == '' || companyName.value == 'undefined') {
					mCheck.alert('借款人现单位名称不能为空');
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
				if (!mCheck.checkIdNumber(idNumberCom.value)) {
					mCheck.alert('共借人证件号码有误');
					return false;
				}
				if (commonParam.idIsPermanent == 'N' && idStartCom.value == '') {
					mCheck.alert('共借人证件到期日不能为空');
					return false;
				}
				if (commonParam.idIsPermanent == 'N' && idDateCom.value == '') {
					mCheck.alert('共借人证件到期日不能为空');
					return false;
				}
				if (idNumber.value == idNumberCom.value) {
					mCheck.alert('借款人和共借人证件号码不能相同');
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
				if (mobile.value == mobileCom.value) {
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
				if (housingCom.value == '') {
					mCheck.alert('请选择共借人居住状况');
					return false;
				}

				if (workNatureCom.value == '') {
					mCheck.alert('请选择共借人工作性质');
					return false;
				}

				if (commonParam.worknature == '10' || commonParam.worknature == '20') {
					if (companyNameCom.value == '' || companyNameCom.value == 'undefined') {
						mCheck.alert('共借人现单位名称不能为空');
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
				if (!mCheck.checkIdNumber(idNumberAss.value)) {
					mCheck.alert('保证人证件号码有误');
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
				if (idNumber.value == idNumberAss.value) {
					mCheck.alert('借款人和保证人证件号码不能相同');
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
				if (mobile.value == mobileAss.value) {
					mCheck.alert('借款人和保证人移动电话不能相同');
					return false;
				}

				if (educationAss.value == '') {
					mCheck.alert('请选择保证人最高学历');
					return false;
				}
				if (marriedAss.value == '') {
					mCheck.alert('请选择保证人婚姻状况');
					return false;
				}
				if (housingAss.value == '') {
					mCheck.alert('请选择保证人居住状况');
					return false;
				}

				if (workNatureAss.value == '') {
					mCheck.alert('请选择保证人工作性质');
					return false;
				}

				if (assureParam.worknature == '10' || assureParam.worknature == '20') {
					if (companyNameAss.value == '' || companyNameAss.value == 'undefined') {
						mCheck.alert('保证人现单位名称不能为空');
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

			if (mainParam.marriage == '20') {
				if (commonParam.apptRelation == '06' && assureParam.apptRelation == '06') {
					mCheck.alert('共借人和保证人与借款人关系不能同时选择配偶');
					return false;
				}
			}

			if (mainParam.marriage != '20') {
				if (commonParam.apptRelation == '06') {
					mCheck.alert('借款人未婚，共借人与借款人关系不能选择配偶');
					return false;
				}
				if (assureParam.apptRelation == '06') {
					mCheck.alert('借款人未婚，保证人与借款人关系不能选择配偶');
					return false;
				}
			}
			if (commonParam.apptRelation == '06' && commonParam.marriage != '20') {
				mCheck.alert('共借人为借款人的配偶，婚姻状况必须选择已婚');
				return false;
			}
			if (assureParam.apptRelation == '06' && assureParam.marriage != '20') {
				mCheck.alert('保证人为借款人的配偶，婚姻状况必须选择已婚');
				return false;
			}
			if (mainParam.idIsPermanent == 'Y' && mainAge < 45) {
				mCheck.alert('借款人，年龄小于45岁，证件不能永久有效！');
				return false;
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
			mData.unLock(applCde, nodeSign, outSts, "01").then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back1();
				}
			});
		};
		back.addEventListener('tap', function () {
			document.activeElement.blur();
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, "01").then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back1();
				}
			});
		});

		pre.addEventListener('tap', function () {
			document.activeElement.blur();
			mBank.openWindowByLoad('./loanPre.html', 'loanPre', 'slide-in-left');
		});
		save.addEventListener('tap', function () {
			document.activeElement.blur();
			if (!list.canClick) {
				return;
			}
			list.canClick = false;
			SaveFlag = '0';
			$('#waitingBox').show();
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					$('#waitingBox').hide();
					list.canClick = true;
					return;
				}else{
					if (!isEmpty2()) {
						list.canClick = true;
						$('#waitingBox').hide();
						return;
					}
					Promise.all([saveDealerAppLoanPerson(mainParam), saveDealerAppLoanPerson(commonParam, 'Com'), saveDealerAppLoanPerson(assureParam, 'Ass')]).then(function (data) {
						list.canClick = true;
						$('#waitingBox').hide();
				        mData.updateLock(applCde, nodeSign, outSts, '999','').then(function(dat){});
						mui.alert('保存成功', '提示', '确定', function () {}, 'div');
					}, function (err) {
						$('#waitingBox').hide();
						list.canClick = true;
						mCheck.alert(err.em);
					});
				}
			});
		});
		next.addEventListener('tap', function () {
			document.activeElement.blur();
			if (!list.canClick) {
				return;
			}
			list.canClick = false;
			SaveFlag = '1';
			$('#waitingBox').show();
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					list.canClick = true;
					$('#waitingBox').hide();
					return;
				}else{
					var mainParamObj = mCheck.formatObj(mainParam);
					if (!isEmpty()) {
						list.canClick = true;
						$('#waitingBox').hide();
						return;
					}
					Promise.all([saveDealerAppLoanPerson(mainParam), saveDealerAppLoanPerson(commonParam, 'Com'), saveDealerAppLoanPerson(assureParam, 'Ass')]).then(function (data) {
						mData.updateLock(applCde, nodeSign, outSts, '999','').then(function(dat){
							if(dat=='N'){
								list.canClick = true;
								$('#waitingBox').hide();
								return;
							}else{
								list.canClick = true;
								mBank.openWindowByLoad('../../CommonPage/signInit.html', 'signInit', 'slide-in-right');
							}
						});
						
					}, function (err) {
						$('#waitingBox').hide();
						list.canClick = true;
						mCheck.alert(err.em);
					});
				}
			});
		});
	});
});