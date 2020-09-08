"use strict";

define(function (require, exports, module) {
	mui.init();
	var mbank = require('../../core/bank');
	mbank.addVconsole();
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();
	});
	/* 
 	操作按钮只有一个时，更多操作 置灰 
 	parentEle  遍历的li元素
 	btnEle 状态按钮
 	moreBtnEle 更多操作按钮
 */
	isOneBtnLength('.table-view-cell', '.btn', '.more');
	function isOneBtnLength(parentEle, btnEle, moreBtnEle) {
		$(parentEle).each(function () {
			if ($(this).find(btnEle).length === 1) $(this).find(moreBtnEle).css('color', '#ddd');
		});
	}

	/* 
 	操作按钮大于 1 个时，更多操作 切换 
 	parentEle  遍历的li元素
 	btnEle 状态按钮
 	moreBtnEle 更多操作按钮
 */
	isOneBtnToggle('.table-view', '.more', '.btn');
	function isOneBtnToggle(parentEle, moreBtnEle, btnEle) {
		$(parentEle).on('tap', moreBtnEle, function () {
			if ($(this).parent().next().children(btnEle).length > 1) {
				$(this).parent().next().slideToggle();
			}
		});
	}
	/* 
 	请求合同签署列表
 */
	getConSignData();
	function getConSignData() {
		//mbank.apiSend();
		/* 列表 状态显示  status = 0, 待签署   status = 1 签署中*/
		if (status === 0) {
			// 待签署
			var btn = "<a class=\"btn fontColor font24\" href=\"javascript:;\">\u5408\u540C\u7B7E\u7F72</a>";
		} else {}
		var html = '';
		for (var i = 0; i < 10; i++) {
			var statusBtn = '',
			    // 按钮
			status = '',
			    // 状态字段
			statusFlag = ''; //合同签署中情况 
			if (status === '待签署') {
				statusBtn = "\n\t\t\t\t\t<div class=\"flex\">\n\t\t\t\t\t\t<p class=\"fontColor font24 more\">\n\t\t\t\t\t\t\t<i class=\"iconSymbol icon__dorp\"></i>  \u66F4\u591A\u64CD\u4F5C\n\t\t\t\t\t\t</p>\n\t\t\t\t\t\t<a class=\"btn fontColor font24\" href=\"javascript:;\">\u7B7E\u7F72\u5408\u540C</a>\n\t\t\t\t\t\t<span class=\"status fontColor font24\">\u5F85\u7B7E\u7F72</span> \n\t\t\t\t\t</div>\n\t\t\t\t";
			}
			if (status === '签署中') {
				// 签署中有三种情况 1、合同签署中 2、合同签署失败 3、合同签署成功
				if (statusFlag === '合同签署中') {
					statusBtn = "\n\t\t\t\t\t\t<div class=\"flex\">\n\t\t\t\t\t\t\t<p class=\"fontColor font24 more\">\n\t\t\t\t\t\t\t\t<i class=\"iconSymbol icon__dorp\"></i>  \u66F4\u591A\u64CD\u4F5C\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t<a class=\"btn fontColor font24\" href=\"javascript:;\">\u7B7E\u7F72\u4E2D</a>\n\t\t\t\t\t\t\t<span class=\"status fontColor font24\">\u7B7E\u7F72\u4E2D</span> \n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<a class=\"btn fontColor font24\" href=\"javascript:;\">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t";
				} else if (statusFlag === '合同签署失败') {
					statusBtn = "\n\t\t\t\t\t\t<div class=\"flex\">\n\t\t\t\t\t\t\t<p class=\"fontColor font24 more\">\n\t\t\t\t\t\t\t\t<i class=\"iconSymbol icon__dorp\"></i>  \u66F4\u591A\u64CD\u4F5C\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t<a class=\"btn fontColor font24\" href=\"javascript:;\">\u7B7E\u7F72\u4E2D</a>\n\t\t\t\t\t\t\t<span class=\"status fontColor font24\">\u7B7E\u7F72\u5931\u8D25</span> \n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<a class=\"btn fontColor font24\" href=\"javascript:;\">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t";
				} else {
					statusBtn = "\n\t\t\t\t\t\t<div class=\"flex\">\n\t\t\t\t\t\t\t<p class=\"fontColor font24 more\">\n\t\t\t\t\t\t\t\t<i class=\"iconSymbol icon__dorp\"></i>  \u66F4\u591A\u64CD\u4F5C\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t<a class=\"btn fontColor font24\" href=\"javascript:;\">\u4E0A\u4F20\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t<span class=\"status fontColor font24\">\u7B7E\u7F72\u6210\u529F</span> \n\t\t\t\t\t\t</div>\n\t\t\t\t\t";
				}
			}

			html += "\n\t\t\t\t<li class=\"table-view-cell\">\n\t\t\t\t\t<div class=\"flex\">\n\t\t\t\t\t\t<span class=\"fontColor font26\">2219042400008</span>\n\t\t\t\t\t\t<time class=\"fontColor font26\">2019/05/15 12:02</time>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"flex\">\n\t\t\t\t\t\t<span class=\"name min-name\">\u8FEA\u4E3D\u70ED\u5DF4\u5DF4\u5DF4</span>\n\t\t\t\t\t\t<div class=\"price\">\n\t\t\t\t\t\t\t<p>\u8D37\u6B3E\u91D1\u989D <small> 6000 </small> \u5143</p>\n\t\t\t\t\t\t\t<p>508 1.8T 3\u7EA7\u81EA\u52A8\u6321</p>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<i class=\"iconSymbol icon__go\"></i>\n\t\t\t\t\t</div>\n\t\t\t\t\t" + statusBtn + "\n\t\t\t\t</li>\n\t\t\t";
		}
		$('.table-view').append(html);
	}

	$('.table-view').on('tap', '.btn', function () {
		if ($(this).text() === '合同签署') {
			// 跳转到 合同输入信息 页面
			mbank.openWindowByLoad('conSignInfo.html', 'conSignInfo', 'slide-in-right');
		} else if ($(this).text() === '签署中') {
			// 跳转到 合同签署界面
			mbank.openWindowByLoad('conSigning.html', 'conSigning', 'slide-in-right');
		} else if ($(this).text() === '上传放款资料') {
			// 跳转到上传放款资料界面
			mbank.openWindowByLoad('conSignInfo.html', 'conSignInfo', 'slide-in-right');
		} else if ($(this).text() === '发送邮件') {
			// 跳转到合同信息查看界面
			mbank.openWindowByLoad('conSignMail.html', 'conSignMail', 'slide-in-right');
		}
	});
	/* 
 	点击【>】跳转到 贷款详情（合同）页面 
 */
	$('.table-view').on('tap', '.go-detail', function () {
		// 点击箭头进入贷款详情页面
		mbank.openWindowByLoad('conSignInfo.html', 'conSignInfo', 'slide-in-right');
	});
});