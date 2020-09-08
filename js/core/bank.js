define(function(require, exports, module) {
	var nativeUI = require('./nativeUI');
	var config = require('./commonConfig');
	var isDemo = false; //为true时，从./virtualHost文件下读取报文
	var virtualHostPath = '_www/virtualHost/';
	var url = config.url;
	var imgUrl = config.imgUrl;
	var psa = {
		liana_appName: "东风PSA", 
		liana_serverPath: url,
		liana_imagePath: imgUrl,
		liana_adSwitch: true
	};
	var bankId = psa;
	
	exports.addVconsole = config.addVconsole;
	exports.storeNo = config.storeNo;
	exports.storeNo = config.telephone;
	
	exports.getAppName = function() {
		return bankId.liana_appName;
	};
	
	exports.getApiURL = function() {
		if(isDemo) {
			return virtualHostPath;
		} else {
			return bankId.liana_serverPath;
		}
	};
	
	exports.getimgURL = function() {
		return bankId.liana_imagePath;
	};
	
	exports.toast = function(str) {
		return mui.toast(str, {type: 'div'});
	}
	
	/*
	 * 新增openWindow方法
	 * package ：webview文件路径
	 * pageId： webview唯一id标识
	 * aniShow ：webview展示动画
	 * param ： 传参值json串
	 * styleJson： webview 样式参数
	 */
	exports.openWindowByLoad = function(package, pageId, aniShow, param, styleJson) {
		if(localStorage.getItem("resubmit_page_id") != pageId) { //防止重复打开同一页面
			plus.webview.hide(pageId);
			plus.webview.close(pageId);
			var html = document.documentElement;
			var windowHeight = html.clientHeight;
			var bodyHeight=window.screen.height;
			param = param || {};
			styleJson = styleJson || {};
			if(pageId=='login'){
				styleJson = exports.extend(styleJson,{
					hardwareAccelerated: true
				});
			}else{
				styleJson = exports.extend(styleJson,{
					hardwareAccelerated: true,
					statusbar:{background:'#f7f7f7'}
				});
			}
			
			var webviewShow = plus.webview.create(package, pageId, styleJson, param);
			localStorage.setItem("resubmit_page_id",pageId);
			setTimeout(function() {
				localStorage.removeItem("resubmit_page_id");
			}, 80);
			webviewShow.addEventListener("loaded", function() { //注册新webview的载入完成事件
				webviewShow.show(aniShow, 50); //把新webview窗体显示出来，显示动画效果为速度150毫秒的右侧移入动画
			}, false);
		} 
	};
	
	/**
	 * 新增ajax请求方法apiSend
	 * @param {请求方法}method
	 * @param {请求地址} url
	 * @param {请求参数} params
	 * @param {成功回掉函数} successCallback
	 * @param {失败回掉函数} errorCallback
	 * @param {} wait
	 * @param {异步同步请求} async
	 */
	exports.apiSend = function(method, url, params, successCallback, errorCallback, wait, async, beforeSendCallback, completeCallback) {
		if(isDemo) { //读取本地虚拟报文
			console.log('请求参数'+JSON.stringify(params));
			nativeUI.readLocalFile(url, successCallback);
		} else {
			var network = plus.networkinfo.getCurrentType();
			if(network < 2) {
				mui.toast('您的网络未连接,建议在wifi情况下浏览。', {type: 'div'});
				return false;
			} else {
				return this._apiSend(method, url, params, successCallback, errorCallback, wait, async, beforeSendCallback, completeCallback);
			}
		}
	};
	
	var qingqiusum=0;
	var sysSessionTimeout = 86400000;
	
	exports._apiSend = function(method, url, params, successCallback, errorCallback, wait, async, beforeSendCallback, completeCallback) {
		if(wait === undefined) { wait = true; }
		if(async === undefined){ async = true; }
		if(beforeSendCallback === undefined){ beforeSendCallback = null }
		if(completeCallback === undefined){completeCallback = null}
		var liana_notCheckUrl = true;
		if(params && params.liana_notCheckUrl == false) {
			liana_notCheckUrl = false;
		}
		//超时校验
		var lastOptionTime = localStorage.getItem("Sys_lastOpentionTime");

		if(lastOptionTime === '' || lastOptionTime === null || lastOptionTime === "null") {
			lastOptionTime = new Date().getTime();
			localStorage.setItem("Sys_lastOpentionTime", lastOptionTime);
		} else {
			if(new Date().getTime() - lastOptionTime >= sysSessionTimeout) {
				if(liana_notCheckUrl) {
					localStorage.removeItem('sessionId');
					localStorage.removeItem('Sys_lastOpentionTime');
					mui.toast('会话已超时请重新登录', {type: 'div'});
					setTimeout(function(){
						exports.checkLogon();
					}, 2000)
					return;
				}
			} else {
				localStorage.setItem("Sys_lastOpentionTime", new Date().getTime());
			}
		}
		var self = this;
		params = params || {};
		var param = {
			"channel": "1301",
			"responseFormat": "JSON",
			"EMP_SID": localStorage.getItem('sessionId'),
			"logonId": localStorage.getItem('logonId')
		};
		params = this.extend(params, param);
		console.log('请求参数' + JSON.stringify(params));
		console.log('请求连接' + url);
		try{
			mui.ajax(url, {
				headers: {
					'APP_UUID': plus ? plus.device.uuid : '',
					'PLATFORM': plus ? plus.os.name : ''
				},
				async: async,
				data: params,
				dataType: 'json', //服务器返回json格式数据
				traditional: true,
				type: method, //HTTP请求类型
				timeout: 20000, //超时时间设置为20秒；
				beforeSend: function() {
					if(typeof beforeSendCallback == 'function') {
						beforeSendCallback();
					}
				},
				complete: function() {
					if(typeof completeCallback == 'function') {
						completeCallback();
					}
				},
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否登录成功；
					console.log('返回信息' + JSON.stringify(data));
					//重置请求次数
					qingqiusum = 0;
					if(!data) {
						console.log("返回无信息");
						return;
					}
					if(data.ec == '0' || data.ec == '0000') {
						if(typeof successCallback == 'function') {
							successCallback(data);
						} else {
							mui.toast('缺少回调函数', {type: 'div'});
						}
					}else {
						if(data.ec == '20001'||data.ec=='20002') {
							mui.alert(data.em, "提示", "确定", function(){
								localStorage.removeItem('sessionId');
								exports.checkLogon();
							}, 'div');
							plus.nativeUI.closeWaiting();
							return;
						}
						if(typeof errorCallback == 'function') {
							plus.nativeUI.closeWaiting();
							errorCallback(data);
						} else {
							mui.alert(data.em, "提示", "确定", null, 'div');
							var path = '_www/views/';
							localStorage.removeItem('isLogin');
							setTimeout(function(){
								exports.openWindowByLoad(path + 'HomePage/homePage.html', 'homePage', 'slide-in-right','',{statusbar:{background:'#F7F7F7'}});
							},200);
							plus.nativeUI.closeWaiting();
							return;
						}
					}
				},
				
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type + '_' + method + '_' + url);
					if(wait) {
						plus.nativeUI.closeWaiting();
					}
					if(errorCallback && errorCallback['error'] && typeof errorCallback['error'] == 'function') {
						console.log('callback');
						errorCallback['error']();
					} else {
						if(typeof errorCallback == 'function') {
							xhr.em = "网络请求超时,请稍后再试";
							errorCallback(xhr);
						} else {
							var btnArray = ['否', '是'];
							if(qingqiusum==0){
								mui.confirm("网络请求超时，是否重新请求?","提示", btnArray, function(e){
									if(e.index == 1) {
										exports.apiSend(method, url, params, successCallback, errorCallback, wait, async, beforeSendCallback, completeCallback);
									}else {
										return;
									}	
								}, 'div')
							}else{
								setTimeout(function(){
									mui.confirm("网络请求超时，是否重新请求?","提示", btnArray, function(e){
										if(e.index == 1) {
											exports.apiSend(method, url, params, successCallback, errorCallback, wait, async, beforeSendCallback, completeCallback);
										}else {
											return;
										}	
									}, 'div')
								},2000);
							}
							qingqiusum=qingqiusum+1;
						}
					}
				}
			});
	    }catch(e){
			console.log(JSON.stringify(e));
			return false;
		}
	};
	
	exports.extend = function() {
		var _result = {},
		arr = arguments;
		//遍历属性，至后向前
		if(!arr.length) return {};
		for(var i = arr.length - 1; i >= 0; i--) {
			this._extend(arr[i], _result);
		}
		arr[0] = _result;
		return _result;
	};
	
	exports.showWaiting = function(msg) {
		plus.nativeUI.showWaiting(msg,{
			round:"0px",
			back:"none",
			style:"black",
			color:"#000000",
			size:"15px",
			background:"rgba(0,0,0,0)"
		});
	};
	
	exports._extend = function me(dest, source) {
		for(var name in dest) {
			if(dest.hasOwnProperty(name)) {
				//当前属性是否为对象,如果为对象，则进行递归
				if((dest[name] instanceof Object) && (source[name] instanceof Object)) {
					me(dest[name], source[name]);
				}
				//检测该属性是否存在
				if (source.hasOwnProperty(name)) {
					continue;
				} else {
					source[name] = dest[name];
				}
			}
		}
	}

	//验证是否登录
	exports.checkLogon = function(prePath) {
		var sessionid = localStorage.getItem('sessionId');
		var path = prePath || '_www/views/';
		localStorage.removeItem("resubmit_page_id");
		if(!sessionid) {
			exports.openWindowByLoad(path + 'login.html', 'login', 'slide-in-right');
			plus.nativeUI.closeWaiting();
			return false;
		}
		return true;
	};
	
	exports.isOpenView = function(id) {
		var wbv = plus.webview.getWebviewById(id);
		if(wbv) {
			return true;
		}
		return false;
	};
	
	/*
	 * ids  webview id集合 形如：['a', 'b']
	 */
	exports.closeviews = function(ids) {
		for(var i = 0; i < ids.length; i++) {
			if(ids){
				plus.webview.hide(ids[i]);
				plus.webview.close(ids[i]);
			}
		}
	};
	/*判断是否为刘海屏*/
	exports.isImmersed = function(e){
		if(mui.os.ios){
			if(plus.navigator.hasNotchInScreen()){
				return true;
			}else {
				return false;
			}
		}else{
			return true;
		}
		
	}
	// /*判断是否为沉浸式状态栏*/
	exports.isIPhoneX= function(nums){
		if(localStorage.getItem('firstFlag')){
			$("#body div.header").css({
				'height':'1.28rem',
				'padding-top':'0.6rem'
			});
			$('.header .icon').css('top','0.75rem');
			$(".content").css({'padding-top':'1.38rem'});
		}else {
			localStorage.setItem('firstFlag','01');
			
		}
	}
	/**
	 * @description: 计算缓存大小
	 * @param {function} 获取成功回调函数
	 */
	function caching(callback){
		if (window.plus) {  
			plusReady();  
		}else {  
			document.addEventListener('plusready', plusReady, false);  
		}
		
		function plusReady(){
			plus.cache.calculate( function ( size ) {
				if (size == 0) {
					fileSizeString = "0B";
				} else if (size < 1024) {
					fileSizeString = size + "B";
				} else if (size < 1048576) {
					fileSizeString = (size / 1024).toFixed(2) + "KB";
				} else if (size < 1073741824) {
					fileSizeString = (size / 1048576).toFixed(2) + "MB";
				} else {
					fileSizeString = (size / 1073741824).toFixed(2) + "GB";
				}
				
				callback(fileSizeString);
			});
		}
		
	}
	
	/**
	 * @description: 清除缓存
	 * @param {function} 清除成功回调函数
	 */
	function clearCaching(callback){
		if (window.plus) {  
			plusReady2();  
		}else {  
			document.addEventListener('plusready', plusReady2, false);  
		}
		
		function plusReady2(){
             localStorage.clear();
			plus.cache.clear(function () {
				callback();
			});
		}
	}
	//获取app缓存
	exports.getCache = function(){
		caching(function(data){
			 // alert("缓存为"+data);
		});
	}
	//清除app缓存
	exports.removeCache = function (){
		clearCaching(function(){
			 // alert("缓存清除成功！");
		});
	}
});