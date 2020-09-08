'use strict';

var domHeight = document.documentElement.clientHeight;
window.addEventListener("resize", function () {
	var showHeight = document.documentElement.clientHeight;
	var ua = navigator.userAgent;
	var isAndroid = /android/i.test(ua); //android终端
	if(isAndroid){
//		var barHeight = getStatusBarHeight();
//		if (domHeight>(showHeight+barHeight)) {
//			$('.footer').hide();
//			$('header').css('position', 'absolute');
//			if ($('.app-tab')) {
//				$('.app-tab').css('position', 'absolute');
//			}
//		} else {
//			$('.footer').show();
//			$('header').css('position', 'fixed');
//			if ($('.app-tab')) {
//				$('.app-tab').css('position', 'fixed');
//			}
//		}
	}
});
function getStatusBarHeight(){
	var immersed = 0;
	var ms=(/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
	if(ms&&ms.length>=3){ 
		immersed=parseFloat(ms[2]);// 获取状态栏的高度
	}
	return immersed;
}	
var ua = navigator.userAgent;
var isAndroid = /android/i.test(ua); //android终端
/*ios终端*/
if (!isAndroid) {
	var bfscrolltop = 0; //获取软键盘唤起前浏览器滚动部分的高度
	$("input").focus(function () {
		if ($(this).attr('readonly') != 'readonly' && $(this).prop('disabled') != true) {
			$('.footer').hide();
			$('header').css('position', 'absolute');
			if ($('.app-tab')) {
				$('.app-tab').css('position', 'absolute');
			}
			if (document.documentElement.scrollTop != 0) {
				bfscrolltop = document.documentElement.scrollTop;
			} else {
				bfscrolltop = document.body.scrollHeight;
			}
		} else {
			return;
		}
	}).blur(function () {
		//设定输入框失去焦点时的事件      	
		if ($(this).attr('readonly') != 'readonly' && $(this).prop('disabled') != true) {
			//注释掉原因是因为二手车车架号点搜索时，滚动条会自己往下走。
			// setTimeout(function () {
			// 	$('html,body').scrollTop(bfscrolltop);
			// }, 200);
			$('.footer').show();
			$('header').css('position', 'fixed');
			if ($('.app-tab')) {
				$('.app-tab').css('position', 'fixed');
			}
		} else {
			return;
		}
	});
}

