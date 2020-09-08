'use strict';

define(function (require, exports, module) {
	mui.init();
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	var isRefresh = true; // 判断是否下拉刷新

	var applCde = localStorage.getItem('applCde');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();
		var contNo = self.contNo;
		var applCde = self.applCde;
		var fromPage = self.fromPage || '';
		var contractStatus = {
			status_1: '签署中',
			status_2: '签署完成',
			status_3: '签署失败',
			status_4: '签署超时',
			status_5: '签署中'
		},
		    filePath = '',
		    stop = false;
		/* 
  	合同签署 状态判断
   */
		function inquireDgSignResult(contNo, docType, isTimeout) {
			var _url = mbank.getApiURL() + 'inquireDgSignResult.do';
			var ad = '';
			mbank.apiSend('post', _url, {
				"keyValue": contNo, // 合同编号
				"docType": docType // 电子签类型 '03'
			}, function (res) {
				filePath = res.filePath; // 查看pdf文件
				if (res.status == '00') {
					// 签署中 【签署终止】、【发送邮件】、【刷新】、二维码 按钮显示
					$('#imgStatus').attr('src', '../../images/conSinging.png');
					$('#prev').html('终止签署');
					$('#next').html('发送邮件');
					$('.nav-bar-icon .iconSymbol').css('font-size', '.48rem'); // 刷新按钮隐藏
				} else if (res.status == '01') {
					// 成功 【返回】、【查看】、【发送邮件】按钮显示
					$('#imgStatus').attr('src', '../../images/conSingSuccess.png');
					$('#prev').html('返回');
					$('#next').html('查看');
					$('#prevAndNext').show();
				} else if (res.status == '02') {
					// 失败 【转PC签署】、二维码按钮显示
					$('#imgStatus').attr('src', '../../images/conSignFailed.png');
					//$('.offser-list .iconSymbol').css('font-size', '.3rem'); // 【？】号
					$('#prev').html('转PC签署');
					$('#next').hide();
					ad = '1';
				} else {
					// 超时【上一步】、【在线签署】按钮显示
					if (res.status == '03' || res.status == '04') {
						// 03 04 终止、作废
						$('#imgStatus').attr('src', '../../images/conSignTimeout.png');
						$('#prev').html('上一步');
						$('#next').html('在线签署');
						ad = '1';
					}
				}
				inquireSingleDgSignResult(contNo, '03', isTimeout, res.status, ad);
			}, function (err) {
				$('#waitingBox').hide();
				$('.dropload-down').hide();
				if (isRefresh) {
					dropload.lock();
					dropload.noData();
					dropload.resetload();
				}
				mCheck.alert(err.em);
			});
		}
		/* 
  	查询合同签署人信息
   */
		function inquireSingleDgSignResult(contNo, docType, isTimeout, errStatus, ad) {
			var _url = mbank.getApiURL() + 'inquireSingleDgSignResult.do';
			mbank.apiSend('post', _url, {
				"keyValue": contNo, // 合同编号
				"docType": docType // 电子签类型
			}, function (res) {
				var result = '';
				for (var i = 0; i < res.signStatusList.length - 1; i++) {
					if (res.signStatusList[i].status == '1' || res.signStatusList[i].status == '5' || res.signStatusList[i].status == '3' || res.signStatusList[i].status == '4') {
						res.signStatusList[i + 1].isHide = true;
					}
				}
				res.signStatusList.forEach(function (item, index) {
					var orCode = '';
					var conStatus = '<span class="status">' + contractStatus['status_' + item.status] + '</span>';
					if (item.status == 3 || item.status == 4) {
						conStatus = '<span data-value="' + item.status + '" class="status failed">' + contractStatus['status_' + item.status] + '<i class="iconSymbol icon__why"></i></span>';
						if (item.status == 4) {
							if (!isTimeout) {
								stop = false;
							} else {
								stop = true;
							}
						}
					}
					if (item.status == '1' || item.status == '5') {
						if (ad === '1') {
							conStatus = '<span class="status"></span>';
						} else {
							if (!item.isHide) {
								orCode = '<img class="orCode" data-value="' + item.url + '" src="../../images/conSignOrCode.png">';
							}
						}
					}
					var custName = '';
					if (item.role == '01') {
						custName = '借款人签名';
					} else if (item.role == '02') {
						custName = '共借人签名';
					} else if (item.role == '03') {
						custName = '保证人签名';
					}
					result += '\n\t\t\t\t\t\t<li id="' + index + '">\n\t\t\t\t\t\t\t<h4 class="name">' + custName + '</h4>\n\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t<label>\u59D3<small class="white">\u674E\u767D</small>\u540D</label>\n\t\t\t\t\t\t\t\t<span id="mainBorrowerName">' + item.custname + '</span>\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t<label>\u624B\u673A\u53F7\u7801</label>\n\t\t\t\t\t\t\t\t<span id="mainBorrowerIphone" class="iphone">' + item.mobilePhone + ' <i class="iconSymbol icon__tel"></i></span>\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t<label>\u53D1\u8D77\u65F6\u95F4</label>\n\t\t\t\t\t\t\t\t<span id="mainBorrowerStartTime">' + item.startDate + '</span>\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t<label>\u5B8C\u6210\u65F6\u95F4</label>\n\t\t\t\t\t\t\t\t<span id="mainBorrowerEndTime">' + item.endDate + '</span>\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t<label>\u72B6<small class="white">\u674E\u767D</small>\u6001</label>\n\t\t\t\t\t\t\t\t' + conStatus + '\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t' + orCode + '\n\t\t\t\t\t\t</li>\n\t\t\t\t\t';
				});
				setTimeout(function () {
					$('.offser-list').html(result);
					$('#waitingBox').hide();
					if (isRefresh) {
						dropload.resetload();
						dropload.unlock();
						dropload.noData(false);
					}
				}, 300);

				if (res.signStatusList.length <= 10) {
					$('.dropload-down').hide();
					dropload.lock();
					dropload.noData();
					return;
				}
			}, function (err) {
				$('#waitingBox').hide();
				$('.dropload-down').hide();
				if (isRefresh) {
					dropload.lock();
					dropload.noData();
					dropload.resetload();
				}
				mCheck.alert(err.em);
			});
		}
		/* 
  	终止合同签署
   */
		function stopDgSign(contNo, docType) {
			var _url = mbank.getApiURL() + 'stopDgSign.do';
			mbank.apiSend('post', _url, {
				"keyValue": contNo, // 申请编号
				"docType": docType // 电子签类型
			}, function (res) {
				mui.toast('合同已终止签署', { type: 'div' });
				$('#prev').html('上一步');
				$('#next').html('在线签署').show(); // 合同终止成功，上一步和在线签署显示
				stop = true;
				inquireDgSignResult(contNo, '03', true);
			},function(err){
				mCheck.callPortFailed(err.ec,err.em);
			});
		}
		/* 
  	合同终止，返回上一步
   */
		function updateContractVersion(contNo, applCde, fromPage) {
			var _url = mbank.getApiURL() + 'updateContractVersion.do';
			mbank.apiSend('post', _url, {
				"contNo": contNo // 申请编号
			}, function (res) {
				mbank.openWindowByLoad('conSignInfo.html', 'conSignInfo', 'slide-in-left', {
					"applCde": applCde,
					contNo: contNo,
					fromPage: fromPage
				});
			},function(err){
				mCheck.callPortFailed(err.ec,err.em);
			});
		}
		/* 
  	二维码生成器
   */
		function isQrCode(url) {
			$('#qrcode').qrcode({
				render: "canvas",
				width: '150',
				height: '150',
				background: '#fff',
				foreground: "#000",
				text: url
			});
		}
		/* 
  	转PC签署
   */
		function transferAppLoanToOffline(applCde, fromPage) {
			var _url = mbank.getApiURL() + 'transferAppLoanToOffline.do';
			mbank.apiSend('post', _url, {
				"applCde": applCde
			}, function (res) {
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.removeItem('firstFlag');
						if (fromPage == 'conList') {
							mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
						} else if (fromPage == 'loanList') {
							mbank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
						} else if (fromPage == 'homePage') {
							mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
						} else if (fromPage == 'lendingList') {
							mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
						}
					}
				});
			},function(err){
				mCheck.callPortFailed(err.ec,err.em);
			});
		}
		/* 
  	在线签署
   */
		function initiateContractDgSign(applCde, contNo, fromPage) {
			var _url = mbank.getApiURL() + 'initiateContractDgSign.do';
			mbank.apiSend('post', _url, {
				"contNo": contNo // 合同编号
				// "isJointFree" : jointFree
			}, function (res) {
				inquireDgSignResult(contNo, '03', false);
			}, function (err) {
				$('#waitingBox').hide();
				mCheck.alert(err.em);
			});
		}
		/* 
  	查询合同签署 状态 
  */
		inquireDgSignResult(contNo, '03', false);
		$('.dropload-down').remove();
		var dropload = $('.content2').dropload({
			scrollArea: window,
			loadUpFn: function loadUpFn(me) {
				// 下拉加载
				isRefresh = true;
				inquireDgSignResult(contNo, '03', false);
			},
			threshold: $(window).height() - 50
		});
		
  	/* 点击 电话图标 ，电话弹窗 开启*/
		var telCode;
		$('.offser-list').on('tap', '.iphone', function () {
			$('#telConfirm').attr('href', 'javascript:;');
			var iphone = $(this).text();
			telCode = $(this).text();
			$('.telCode').html('是否呼叫 <span>' + iphone + '</span>');
			$('.telMask').show();
		});
  	/*关闭电话弹窗*/
		$('.telBtn').on('tap', 'a', function () {
			if ($(this).index() == 1) {
				$('#telConfirm').attr('href', 'tel:' + telCode);
			}else{
				$('.telMask').hide();
			}
		});
		 
		/*点击 【?】*/
		$('ul').on('tap', '.failed', function (e) {
			var itemStatus = $(this).attr('data-value');
			var alertTips = '';
			if (itemStatus == '3') {
				alertTips = '由于客户银行卡四要素验证多次未通过，或人脸识别验证比对多次未通过，导致电子签失败。请转PC线下签署。';
			} else if (itemStatus == '4' && !stop) {
				alertTips = '客户未在规定时间内完成电子文档签署，请您联系客户确认后重新尝试。如信息填写错误，请点击上一步返回修改。';
			} else if (itemStatus == '4' && stop) {
				alertTips = '您已终止合同签署，如信息填写错误，请点击上一步返回修改。或者重新在线签署';
			}
			mui.alert(alertTips, ' ', '确定', function (e) {
				e.index;
			}, 'div');
		});
		/* 
  	点击 【签署终止】按钮
  */
		$('.mui-bar-footer').on('tap', 'a', function () {
			if ($(this).text() === '终止签署') {
				// 签署中 状态
				mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						mui.confirm('请确认是否终止签署，如点击确定，则正在进行中的签署操作会立即结束。', ' ', ['取消', '确认'], function (e) {
							isRefresh = false;
							if (e.index === 1) {
								stopDgSign(contNo, '03'); // 合同终止签署
							}
						}, 'div');
					}
				});
				
			} else if ($(this).text() === '在线签署') {
				isRefresh = false;
				mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						$('#waitingBox').show();
						initiateContractDgSign(applCde, contNo, fromPage);
					}
				});
			} else if ($(this).text() === '转PC签署') {
				mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						mui.confirm('确认将办理渠道转为PC吗？如点击确认，则后续流程均需通过电脑端完成，仅接受纸质合同作为放款资料。', ' ', ['取消', '确认'], function (e) {
							if (e.index === 1) {
								// 确定，页面返回到合同签订列表界面
								transferAppLoanToOffline(applCde, fromPage);
							}
						}, 'div');
					}
				});
			} else if ($(this).text() === '返回') {
				// 跳转到 合同签署 列表 页
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left', {
							"applCde": applCde
						});
					}
				});
				
			} else if ($(this).text() === '上一步') {
				// 返回合同信息输入页面
				updateContractVersion(contNo, applCde, fromPage);
			} else if ($(this).text() === '查看') {
				// 【查看】按钮，点击此按钮，查看签署的合同文件；
				mbank.openWindowByLoad('conSigningLook.html', 'conSigningLook', 'slide-in-right', {
					filePath: filePath
				});
			} else if ($(this).text() === '发送邮件') {
				mbank.openWindowByLoad('conSignMail.html', 'conSignMail', 'slide-in-right', {
					"applCde": applCde,
					'contNo': contNo, // 合同编号
					fromPage: fromPage
				});
			}
		});

		/* 
  	刷新按钮
  */
		$('#refresh').on('tap', function () {
			// 	【刷新】按钮，点击此按钮，刷新签署的信息；
			$('#waitingBox').show();
			isRefresh = false;
			inquireDgSignResult(contNo, '03', false);
		});
		/* 
  	二维码点击放大
  */
		$('.offser-list').on('tap', '.orCode', function () {
			$('#qrcode').html('');
			$('#qrcodeName').html($(this).parents('li').find('#mainBorrowerName').html());
			$('#qrcodeIphone').html($(this).parents('li').find('#mainBorrowerIphone').text());
			isQrCode($(this).attr('data-value'));
			$('.orCodeMask').show();
		});
		/* 
  	点击关闭按钮，二维码隐藏
   */
		$('.bigOrCodeOuter i').on('tap', function () {
			$('.orCodeMask').hide();
		});
		$('#back').on('tap', function () {
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='N'){
					return;
				}else{
					localStorage.removeItem('firstFlag');
					if (fromPage == 'conList') {
						mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
					} else if (fromPage == 'loanList') {
						mbank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
					} else if (fromPage == 'homePage') {
						mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
					} else if (fromPage == 'lendingList') {
						mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
					}
				}
			});
			
		});
		if (fromPage == 'conList') {
			mui.back = function () {
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'loanList') {
			mui.back = function () {
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						mbank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'homePage') {
			localStorage.removeItem('firstFlag');
			mui.back = function () {
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'lendingList') {
			mui.back = function () {
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
					}
				});
			};
		}
		/* plus.key.addEventListener('backbutton', function () {
  	
  }, false); */
	});
});