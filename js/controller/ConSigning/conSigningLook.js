'use strict';

define(function (require, exports, module) {
	mui.init();
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	/* 
 	查看PDF 文件
  */
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();
		var filePath=mbank.getApiURL()+self.filePath;
		$("#lookConSign").attr("src",filePath);
		// 查看pdf 文件
		// var pdfh5 = new Pdfh5('.lookConSign', {
			// pdfurl: mbank.getApiURL() + filePath
		// });
	});
});