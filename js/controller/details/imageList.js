'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	var list = {
		'canClick': true,
		'docList': [],
		'state': '',
		'role': localStorage.getItem('sessionUserRole'),
		'messageState': 'subMessage',
		'id': ''
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
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
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
						state = '';
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
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});

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

		show1();

		function show1() {
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
					mCheck.callPortFailed(err.ec, err.em);
				});
			},function(err){
				mCheck.callPortFailed(err.ec, err.em);
			});
		}

		mui('#imgList').on('tap', '.df-list-item', function () {
			mBank.openWindowByLoad('./imageInfo.html', 'imageInfo2', 'slide-in-right', {
				param: list.docList[$(this).index()],
				viewId: self.id
			});
		});

		$('#loanHistory').on('tap', function () {
			mBank.openWindowByLoad('../comPage/loanHistory.html', 'loanHistory', 'slide-in-right', {
				'applCde': applCde
			});
		});
		back.addEventListener('tap', function () {
			mui.back();
		});
		var loanInfo = plus.webview.getWebviewById("loanInfo2");
		var appInfo = plus.webview.getWebviewById("appInfo2");
		var imageList = plus.webview.getWebviewById('imageList2');
		var imageInfo = plus.webview.getWebviewById('imageInfo2');
		var arr = [loanInfo, appInfo, imageList, imageInfo];
		iconBack.addEventListener('tap', function () {
			for (var i = 0; i < arr.length; i++) {
				if (self != arr[i]) {
					plus.webview.hide(arr[i]);
					plus.webview.close(arr[i]);
				}
			}
			setTimeout(function () {
				plus.webview.hide(self.id);
				plus.webview.close(self.id);
			}, 500);
		});
	});
});