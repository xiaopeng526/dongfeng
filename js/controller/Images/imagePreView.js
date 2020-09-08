'use strict';

define(function(require, exports, module) {
	var mBank = require('../../core/bank');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	var typeFlag = localStorage.getItem('typeFlag');
	var list = {
		applCde: '',
		param: {}
	};
	var preObj = {};
	
	preObj.all = function(selector, contextElement) {
		var nodeList,
			list = [];
		if (contextElement) {
			nodeList = contextElement.querySelectorAll(selector);
		} else {
			nodeList = document.querySelectorAll(selector);
		}
		if (nodeList && nodeList.length > 0) {
			list = Array.prototype.slice.call(nodeList);
		}
		return list;
	};
	
	preObj.delegate = function($el, eventType, selector, fn) {
		if (!$el) {
			return;
		}
		$el.addEventListener(eventType, function(e) {
			var targets = preObj.all(selector, $el);
			if (!targets) {
				return;
			}
			// findTarget:
			for (var i = 0; i < targets.length; i++) {
				var $node = e.target;
				while ($node) {
					if ($node == targets[i]) {
						fn.call($node, e);
						break; //findTarget;
					}
					$node = $node.parentNode;
					if ($node == $el) {
						break;
					}
				}
			}
		}, false);
	};
	mui.plusReady(function() {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
		mui.back = function() {
			var view = plus.webview.getWebviewById(self.viewId);
			plus.webview.hide(self);
			plus.webview.close(self);
		};
		for (var i in self.imgList['imgPath']) {
			showImage(self.imgList['imgPath'][i]);
		}
		back.addEventListener('tap', function() {
			mui.back();
		});
		$("#title").html(self.serialNum+'/'+self.countNum);
		list.applCde = applCde;
		function showImage(url) {
			var str = '<div class="img-info"></div>';
			imgList.innerHTML = imgList.innerHTML + str;
			var img = new Image();
			img.src = url;
			img.onload = function () {
				if (img.height > img.width) {
					img.className = 'high';
				} else {
					img.className = 'widh';
				}
				$('#imgList').find('.img-info').last().append(img);
				var urls = [];
				var imgs2 = preObj.all('img', preObj.all('#imgList')[0]);
				console.log(imgs2);
				imgs2.forEach(function (v, i) {
					urls.push(v.src);
				});
				preObj.delegate(document.querySelector('#imgList'), 'click', 'img', function () {
					var current = this.src;
					var obj = {
						urls: urls,
						current: current
					};
					previewImage.start(obj);
				});
			};
		}
		
		
		
	});
});
