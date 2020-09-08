'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	mBank.addVconsole();
	var msgList = [];
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		var message = self.message || '';
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
		var pageNum = 1,
		    turnPageShowNum = 10;
		$('.dropload-down').remove();
		var dropload = $('.content').dropload({
			scrollArea: window,
			domDown: {
				domNoData: '<div class="dropload-noData">无更多数据啦~</div>'
			},
			loadUpFn: function loadUpFn(me) {
				pageNum = 1;
				querySysMessage(pageNum, true);
			},
			loadDownFn: function loadDownFn(me) {
				querySysMessage(pageNum, false); // 下拉加载
			},
			threshold: 50
		});
		function querySysMessage(pageNo, isUp) {
			var _url = mBank.getApiURL() + 'querySysMessage.do',
			    result = '';
			mBank.apiSend('post', _url, {
				wlm_crt_usr: localStorage.getItem("logonId"),
				turnPageBeginPos: Number((pageNo - 1) * turnPageShowNum + 1),
				turnPageShowNum: turnPageShowNum
			}, function (res) {
				getData(res, pageNo, isUp);
			}, function (err) {
				$('.dropload-down').hide();
				dropload.lock();
				dropload.noData();
				dropload.resetload();
				mCheck.alert(err.em);
			});
		}
		function getData(res, pageNo, isUp) {
			var result = '';
			if (res.iMessageList.length === 0) {
				$('.dropload-down').html('<div class="dropload-noData">无更多数据啦~</div>');
				dropload.lock();
				dropload.noData();
				return;
			} else {
				res.iMessageList.forEach(function (item, index) {
					// state ： 0未读 1已读
					var time = '';
					var msgTime = item.messageTime;
					time += msgTime.substr(0, 4) + '-' + msgTime.substr(4, 2) + '-' + msgTime.substr(6, 2) + ' ' + msgTime.substr(8, 2) + ':' + msgTime.substr(10, 2);
					var strContent = '';
					if (item.messageContent == null) {
						strContent = '<span></span>';
					} else {
						if (item.messageContent.length < 200) {
							strContent += '<span>' + item.messageContent + '</span>';
						} else {
							strContent += '<span>' + item.messageContent.substr(0, 199) + '...</span>\n\t\t\t\t\t\t\t<span class="iconSymbol icon__dorp message-icon" data-content="' + item.messageContent + '"></span>';
						}
					}
					var isRead = '<span class="apply-code">\u7533\u8BF7\u5355\u53F7\uFF1A <em>' + item.fromNo + '</em></span>';
					if (item.state == 0) {
						isRead = '<span class="apply-code isNotRead">\u7533\u8BF7\u5355\u53F7\uFF1A <em>' + item.fromNo + '</em></span>';
					}
					result += '<li>\n\t\t\t\t\t\t\t\t<p class="message-header">\n\t\t\t\t\t\t\t\t\t' + isRead + '\n\t\t\t\t\t\t\t\t\t<span data-id="' + item.messageId + '" class="loan-detail">\u67E5\u770B\u8D37\u6B3E\u8BE6\u60C5</span>\n\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t<p class="message-main">\n\t\t\t\t\t\t\t\t\t' + strContent + '\n\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t<p class="message-footer">\n\t\t\t\t\t\t\t\t\t<span>' + time + '</span>\n\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t</li>';
				});
				setTimeout(function () {
					if (pageNo == 1) $('#messageBox').html('');
					$('#messageBox').append(result);
					dropload.resetload();
					if (isUp) {
						if (Number(pageNo - 1) * turnPageShowNum + turnPageShowNum < res.turnPageTotalNum) {
							pageNum = 2;
						}
						dropload.unlock();
						dropload.noData(false);
					}
				}, 300);
				// if(res.iNoticeList.length < 10){ 
				if (Number(pageNo - 1) * turnPageShowNum + turnPageShowNum >= res.turnPageTotalNum) {
					dropload.lock();
					dropload.noData();
					return;
				}
				if (!isUp) {
					pageNum++;
				}
			}
		}
		mui('.message-box').on('tap', '.loan-detail', function () {
			mBank.openWindowByLoad('../ConSigning/conSignDetail.html', 'conSignDetail', 'slide-in-right', {
				applCde: $(this).siblings('span').find('em')[0].innerHTML,
				messageId: $(this).attr('data-id'),
				message: 'message'
			});
		});
		mui('.message-box').on('tap', '.message-main', function () {
			var me = $(this).find('.message-icon')[0];
			var str = me.getAttribute('data-content').length <= 200 ? me.getAttribute('data-content') : me.getAttribute('data-content').substr(0, 199) + '...';
			if ($(me).hasClass('icon__dorp')) {
				$(me).removeClass('icon__dorp').addClass('icon__up');
				$(me).siblings('span')[0].innerHTML = me.getAttribute('data-content');
			} else {
				$(me).removeClass('icon__up').addClass('icon__dorp');
				$(me).siblings('span')[0].innerHTML = str;
			}
		});
		$('#back').on('tap', function () {
			localStorage.removeItem('firstFlag');
			if (message) {
				mBank.openWindowByLoad('../comPage/loanManagement.html', 'loanManagement', 'slide-in-left');
			} else {
				mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
			}
		});
		mui.back = function () {
			localStorage.removeItem('firstFlag');
			if (message) {
				mBank.openWindowByLoad('../comPage/loanManagement.html', 'loanManagement', 'slide-in-left');
			} else {
				mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
			}
		};
	});
});