'use strict';

define(function (require, exports, module) {
	var mbank = require('./bank');
	var mCheck = require('./check');

	/*查询编辑锁*/
	exports.queryLock = function (applCde, nodeSign, outSts, contNo, subFlag, ele) {
		var isEdit = "Y";
		var url = mbank.getApiURL() + 'queryLocking.do';
		var sendData = {
			"applCde": applCde,
			"nodeSign": nodeSign,
			"outSts": outSts
		};
		return new Promise(function (resolve, reject) {
			mbank.apiSend('post', url, sendData, function (data) {
				if (data.ec == '0') {
					for (var key in data) {
						if (data[key] == null || data[key] == "null") {
							data[key] = "";
						}
					}
					if (data.editable == 'Y') {
						if (subFlag == "01" && data.imageFlag == "Y") {
							mCheck.alert("该申请单在完成影像操作前，不允许提交");
							isEdit = "N";
						}else{
							isEdit = "Y";
						}
					} else if (data.editable == "N") {
						if (data.currentLock == "") {
							mCheck.alert("您已失去编辑权限，不允许继续操作");
						} else {
							mCheck.alert("您已失去编辑权限，不允许继续操作。该申请单编辑用户已变更为" + data.currentLock);
						}
						isEdit = "N";
					}
				} else {
					isEdit = "N";
				}
				resolve(isEdit);
			}, function (err) {
				$('#waitingBox').hide();
				mCheck.alert(err.em);
				isEdit = "N";
				reject(isEdit);
			}, true, false);
		});
		
	};
	/*添加编辑锁*/
	exports.editLock = function (applCde, nodeSign, outSts, flag, operationType,callback) {
		if (!flag) {
			flag = "100";
		}
		if (!operationType) {
			operationType = "";
		}
		var isEdit = "Y";
		var url = mbank.getApiURL() + 'editLocking.do';
		var sendData = {
			"applCde": applCde,
			"nodeSign": nodeSign,
			"outSts": outSts,
			"flag": flag,
			"operationType": operationType,
			'handlingChannel': '01'
		};
		return new Promise(function (resolve, reject) {
			mbank.apiSend('post', url, sendData, function (data) {
				if (data.ec == '0') {
					for (var key in data) {
						if (data[key] == null || data[key] == "null") {
							data[key] = "";
						}
					}
					if (data.editable == "N" && data.currentLock != "") {
						mCheck.alert("该申请单已被用户" + data.currentLock + "锁定，如需操作，请信贷主管或其他权限用户进入\"解除锁定\"菜单解绑。");
						isEdit = "N";
					}else{
						isEdit = "Y";
					}
				} else if (data.ec == 'LK0001') {
					mCheck.alert(data.em);
					isEdit = "N";
				}else{
					isEdit = "N";
				}
				resolve(isEdit);
			}, function (err) {
				$('#waitingBox').hide();
				mCheck.alert(err.em);
				isEdit = "N";
				reject(isEdit);
			}, true, false);
		});
		
	};
	/*添加更新锁*/
	exports.updateLock = function (applCde, nodeSign, outSts, flag,callback) {
		if (!flag) {
			flag = "100";
		}
		var isEdit = "N";
		var url = mbank.getApiURL() + 'updateLocking.do';
		var sendData = {
			"applCde": applCde,
			"nodeSign": nodeSign,
			"outSts": outSts,
			"flag": flag
		};
		return new Promise(function (resolve, reject) {
			mbank.apiSend('post', url, sendData, function (data) {
				if (data.ec == '0') {
					isEdit = "Y";
				}else{
					isEdit = "N";
				}
				resolve(isEdit);
			}, function (err) {
				$('#waitingBox').hide();
				mCheck.alert(err.em);
				isEdit = "N";
				reject(isEdit);
			}, true, false);
		});
		
	};
	/*解除编辑锁*/
	exports.unLock = function (applCde, nodeSign, outSts, flag) {
		var isUnlock = "N";
		var url = mbank.getApiURL() + 'unLocking.do';
		var sendData = {
			"applCde": applCde,
			"nodeSign": nodeSign,
			"outSts": outSts,
			"flag": flag
		};
		return new Promise(function (resolve, reject) {
			mbank.apiSend('post', url, sendData, function (data) {
				console.log(JSON.stringify(data));
				if (data.ec == '0') {
					isUnlock = "Y";
				}else{
					isUnlock="N";
				}
				resolve(isUnlock);
			}, function (err) {
				$('#waitingBox').hide();
				mCheck.alert(err.em);
				isUnlock = "Y";
				reject(isUnlock);
			}, true, false);
		});
		
	};

	/*调用接口公共方法*/
	exports.interFace = function (type, interName) {
		var url = '' + mbank.getApiURL() + interName + '.do';
		var param = arguments.length <= 2 ? undefined : arguments[2];
		return new Promise(function (resolve, reject) {
			mbank.apiSend(type, url, param, function (data) {
				resolve(data);
			}, function (err) {
				reject(err);
			});
		});
	};

	/*查询经销商评级、该门店业务范围*/
	exports.queryriskflagsec = function (storeNo) {
		var applCde = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

		var _url = mbank.getApiURL() + 'queryriskflagsec.do';
		var _param = {
			'storeNo': storeNo,
			'applCde': applCde
		};
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', _url, _param, function (data) {
				if (data.ec == '0') {
					localStorage.setItem('sessionRiskFlag', data.co_riskflag);
					resolve(data);
				}
			}, null, true, false);
		});
	};

	/*获取系统时间*/
	exports.getSystime = function () {
		var url = mbank.getApiURL() + 'getSysTime.do';
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', url, {}, function (data) {
				if (data.ec == '0') {
					resolve(data);
				}
			}, null);
		});
	};

	/*列表选择*/
	exports.selectData = function (data) {
		var layer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
		var picker = new mui.PopPicker({ layer: layer });
		picker.setData(data);
		return new Promise(function (resolve, reject) {
			if (data.length == '0') {
				mCheck.alert("查询无数据");
				return;
			}
			picker.show(function (item) {
				if (layer == 3) {
					var arr = [];
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;
					
					try {
						for (var _iterator = item[0].children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var items = _step.value;
 
							arr.push(items.value);
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
					if (arr.indexOf(item[1].value) == -1) {
						return;
					}
				}
				if(item.length==1){
					if (item[0].text != "") {
						if (item[0].value == "undefined" || item[0].value == undefined || item[0].value == null) {
							item[0].text = "";
						}
					}
				}else if(item.length==3){
					if(item[0].text !="" ||item[1].text !=""||item[2].text !=""){
						if(item[0].value=="undefined" || item[0].value == undefined || item[0].value == null){
							return;
						}
						if(item[1].value=="undefined" || item[1].value == undefined || item[1].value == null){
							return;
						}
						if(item[2].value=="undefined" || item[2].value == undefined || item[2].value == null){
							return ;
						}
					}
				}
				resolve(item);
			});
		});
	};
	/*日期选择*/
	exports.selectDate = function (data) {
		var picker = new mui.DtPicker(data);
		return new Promise(function (resolve, reject) {
			picker.show(function (item) {
				resolve(item);
			});
		});
	};
	/*查询品牌*/
	exports.getCarBrand = function (carType) {
		var _url = mbank.getApiURL() + 'getCarBrand.do';
		var _param = { 'carType': carType };
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', _url, _param, function (data) {
				data.iCarInfoList.forEach(function (item) {
					item.text = item.sb_brand_nam;
					item.value = item.sb_brand_cde;
				});
				resolve(data.iCarInfoList);
			}, function (err) {
				reject(err);
			}, true);
		});
	};

	/*查询子品牌*/
	exports.getSubCarBrand = function (carType, sbBrandCde) {
		var _url = mbank.getApiURL() + 'getSubCarBrand.do';
		var _param = { 'carType': carType, 'sb_brand_cde': sbBrandCde };
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', _url, _param, function (data) {
				data.iCarInfoList.forEach(function (item) {
					item.text = item.sub_sb_brand_nam;
					item.value = item.sub_sb_brand_cde;
				});
				resolve(data.iCarInfoList);
			}, function (err) {
				reject(err);
			}, true);
		});
	};

	/*查询车系*/
	exports.getCarSeries = function (carType, sbBrandCde, subSbBrandCde) {
		var _url = mbank.getApiURL() + 'getCarSeries.do';
		var _param = { 'carType': carType, 'sb_brand_cde': sbBrandCde, 'sub_sb_brand_cde': subSbBrandCde };
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', _url, _param, function (data) {
				data.iCarInfoList.forEach(function (item) {
					item.text = item.svc_class_nam;
					item.value = item.svc_class_cde;
				});
				resolve(data.iCarInfoList);
			}, null);
		});
	};

	/*查询年型*/
	exports.getCarModeYear = function (carType, sbBrandCde, svcClassCde) {
		var _url = mbank.getApiURL() + 'getCarModeYear.do';
		var _param = { 'carType': carType, 'sb_brand_cde': sbBrandCde, 'svc_class_cde': svcClassCde };
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', _url, _param, function (data) {
				data.iModeYearList.forEach(function (item) {
					item.text = item.mode_year_nam;
					item.value = item.mode_year_cde;
				});
				resolve(data.iModeYearList);
			}, null);
		});
	};

	/*查询车型*/
	exports.getCarModel = function (carType, carSeries, modeYearCde) {
		var _url = mbank.getApiURL() + 'getCarModel.do';
		var _param = { 'carType': carType, 'svc_class_cde': carSeries, 'mode_year_cde': modeYearCde };
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', _url, _param, function (data) {
				data.iCarInfoList.forEach(function (item) {
					item.text = item.svm_mode_nam;
					item.value = item.svm_mode_cde;
				});
				resolve(data.iCarInfoList);
			}, null);
		});
	};

	/*查询产品线*/
	exports.queryPGrpList = function (carType) {
		var _url = mbank.getApiURL() + 'queryPGrpList.do';
		var _param = { 'cusKind': '01', 'carType': carType };
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', _url, _param, function (data) {
				data.pGrpList.forEach(function (item) {
					item.text = item.grpName;
					item.value = item.grpCde;
				});
				resolve(data.pGrpList);
			}, function(err){
				reject(err);
			});
		});
	};

	/*查询贷款产品*/
	exports.queryLoanProduct = function () {
		var carType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
		var grpCde = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
		var goodsKind = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
		var carSeries = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
		var mode_year_cde = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
		var goodsModel = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';

		var _url = mbank.getApiURL() + 'getLoanProduct.do';
		var _param = {
			'cusKind': '01',
			'carType': carType,
			'grpCde': grpCde,
			'iLoanCarInfo1.sb_brand_cde': [goodsKind],
			'iLoanCarInfo1.svc_class_cde': [carSeries],
			'iLoanCarInfo1.yearModel': [mode_year_cde],
			'iLoanCarInfo1.svm_mode_cde': [goodsModel]
		};
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', _url, _param, function (data) {
				data.iLoyalProdList = data.iLoyalProdList.map(function (item) {
					return item.loyalProdCde;
				});
				data.iLoanProductList.forEach(function (item) {
					if (data.iLoyalProdList.includes(item.typCde)) {
						item.loyalCust = 'Y';
					} else {
						item.loyalCust = 'N';
					}
					item.text = item.typDesc;
					item.value = item.typCde;
				});
				resolve(data.iLoanProductList);
			}, null);
		});
	};

	/*计算贷款金额*/
	exports.cfLoanAmt = function () {
		var _url = mbank.getApiURL() + 'CfLoanAmt.do';
		var _params = arguments.length <= 0 ? undefined : arguments[0];
		return new Promise(function (resolve, reject) {
			mbank.apiSend('post', _url, _params, function (data) {
				resolve(data);
			}, function (err) {
				reject(err);
			}, true, false);
		});
	};

	/*计算执行利率*/
	exports.getLoanInf = function (typSeq, loanAmt) {
		var _url = mbank.getApiURL() + 'getLoanInf.do';
		var _params = { typSeq: typSeq, loanAmt: loanAmt };
		return new Promise(function (resolve, reject) {
			mbank.apiSend('post', _url, _params, function (data) {
				resolve(data);
			},function(err){
				reject(err);
			}, true, false);
		});
	};

	/*删除共借人、担保人信息*/
	exports.deletePreLoanOtherAppt = function (applCde, aprFlag, flag) {
		var _url = mbank.getApiURL() + 'deletePreLoanOtherAppt.do';
		var _params = { applCde: applCde, aprFlag: aprFlag, flag: flag };
		return new Promise(function (resolve, reject) {
			mbank.apiSend('post', _url, _params, function (data) {
				resolve(data);
			}, null);
		});
	};
	/*下拉选项改变数据属性，默认选择的位置*/
	exports.changePro = function(proCode,selectId){
		var layer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
		var infoVal={
			'proVal':'',
			'indSeq':''
		};
		infoVal.proVal=JSON.parse(JSON.stringify(proCode).replace(/text/g,"label"));
		if (infoVal.proVal.length == '0') {
			mCheck.alert("查询无数据");
			return infoVal;
		}
		var indVal=$('#'+selectId+'').val();
		if(layer==1){
			for(var i=0;i<infoVal.proVal.length;i++){
				if(indVal==infoVal.proVal[i].label){
					infoVal.indSeq=infoVal.proVal[i].value;
				}
			}
		}else if(layer==2){
			var arrVal=indVal.split(/\s+/);
			for(var i=0;i<infoVal.proVal.length;i++){
				if(arrVal[0]==infoVal.proVal[i].label){
					infoVal.indSeq =infoVal.proVal[i].value+',';
					for(var j=0;j<infoVal.proVal[i].children.length;j++){
						if(arrVal[1]==infoVal.proVal[i].children[j].label){
							infoVal.indSeq +=infoVal.proVal[i].children[j].value;
						}
					}
				}
			}
		}else{
			var arrVal=indVal.split(/\s+/);
			for(var i=0;i<infoVal.proVal.length;i++){
				if(arrVal[0]==infoVal.proVal[i].label){
					infoVal.indSeq =infoVal.proVal[i].value+',';
					for(var j=0;j<infoVal.proVal[i].children.length;j++){
						if(arrVal[1]==infoVal.proVal[i].children[j].label){
							infoVal.indSeq +=infoVal.proVal[i].children[j].value+',';
							for(var k=0;k<infoVal.proVal[i].children[j].children.length;k++){
								if(arrVal[2]==infoVal.proVal[i].children[j].children[k].label){
									infoVal.indSeq +=infoVal.proVal[i].children[j].children[k].value;
								}
							}
						}
					}
				}
			}
		}
		if (infoVal.indSeq === null || infoVal.indSeq === undefined || infoVal.indSeq === 'undefined' || infoVal.indSeq === '' || infoVal.indSeq === 'null') {
			if(layer==1){
				infoVal.indSeq=infoVal.proVal[0].value;
			}else if(layer==2){
				infoVal.indSeq=infoVal.proVal[0].value+','+infoVal.proVal[0].children[0].value;
			}else{
				infoVal.indSeq=infoVal.proVal[0].value+','+infoVal.proVal[0].children[0].value+','+infoVal.proVal[0].children[0].children[0].value;
			}
		}else{
			infoVal.indSeq=infoVal.indSeq;
		}
		return infoVal;
	}
	/*日期下拉选择*/
	exports.clearDate=function (itemY,itemM,itemD){
		itemY=itemY.substring(0,itemY.length-1);
		itemM=itemM.substring(0,itemM.length-1);
		itemD=itemD.substring(0,itemD.length-1);
		if(itemM<10){
			itemM='0'+itemM;
		}else{
			itemM=itemM;
		}
		if(itemD<10){
			itemD='0'+itemD;
		}else{
			itemD=itemD;
		}
		var getVal=itemY+'-'+itemM+'-'+itemD;
		return getVal;
	}
	exports.selDate=function(getVal,listSysDate){
		var options = { 'type': 'date' };
		var dataInfoVal={
			startDate:'',
			endDate:'',
			defY:'',
			defM:'',
			defD:''
		};
		var dateTime = new Date(listSysDate.substr(0, 4), parseInt(listSysDate.substr(4, 2)) - 1, listSysDate.substr(6, 2));
		var preDateTime=new Date(dateTime.getTime() - 24*60*60*1000);
		options.beginYear = dateTime.getFullYear() - 12;
		options.beginMonth = dateTime.getMonth() + 1;
		options.beginDay = dateTime.getDate();
		options.endYear = preDateTime.getFullYear();
		options.endMonth = preDateTime.getMonth() + 1;
		options.endDay = preDateTime.getDate();
		dataInfoVal.startDate=options.beginYear+'-'+options.beginMonth+'-'+options.beginDay;
		dataInfoVal.endDate = options.endYear+'-'+options.endMonth+'-'+options.endDay;
		if(getVal==''){
			dataInfoVal.defY=options.endYear;
			dataInfoVal.defM=options.endMonth;
			dataInfoVal.defD=options.endDay;
		}else{
			var itemArr=getVal.split('-');
			dataInfoVal.defY=itemArr[0];
			dataInfoVal.defM=itemArr[1];
			dataInfoVal.defD=itemArr[2];
		}
		return dataInfoVal;
	}
});