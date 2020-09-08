'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var applCde = localStorage.getItem('applCde');
	mBank.addVconsole();
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		applCdeVal.innerHTML = applCde;
		if (self.loanstt) {
			$('#suc').show();
			$('#tips1').show();
			$('#wait').hide();
			$('#tips2').hide();
		} else {
			$('#suc').hide();
			$('#tips1').hide();
			$('#wait').show();
			$('#tips2').show();
		}

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
		//		plus.key.addEventListener('backbutton', function () {
		//			mui.back = function () {
		//				back1();
		//			}
		//		}, false);
		mui.back = function () {
			back1();
		};
		iconBack.addEventListener('tap', function () {
			back1();
		});
		back.addEventListener('tap', function () {
			localStorage.removeItem('firstFlag');
			mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-right');
		});
	});
});