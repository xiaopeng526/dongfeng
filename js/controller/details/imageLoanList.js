'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var old_back = mui.back;
	var applCde = localStorage.getItem('applCde');
	var fdLoanTyp = localStorage.getItem('fdLoanTyp');
	var typeFlag = localStorage.getItem('typeFlag');
	var typeFlagList = localStorage.getItem('typeFlagList');
	var contractNo = localStorage.getItem('contractNo');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');

	var list = {
		'canClick': true,
		'docList': [],
		'state': '',
		'role': localStorage.getItem('role'),
		'messageState': 'subMessage',
		'id': ''
	};

	var getcfDocDtl = function getcfDocDtl(a, b, c) {
		var url = mBank.getApiURL() + 'getcfDocDtl.do';
		var param = {
			'applCde': a,
			'fd_loan_typ': b,
			'docTyp': c
		};
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				resolve(data.iDocDtlList);
			}, function(err){
				reject(err);
			});
		});
	};
	var appGetcfDocDtl = function appGetcfDocDtl(a, b) {
		var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

		var url = mBank.getApiURL() + 'appGetcfDocDtl.do';
		var param = { 'applCde': a, 'docTyp': b, 'fd_loan_typ': c };
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				resolve(data.iDocDtlList);
			}, function(data){
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

	var AddOrUpdateDoc = function AddOrUpdateDoc(applCde) {
		var url = mBank.getApiURL() + 'AddOrUpdateDoc.do';
		var params = {
			'applCde': applCde,
			'temp': 'add'
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
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
		getcfDocDtlFun(applCde, fdLoanTyp, '2001');
		appGetcfDocDtlFun(applCde, '2001', fdLoanTyp);
		//		window.addEventListener('updateNum', function(event){
		//			getcfDocDtlFun(applCde, fdLoanTyp, '2001');
		//			appGetcfDocDtlFun(applCde, '2001', fdLoanTyp);
		//		})
		function getcfDocDtlFun(a, b, c) {
			getcfDocDtl(a, b, c).then(function (data) {
				var str = '';
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var item = _step.value;

						var str2 = void 0,
						    str3 = void 0;
						if (item.doc_property == '00') {
							str2 = '<em style="color: red">\u5FC5\u6536</em>';
						} else if (item.doc_property == '01') {
							str2 = '后补';
						}
						if (item.da_is_recive == 'Y') {
							str3 = '已签署';
						} else {
							str3 = '';
						}
						str += '<div class="item-desc">\n\t\t    \t\t\t\t\t<span class="info-desc">' + item.docKindDesc + '\uFF08' + str2 + '\uFF09</span>\n\t\t    \t\t\t\t\t<span class="info-state">' + str3 + '</span>\n\t\t    \t\t\t\t</div>';
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

				infoDiv.innerHTML = str;
			},function(err){
				mCheck.callPortFailed(err.ec, err.em);
			});
		}

		function queryEcmUploadPages(applCde) {
			var url = mBank.getApiURL() + 'queryEcmUploadPages.do';
			var param = {
				'applCde': applCde,
				'docKind': '2001'
			};
			return new Promise(function (resolve, reject) {
				mBank.apiSend('get', url, param, function (data) {
					resolve(data.iDocDtlList);
				},function(err){
					reject(err);
				});
			});
		}

		function appGetcfDocDtlFun(a, b, c) {
			queryEcmUploadPages(applCde).then(function (data2) {
				appGetcfDocDtl(a, b, c).then(function (data) {
					list.docList = data;
					var str = '';
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = list.docList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var item = _step2.value;
							var _iteratorNormalCompletion3 = true;
							var _didIteratorError3 = false;
							var _iteratorError3 = undefined;

							try {
								for (var _iterator3 = data2[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
									var _list = _step3.value;

									if (item.docKind == _list.docKind) {
										item.num = _list.page_Num;
									}
								}
							} catch (err) {
								_didIteratorError3 = true;
								_iteratorError3 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion3 && _iterator3.return) {
										_iterator3.return();
									}
								} finally {
									if (_didIteratorError3) {
										throw _iteratorError3;
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

					typeDiv.innerHTML = str;
				},function(err){
					mCheck.callPortFailed(err.ec, err.em);
				});
			},function(err){
				mCheck.callPortFailed(err.ec, err.em);
			});
		}

		var messageList = function messageList(data) {
			if (data.length == 0) {
				return;
			}
			var str = '';
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var item = _step4.value;

					var state = '';
					if (item.wlm_msg_sts == '99') {
						$('#msgText').parent().hide();
						list.messageState = 'updateMessageWLM';
						state = '<span class="msg-btn change" id="changeBtn">\u4FEE\u6539</span>';
						list.id = item.wlm_mag_id;
					}
					if (item.wlm_contact == null) {
						item.wlm_contact = '';
					}
					str += '<div class="message-list margin-top" id="' + mCheck.dataIsNull(item.wlm_mag_id) + '">\n\t\t\t\t\t\t\t<div class="msg-det">' + mCheck.dataIsNull(item.wlm_msg_info) + '</div>\n\t\t\t\t\t\t\t<div class="msg-time">' + mCheck.dataIsNull(item.wlm_crt_dt) + '</div>\n\t\t\t\t\t\t\t<div class="msg-tips">\n\t\t\t\t\t\t\t\t<span class="msg-name">' + mCheck.dataIsNull(item.wlm_node_name) + '&nbsp;&nbsp;<em>' + mCheck.dataIsNull(item.wlm_crt_name) + '</em></span>\n\t\t\t\t\t\t\t\t<span class="msg-tel">' + mCheck.dataIsNull(item.wlm_contact) + '</span>\n\t\t\t\t\t\t\t\t' + state + '\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>';
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
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

		mui('#typeDiv').on('tap', '.df-list-item', function () {
			mBank.openWindowByLoad('./imageInfo.html', 'imageInfo', 'slide-in-right', {
				param: list.docList[$(this).index()],
				viewId: self.id
			});
		});

		var messageSubmit = function messageSubmit(a) {
			var url = mBank.getApiURL() + 'messageSubmit.do';
			var param = {
				'applCde': a
			};
			return new Promise(function (resolve, reject) {
				mBank.apiSend('post', url, param, function (data) {
					resolve(data);
				}, function(err){
					reject(err);
				});
			});
		};

		var loanData = plus.webview.getWebviewById('loanData2');
		iconBack.addEventListener('tap', function () {
			plus.webview.hide(loanData);
			plus.webview.close(loanData);
			setTimeout(function () {
				plus.webview.hide(self.id);
				plus.webview.close(self.id);
			}, 500);
		});
		sub.addEventListener('tap', function () {
			mui.back();
		});
		$('#loanHistory').on('tap', function () {
			mBank.openWindowByLoad('../comPage/loanHistory.html', 'loanHistory', 'slide-in-right', {
				applCde: applCde
			});
		});
	});
});