"use strict";

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	mBank.addVconsole();
	var list = {};
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		var str = '';
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = self.carModelList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var item = _step.value;

				//			if(self.carModelSelected === item.text) {
				//				str += `<div class="df-list-item" style="background-color: #eee">
				//						${item.text}
				//					</div>`;
				//			}else {
				str += "<div class=\"df-list-item\">\n\t\t\t\t\t\t" + item.text + "\n\t\t\t\t\t</div>";
				//			}		
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

		carModelListBox.innerHTML = str;
		var loanPreWebview = void 0;
		if (self.processType === '02') {
			//补录阶段
			loanPreWebview = plus.webview.getWebviewById('loanInfo');
		} else {
			loanPreWebview = plus.webview.getWebviewById('loanPre');
		}
		mui('#carModelListBox').on('tap', '.df-list-item', function () {
			var carModelItem = self.carModelList[$(this).index()];
			// if (carModelItem.svm_mode_cde != self.carModelList.svm_mode_cde) {
			mui.fire(loanPreWebview, 'carModelReverse', carModelItem);
			// }
			mui.back();
		});
	});
});