'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		$('#waitingBox').show();
		var _url = mBank.getApiURL() + 'loanCounter.do';
		var _param = self.counterParam;
		mBank.apiSend('get', _url, _param, function (data) {

			var str = '';
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = data.PayShdTryList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var item = _step.value;

					str += '<li>\n\t\t\t\t\t<div class="calc-list-item">\n\t\t\t\t\t\t<p><b>' + item.perdNo + '</b> / ' + data.PayShdTryList.length + ' \u671F</p>\n\t\t\t\t\t\t<p class="flex-right">\n\t\t\t\t\t\t\t<span>\u5230\u671F\u65E5</span>\n\t\t\t\t\t\t\t<time>' + item.dueDt + '</time>\n\t\t\t\t\t\t</p>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="item calc-list-item">\n\t\t\t\t\t\t<p class="flex-right">\n\t\t\t\t\t\t\t<span>\u5229\u7387</span>\n\t\t\t\t\t\t\t<span>' + parseFloat(item.intRate * 100).toFixed(2) + ' %</span>\n\t\t\t\t\t\t</p>\n\t\t\t\t\t\t<p class="flex-right">\n\t\t\t\t\t\t\t<span>\u7F5A\u606F\u5229\u7387</span>\n\t\t\t\t\t\t\t<span>' + parseFloat(item.odIntRate * 100).toFixed(2) + ' %</span>\n\t\t\t\t\t\t</p>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="item calc-list-item">\n\t\t\t\t\t\t<p class="flex-right">\n\t\t\t\t\t\t\t<span>\u5E94\u8FD8\u5229\u606F</span>\n\t\t\t\t\t\t\t<span>' + item.normInt + ' \u5143</span>\n\t\t\t\t\t\t</p>\n\t\t\t\t\t\t<p class="flex-right">\n\t\t\t\t\t\t\t<span>\u5E94\u8FD8\u672C\u91D1</span>\n\t\t\t\t\t\t\t<span>' + item.prcpAmt + ' \u5143</span>\n\t\t\t\t\t\t</p>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="calc-list-item">\n\t\t\t\t\t\t<p class="flex-right">\n\t\t\t\t\t\t\t<span>\u5E94\u8FD8\u671F\u606F</span>\n\t\t\t\t\t\t\t<i>' + item.instmAmt + ' \u5143</i>\n\t\t\t\t\t\t</p>\n\t\t\t\t\t\t<p class="flex-right">\n\t\t\t\t\t\t\t<span>\u5269\u4F59\u672C\u91D1</span>\n\t\t\t\t\t\t\t<i>' + item.psRemPrcp + ' \u5143</i>\n\t\t\t\t\t\t</p>\n\t\t\t\t\t</div>\n\t\t\t\t</li>';
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
			details.innerHTML = str;
			$('#waitingBox').hide();
		}, function (err) {
			$('#waitingBox').hide();
			mCheck.alert(err.em);
		});
	});
});