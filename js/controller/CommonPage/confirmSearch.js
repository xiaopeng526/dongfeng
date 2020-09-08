'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	mBank.addVconsole();
	var list2 = {};
	var applCde = localStorage.getItem('applCde');
	var storeNo = localStorage.getItem('sessionStoreNo');
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		cancel.addEventListener('tap', function () {
			search.value = '';
			mBank.openWindowByLoad('./confirmUser.html', 'confirmUser', 'slide-in-left');
		});
		mui('#list').on('tap', 'li', function () {
			$(this).toggleClass('active');
			list2.creditOfficer = this.id;
			var _this = this;
			$('#waitingBox').show();
			mData.interFace('post', 'saveReviewCreditOfficer', { 'applCde': applCde, 'creditOfficer': list2.creditOfficer }).then(function (data) {
				$('#waitingBox').hide();
				mBank.openWindowByLoad('./confirmUser.html', 'confirmUser', 'slide-in-left', {
					creditOfficer: _this.id
				});
			}, function (err) {
				$('#waitingBox').hide();
				mCheck.alert(err.em);
			});
		});

		$('#search').on('keyup', function (e) {
			var keycode = e.keyCode;
			var _this = this;
			if ($(this).val() !== '' && keycode == 13) {
				$('#waitingBox').show();
				mData.interFace('get', 'chooseCreditList', { 'salerName': _this.value, 'storeNo': storeNo }).then(function (data) {
					var iDealerList = data.iSalerList;
					var str = '';
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = iDealerList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var item = _step.value;

							str += '<li id="' + item.salerNo + '">\n\t\t\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t\t\t<p>' + item.salerName + '</p>\n\t\t\t\t\t\t\t\t\t\t<label>' + item.salerMobile + '</label>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<span>' + item.role + '</span>\n\t\t\t\t\t\t\t\t</li>';
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

					list.innerHTML = str;
					$('#waitingBox').hide();
				}, function (err) {
					mCheck.alert(err.em);
					$('#waitingBox').hide();
				});
			}
		});
	});
});