"use strict";

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	mBank.addVconsole();
	var bodyheight = document.documentElement.clientHeight;
	//	console.log(bodyheight);
	var list2 = document.getElementById("carModelListBox");
	var header = document.getElementById("header");
	var head_boxheight = header.scrollHeight;
	var content = document.getElementsByClassName('content');
	var Letter_Box = document.getElementById("Letter_Box"); //索引搜索列表
	var Letter_f = Letter_Box.getElementsByTagName("a")[0];
	list2.style.height = bodyheight - head_boxheight - 25 + "px";
	Letter_Box.style.paddingTop = (Letter_Box.scrollHeight - Letter_f.scrollHeight * 26) / 2 + "px";
	window.groupList = new mui.GroupList(list2);
	var list = {};
	function makePy(str) {
		if (typeof str != "string") throw new Error(-1, "函数makePy需要字符串类型参数!");
		var arrResult = new Array(); //保存中间结果的数组
		for (var i = 0, len = str.length; i < len; i++) {
			//获得unicode码
			var ch = str.charAt(i);
			//检查该unicode码是否在处理范围之内,在则返回该码对映汉字的拼音首字母,不在则调用其它函数处理
			arrResult.push(checkCh(ch));
		}
		//处理arrResult,返回所有可能的拼音首字母串数组
		return mkRslt(arrResult);
	};
	function mkRslt(arr) {
		var arrRslt = [""];
		for (var i = 0, len = arr.length; i < len; i++) {
			var str = arr[i];
			var strlen = str.length;
			if (strlen == 1) {
				for (var k = 0; k < arrRslt.length; k++) {
					arrRslt[k] += str;
				}
			} else {
				var tmpArr = arrRslt.slice(0);
				arrRslt = [];
				for (k = 0; k < strlen; k++) {
					//复制一个相同的arrRslt
					var tmp = tmpArr.slice(0);
					//把当前字符str[k]添加到每个元素末尾
					for (var j = 0; j < tmp.length; j++) {
						tmp[j] += str.charAt(k);
					}
					//把复制并修改后的数组连接到arrRslt上
					arrRslt = arrRslt.concat(tmp);
				}
			}
		}
		return arrRslt;
	};
	function checkCh(ch) {
		var uni = ch.charCodeAt(0);
		//如果不在汉字处理范围之内,返回原字符,也可以调用自己的处理函数
		if (uni > 40869 || uni < 19968) return ch; //dealWithOthers(ch);
		//检查是否是多音字,是按多音字处理,不是就直接在strChineseFirstPY字符串中找对应的首字母
		return oMultiDiff[uni] ? oMultiDiff[uni] : strChineseFirstPY.charAt(uni - 19968);
	};
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		var str = '';
		var htmlA = "";
		var htmlB = "";
		var mymap = new Array();
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = self.carModelList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var item = _step.value;


				var namePy = makePy(item.text);
				var namefst = namePy.toString().substr(0, 1);

				var mode = '<li class="mui-table-view-cell mui-indexed-list-item bgall bg1 citylist_style select-list" style="padding-left:0.45rem;font-size:.24rem;padding-top:.14rem;padding-bottom:.14rem">' + item.text + '</li>';
				if (yw.indexOf(namefst.toUpperCase()) == -1) {
					if (htmlB == '') {
						htmlB = mode;
					} else {
						htmlB += mode;
					}
				} else {
					//首字母英文
					for (var k = 0; k < yw.length; k++) {
						var tem = yw.substr(k, 1);
						if (namefst.toUpperCase() == tem) {
							if (mymap[tem] == undefined) {
								mymap[tem] = mode;
							} else {
								mymap[tem] = mymap[tem] + mode;
							}
						}
					}
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

		for (var l = 0; l < yw.length; l++) {
			var flag = yw.substr(l, 1);
			if (mymap[flag] != undefined) {
				htmlA += '<li style="font-size:0.27rem;height: 0.7rem;line-height: 0.7rem;background: #769BDA;color: #FFFFFF;padding-left:0.2rem;" data-group="' + flag + '">' + flag + '</li>' + mymap[flag];
			}
		}
		if (htmlB != "") {
			htmlB = '<li data-group="其他">其他</li>' + htmlB;
		}
		var html = htmlA + htmlB;
		showDiv.innerHTML = html;
		var loanPreWebview = void 0;
		if (self.processType === '02') {
			//补录阶段
			loanPreWebview = plus.webview.getWebviewById('loanInfo');
		} else {
			loanPreWebview = plus.webview.getWebviewById('loanPre');
		}
		mui('#showDiv').on('tap', '.select-list', function () {
			for (var i = 0; i < self.carModelList.length; i++) {
				if ($(this).html() == self.carModelList[i].text) {
					//					const carModelItem = self.carModelList[$(this).index()];
					if (self.carModelList[i].text != self.carModelSelected) {
						mui.fire(loanPreWebview, 'carBrandReverse', self.carModelList[i]);
					}
					mui.back();
				}
			}
		});
	});
});