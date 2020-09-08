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
		var quality = 95;
		if (plus.os.name == 'iOS') {
			quality = 0.5;
		} else {
			quality = 95;
		}

		function appDownloadFile(applCde, docTyp, docKind) {
			var url = mBank.getApiURL() + 'appDownloadFile.do';
			var param = {
				applCde: applCde,
				docTyp: docTyp,
				docKind: docKind
			};
			return new Promise(function(resolve, reject) {
				mBank.apiSend('get', url, param, function(data) {
					resolve(data.iECMIMGlist);
				}, null);
			});
		};

		mui.back = function() {
			var view = plus.webview.getWebviewById(self.viewId);
			mui.fire(view, 'updateNum');
			plus.webview.hide(self);
			plus.webview.close(self);
		};
		iconBack.addEventListener('tap', function() {
			mui.back();
		});
		list.applCde = applCde;
		list.param = self.param;
		$('.title')[0].innerHTML = self.param.docKindDesc;
		mui('#imgList').on('tap', '#add', function () {
			mBank.openWindowByLoad('./imageImportInit.html', 'imageImportInit', 'slide-in-right',{param: list.param,viewId:self.viewId});
		});
		appDownPic();
		function appDownPic(){
			appDownloadFile(applCde, self.param.docTyp, self.param.docKind).then(function (data) {
				if (data.length > 0) {
					var str = '';
					data.forEach(function (item) {
						if (item.format.substring(item.format.length - 3) == 'pdf') {
							str += '<div class="img-info" style="display:none"><img src="../../images/pdfIcon.png"></div>';
						} else {
							str += '<div class="img-info" style="display:none"><img src="' + item.PAGE_URL + '"></div>';
						}
					});
					imgList.innerHTML = imgList.innerHTML + str;
					var imgs = imgList.getElementsByTagName('img');
					setTimeout(function () {
						var _iteratorNormalCompletion = true;
						var _didIteratorError = false;
						var _iteratorError = undefined;
			
						try {
							for (var _iterator = imgs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
								var item = _step.value;
			
								if (item.height > item.width) {
									item.className = 'high';
								} else {
									item.className = 'widh';
								}
								$(item).parent().show();
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
					}, 1000);
			
					var urls = [];
					var imgs2 = preObj.all('img', preObj.all('#imgList')[0]);
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
				}
			});
		}
		
		window.addEventListener('updatePic', function (event) {
			$("#imgList div:not(:first)").remove();
			appDownPic();
			
		});
	});
});
