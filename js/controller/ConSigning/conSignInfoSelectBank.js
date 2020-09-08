'use strict';

define(function (require, exports, module) {
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	mui.init();
	/* 
 	加载银行类表 
 */
	var sa_acc_bank_name = '';
	function loadBankList(sa_acc_bank_cde, add_province, add_city, sa_acc_bank_name) {
		var _url = mbank.getApiURL() + 'bankSearchAjax.do',
		    pageNum = 1,
		    turnPageShowNum = 50;
		$('.dropload-down').remove();
		$('.select-bank').dropload({
			scrollArea: window,
			domDown: {
				domNoData: '<div class="dropload-noData">无更多数据啦~</div>'
			},
			loadDownFn: function loadDownFn(me) {
				// 上拉加载更多
				var result = '';
				mbank.apiSend('post', _url, {
					'sa_acc_bank_cde': sa_acc_bank_cde,
					'add_province': add_province,
					'add_city': add_city,
					'sa_acc_bank_name': sa_acc_bank_name,
					'turnPageBeginPos': Number((pageNum - 1) * turnPageShowNum + 1),
					'turnPageShowNum': turnPageShowNum,
					'channel': '4101'
				}, function (res) {
					if (res.iBankList.length == 0) {
						$('.dropload-down').html('<div class="dropload-noData">无更多数据啦~</div>');
						me.lock();
						me.noData();
						return;
					} else {
						res.iBankList.forEach(function (item) {
							// dataValue = '开户行编码|开户行名称|开户支行编码|开户支行名称|开户省|开户市'
							var dataValue = '' + (item.sa_acc_bank_cde + '|' + item.sa_acc_bank_name + '|' + item.sa_acc_bch_cde + '|' + item.sa_acc_bch_name + '|' + item.add_province + '|' + item.add_city);
							result += '<li data-value="' + dataValue + '">' + item.sa_acc_bch_name + '</li>';
						});
						setTimeout(function () {
							$('#bankList').append(result);
							me.resetload();
						}, 300);
						if (res.iBankList.length < turnPageShowNum) {
							me.lock();
							me.noData();
							return;
						}
						pageNum++;
					}
				}, function (err) {
					$('.dropload-down').hide();
					dropload.lock();
					dropload.noData();
					dropload.resetload();
					mCheck.alert(err.em);
				});
			}
		});
	}

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		var ac = self.ac;
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();
		var sa_acc_bank_cde = self['sa_acc_bank_cde']; // 开户行编码
		var add_province = self['add_province'] || ''; // 所在省
		var add_city = self['add_city'] || '';// 所在市
		var sa_acc_bank = self['sa_acc_bank']; // 开户行
		var add_provinceC = self['add_provinceC']; // 开户省
		var add_cityC = self['add_cityC']; // 开户市
		/* 
  	默认加载银行类表 
  */
		loadBankList(sa_acc_bank_cde, add_province, add_city, sa_acc_bank_name);

		/* 
  	查询加载银行类表 
  */
		/* $('#search').on('input', function () {
  	$('#bankList').html('');
  	sa_acc_bank_name = $(this).val();
  	loadBankList(sa_acc_bank_cde, add_province, add_city, sa_acc_bank_name);
  }); */
		$('#search').on('keyup', function (e) {
			var searchValue = $(this).val();
			if (searchValue !== '' && e.keyCode === 13) {
				$('#bankList').html('');
				sa_acc_bank_name = $(this).val();
				loadBankList(sa_acc_bank_cde, add_province, add_city, sa_acc_bank_name);
			}
		});
		/* 
  	点击选中银行，页面跳转 
  */
		$('#bankList').on('tap', 'li', function () {
			var _this = this;
			$(_this).addClass('active').siblings().removeClass();
			var bankDetail = $(_this).attr('data-value'); // '开户行编码|开户行名称|开户支行编码|开户支行名称|开户省|开户市'
			var parentView = plus.webview.getWebviewById("conSignInfoBank");
			plus.webview.hide(parentView.id);
			plus.webview.close(parentView.id);
			var chidView = plus.webview.getWebviewById("conSignInfo");
			mui.fire(chidView, "bankSelectDetail", { bankDetail: bankDetail, ac: ac });
			mui.fire(chidView, "bankSelectDetailRc", { bankDetail: bankDetail, add_provinceC: add_provinceC, add_province: add_province, ac: ac });
			plus.webview.hide(self.id);
			plus.webview.close(self.id);
		});
		/* 
  	点击取消，输入框内容清空，【默认展示第一次查询内容】（bug7076，取消返回上一页）	
   */
		$('.cancel').on('tap', function () {
			$('#search').val('');
			var depositBankView = plus.webview.getWebviewById("conSignInfoBank");
			mui.fire(depositBankView, "depositBank", { sa_acc_bank_cde: sa_acc_bank_cde, add_province: add_province,add_city:add_city });
			plus.webview.hide(self.id);
			plus.webview.close(self.id);
//			loadBankList(sa_acc_bank_cde, add_province, add_city, $('#search').val());
		});
	});
});