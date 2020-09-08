'use strict';

define(function (require, exports, module) {
	var mbank = require('./core/bank');
	var mcheck = require('./core/check');
	mbank.addVconsole();
	localStorage.removeItem('sessionId');
	localStorage.removeItem('clientid');
	localStorage.removeItem('sessionRiskFlag');
	localStorage.removeItem("resubmit_page_id");
	localStorage.setItem('outSts', '');
	localStorage.setItem('nodeSign', '');
	localStorage.setItem('backFlag', '');
	localStorage.setItem('applCde', '');
	localStorage.removeItem('isLogin');
	var loginParams = {}; //登录请求参数列表
	var canClick = true;

	var storey_box = document.getElementById("storey_box");
	var down_info1 = document.getElementById('down_info1');
	var preNum = document.getElementById("preNum");
	var accountreg = new RegExp(/^(1[1-9])[0-9]{9}$/); //手机号格式验证
	var passwordSeed = '';
	var wgtVer;
	passwordSeed = passwdSeed();
//	var uuID = '';
	/*获取图形验证码*/
	var generateCode = function generateCode() {
		var _url = mbank.getApiURL() + 'generateCode.do';
		var _params = {
//			'uuID': uuID
			 'uuID': plus.device.uuid
		};
		return new Promise(function (resolve, reject) {
			mbank.apiSend('get', _url, _params, function (data) {
				resolve(data);
			}, function(err){
				reject(err);
			});
		});
	};
	/*生成密码因子随机数*/
	function passwdSeed() {
		var DATE = new Date();
		var YEAR = DATE.getFullYear().toString();
		var MONTH = DATE.getMonth() + 1 < 10 ? '0' + (DATE.getMonth() + 1) : DATE.getMonth() + 1;
		var DAY = DATE.getDate() < 10 ? '0' + DATE.getDate() : DATE.getDate().toString();
		var HOURS = DATE.getHours() < 10 ? '0' + DATE.getHours() : DATE.getHours().toString();
		var MINUTES = DATE.getMinutes() < 10 ? '0' + DATE.getMinutes() : DATE.getMinutes().toString();
		var SECONDS = DATE.getSeconds() < 10 ? '0' + DATE.getSeconds() : DATE.getSeconds().toString();
		var time = void 0;
		if (DATE.getMilliseconds() < 10) {
			time = '00' + DATE.getMilliseconds();
		} else if (DATE.getMilliseconds() < 100) {
			time = '0' + DATE.getMilliseconds();
		} else {
			time = DATE.getMilliseconds().toString();
		}
		var random = Math.random().toString().split('.')[1].substr(0, 15);
		return YEAR + MONTH + DAY + HOURS + MINUTES + SECONDS + time + random;
	};
	var reg = "^(?![a-zA-Z0-9]+$)(?![^a-zA-Z/D]+$)(?![^0-9/D]+$).{8,20}$";

	/*请求后台登录事件*/
	var signIn = function signIn(params) {
		var url = mbank.getApiURL() + 'signIn.do';
		return new Promise(function (resolve, reject) {
			mbank.apiSend('post', url, params, function (data) {
				resolve(data);
			}, function (err) {
				reject(err);
			});
		});
	};

	loginParams.storeNo = mbank.storeNo;
	loginParams.telephone = mbank.telephone;

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		var InScreen=mbank.isImmersed();
		plus.screen.lockOrientation("portrait-primary"); //锁定屏幕方向：竖屏正方向
		plus.navigator.setStatusBarBackground('#fff');
		plus.navigator.setStatusBarStyle('dark'); //dark or light 	
//		plus.device.getInfo({
//			success:function(e){ 
//				uuID=e.uuid;
//			},  
//			fail:function(){  
//				showMsg("获取硬件标识失败，请同意软件获取设备信息后重新打开应用");  
//			}  
//		});
		if (plus.os.name == 'Android') {
			plus.pluginPGKeyboard.clearKeyboard("pwd");
		}

		if (localStorage.getItem('sessionStoreNo') && localStorage.getItem('sessionStoreNo') != '') {
			dealerCode.value = localStorage.getItem('sessionStoreNo');
		}
		if (localStorage.getItem('sessionTel') && localStorage.getItem('sessionTel') != '') {
			cellNum.value = localStorage.getItem('sessionTel');
		}
		//安卓返回键事件
		var backButtonPress = 0; //返回按钮	
		mui.back = function (event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function () {
				backButtonPress = 0;
			}, 1000);
		};

		dealerCode.addEventListener('blur', function () {
			loginParams.storeNo = this.value;
		});

		cellNum.addEventListener('blur', function () {
			loginParams.telephone = this.value;
		});
		password.addEventListener("blur", function (event) {
			event.preventDefault();
			if (plus.os.name == 'Android') {
				plus.pluginPGKeyboard.hideKeyboard("pwd");
			}
		});
		password.addEventListener("click", function (event) {
			event.preventDefault();
			plus.pluginPGKeyboard.hideKeyboard("pwd");
			plus.pluginPGKeyboard.clearKeyboard("pwd");
			password.name = "";password.value = "";

			plus.pluginPGKeyboard.openAESKeyboard("pwd", "false", 0, 20, "false", "false", "true", reg, "", passwordSeed, function (result) {
				if (result.status) {
					if (plus.os.name == 'iOS') {
						var json = result.payload;
						var obj = $.parseJSON(json);
						password.value = obj.cipherText == null ? "" : obj.text;
						password.name = obj.cipherText == null ? "" : obj.cipherText;
					} else {
						var msg = result.message;
						if (msg == 0) {
							var error = result.payload;
							nativeUI.errorMSG(error, function () {});
						} else if (msg == 1) {
							var height = result.payload;
						} else if (msg == 2) {
							var json = result.payload;
							var obj = $.parseJSON(json);
							password.value = obj.cipherText == null ? "" : obj.text;
							password.name = obj.cipherText == null ? "" : obj.cipherText;
						} else if (msg == 3) {
							var id = result.payload;
						}
					}
				} else {
					mcheck.toast("调用密码键盘失败!");
				}
			}, function (result) {
				mcheck.toast(result);
			});
		});
		
		setTimeout(function(){
			getCode();
		},1000);
		function getCode() {
			generateCode().then(function (data) {
				codeImg.src = 'data:image/png;base64,' + data.srandNum;
			});
		}
		

		//点击图片，刷新验证码
		codeImg.addEventListener('tap', function (event) {
			getCode();
		}, false);

		validateCode.addEventListener('keydown', function (event) {
			if (event.keyCode == 13) {
				setTimeout(function () {
					loginParams.checkCode = this.value;
					loginSuc();
				}, 300);
			}
		});
		validateCode.addEventListener('blur', function () {
			loginParams.checkCode = this.value;
		});
		validateCode.addEventListener('keyup', function () {
			loginParams.checkCode = this.value;
		});

		function loginSuc() {
			if (dealerCode.value == '') {
				mcheck.toast('经销商代码不能为空');
				return;
			}
			if (cellNum.value == '') {
				mcheck.toast('手机号不能为空');
				return;
			}
			if (password.value == '') {
			 	mcheck.toast('密码不能为空');
			 	return;
			 }
			if (validateCode.value == '') {
				mcheck.toast('验证码不能为空');
				return;
			}
			if (!accountreg.test(cellNum.value)) {
				mcheck.toast('手机号格式错误');
				return;
			}
			$('#waitingBox').show();
			var url = mbank.getApiURL() + 'verifyCode.do';
			var params = {
				"noCode": validateCode.value,
//				'uuID': uuID
				'uuID': plus.device.uuid
			};
			mbank.apiSend('post', url, params, function (data) {
				loginParams.clientid = plus.push.getClientInfo().clientid;
				loginParams.passwdSeed = passwordSeed;
				loginParams.passwordEncrypted = password.name;
				loginParams.storeNo = Base64.encode(dealerCode.value);
				loginParams.telephone = Base64.encode(cellNum.value);
				loginParams.checkCode = validateCode.value;
				loginParams.codeFlag = '0';
				signIn(loginParams).then(function (data) {
					localStorage.setItem('logonId', data.logonId);
					localStorage.setItem('sessionId', data.sessionId);
					localStorage.setItem('sessionName', data.session_customerNameCN); //存储登录用户名
					localStorage.setItem('sessionStoreNo', data.storeNo);
					localStorage.setItem("sessionUserRole", data.session_userRole);
					localStorage.setItem("sessionStoreName", data.session_storeName);
					localStorage.setItem("sessionTel", data.telephone);
					localStorage.setItem("clientid", loginParams.clientid);
					localStorage.setItem('isLogin', 'true');
					localStorage.setItem('firstFlag','01');
					if (data.numfirstFlag == '0') {//如果用户是首次登录，就跳转到修改密码页码页面进行密码修改
						$('#waitingBox').hide();
						mui.alert(data.evaMessage, "提示", "去修改", function () {
							mbank.openWindowByLoad('./Mine/passwordModify.html', 'passwordModify', 'slide-in-right');
						}, 'div');
						return;
					}else if (data.needCheckMobile == "1") {//如果用户手机号需要进行验证，则跳转到获取手机验证码页面进行验证
						$('#waitingBox').hide();
						mbank.openWindowByLoad('./HomePage/checkMobileCode.html', 'checkMobileCode', 'slide-in-right', {
							"phoneNumber": localStorage.getItem("sessionTel")
						});
						return;
					}else {
						localStorage.removeItem('firstFlag');
						mbank.openWindowByLoad('./HomePage/homePage.html', 'homePage', 'slide-in-right', {
							'isLogin': true
						});
					}
				}, function (err) {
					validateCode.value = "";
					getCode();
					mcheck.callPortFailed(err.ec, err.em, '#waitingBox');
				});
			}, function (err) {
				$('#waitingBox').hide();
				validateCode.value = "";
				mcheck.toast(err.em);
				getCode();
			}, true);
		}

		/*登录按钮点击事件*/
		var login2 = document.getElementById('login');
		login2.addEventListener('tap', function () {
			document.activeElement.blur();
			loginSuc();
		});

		forgetPsd.addEventListener('tap', function () {
			mbank.openWindowByLoad('./HomePage/setWays.html', 'setWays', 'slide-in-right');
		});

		policy.addEventListener('tap', function () {
			mbank.openWindowByLoad('./CommonPage/policy.html', 'policy', 'slide-in-right');
		});
		fwtk.addEventListener('tap', function () {
			mbank.openWindowByLoad('./CommonPage/protocol.html', 'protocol', 'slide-in-right');
		});

		/**
   * 版本更新,发布
   */
		// 获取本地应用资源版本号
		plus.runtime.getProperty(plus.runtime.appid, function (inf) {
			wgtVer = inf.version;
			console.log("当前应用版本：" + wgtVer);
			checkUpdate(wgtVer);
		});
		//休眠方法
		function sleep(numberMillis) {
			var now = new Date();
			var exitTime = now.getTime() + numberMillis;
			while (true) {
				now = new Date();
				if (now.getTime() > exitTime) return;
			}
		}
		//判断进行更新
		function checkUpdate(v) {
			if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
				versionupdates("IOSVERSION", v);
			} else if (/(Android)/i.test(navigator.userAgent)) {
				versionupdates("ADRVERSION", v);
			} else {
				console.log("获取设备客户端信息失败 ！");
			}
		};
		function versionupdates(jix, v) {
			var reqData = {
				"aprFlag": "1",
				"flag": jix
			};
			var url = mbank.getApiURL() + 'checkVersion.do';
			mbank.apiSend('post', url, reqData, function (data) {
				var currentArr = v.split(".");
				var previousArr = data.checkFlag.split(".");
				var minLength = Math.min(currentArr.length, previousArr.length),
					position = 0,
      				diff = 0;
				while (position < minLength && ((diff = parseInt(currentArr[position]) - parseInt(previousArr[position])) == 0)){
			    	position++;
			    }
			    diff = (diff != 0) ? diff : 0;
				if (position == minLength) {
					if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
						plus.nativeUI.closeWaiting();
					}
				}
				if (diff<0) {
					plus.nativeUI.alert("当前应用有更新，请前往更新！", function (event) {
						mbank.removeCache();
						setTimeout(function(){
							if (event.index == 0) {
								if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
									plus.runtime.quit();
									plus.nativeUI.showWaiting("正在下载,请稍后……", {
										padlock: false
									});
									window.location = data.url;
								} else {
									var simulateLoading = function simulateLoading(container, progress) {
										if (typeof container === 'number') {
											progress = container;
											container = 'body';
										}
										setTimeout(function () {
											var totalSize = dtask.totalSize;
											var downloadedSize = dtask.downloadedSize;
											var a = parseFloat((downloadedSize / 1024 / 1024).toFixed(2) / (totalSize / 1024 / 1024).toFixed(2)).toFixed(2) * 100;
											// var preNum = document.getElementById("preNum");
											preNum.innerHTML = parseInt(a) + "%";
											progress = a;
											mui(container).progressbar().setProgress(progress);
											if (progress < 100) {
												simulateLoading(container, progress);
											} else {
												mui(container).progressbar().hide();
												plus.runtime.quit();
											}
											if (totalSize == downloadedSize) {
												storey_box.style.display = "none";
												down_info1.style.display = "none";
											}
										}, 1500);
									};

									storey_box.style.display = "block";
									down_info1.style.display = "block";
									var container = mui("#downProBar p");
									if (container.progressbar({
										progress: 0
									}).show()) {
										simulateLoading(container, 0);
									}

									var dtask = plus.downloader.createDownload(data.url, {}, function (d, status) {
										if (status == 200) {

											plus.nativeUI.toast("正在加载安装包，请稍后");
											storey_box.style.display = "none";
											down_info1.style.display = "none";
											sleep(1000);
											var path = d.filename;
											plus.runtime.install(path); // 安装下载的apk文件
										} else {
											alert('Download failed:' + status);
										}
									});
									dtask.start();
								}
							} else {
							plus.runtime.quit();
						    }
					    },200)
					}, "更新提示", "前往更新");
				}
			}, versionFai, false);
		}
		function versionFai(data) {
			mcheck.callPortFailed(data.ec, data.em, '#waitingBox');
		}
	});
});
