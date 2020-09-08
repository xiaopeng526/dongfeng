'use strict';

define(function (require, exports, module) {
	mui.init({
		subpages: [{
			url: 'preList_sub.html',
			id: 'preList_sub',
			styles: {
				top: '100px',
				bottom: '0px',
				hardwareAccelerated: true
			}
		}]
	});
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		$('.mui-flex').on('tap', 'a', function (e) {
			var index = $(this).index();
			if ($(this).hasClass('mui-active')) return;
			var chidView = plus.webview.getWebviewById("preList_sub");
			self.evalJS(chidView.pullRefresh().scrollTo(0, 0, 100));
			mui.fire(chidView, "refreshMainView", { msgnum: index });
		});
	});
});