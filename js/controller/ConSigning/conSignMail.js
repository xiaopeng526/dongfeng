'use strict';

define(function (require, exports, module) {
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	mui.init();
	var fileCollectionListCode = []; // 用于添加 发送清单
	var fileCollectionListOrder = [];
	var editionNo = '';
	var old_back = mui.back;
	/* 
 	获取合同版本号
  */
	function queryContVersion(applCde, contNo) {
		var _url = mbank.getApiURL() + 'queryContVersion.do';
		mbank.apiSend('post', _url, {
			applCde: applCde
		}, function (res) {
			editionNo = res.editionNo;
			contModelListQuery(applCde, res.editionNo, contNo);
		},function(err){
			mCheck.callPortFailed(err.ec, err.em,"#waitingBox");
		});
	}
	/* 
 	合同模板列表查询
  */
	function contModelListQuery(applCde, editionNo, contNo) {
		var _url = mbank.getApiURL() + 'contModelListQuery.do';
		mbank.apiSend('post', _url, {
			editionNo: editionNo, // --版本号
			contNo: contNo, // --合同号
			applCde: applCde
		}, function (res) {
			var result = '';
			res.pTempGroupResultList.forEach(function (item) {
				result += '\n\t\t\t\t\t<span key="' + item.temp_typ + '" item="' + item.temp_name + '" data-value="' + item.temp_cde + '" data-order="' + item.temp_order + '">' + item.temp_name + '</span>\n\t\t\t\t';
			});
			$('#dataList p').append(result);
		},function(err){
			mCheck.callPortFailed(err.ec, err.em,"#waitingBox");
		});
	}
	/* 
 	邮件发送
  */
	function contFileMailToCustomer(applCde, contNo, fromPage) {
		var _url = mbank.getApiURL() + 'contFileMailToCustomer.do';
		mbank.apiSend('post', _url, {
			"applCde": applCde,
			'email': $('#email').val(),
			'contNo': contNo, // 合同编号
			'flag': '02', // 是否专用章
			'fileCollectionList.temp_cde': fileCollectionListCode,
			'fileCollectionList.temp_order': fileCollectionListOrder,
			editionNo: editionNo,
			orderType: 'query'
		}, function (res) {
			$('.loading').hide();
			mui.alert('邮件发送成功', ' ', '确定', function (e) {
				localStorage.removeItem('firstFlag');
				if (fromPage == 'conList') {
					mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
				} else if (fromPage == 'loanList') {
					mbank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
				} else if (fromPage == 'homePage') {
					mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
				} else if (fromPage = 'lendingList') {
					mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
				} else if (fromPage = 'preList') {
					mbank.openWindowByLoad('../PreHearing/PreList/preList.html', 'preList', 'slide-in-left');
				}
				//	如果待签署列表，【合同签署】按钮进入，返回待签署列表界面；
				//	如果签署中列表，【发送邮件】按钮进入，返回签署中列表界面；
				//	如果全部列表，【合同签署】或【发送邮件】按钮进入，返回全部列表界面；
				//	如果贷款详情（合同）界面进入，返回贷款详情（合同）界面；
			}, 'div');
		}, function (err) {
			$('.loading').hide();
			mCheck.alert(err.em);
		});
	}
	/* 
 	点击 切换 发送清单、印章 是否选中
  */
	$('.sign-mail').on('tap', 'span', function () {
		var _this = this;
		$(_this).toggleClass('active');
		if ($(_this).hasClass('active')) {
			fileCollectionListCode.push($(_this).attr('data-value'));
			fileCollectionListOrder.push($(_this).attr('data-order'));
		} else {
			fileCollectionListCode = fileCollectionListCode.filter(function (item) {
				return item !== $(_this).attr('data-value');
			});
			fileCollectionListOrder = fileCollectionListOrder.filter(function (item) {
				return item !== $(_this).attr('data-order');
			});
		}
	});
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();
		var applCde = self.applCde;
		var contNo = self.contNo;
		var fromPage = self.fromPage;
		$('.current-mail').on('tap', 'li', function () {
			$('#email').val($(this).text());
			$('.current-mail').hide();
		});
		queryContVersion(applCde, contNo);
		/* 
  	输入邮箱联想
   */
		var arrEmail = [];
		var emailArr = JSON.parse(localStorage.getItem('emailArr')) || [];
		$('#email').val(emailArr[0]);
		/* 
  	点击发送按钮 发送邮件
  */
		$('#next').on('tap', function () {
			var reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
			    // 邮箱验证
			mail = $('#email').val();
			// 添加邮件
			if (mail != '' && reg.test(mail)) {
				arrEmail.unshift(mail);
				localStorage.setItem('emailArr', JSON.stringify(arrEmail));
			}
			// 发送邮件，请求接口
			if (fileCollectionListCode.length != 0 && mail != '' && reg.test(mail)) {
				$('.loading').show();
				contFileMailToCustomer(applCde, contNo, fromPage);
			} else {
				if (fileCollectionListCode.length === 0) {
					mui.toast('请至少选择一种发送清单', { type: 'div' });
					return;
				}
				if (mail === '') {
					mui.toast('邮箱不能为空', { type: 'div' });
					return;
				}
				if (!reg.test(mail)) {
					mui.toast('请输入正确的邮箱', { type: 'div' });
					return;
				}
			}
		});
		$('#prev').on('tap', function () {
			var reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
			    // 邮箱验证
			mail = $('#email').val();
			if (mail != '' && reg.test(mail)) {
				arrEmail.unshift(mail);
				localStorage.setItem('emailArr', JSON.stringify(arrEmail));
			}
			old_back();
		});
		$('#back').on('tap', function () {
			localStorage.removeItem('firstFlag');
			if (fromPage == 'conList') {
				mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
			} else if (fromPage == 'loanList') {
				mbank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
			} else if (fromPage == 'homePage') {
				mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
			} else if (fromPage == 'lendingList') {
				mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
			} else if (fromPage == 'lendingList') {
				mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
			} else if (fromPage = 'preList') {
				mbank.openWindowByLoad('../PreHearing/PreList/preList.html', 'preList', 'slide-in-left');
			}
		});
		if (fromPage == 'conList') {
			mui.back = function () {
				mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
			};
		} else if (fromPage == 'loanList') {
			mui.back = function () {
				mbank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
			};
		} else if (fromPage == 'homePage') {
			localStorage.removeItem('firstFlag');
			mui.back = function () {
				mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
			};
		} else if (fromPage == 'lendingList') {
			mui.back = function () {
				mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
			};
		} else if (fromPage == 'preList') {
			mui.back = function () {
				mbank.openWindowByLoad('../PreHearing/PreList/preList.html', 'preList', 'slide-in-left');
			};
		}
		/* plus.key.addEventListener('backbutton', function () {
  	
  }, false); */
	});
});