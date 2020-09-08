'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var list = {};
	var applCde = localStorage.getItem('applCde');
	var typeFlag = localStorage.getItem('typeFlag');

	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');

	var storeNo = localStorage.getItem('sessionStoreNo');

	var fdLoanTyp = localStorage.getItem('fdLoanTyp');
	var contractNo = localStorage.getItem('contractNo');
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		var creditOfficer = self.creditOfficer || '';
		var isClick = true;
		if (creditOfficer && isClick) {
			list.creditOfficer = creditOfficer;
		}
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();

		function back1() {
			var backFlag = localStorage.getItem('backFlag');
			localStorage.removeItem('firstFlag');
			if (backFlag == '01') {
				mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
			} else if (backFlag == '02') {
				mBank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
			} else if (backFlag == '03') {
				mBank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
			} else if (backFlag == '04') {
				mBank.openWindowByLoad('../ConSigning/conSignList.html', 'conSignList', 'slide-in-left');
			} else if (backFlag == '05') {
				mBank.openWindowByLoad('../PreHearing/NewPre/loanPreList.html', 'loanPreList', 'slide-in-left');
			} else if (backFlag == '06') {
				mBank.openWindowByLoad('../PreHearing/PreList/preList.html', 'preList', 'slide-in-left');
			} else {
				mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
			}
		}
		searchIcon.addEventListener('tap', function () {
			mBank.openWindowByLoad('./confirmSearch.html', 'confirmSearch', 'slide-in-right');
		});
		mData.interFace('get', 'chooseCreditList', { 'salerName': '', 'storeNo': storeNo }).then(function (data) {
			var iDealerList = data.iSalerList;
			var str = '';
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = iDealerList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var item = _step.value;

					str += '<li id="' + item.salerNo + '">\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<p>' + item.salerName + '</p>\n\t\t\t\t\t\t\t\t<label>' + item.salerMobile + '</label>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<span>' + item.role + '</span>\n\t\t\t\t\t\t</li>';
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			list2.innerHTML = str;
			return mData.interFace('get', 'queryReviewCreditOfficer', { 'applCde': applCde }).then(function(data){
				$('#list2').find('#' + data.creditOfficer).addClass('active');
				list.creditOfficer = data.creditOfficer;
			}, function (err) {
				mCheck.alert(err.em);
			});
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});
		mui('#list2').on('tap', 'li', function () {
			isClick = false;
			$(this).siblings('li').removeClass('active');
			$(this).toggleClass('active');
			list.creditOfficer = this.id;
		});
		var str10 = '';
		var param10 = {
			'applCde': applCde,
			'lendingMode': '',
			'contractNo': ''
		};
		if (typeFlag == '02') {
			str10 = 'cfapplSubmit';
		} else if (typeFlag == '04') {
			str10 = 'submitFKDoc';
			param10.lendingMode = fdLoanTyp;
			param10.contractNo = contractNo;
		}

		iconBack.addEventListener('tap', function () {
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back1();
				}
			});
		});

		var canClick = true;
		submit.addEventListener('tap', function () {
			if (!canClick) {
				return;
			}
			canClick = false;
			$('#waitingBox').show();
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					canClick = true;
					$('#waitingBox').hide();
					return;
				}else{
					if (list.creditOfficer && $('#list2').children().hasClass('active')) {
						mData.interFace('post', 'saveReviewCreditOfficer', { 'applCde': applCde, 'creditOfficer': list.creditOfficer }).then(function (data) {
							mData.interFace('post', str10, param10).then(function (data) {
								canClick = true;
								mCheck.alert('提交成功', function () {
									$('#waitingBox').hide();
									mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
										if(dat=='Y'){
											back1();
										}
									});
								});
							}, function (err) {
								canClick = true;
								mCheck.alert(err.em);
								$('#waitingBox').hide();
							});
						}, function (err) {
							canClick = true;
							mCheck.alert(err.em);
							$('#waitingBox').hide();
						});
					} else {
						mCheck.alert('请先选择信贷员！', function () {
							canClick = true;
							$('#waitingBox').hide();
						});
					}
				}
			});
		});
	});
});