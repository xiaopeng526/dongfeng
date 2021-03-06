'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	var backFlag = localStorage.getItem('backFlag');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');

	/* 信贷员打回给销售 */
	function queryApplyCreator(applCde) {
		var _url = mBank.getApiURL() + 'queryApplyCreator.do';
		mBank.apiSend('post', _url, {
			applCde: applCde
		}, function (res) {
			res.role === '03' ? $('#back').show() : $('#back').hide();
		},function(err){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});
	}
	var list = {
		'canClick': true,
		'docList': [],
		'messageState': 'subMessage'
	};
	var appGetcfDocDtl = function appGetcfDocDtl(applCde) {
		var url = mBank.getApiURL() + 'appGetcfDocDtl.do';
		var param = { 'applCde': applCde, 'docTyp': '1001' };
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				resolve(data.iDocDtlList);
			}, function(err){
				reject(err);
			});
		});
	};
	var queryEcmUploadPages = function queryEcmUploadPages(applCde) {
		var url = mBank.getApiURL() + 'queryEcmUploadPages.do';
		var param = {
			'applCde': applCde,
			'docKind': '1001'
		};
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				resolve(data.iDocDtlList);
			},function(err){
				reject(err);
			});
		});
	};

	var AddOrUpdateDoc = function AddOrUpdateDoc(applCde) {
		var url = mBank.getApiURL() + 'AddOrUpdateDoc.do';
		var params = {
			'applCde': applCde,
			'temp': 'zlbc'
		};
		return new Promise(function (resolve, reject) {
			mBank.apiSend('post', url, params, function (data) {
				resolve(data);
			}, function (err) {
				reject(err);
			});
		});
	};

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		//queryApplyCreator(applCde);
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
		var queryMessage = function queryMessage(applCde) {
			var param = {
				turnPageBeginPos: '1',
				turnPageShowNum: "100",
				applCde: applCde,
				wlm_cont_no: ''
			};
			var url = mBank.getApiURL() + 'queryMessage.do';
			return new Promise(function (resolve, reject) {
				mBank.apiSend('get', url, param, function (data) {
					resolve(data.iMessage_wlm);
				}, function(err){
					reject(err);
				});
			});
		};

		var messageList = function messageList(data) {
			if (data.length == 0) {
				return;
			}
			var str = '';
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var item = _step.value;

					var state = '';
					if (item.wlm_msg_sts == '99') {
						$('#msgText').parent().hide();
						list.messageState = 'updateMessageWLM';
						state = '<span class="msg-btn change" id="changeBtn">\u4FEE\u6539</span>';
						list.id = item.wlm_mag_id;
					}
					str += '<div class="message-list margin-top" id="' + mCheck.dataIsNull(item.wlm_mag_id) + '">\n\t\t\t\t\t\t\t<div class="msg-det">' + mCheck.dataIsNull(item.wlm_msg_info) + '</div>\n\t\t\t\t\t\t\t<div class="msg-time">' + mCheck.dataIsNull(item.wlm_crt_dt) + '</div>\n\t\t\t\t\t\t\t<div class="msg-tips">\n\t\t\t\t\t\t\t\t<span class="msg-name">' + mCheck.dataIsNull(item.wlm_node_name) + '&nbsp;&nbsp;<em>' + mCheck.dataIsNull(item.wlm_crt_name) + '</em></span>\n\t\t\t\t\t\t\t\t<span class="msg-tel">' + mCheck.dataIsNull(item.wlm_contact) + '</span>\n\t\t\t\t\t\t\t\t' + state + '\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>';
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

			msgList.innerHTML = str;
		};
		queryMessage(applCde).then(function (data) {
			messageList(data);
		},function(data){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});

		var subMessage = function subMessage(messageState, applCde, info) {
			var id = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

			var url = '' + mBank.getApiURL() + messageState + '.do';
			var param = void 0;
			if (messageState == 'updateMessageWLM') {
				param = {
					'applCde': applCde,
					'wlm_mag_id': id,
					'wlm_msg_info': info,
					'wlm_crt_usr': localStorage.getItem("logonId"),
					'wlm_crt_name': localStorage.getItem("sessionName"),
					'wlm_contact': localStorage.getItem("sessionTel")
				};
			} else {
				param = {
					'wlm_appl_seq': applCde,
					'wlm_msg_sts': '99',
					'wlm_msg_info': info,
					'wlm_crt_usr': localStorage.getItem('logonId'),
					'wlm_crt_name': localStorage.getItem('sessionName'),
					'wlm_flag': '01',
					'wlm_node_name': '经销商',
					'wlm_contact': localStorage.getItem("sessionTel")
				};
			}

			return new Promise(function (resolve, reject) {
				mBank.apiSend('post', url, param, function (data) {
					resolve(data);
				}, function(err){
					reject(err);
				});
			});
		};

		msgBtn.addEventListener('tap', function () {
			if (msgText.value == '') {
				mui.toast('留言信息不能为空', { type: 'div' });
				return;
			}
			subMessage(list.messageState, applCde, msgText.value, list.id).then(function (data) {
				msgText.value = '';
				$('#msgText').parent().hide();
				queryMessage(applCde).then(function (data) {
					messageList(data);
				},function(err){
					mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
				});
			},function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		});

		mui('#msgList').on('tap', '#changeBtn', function () {
			$('#msgText').parent().show();
			var val = $('#msgList').find('#changeBtn').parent().siblings('.msg-det')[0].innerHTML;
			msgText.value = val.replace(/\<br\>+/g, '\n');
		});

		showAppDtl();
		function showAppDtl() {
			queryEcmUploadPages(applCde).then(function (data2) {
				appGetcfDocDtl(applCde).then(function (data) {
					list.docList = data;
					var str = '';
					list.docList.forEach(function (item) {
						var _iteratorNormalCompletion2 = true;
						var _didIteratorError2 = false;
						var _iteratorError2 = undefined;

						try {
							for (var _iterator2 = data2[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
								var _list = _step2.value;

								if (item.docKind == _list.docKind) {
									item.num = _list.page_Num;
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

						var str2 = '';
						if (item.num == '0' || item.num == '' || item.num == undefined) {
							str2 = '点击上传';
						} else {
							str2 = '\u5DF2\u4E0A\u4F20 <em style="color:red">' + item.num + '</em> \u5F20';
						}
						str += '<div class="df-list-item">\n\t\t\t\t    \t\t\t\t<span class="item-title">' + item.docKindDesc + '</span>\n\t\t\t\t    \t\t\t\t<span class="iconSymbol icon__go icon-go">' + str2 + '</span>\n\t\t\t\t\t\t\t\t</div>';
					});
					imgList.innerHTML = str;
				},function(err){
					mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
				});
			},function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		}

		mui('#imgList').on('tap', '.df-list-item', function () {
			mBank.openWindowByLoad('./imageInfo.html', 'imageInfo', 'slide-in-right', {
				param: list.docList[$(this).index()],
				viewId: self.id
			});
		});

		window.addEventListener('updateNum', function (event) {
			showAppDtl();
		});

		// back.addEventListener('tap', function(){
		// 	if(!list.canClick){
		// 		return;
		// 	}
		// 	list.canClick = false;
		// 	if(mData.queryLock(applCde, nodeSign, outSts) == 'N'){
		// 		list.canClick = true;
		// 		return;
		// 	}
		// 	var url = mBank.getApiURL() + 'refusecfapplSubmit.do';
		// 	var param = {
		// 		'applCde': applCde
		// 	};
		// 	mBank.apiSend('post', url, param, function(data){
		// 		list.canClick = true;
		// 		mui.alert('打回成功', "提示", "确定", function(){
		// 			if(mData.unLock(applCde, nodeSign, outSts, '01') == 'N'){
		// 				return;
		// 			}
		// 			back1();
		// 		}, 'div');
		// 	}, function(err){
		// 		list.canClick = true;
		// 		mCheck.alert(err.em);
		// 	}, true)
		// })
		sub.addEventListener('tap', function () {
			if (!list.canClick) {
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
					var url = mBank.getApiURL() + 'messageSubmit.do';
					var param = { 'applCde': applCde };
					mBank.apiSend('post', url, param, function () {
						AddOrUpdateDoc(applCde).then(function (data) {
							list.canClick = true;
							$('#waitingBox').hide();
							mui.alert('提交成功', "提示", "确定", function () {
								mData.unLock(applCde, nodeSign, outSts, '04').then(function(dat){
									if(dat=='N'){
										return;
									}else{
										back();
									}
								});
							}, 'div');
						}, function (err) {
							$('#waitingBox').hide();
							list.canClick = true;
							mCheck.alert(err.em);
						});
					}, function (err) {
						$('#waitingBox').hide();
						list.canClick = true;
						mCheck.alert(err.em);
					}, true);
				}
			});
		});
		$('#loanHistory').on('tap', function () {
			mBank.openWindowByLoad('../comPage/loanHistory.html', 'loanHistory', 'slide-in-right', {
				applCde: applCde
			});
		});
		function back() {
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
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back();
				}
			});
		};
		iconBack.addEventListener('tap', function () {
			if ($('#waitingBox').is(':visible')) {
				//如果loading框显示，不能点击手机返回按键
				return;
			}
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back();
				}
			});
		});
	});
});