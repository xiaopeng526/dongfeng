'use strict';

define(function (require, exports, module) {
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	mui.init();
	/* 
 	加载贷款历史记录
  */
	function queryApplyHis(applCde) {
		var _url = mbank.getApiURL() + 'queryApplyHis.do';
		mbank.apiSend('post', _url, {
			"applCde": applCde // 申请单号
		}, function (res) {
			var result = '';
			if (res.loanHisList.length === 0) {
				mui.toast('无更多数据', { type: 'div' });
				return;
			} else {
				res.loanHisList.forEach(function (item) {
					var dorp = '';
					var message = '';
					if (!item.creditOfficerName && !item.wlm_msg_info || item.creditOfficerName && !item.wlm_msg_info) {
						message = '';
					}
					if (item.creditOfficerName && item.wlm_msg_info) {
						message = '\n\t\t\t\t\t\t\t<span>' + mCheck.dataIsNull(item.creditOfficerName) + ' :</span> \n\t\t\t\t\t\t\t<label>' + mCheck.dataIsNull(item.wlm_msg_info) + '</label>\n\t\t\t\t\t\t';
						if (item.wlm_msg_info.length > 20) dorp = '<i class="iconSymbol icon__dorp"></i>';
					}
					result += '\n\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t<h4>\n\t\t\t\t\t\t\t\t<span>' + mCheck.dataIsNull(item.outSts) + '</span>\n\t\t\t\t\t\t\t\t<time>' + mCheck.dataIsNull(item.lastChgDt) + '</time>\n\t\t\t\t\t\t\t</h4>\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<p class="message-label">\n\t\t\t\t\t\t\t\t\t<b>\u7559\u8A00</b>\n\t\t\t\t\t\t\t\t\t' + dorp + '\n\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t<div class="message-box mui-clearfix ellipsis">\n\t\t\t\t\t\t\t\t\t' + message + '\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t';
				});
				$('.message-list').append(result);
			}
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});
	}
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();
		var applCde = self.applCde;
		queryApplyHis(applCde); // 贷款历史调用
		/* 
  	下三角是否展示
  */
		$('li').each(function () {
			if ($(this).find('.message-box label').text().trim().length < 20) {
				$(this).find('i').css('font-size', '0');
			}
		});
		/* 
  	留言内容切换展示 
  */
		$('.message-list').on('tap', '.iconSymbol', function () {
			$(this).parent().next().toggleClass('ellipsis');
			if ($(this).hasClass('icon__dorp')) {
				$(this).removeClass('icon__dorp').addClass('icon__up');
			} else {
				$(this).removeClass('icon__up').addClass('icon__dorp');
			}
		});
	});
});