'use strict';
define(function (require, exports, module) {
	var url = 'http://106.120.242.251:8088/iLoan/';
	var imgUrl = 'http://192.168.7.159:7001/innermanage/images/advert/';
	var storeNo = '';
	var telephone = '';
	exports.url = url;
	exports.imgUrl = imgUrl;
	exports.addVconsole = function () {
		window.vConsole = new window.VConsole({
			defaultPlugins: ['element', 'console', 'network', 'storage'], // 可以在此设定要默认加载的面板
			maxLogNumber: 1000
		});
	};
	exports.storeNo = storeNo;
	exports.telephone = telephone;
});