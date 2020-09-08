"use strict";

define(function (require, exports, module) {
	mui.init();
	var mbank = require('../../core/bank');
	mbank.addVconsole();
	var list = []; // 用于存放公告列表
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mbank.isImmersed();
		var pageNum = 1,
		    turnPageShowNum = 10;
		$('.dropload-down').remove();
		var dropload = $('.mui-content').dropload({
			scrollArea: window,
			domDown: {
				domNoData: '<div class="dropload-noData">无更多数据啦~</div>'
			},
			loadUpFn: function loadUpFn(me) {
				// 下拉加载
				pageNum = 1;
				queryNoticeList(1, true);
			},
			loadDownFn: function loadDownFn(me) {
				queryNoticeList(pageNum, false);
			},
			threshold: 50
		});

		function queryNoticeList(pageNo, isUp) {
			var _url = mbank.getApiURL() + 'queryNoticeList.do',
			    result = '';
			mbank.apiSend('post', _url, {
				currentBusinessCode: 'CF004009',
				turnPageBeginPos: Number((pageNo - 1) * turnPageShowNum + 1),
				turnPageShowNum: turnPageShowNum
			}, function (res) {
				list = pageNo === 1 ? res.iNoticeList : list.concat(res.iNoticeList);
				getData(res, pageNo, isUp);
			}, function (err) {
				$('.dropload-down').hide();
				dropload.lock();
				dropload.noData();
				dropload.resetload();
				mCheck.alert(err.em);
			});
		}
		var reg = /(\<br\>)|(\<\/br\>)/ig;
		function getData(res, pageNo, isUp) {
			var result = '';
			if (res.iNoticeList.length === 0) {
				$('.dropload-down').html('<div class="dropload-noData">无更多数据啦~</div>');
				dropload.lock();
				dropload.noData();
				return;
			} else {
				res.iNoticeList.forEach(function (item, index) {
					var isRead = "<span class=\"title\">" + item.cn_bul_title + "</span>";
					if (item.isRead !== '已读') isRead = "<span class=\"title isNotRead\">" + item.cn_bul_title + "</span>";

					result += "\n\t\t\t\t\t\t<li id=\"" + index + "\">\n\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t" + isRead + "\n\t\t\t\t\t\t\t\t<time>" + item.cn_bul_dt + "</time>\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<p>" + item.cn_bul_detail.replace(reg, '&nbsp;') + "</p>\n\t\t\t\t\t\t\t\t<a href=\"javascript:;\">\u8BE6\u60C5 <i class=\"iconSymbol icon__go\"></i></a>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\n\t\t\t\t\t";
				});
				setTimeout(function () {
					if (pageNo == 1) $('.notice-list').html('');
					$('.notice-list').append(result);
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
		$('.notice-list').on('tap', 'a, div', function () {
			if ($(this).parents('li')[0].id) {
				localStorage.setItem("noticeList", JSON.stringify(list[$(this).parents('li')[0].id]));
				mbank.openWindowByLoad('noticeDetail.html', 'noticeDetail', 'slide-in-right');
			}
		});
		$('#back').on('tap', function () {
			localStorage.removeItem('firstFlag');
			mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
		});
		mui.back = function () {
			localStorage.removeItem('firstFlag');
			mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
		};
		/* plus.key.addEventListener('backbutton', function () {
  	
  }, false); */
	});
});