"use strict";

define(function (require, exports, module) {

	/**
  * 数字校验
  */
	exports.checknum = function (obj) {
		obj.value = obj.value.replace(/[^\d.]/g, ""); //清除数字和.以外的字符
		obj.value = obj.value.replace(/\.{2,}/g, ""); //只保留第一个.，清除多余的
		obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
		obj.value = obj.value.replace(/^(\d+)\.(\d\d).*$/, '$1.$2');
		if (obj.value.indexOf(".") < 0 && obj.value != "") {
			obj.value = parseFloat(obj.value);
		}
		if (obj.value.indexOf(".") == 0 && obj.value != "") {
			obj.value = "0.";
		}
	};
	//只能输入数字，其它字符都不输入
	exports.checknum1 = function (obj) {
		obj.value = obj.value.replace(/[^\d]/g, ""); //清除数字以外的字符
		if (obj.value.indexOf(".") < 0 && obj.value != "") {
			//首位不能输入0这个字符
			obj.value = parseFloat(obj.value);
		}
	};
	exports.toast = function (tips) {
		mui.toast(tips, { type: 'div' });
	};

	/*alert弹出框*/
	exports.alert = function (str) {
		var callBack = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

		mui.alert(str, "提示", "确定", callBack, 'div');
	};
	/*
  * 新增接口交易处理失败的方法
  */
	exports.callPortFailed = function (ecMark, emDesc, emId) {
		if (ecMark == "EBLN0000") {
			mui.alert(emDesc, "提示", "确定", function () {
				$(emId).hide();
			}, 'div');
		} else if (ecMark == "ERC0001") {
			mui.alert(emDesc, "提示", "确定", function () {
				$(emId).hide();
			}, 'div');
		} else {
			mui.alert(emDesc, "提示", "确定", function () {
				$(emId).hide();
			}, 'div');
		}
		return;
	};

	/*城市数据字典转换*/
	exports.formatCity = function (data, dataList) {
		if (data == '' || data == ',,' || data == ',' || data == undefined || data=="undefined") {
			return '';
		}
		var ARR = data.split(',');
		var list = dataList.filter(function (item) {
			return item.value == ARR[0];
		});
		if (ARR.length == 1) {
			return list[0].text;
		} else {
			var twoList = list[0].children.filter(function (item) {
				return item.value == ARR[1];
			});
			if (ARR.length == 2) {
				return list[0].text + " " + twoList[0].text;
			} else if (ARR.length == 3) {
				var threeList = twoList[0].children.filter(function (item) {
					return item.value == ARR[2];
				});
				return list[0].text + " " + twoList[0].text + " " + threeList[0].text;
			}
		}
	};

	/*手机号码校验*/
	exports.checkCellnum = function (cellnum) {
		if (cellnum === '') {
			mui.toast('请输入手机号码', { type: 'div' });
			return false;
		}
		var REG = new RegExp(/^(1[1-9])[0-9]{9}$/);
		if (!REG.test(cellnum)) {
			mui.toast('请输入正确的手机号码', { type: 'div' });
			return false;
		}
		return true;
	};

	/*手机号码校验2*/
	exports.checkCellnum2 = function (cellnum) {
		var REG = new RegExp(/^(1[1-9])[0-9]{9}$/);
		if (!REG.test(cellnum)) {
			return false;
		}
		return true;
	};

	exports.checkHomeTell = function (a) {
		var REG = new RegExp(/^((0?[0-9]{2,3}-?){0,1}[0-9]{7,8}(-[0-9]{1,4}){0,1}|(1\d{10}))$/);
		if (!REG.test(a)) {
			return false;
		}
		return true;
	};

	exports.checkOffTel = function (a) {
		var REG = new RegExp(/^((0?[0-9]{2,3}-?){0,1}[0-9]{7,8}(-[0-9]{1,4}){0,1}|(1\d{10}))$/);
		if (!REG.test(a)) {
			return false;
		}
		return true;
	};

	/*对象属性值为null，改为空*/
	exports.formatObj = function (obj) {
		//优化： 是否要判断数据类型为对象好一点？
		for (var key in obj) {
			if (obj[key] === null || obj[key] == undefined || obj[key] == "undefined") {
				obj[key] = '';
			}
		}
		return obj;
	};

	/*数据描述以及代码转换*/
	exports.formatData = function (data, dataList) {
		if (data == '') {
			return data;
		}
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = dataList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var item = _step.value;

				if (item.value === data) {
					return item.text;
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
	};

	exports.removeSeparator = function (s) {
		if (s == "") {
			s = 0;
		} else {
			s = parseFloat(s.replace(/[^0-9-.]/g, ''));
		}
		return s;
	};

	/*添加货币分隔符*/
	exports.addSeparator = function (money) {
		//怎样判断一个变量是数字还是数字类型的字符串，需要优化
		if (isNaN(money)) {
			return 0;
		}
		if (/[^0-9\.]/.test(money)) {
			return 0;
		}
		money = money.toString();
		money = money.replace(/^(\d*)$/, '$1.'); //将数字替换为数字. 例如112替换成112.
		money = (money + '00').replace(/(\d*\.\d\d)\d*/, '$1'); //112.00 => 112.00
		money = money.replace('.', ',');
		var REG = /(\d)(\d{3},)/;
		while (REG.test(money)) {
			money = money.replace(REG, '$1,$2');
		}
		money = money.replace(/,(\d\d)$/, '.$1');
		return money.replace(/^\./, '0.');
	};

	/*首付比例范围校验*/
	exports.checkDownPay = function (min, max, fstPct) {
		if (min === '' && max != '') {
			if (max * 100 < fstPct * 100) {
				mui.toast('首付比例需要小于' + max * 100 + '%，请重新输入', { type: 'div' });
				return false;
			}
		}
		if (max === '' && min != '') {
			if (min * 100 > fstPct * 100) {
				mui.toast('首付比例需要大于' + min * 100 + '%，请重新输入', { type: 'div' });
				return false;
			}
		}
		if (max != '' && min != '') {
			if (max * 100 < fstPct * 100 || min * 100 > fstPct * 100) {
				mui.toast('首付比例需要在' + min * 100 + '%-' + max * 100 + '%之间，请重新输入', { type: 'div' });
				return false;
			}
		}
		return true;
	};

	/*尾款比例校验*/
	exports.checkDefPct = function (min, max, defPct) {
		if (max != '' && min != '') {
			if (max * 100 < defPct * 100 || min * 100 > defPct * 100) {
				mui.toast('尾款比例需要在' + min * 100 + '%-' + max * 100 + '%之间，请重新输入', { type: 'div' });
				return false;
			}
		}
		return true;
	};

	/*身份证号校验*/
	exports.checkIdNumber = function (s) {
		var AREA_CODE = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外" };
		// 检查长度是否合法
		// 检查长度是否合法
		switch (s.length) {
			case 15:case 18:
				{
					break;
				}
			default:
				{
					return false;
				}
		}
		// 检查是否为数字
		var testInt = s.length == 15 ? s : s.substr(0, 17);
		var isInteger = /^[0-9]*$/;
		if (!isInteger.test(testInt)) {
			return false;
		}
		// 检查区域代码是否合法
		var areaCode = parseInt(s.substr(0, 2));
		if (!AREA_CODE[areaCode]) {
			return false;
		}
		// 检查校验位是否合法
		if (s.length == 18) {
			var testNumber = (parseInt(s.charAt(0)) + parseInt(s.charAt(10))) * 7 + (parseInt(s.charAt(1)) + parseInt(s.charAt(11))) * 9 + (parseInt(s.charAt(2)) + parseInt(s.charAt(12))) * 10 + (parseInt(s.charAt(3)) + parseInt(s.charAt(13))) * 5 + (parseInt(s.charAt(4)) + parseInt(s.charAt(14))) * 8 + (parseInt(s.charAt(5)) + parseInt(s.charAt(15))) * 4 + (parseInt(s.charAt(6)) + parseInt(s.charAt(16))) * 2 + parseInt(s.charAt(7)) * 1 + parseInt(s.charAt(8)) * 6 + parseInt(s.charAt(9)) * 3;
			//	        if ( s.charAt(17) != "10x98765432".charAt( testNumber % 11 )&&s.charAt(17) != "10X98765432".charAt( testNumber % 11 ) ){
			//	            return false;
			//	        }
			if (s.charAt(17) != "10X98765432".charAt(testNumber % 11)) {
				return false;
			}
		}
		return true;
	};

	/*车架号校验*/
	exports.checkVIN = function (vin) {
		var VINmap = { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', 'A': '1', 'B': '2', 'C': '3', 'D': '4', 'E': '5', 'F': '6', 'G': '7', 'H': '8', 'J': '1', 'K': '2', 'L': '3', 'M': '4', 'N': '5', 'P': '7', 'R': '9', 'S': '2', 'T': '3', 'U': '4', 'V': '5', 'W': '6', 'X': '7', 'Y': '8', 'Z': '9' };
		var VINmap2 = { '0': '8', '1': '7', '2': '6', '3': '5', '4': '4', '5': '3', '6': '2', '7': '10', '9': '9', '10': '8', '11': '7', '12': '6', '13': '5', '14': '4', '15': '3', '16': '2' };
		if (vin.length != 17) {
			return false;
		}
		var VINmapValue = 0;
		for (var i = 0; i < vin.length; i++) {
			if (i != 8) {
				VINmapValue += VINmap[vin.charAt(i)] * VINmap2[i];
			}
		}
		var val = VINmapValue % 11;
		if (val == 10) {
			val = "X";
		}
		return val == vin.charAt(8);
	};

	/*合并对象*/
	exports.assignObj = function (obj1, obj2) {
		Object.keys(obj1).forEach(function (key) {
			if (obj2[key] || obj2[key] == '') {
				obj1[key] = obj2[key];
			} else {
				obj1[key] = obj1[key];
			}
		});
	};

	/*时间格式转换*/
	exports.timeFormat = function (time) {
		return time == '' ? '' : time.substr(0, 4) + "-" + time.substr(4, 2) + "-" + time.substr(6, 2);
	};
	/* 
 	操作按钮只有一个时，更多操作 置灰 
 	parentEle  遍历的li元素
 	btnEle 状态按钮
 	moreBtnEle 更多操作按钮
 */
	exports.isOneBtnLength = function (parentEle, btnEle, moreBtnEle) {
		$(parentEle).each(function () {
			if ($(this).find(btnEle).length === 1) $(this).find(moreBtnEle).css('color', '#ddd');
		});
	};
	/* 
 	操作按钮大于 1 个时，更多操作 切换 
 	parentEle  遍历的li元素
 	btnEle 状态按钮
 	moreBtnEle 更多操作按钮
 */
	exports.isOneBtnToggle = function (parentEle, moreBtnEle, btnEle) {
		$(parentEle).on('tap', moreBtnEle, function () {
			if ($(this).parent().next().children(btnEle).length > 0) {
				$(this).parent().next().slideToggle();
			} else {
				mui.alert('没有其他按钮了，不能点击！', '提示', '确定', function (e) {
					e.index;
				}, 'div');
			}
		});
	};

	/*转换前后台数据格式*/
	exports.formateData = function (back, backStr, obj) {
		back.forEach(function (item, key) {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = Object.keys(item)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var value = _step2.value;

					if (obj[backStr + '.' + value]) {
						obj[backStr + '.' + value].push(item[value]);
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
		});
	};

	/* 处理后台返回数据为空的字段 */
	exports.dataIsNull = function (data) {
		data = data || '';
		if (data === null || data === undefined || data === 'undefined' || data === '' || data === 'null') {
			return '';
		}
		return data;
	};
	
	/*身份证号检验*/
	exports.idCardFormate = function (idNO) {
		var length = idNO.length;
		if (length != 18) {
			return false;
		}
		var reg = /^([0-9]{17})([0-9|x|X])$/;
		var checkres = reg.test(idNO);
		if (!checkres) {
			return false;
		}
		var year = idNO.substring(6, 10);
		var month = idNO.substring(10, 12);
		var day = idNO.substring(12, 14);
		var dateObj = new Date(year, month - 1, day);
		if (isNaN(dateObj)) {
			return false;
		}
		//修改parserInt('08')=0,parserInt('09')=0引起的校验失败问题
		if ((parseInt(day,10) != parseInt(dateObj.getDate(),10))|| (parseInt(month,10) != parseInt((dateObj.getMonth() + 1),10))) {
			return false;
		}
		if (length == 18) {
			var wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
			var verifyCodeList = [ "1", "0", "x", "9", "8", "7", "6", "5", "4","3", "2" ];
			var totalCode = 0;
			for ( var k = 0; k < 17; k++) {
				totalCode += idNO.substring(k, k + 1) * wi[k];
			}
			var code = verifyCodeList[totalCode % 11];
			//针对code为'x'，value最后一位为'X'的情况
			if(code == "x" && idNO.substring(17, 18)=="X"){
				return true;
			}
			if (code != idNO.substring(17, 18)) {
				return false;
			}
		}
		return true;
	}
	exports.numMulti = function(num1,num2){
		var result=0;
		var baseNum = 0;
		try {
			baseNum += num1.toString().split(".")[1].length;
		} catch (e) {
			baseNum += 0;
		}
		try {
			baseNum += num2.toString().split(".")[1].length;
		} catch (e) {
			baseNum += 0;
		}
		result = (Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", "")) / Math.pow(10, baseNum));
		result = (Math.round(result*100))/100;
		return result;
	}
});