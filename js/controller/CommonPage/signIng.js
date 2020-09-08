'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mBank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	var typeFlag = localStorage.getItem('typeFlag');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	var list = {
		'canClick': true,
		'signStatusList': [],
		'url': ''
	}; //页面临时参数集合  

	//查询电子签签署情况(全体)
	function inquireDgSignResult(applCde, docType) {
		var param = { 'keyValue': applCde, docType: docType };
		var url = mBank.getApiURL() + 'inquireDgSignResult.do';
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				resolve(data);
			}, function (err) {
				reject(err);
			}, true, false);
		});
	}

	//查询单人电子签署情况
	function inquireSingleDgSignResult(applCde, docType, type) {
		var param = { 'keyValue': applCde, docType: docType };
		var url = mBank.getApiURL() + 'inquireSingleDgSignResult.do';
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				list.signStatusList = data.signStatusList;
				if (type == '02') {
					//签署申请表的时候
					for (var i = 0; i < list.signStatusList.length - 1; i++) {
						if (list.signStatusList[i].status == '1' || list.signStatusList[i].status == '3' || list.signStatusList[i].status == '4') {
							list.signStatusList[i + 1].isHide = true;
						}
					}
				}
				resolve(list.signStatusList);
			}, function (err) {
				reject(err);
			});
		});
	}

	//终止电子签署
	function stopDzSign(applCde, docType) {
		var param = { 'keyValue': applCde, docType: docType };
		var url = mBank.getApiURL() + 'stopDgSign.do';
		return new Promise(function (resolve, reject) {
			mBank.apiSend('post', url, param, function (data) {
				resolve(data);
			}, function (err) {
				reject(err);
			});
		});
	}

	//签署中状态
	var signIngState = function signIngState() {
		$('.state').css('background-image', 'url(../../images/sign04.png)');
		$('.app-code').show();
		$('#refresh').show();
		$('.footer').find('span').hide();
		$('#stop').show();
	};

	//签署失败状态
	var signFailState = function signFailState() {
		$('.state').css('background-image', 'url(../../images/sign03.png)');
		$('.app-code').hide();
		$('#refresh').hide();
		$('.footer').find('span').hide();
		$('#back').show();
	};

	//签署成功状态
	var signSucState = function signSucState() {
		$('.state').css('background-image', 'url(../../images/sign02.png)');
		$('.app-code').hide();
		$('#refresh').hide();
		$('.footer').find('span').hide();
		$('#see').show();
		$('#sub').show();
	};

	//超时状态
	var overtimeState = function overtimeState() {
		$('.state').css('background-image', 'url(../../images/sign01.png)');
		$('.app-code').hide();
		$('#refresh').hide();
		$('.footer').find('span').hide();
		$('#pre').show();
		$('#sign').show();
		list.canClick=true;
	};

	var initiateDzSign = function initiateDzSign(urlName, applCde) {
		var url = '' + mBank.getApiURL() + urlName + '.do';
		var param = { 'applCde': applCde };
		return new Promise(function (resolve, reject) {
			mBank.apiSend('post', url, param, function (data) {
				resolve(data);
			}, function (err) {
				reject(err);
			}, true, true);
		});
	};

	var submitDealerPreTrial = function submitDealerPreTrial(applCde) {
		var url = mBank.getApiURL() + 'submitDealerPreTrial.do';
		var param = { 'applCde': applCde };
		return new Promise(function (resolve, reject) {
			mBank.apiSend('post', url, param, function (data) {
				resolve(data);
			}, function (err) {
				reject(err);
			}, true);
		});
	};
	function ocrUploadECM(applCde) {
		var url = mBank.getApiURL() + 'ocrUploadECM.do';
		mBank.apiSend("post", url, {
			applCde: applCde,
			orderTyp: 'SQ'
		}, function (res) {
			$('#waitingBox2').hide();
			mBank.openWindowByLoad('../Images/imageList.html', 'imageList', 'slide-in-right');
		}, function (err) {
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox2');
		});
	}
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		if (typeFlag == '01') {
			$('.title')[0].innerHTML = '征信授权';
			list.url = 'initiateAuthSign';
			list.docType = '01';
			$('#sub').text('提交');
		} else if (typeFlag == '02') {
			$('.title')[0].innerHTML = '签署申请表';
			list.url = 'initiateApplyFormDgSign';
			list.docType = '02';
		}

		var dropload = $('.content2').dropload({
			scrollArea: window,
			loadUpFn: function loadUpFn(me) {
				refresh12();
			},
			threshold: $(window).height() - 50
		});

		pre.addEventListener('tap', function () {
			mBank.openWindowByLoad('./signInit.html', 'signInit', 'slide-in-left');
		});
		//终止后，再次出现【在线签署】
		sign.addEventListener('tap', function () {
			if (!list.canClick) {
				return;
			}
			list.canClick = false;
			$('#waitingBox2').show();
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					list.canClick = true;
					$('#waitingBox2').hide();
					return;
				}else{
					if (typeFlag == '01') {
						list.url = 'initiateAuthSign';
					} else {
						list.url = 'initiateApplyFormDgSign';
					}
					initiateDzSign(list.url, applCde).then(function (data) {
						refresh12();
					}, function (err) {
						list.canClick = true;
						mCheck.callPortFailed(err.ec, err.em, '#waitingBox2');
					});
				}
			});
		});
		//点击下一步
		sub.addEventListener('tap', function () {
			$('#waitingBox2').show();
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					$('#waitingBox2').hide();
					return;
				}else{
					if (typeFlag == '01') {
						submitDealerPreTrial(applCde).then(function (data) {
							mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
								if(dat=='Y'){
									$('#waitingBox2').hide();
									mBank.openWindowByLoad('./subPage.html', 'subPage', 'slide-in-right', { 'loanstt': data.loanstt });
								}
							});
							$('#waitingBox2').hide();
						}, function (err) {
							mCheck.callPortFailed(err.ec, err.em, '#waitingBox2');
						});
					} else if (typeFlag == '02') {
						ocrUploadECM(applCde);
					}
				}
			});
		});
		function inquireCallbackSingle(errStatus, ad) {
			inquireSingleDgSignResult(applCde, list.docType, typeFlag).then(function (data) {
				var str = '';
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var item = _step.value;

						var name = '';
						var status = '';
						var codeStr = '';
						if (item.role == '01') {
							name = '借款人';
						} else if (item.role == '02') {
							name = '共借人';
						} else if (item.role == '03') {
							name = '保证人';
						}
						if (item.status == '1') {
							if (ad == '1') {
								status = '<span class="main-content main-status"></span>';
							} else {
								if (!item.isHide) {
									status = '<span class="main-content main-status">\u7B7E\u7F72\u4E2D</span>';
									codeStr = '<span class="app-code"></span>';
								} else {
									status = '<span class="main-content main-status">\u7B7E\u7F72\u4E2D</span>';
								}
							}
						} else if (item.status == '2') {
							status = '<span class="main-content main-status">\u7B7E\u7F72\u5B8C\u6210</span>';
						} else if (item.status == '3') {
							status = '<span class="main-content red main-status">\u5931\u8D25</span>\n\t\t\t\t\t\t\t\t\t<span class="iconSymbol red icon__why"></span>';
						} else if (item.status == '4') {
							status = '<span class="main-content red main-status">\u8D85\u65F6</span>\n\t\t\t\t\t\t\t\t\t<span class="iconSymbol red icon__why"></span>';
						}
						//					if (errStatus == '02' || errStatus == '03') {
						//						status = `<span class="main-content main-status"></span>`;
						//					}
						str += '<div class="app-box">\n\t\t\t\t\t\t\t' + codeStr + '\n\t\t\t\t\t\t\t<span class="app-header">' + name + '\u7B7E\u540D</span>\n\t\t\t\t\t\t\t<ul class="app-main" id="appMain">\n\t\t\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t\t\t<span class="main-title">\u59D3<em>\u59D3\u540D</em>\u540D</span>\n\t\t\t\t\t\t\t\t\t<span class="main-content">' + item.custname + '</span>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t\t\t<span class="main-title">\u624B\u673A\u53F7\u7801</span>\n\t\t\t\t\t\t\t\t\t<span class="main-content main-tel">' + item.mobilePhone + '</span>\n\t\t\t\t\t\t\t\t\t<span class="iconSymbol icon__tel"></span>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t\t\t<span class="main-title">\u53D1\u8D77\u65F6\u95F4</span>\n\t\t\t\t\t\t\t\t\t<span class="main-content">' + item.startDate + '</span>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t\t\t<span class="main-title">\u5B8C\u6210\u65F6\u95F4</span>\n\t\t\t\t\t\t\t\t\t<span class="main-content">' + item.endDate + '</span>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t\t\t<span class="main-title">\u72B6<em>\u72B6\u6001</em>\u6001</span>\n\t\t\t\t\t\t\t\t\t' + status + '\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t</div>';
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

				appInfo.innerHTML = str;
				setTimeout(function () {
					$('#waitingBox2').hide();
					dropload.resetload();
					dropload.unlock();
					dropload.noData(false);
				}, 1000);
				if (data.length <= 10) {
					$('.dropload-down').hide();
					dropload.lock();
					dropload.noData();
					return;
				}
			}, function (err) {
				mCheck.alert(err.em);
				setTimeout(function () {
					$('#waitingBox2').hide();
					dropload.resetload();
					dropload.unlock();
					dropload.noData(false);
				}, 1000);
			});
		}
		function inquireCallbackAll() {
			var ad = '';
			inquireDgSignResult(applCde, list.docType).then(function (data) {
				list.status = data.status;
				list.url = data.filePath;
				if (data.status == '00') {
					signIngState();
				} else if (data.status == '01') {
					signSucState();
				} else if (data.status == '02') {
					signFailState();
					ad = '1';
				} else if (data.status == '03') {
					ad = '1';
					overtimeState();
				}
				inquireCallbackSingle(data.status, ad); //查询单体签署情况
			}, function (err) {
				mCheck.alert(err.em);
				setTimeout(function () {
					$('#waitingBox2').hide();
					dropload.resetload();
					dropload.unlock();
					dropload.noData(false);
				}, 1000);
			});
		}
		refresh12();
		function refresh12() {
			inquireCallbackAll(); //查询整体	
		}
		refresh.addEventListener('tap', function () {
			$('#waitingBox2').show();
			inquireCallbackAll(); //查询整体
			//			inquireCallbackSingle();//查询单体签署情况
		});
		//超时、失败原因
		mui(appInfo).on('tap', '.icon__why', function () {
			//			const items = [...document.getElementsByClassName('main-status')];
			var items = [].slice.call(document.getElementsByClassName('main-status'));
			var n = items.indexOf($(this).siblings('.main-status')[0]);
			if (list.signStatusList[n].status == '3') {
				//失败
				if (typeFlag == '01') {
					mui.alert('由于客户银行卡四要素验证多次未通过，或人脸识别验证比对多次未通过，导致电子签失败。请转PC线下签署。', "提示", "确定", null, 'div');
				} else if (typeFlag == '02') {
					mui.alert('由于客户银行卡四要素验证多次未通过，或人脸识别验证比对多次未通过，导致电子签失败。请转PC线下签署。', "提示", "确定", null, 'div');
				}
			}
			if (list.signStatusList[n].status == '4') {
				//超时
				mui.alert('客户未在规定时间内完成电子文档签署，请您联系客户确认后重新尝试。如信息填写错误，请点击上一步返回修改。', "提示", "确定", null, 'div');
			}
		});
		//生成二维码
		function isQrCode(url, dom) {
			$(dom).qrcode({
				render: 'canvas',
				width: '160',
				height: '160',
				background: '#fff',
				foreground: "#000",
				text: url
			});
		}
		mui(appInfo).on('tap', '.app-code', function () {
			var url = '';
			//const items = [...document.getElementsByClassName('app-header')];
			var items = [].slice.call(document.getElementsByClassName('app-header'));
			var n = items.indexOf($(this).siblings('.app-header')[0]);
			codeInfo.innerHTML = list.signStatusList[n].custname + ' | ' + list.signStatusList[n].mobilePhone;
			qrCode.innerHTML = '';
			isQrCode(list.signStatusList[n].url, qrCode);
			$('#waitingBox').show();
			$('#code').show();
			$('#tel').hide();
		});
		mui(appInfo).on('tap', '.icon__tel', function () {
			//			const items = [...document.getElementsByClassName('main-tel')];
			var items = [].slice.call(document.getElementsByClassName('main-tel'));
			var n = items.indexOf($(this).siblings('.main-tel')[0]);
			telNum.innerHTML = list.signStatusList[n].mobilePhone;
			$('#waitingBox').show();
			$('#code').hide();
			$('#tel').show();
			$('#call').attr('href', 'tel:' + list.signStatusList[n].mobilePhone);
		});
		cancel.addEventListener('tap', function () {
			$('#waitingBox').hide();
		});
		$('#close')[0].addEventListener('tap', function () {
			$('#waitingBox').hide();
		});
		see.addEventListener('tap', function () {
			mBank.openWindowByLoad('../ConSigning/conSigningLook.html', 'conSigningLook', 'slide-in-right', {
				'filePath': list.url
			});
		});
		$('#stop')[0].addEventListener('tap', function () {
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					return;
				}else{
					mui.confirm("请确认是否终止签署", "提示", ['否', '是'], function (e) {
						if (e.index == 1) {
							$('#waitingBox2').show();
							stopDzSign(applCde, list.docType).then(function (data) {
								overtimeState();
								//inquireCallbackSingle();
								refresh12();
							}, function (err) {
								mCheck.alert(err.em);
								$('#waitingBox2').hide();
							});
						} else {
							return;
						}
					}, 'div');
				}
			});
		});
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
			if ($('#waitingBox2').is(':visible')) {
				//如果loading框显示，不能点击手机返回按键
				return;
			}
			$('#waitingBox2').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox2').hide();
					back1();
				}
			});
		};
		back.addEventListener('tap', function () {
			$('#waitingBox2').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox2').hide();
					back1();
				}
			});
		});
		pre.addEventListener('tap', function () {
			$('#waitingBox2').show();
			if (typeFlag == '01') {
				var url = mBank.getApiURL() + 'modifyPreTrial.do';
				var param = { 'applCde': applCde };
				mBank.apiSend('post', url, param, function (data) {
					$('#waitingBox2').hide();
					mBank.openWindowByLoad('../PreHearing/NewPre/loanPre.html', 'loanPre', 'slide-in-left');
				}, function (err) {
					mCheck.callPortFailed(err.ec, err.em, '#waitingBox2');
				}, true);
			} else if (typeFlag == '02') {
				var url = mBank.getApiURL() + 'modifyApplyInfo.do';
				var param = { 'applCde': applCde };
				mBank.apiSend('post', url, param, function (data) {
					$('#waitingBox2').hide();
					mBank.openWindowByLoad('../Application/loanInfo.html', 'loanInfo', 'slide-in-left');
				}, function (err) {
					mCheck.callPortFailed(err.ec, err.em, '#waitingBox2');
				}, true);
			}
		});
		iconBack.addEventListener('tap', function () {
			$('#waitingBox2').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox2').hide();
					back1();
				}
			});
		});
	});
});