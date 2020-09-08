'use strict';

define(function (require, exports, module) {
	/*
  * 探索如何支持微信站和web站
  * 1.将所有plus封入nativeUI的方法，禁止调用plus.的方法
  * 2.如果没办法，一定要调用的话，封入mui.plusReady里面去
  * 3.mui.plusReady需要批量替换为mui.ready 但是在webView 传值的情况下是否会出问题还需要进一步论证
  * 4.写清楚每个js的范围，大家注意，别乱调用
  * 5.subpages目前mui只支持一个subpage转为iframe。那么就要把启动页重新搞一下了。
  * 6.对webView的封装其实是很困难的一件事情，尤其是页面间传值如何兼容H5站，存在极大的问题
  * 7.去掉所有Jquery调用，或者用更优雅的方式调用
  * 8.param的参数，重新整理一下，更优雅
  * 9.去掉冗余的js，例如jquery mui以及echart等
  * 10.
  */
	var waitingObj = null;
	exports.pickDate = function (okCallback, cancelCallback, options) {
		if (window.plus) {
			plus.nativeUI.pickDate(function (e) {
				var date = e.date;
				if (typeof okCallback == 'function') {
					okCallback(date);
				}
			}, function (e) {
				if (typeof cancelCallback == 'function') {
					cancelCallback(e.message);
				}
			}, options);
		}
	};
	exports.pickTime = function (okCallback, cancelCallback, options) {
		if (window.plus) {
			plus.nativeUI.pickTime(function (e) {
				var date = e.date;
				if (typeof okCallback == 'function') {
					okCallback(date);
				}
			}, function (e) {
				if (typeof cancelCallback == 'function') {
					cancelCallback(e.message);
				}
			}, options);
		}
	};
	exports.toast = function (msg) {
		mui.toast(msg);
		//		if (window.plus) {
		//			plus.nativeUI.toast(msg, {
		//				duration: 'short',
		//				align: 'center',
		//				verticalAlign: 'bottom'
		//			});
		//		}
	};
	exports.showWaiting = function (msg) {
		if (window.plus) {
			plus.nativeUI.showWaiting(msg);
		}
	};
	exports.closeWaiting = function () {
		if (window.plus) {
			plus.nativeUI.closeWaiting();
		}
	};
	exports.watting = function (msg, closeTimes) {
		if (waitingObj) {
			// 避免快速多次点击创建多个窗口
			return;
		}
		if (window.plus) {
			waitingObj = plus.nativeUI.showWaiting(msg);
			if (closeTimes) {
				closeTimes = parseInt(closeTimes);
				if (closeTimes > 0) {
					window.setTimeout(function () {
						if (waitingObj) {
							waitingObj.close();
							waitingObj = null;
						}
					}, closeTimes);
				}
			}
		}
	};
	exports.wattingTitle = function (msg) {
		if (window.plus) {
			if (waitingObj) {
				waitingObj.setTitle('    ' + msg + '    ');
			}
		}
	};
	exports.wattingClose = function () {
		if (window.plus) {
			if (waitingObj) {
				waitingObj.close();
				waitingObj = null;
			}
		}
	};
	exports.alert = function (title, msg, button, callback) {
		//		if (window.plus) {
		//			plus.nativeUI.alert(msg, function() {
		//				if (typeof callback == 'function') {
		//					callback();
		//				}
		//			}, title, button);
		//		}
		mui.alert(title, msg, button, callback);
	};
	exports.confirm = function (title, msg, button, okCallback, cancelCallback) {
		if (window.plus) {
			plus.nativeUI.confirm(msg, function (e) {
				if (e.index == 0) {
					if (typeof okCallback == 'function') {
						okCallback();
					}
				} else {
					if (typeof cancelCallback == 'function') {
						cancelCallback();
					}
				}
			}, title, button);
		}
	};

	exports.confactionSheetirm = function (title, cancelText, buttons, callback) {
		if (window.plus) {
			plus.nativeUI.actionSheet({
				title: title,
				cancel: cancelText,
				buttons: buttons
			}, function (e) {
				if (typeof callback == 'function') {
					callback(e.index);
				}
			});
		}
	};
	exports.getCurrentPosition = function (succcessCB, errorCB, option) {
		if (window.plus) {
			plus.geolocation.getCurrentPosition(succcessCB, errorCB, option);
		} else {
			navigator.geolocation.getCurrentPosition(succcessCB, errorCB, option);
		}
	};
	exports.lockOrientation = function (orientation) {
		if (window.plus) {
			plus.screen.lockOrientation(orientation);
		}
	};
	exports.currentWebview = function () {
		if (window.plus) {
			plus.webview.currentWebview();
		} else {
			window.self;
		}
	};
	/**
  * 设置应用本地配置
  **/
	exports.setStorage = function (_key, _value) {
		_key = _key || {};
		_value = _value || {};
		localStorage.setItem('$Liana_' + _key, JSON.stringify(_value));
	};

	/**
  * 获取应用本地配置
  **/
	exports.getStorage = function (_key) {
		var _value = localStorage.getItem('$Liana_' + _key) || "{}";
		return JSON.parse(_value);
	};
	exports.boxshow = function (share_list, successCallback) {
		//弹出分享列表
		var share_box = document.createElement("div");
		share_box.className = "share_box";
		var share_can = document.createElement("button");
		share_can.innerHTML = "取消";
		var share_ul = document.createElement("ul");
		share_ul.className = "share_ul";
		var sharehtml = "";
		//循环添加分享渠道
		for (var i = 0; i < share_list.length; i++) {
			console.log(share_list[i].url);
			sharehtml += "<li class='share_list'><ul><li><img id='" + i + "' src='" + share_list[i].url + "'/></li><li>" + share_list[i].title + "</li></ul></li>";
		}
		share_ul.innerHTML = sharehtml;
		share_box.appendChild(share_ul);
		document.body.appendChild(share_box);
		share_box.appendChild(share_can);
		mui(share_ul).on("tap", "img", function () {
			document.body.removeChild(zhe_div);
			document.body.removeChild(share_box);
			if (typeof successCallback == 'function') {
				successCallback(this.id);
			}
		});
		//添加遮罩层
		var zhe_div = document.createElement("div");
		zhe_div.className = "imgshowlist";
		zhe_div.style.display = "block";
		document.body.appendChild(zhe_div);
		//单击取消时去除分享所有模块
		share_can.addEventListener("tap", function () {
			document.body.removeChild(zhe_div);
			document.body.removeChild(share_box);
		});
	};
	//确认框
	//	exports.confirmDialog = function(message, title, funCallback) {
	//		if(plus.os.name == 'Android') {
	//			plus.nativeUI.confirm(message, function(e) {
	//				if(e.index == 0) {
	//					funCallback();
	//				} else {
	//					plus.nativeUI.closeWaiting();
	//				}
	//			}, title, "nativeUI", ["确认", "取消"]);
	//		} else {
	//			mui.confirm(message, title, ["取消", "确认"], function(e) {
	//				if(e.index == 1) {
	//					funCallback();
	//				} else {
	//					plus.nativeUI.closeWaiting();
	//				}
	//			});
	//		}
	//	};
	//确认框
	exports.confirmDialog = function (message, title, funCallback, funCancel) {
		if (plus.os.name == 'Android') {
			plus.nativeUI.confirm(message, function (e) {
				if (e.index == 0) {
					if (typeof funCallback == "function") {
						funCallback();
					} else {
						plus.nativeUI.closeWaiting();
					}
				} else {
					if (typeof funCancel == "function") {
						funCancel();
					} else {
						plus.nativeUI.closeWaiting();
					}
				}
			}, title, "nativeUI", ["确认", "取消"]);
		} else {
			mui.confirm(message, title, ["取消", "确认"], function (e) {
				if (e.index == 1) {
					funCallback();
				} else {
					if (typeof funCancel == "function") {
						funCancel();
					} else {
						plus.nativeUI.closeWaiting();
					}
				}
			});
		}
	};
	//确认框
	exports.confirmDialogTwo = function (message, title, funCallback, btnArray) {
		if (plus.os.name == 'Android') {
			plus.nativeUI.confirm(message, function (e) {
				if (e.index == 0) {
					funCallback();
				} else {
					plus.nativeUI.closeWaiting();
				}
			}, title, btnArray);
		} else {
			mui.confirm(message, title, btnArray.reverse(), function (e) {
				if (e.index == 1) {
					funCallback();
				} else {
					plus.nativeUI.closeWaiting();
				}
			});
		}
	};
	//输入框
	exports.inputDialog = function (message, title, funCallback) {
		if (plus.os.name == 'Android') {
			var btnArray = ['确认', '取消'];
			mui.prompt(message, title, title, btnArray, function (e) {
				if (e.index == 0) {
					funCallback(e);
				}
			});
		} else {
			var btnArray = ['取消', '确认'];
			mui.prompt(message, title, title, btnArray, function (e) {
				if (e.index == 1) {
					funCallback(e);
				}
			});
		}
	};

	exports.readLocalFile = function (url, successCallback) {
		console.log('请求链接' + url);
		plus.io.resolveLocalFileSystemURL(url, function (entry) {
			// 可通过entry对象操作test.html文件 
			entry.file(function (file) {
				var fileReader = new plus.io.FileReader();
				fileReader.readAsText(file, 'utf-8');
				fileReader.onloadend = function (evt) {
					var data = JSON.parse(evt.target.result);
					console.log('返回信息' + JSON.stringify(data));
					successCallback(data);
				};
			});
		}, function (e) {
			mui.alert("Resolve file URL failed: " + e.message);
		});
	};

	/**
  * 自定义提示框
  * @param {Object} title       标题
  * @param {Object} confirmFun  点击确定回调函数
  * 
  * 注：  append的html对象不能被document.getElementById获取，只能用document.querySelector获取
  * 		事件也不能用addEventListener添加，需用mui("").on("tap","",function)添加事件
  */
	exports.errorMSG = function (title, confirmFun) {
		var bodyheight = document.body.clientHeight;
		var error_box = document.querySelector(".error_box");
		if (error_box) {
			document.querySelector(".error_text").innerHTML = title;
			error_box.style.display = "block";
			document.querySelector(".mui-popup-backdrop").style.display = "block";
		} else {
			var errorMsgHtml = '<div class="mui-popup-backdrop mui-active"></div><div class="error_box">' + '<div class="error_text">' + title + '</div>' + '<div class="error_btn">确定</div></div>';
			jQuery("body").append(errorMsgHtml);
			error_box = document.querySelector(".error_box");
			var error_text = document.querySelector(".error_text");
			error_text.style.maxHeight = bodyheight / 2 + "px";
			error_text.style.overflowX = "hidden";
			error_text.style.whiteSpace = "pre-wrap";
			var error_boxheight = error_box.scrollHeight;
			error_box.style.top = (bodyheight - error_boxheight) / 2 + "px";
		}
		mui("body").on("tap", ".error_btn", function (event) {
			event.preventDefault();
			var popupnum = document.body.getElementsByClassName("mui-popup-backdrop").length;
			var errornum = document.body.getElementsByClassName("error_box").length;
			var div_dian = document.body.getElementsByClassName("mui-popup-backdrop")[0];
			var div_dian2 = document.body.getElementsByClassName("error_box")[0];
			if (popupnum > 0 && errornum > 0) {
				document.body.removeChild(div_dian);
				document.body.removeChild(div_dian2);
			} else if (popupnum > 0 && errornum < 0) {
				document.body.removeChild(div_dian);
			} else if (popupnum < 0 && errornum > 0) {
				document.body.removeChild(div_dian2);
			} else {
				return;
			}
			if (typeof confirmFun == "function") {
				confirmFun();
			}
		});
	};
	exports.inputUI = function (title, confirmFun, ErrorFun) {
		document.activeElement.blur();
		var bodyheight = document.body.clientHeight;
		var inout_UI = document.querySelector(".inout_UI");
		if (inout_UI) {
			document.querySelector(".iputit").innerHTML = title;
			inout_UI.style.display = "block";
			document.querySelector(".mui-popup-backdrop").style.display = "block";
		} else {
			var errorMsgHtml = '<div class="mui-popup-backdrop mui-active"></div><div class="inout_UI">' + '<div class="iputit">' + title + '</div>' + '<div class="num_nut"><input type="text" onkeyup="clearNoNum(this)" placeholder="0.00" /></div>' + '<div class="cancel_btn">取消</div><div class="cofirm_btn">确定</div></div>';
			jQuery("body").append(errorMsgHtml);
			inout_UI = document.querySelector(".inout_UI");
			var error_boxheight = inout_UI.scrollHeight;
			inout_UI.style.top = (bodyheight - error_boxheight) / 2 + "px";
		}
		mui("body").on("tap", ".cancel_btn", function () {
			inout_UI.style.display = "none";
			document.querySelector(".mui-popup-backdrop").style.display = "none";
			if (typeof confirmFun == "function") {
				ErrorFun();
			}
		});
		mui("body").on("tap", ".cofirm_btn", function () {
			inout_UI.style.display = "none";
			document.querySelector(".mui-popup-backdrop").style.display = "none";
			var money = document.querySelector("input").value;
			document.querySelector("input").value = "";
			if (typeof confirmFun == "function") {
				confirmFun(money);
			}
		});
		clearNoNum = function clearNoNum(obj) {
			obj.value = obj.value.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符   
			obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的   
			obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
			obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数   
			if (obj.value.indexOf(".") < 0 && obj.value != "") {
				//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
				obj.value = parseFloat(obj.value);
			}
			if (obj.value.indexOf(".") == 0 && obj.value != "") {
				//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
				obj.value = "0.";
			}
		};
	};
	exports.CallIpone = function (title) {
		document.activeElement.blur();
		var bodyheight = document.body.clientHeight;
		if (plus.os.version != "10.3.1" && plus.os.name == 'iOS') {
			var Cell_UI = document.querySelector(".cell_box");
			if (Cell_UI != "" && Cell_UI != null) {
				document.querySelector(".error_text").innerHTML = title;
				Cell_UI.style.display = "block";
				document.querySelector(".mui-popup-backdrop").style.display = "block";
			} else {
				var CallHtml = '<div class="mui-popup-backdrop mui-active"></div><div class="cell_box">' + '<div class="error_text">' + title + '</div>' + '<div class="error_btn"><a class="cancel"  href="javascript:;">取消</a>' + '<a class="cell" href="javascript:;">呼叫</a><div style="clear: both;"></div></div></div>';
				jQuery("body").append(CallHtml);
				Cell_UI = document.querySelector(".cell_box");
				Cell_UI.style.display = "block";
				var Cell_boxheight = Cell_UI.scrollHeight;
				Cell_UI.style.top = (bodyheight - Cell_boxheight) / 2 + "px";
			}
			mui("body").on("tap", ".cancel", function () {
				Cell_UI.style.display = "none";
				document.querySelector(".mui-popup-backdrop").style.display = "none";
			});
			mui("body").on("click", ".cell", function () {
				Cell_UI.style.display = "none";
				document.querySelector(".mui-popup-backdrop").style.display = "none";
				plus.device.dial(title, false);
			});
		} else {
			plus.device.dial(title, true);
		}
	};
	exports.tipsMethod = function (cantext, oktext, styletext, contentText, CallFun, Errfun) {
		var bodyheight = document.body.clientHeight;
		var tips_div_box = document.querySelector(".tips_div_box");
		if (tips_div_box) {
			document.querySelector(".tipsInfo_box").innerHTML = contentText;
			tips_div_box.style.display = "block";
			document.querySelector(".tips_div_bg").style.display = "block";
		} else {
			var TipsDivHtml = '<div class=' + styletext + '></div><div class="tips_div_box">' + '<div class="tipsInfo_box">' + contentText + '</div>' + '<ul class="tipsBtn_box"><li class="cancel_tips">' + cantext + '</li><li class="line_tips"></li>' + '<li class="ok_tips">' + oktext + '</li><div style="clear: both;"></div></ul></div>';
			jQuery("body").append(TipsDivHtml);
			tips_div_box = document.querySelector(".tips_div_box");
			var tips_text = document.querySelector(".tipsInfo_box");
			tips_text.style.maxHeight = bodyheight / 2 + "px";
			tips_text.style.overflowX = "hidden";
			tips_text.style.whiteSpace = "pre-wrap";
			var tips_boxheight = tips_div_box.scrollHeight;
			tips_div_box.style.top = (bodyheight - tips_boxheight) / 2 + "px";
		}
		mui("body").on("tap", ".cancel_tips", function (event) {
			event.preventDefault();
			var popupnum = document.body.getElementsByClassName("tips_div_bg").length;
			var popupnum1 = document.body.getElementsByClassName("tips_div_bg1").length;
			var errornum = document.body.getElementsByClassName("tips_div_box").length;
			var div_dian = document.body.getElementsByClassName("tips_div_bg")[0];
			var div_dian1 = document.body.getElementsByClassName("tips_div_bg1")[0];
			var div_dian2 = document.body.getElementsByClassName("tips_div_box")[0];
			if (popupnum > 0 && errornum > 0) {
				document.body.removeChild(div_dian);
				document.body.removeChild(div_dian2);
			} else if (popupnum1 > 0 && errornum > 0) {
				document.body.removeChild(div_dian1);
				document.body.removeChild(div_dian2);
			} else if (popupnum > 0 && errornum < 0) {
				document.body.removeChild(div_dian);
			} else if (popupnum1 > 0 && errornum < 0) {
				document.body.removeChild(div_dian1);
			} else if (popupnum < 0 && popupnum1 < 0 && errornum > 0) {
				document.body.removeChild(div_dian2);
			} else {
				return;
			}
			if (typeof Errfun == "function") {
				Errfun();
			}
		});
		mui("body").on("tap", ".ok_tips", function (event) {
			event.preventDefault();
			var popupnum = document.body.getElementsByClassName("tips_div_bg").length;
			var popupnum1 = document.body.getElementsByClassName("tips_div_bg1").length;
			var errornum = document.body.getElementsByClassName("tips_div_box").length;
			var div_dian = document.body.getElementsByClassName("tips_div_bg")[0];
			var div_dian1 = document.body.getElementsByClassName("tips_div_bg1")[0];
			var div_dian2 = document.body.getElementsByClassName("tips_div_box")[0];
			if (popupnum > 0 && errornum > 0) {
				document.body.removeChild(div_dian);
				document.body.removeChild(div_dian2);
			} else if (popupnum1 > 0 && errornum > 0) {
				document.body.removeChild(div_dian1);
				document.body.removeChild(div_dian2);
			} else if (popupnum > 0 && errornum < 0) {
				document.body.removeChild(div_dian);
			} else if (popupnum1 > 0 && errornum < 0) {
				document.body.removeChild(div_dian1);
			} else if (popupnum < 0 && popupnum1 < 0 && errornum > 0) {
				document.body.removeChild(div_dian2);
			} else {
				return;
			}
			if (typeof CallFun == "function") {
				CallFun();
			}
		});
	};
});