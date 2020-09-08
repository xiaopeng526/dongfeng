'use strict';

define(function (require, exports, module) {
	var SESSION_USERROLE = localStorage.getItem('session_userRole') || '01'; // 用户角色 01 销售顾问，02 一般信贷员 ，03 渠道信贷员
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
	});
	mui.init({
		pullRefresh: {
			container: "#preList",
			down: {
				contentdown: "下拉可以刷新", //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
				contentover: "释放立即刷新", //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
				contentrefresh: "正在刷新...", //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
				callback: pulldownRefresh
			},
			up: {
				auto: true,
				contentrefresh: "正在加载...", //可选，正在加载状态时，上拉加载控件上显示的标题内容
				contentnomore: '没有更多数据了',
				callback: pullupRefresh
			}
		}
	});
	/* 下拉刷新 */
	function pulldownRefresh() {
		setTimeout(function () {
			// 下拉刷新逻辑
			mui('#preList').pullRefresh().endPulldownToRefresh(); //refresh completed
		}, 300);
	}
	/* 上拉加载 */
	function pullupRefresh() {
		setTimeout(function () {
			mui('#preList').pullRefresh().endPullupToRefresh(); //参数为true代表没有更多数据了。
			// 上拉加载逻辑
		}, 300);
	}
	window.addEventListener('refreshMainView', function (event) {
		msgnum = event.detail.msgnum;
		mui('#preList').pullRefresh().scrollTo(0, 0, 100);
		$('#preList').html('');
	});
	/* 
 	获取申请代办列表数据
 */
	getData();
	function getData() {
		//mbank.apiSend('post', url, params, function(data) {}, null);
		var html = '';
		var btnShow = '';
		if (SESSION_USERROLE === '01') {
			// 01 销售顾问
			btnShow = '\n\t\t\t\t<div class="flex">\n\t\t\t\t\t<p class="fontColor font24 more">\n\t\t\t\t\t\t<i class="iconSymbol icon__dorp"></i>  \u66F4\u591A\u64CD\u4F5C\n\t\t\t\t\t</p>\n\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u7F16\u8F91</a>\n\t\t\t\t\t<span class="status fontColor font24">\u4FE1\u8D37\u5BA1\u6838\u4E2D</span> \n\t\t\t\t</div>\n\t\t\t';
		} else if (session_userRole === '02' || session_userRole === '03') {// 02 一般信贷员 ， 03 渠道信贷员

		}
		for (var i = 0; i < 10; i++) {
			html += '\n\t\t\t\t<li class="table-view-cell">\n\t\t\t\t\t<div class="flex">\n\t\t\t\t\t\t<span class="fontColor font26">2219042400008</span>\n\t\t\t\t\t\t<time class="fontColor font26">2019/05/15 12:02</time>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="flex">\n\t\t\t\t\t\t<span class="name min-name">\u8FEA\u4E3D\u70ED\u5DF4\u5DF4\u5DF4</span>\n\t\t\t\t\t\t<div class="price">\n\t\t\t\t\t\t\t<p>\u8D37\u6B3E\u91D1\u989D <small> 6000 </small> \u5143</p>\n\t\t\t\t\t\t\t<p>508 1.8T 3\u7EA7\u81EA\u52A8\u6321</p>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<i class="iconSymbol icon__go"></i>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="flex">\n\t\t\t\t\t\t<p class="fontColor font24 more">\n\t\t\t\t\t\t\t<i class="iconSymbol icon__dorp"></i>  \u66F4\u591A\u64CD\u4F5C\n\t\t\t\t\t\t</p>\n\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u7F16\u8F91</a>\n\t\t\t\t\t\t<span class="status fontColor font24">\u4FE1\u8D37\u5BA1\u6838\u4E2D</span> \n\t\t\t\t\t</div>\n\t\t\t\t\t<div>\n\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u5408\u540C\u4FEE\u6539</a>\n\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t</div>\n\t\t\t\t</li>\n\t\t\t';
		}
		//$('.table-view').append(html);	
	}

	/* 操作按钮只有一个时，更多操作 置灰 */
	$('.table-view-cell').each(function () {
		if ($(this).find('.btn').length === 1) $(this).find('.more').css('color', '#ddd');
	});
	/* 操作按钮大于 1 个时，更多操作 切换 */
	$('.table-view').on('tap', '.more', function () {
		if ($(this).parent().next().children('.btn').length > 1) {
			$(this).parent().next().slideToggle();
		}
	});
});