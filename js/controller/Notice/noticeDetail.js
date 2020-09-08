'use strict';

define(function (require, exports, module) {
	mui.init();
	var mbank = require('../../core/bank');
	mbank.addVconsole();
	/* 
 	公告是否已读
  */
	function updateNoticeIsRead(noticeList) {
		var _url = mbank.getApiURL() + 'updateNoticeIsRead.do';
		mbank.apiSend('post', _url, {
			'cn_bul_seq': noticeList['cn_bul_seq']
		}, function (res) {
			console.log(JSON.stringify(res));
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});
	}
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		var noticeList = JSON.parse(localStorage.getItem("noticeList")); // sefl.noticeList
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mbank.isImmersed();
		var result = '\n\t\t\t<div>\n\t\t\t\t<h6 id="title">' + noticeList.cn_bul_title + '</h6>\n\t\t\t\t<div class="content">\n\t\t\t\t\t<time>' + noticeList.cn_bul_dt + '</time>\n\t\t\t\t\t<p>' + noticeList.cn_bul_detail + '</p>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t';
		$('.mui-content').html(result);
		updateNoticeIsRead(noticeList);
		$('#back').on('tap', function () {
			mbank.openWindowByLoad('noticeList.html', 'noticeList', 'slide-in-left');
		});
		mui.back = function () {
			mbank.openWindowByLoad('noticeList.html', 'noticeList', 'slide-in-left');
		};
		/* plus.key.addEventListener('backbutton', function () {
  	
  }, false); */
	});
});