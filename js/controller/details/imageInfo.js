'use strict';

define(function (require, exports, module) {
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

	preObj.all = function (selector, contextElement) {
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

	preObj.delegate = function ($el, eventType, selector, fn) {
		if (!$el) {
			return;
		}
		$el.addEventListener(eventType, function (e) {
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
	function appDownloadFile(applCde, docTyp, docKind) {
		var url = mBank.getApiURL() + 'appDownloadFile.do';
		var param = { applCde: applCde, docTyp: docTyp, docKind: docKind };
		return new Promise(function (resolve, reject) {
			mBank.apiSend('get', url, param, function (data) {
				resolve(data.iECMIMGlist);
			}, function(err){
				reject(err);
			});
		});
	};
	function getCameraInterface() {
		var isCamera = plus.camera.getCamera();
		isCamera.captureImage(function (p) {
			plus.io.resolveLocalFileSystemURL(p, function (entry) {
				compressImage(entry.toLocalURL(), entry.name);
			}, function (e) {
				mui.toast('读取拍照文件错误：' + e.message, { type: 'div' });
			});
		}, function (e) {}, { filter: 'image' });
	};

	function getPhotoInterface() {
		plus.gallery.pick(function (e) {
			var name = e.substr(e.lastIndexOf('/') + 1);
			compressImage(e, name);
		}, function (e) {
			mui.toast('读取相册文件错误：' + e.message, { type: 'div' });
		}, { filter: 'image' });
	};

	function compressImage(url, fileName) {
		var name = "_doc/upload" + fileName;
		plus.zip.compressImage({
			src: url, // src: (String 类型 )压缩转换原始图片的路径
			dst: name, // 压缩转换目标图片的路径 
			quality: 40, //quality: (Number 类型 )压缩图片的质量.取值范围为1-100
			overwrite: true //overwrite: (Boolean 类型 )覆盖生成新文件  	
		}, function (zip) {
			getImageUrl(zip.target, name);
		}, function () {
			mui.toast('压缩图片失败，请稍候再试', { type: 'div' });
		});
	}

	function getImageUrl(url, fileName) {
		plus.nativeUI.showWaiting('', {
			padlock: false
		});
		plus.io.resolveLocalFileSystemURL(url, function (entry) {
			entry.file(function (file) {
				var fileReader = new plus.io.FileReader();
				fileReader.readAsDataURL(file);
				fileReader.onloadend = function (e) {
					var picUrl = e.target.result.toString();
					//					if (file.size <= 2 * 1024 * 1024) {
					//						showImage(picUrl, flag);	
					//						let param = {
					//							IdImgDataZH: picUrl,
					//							IdImgDataF: picUrl,
					//							flag: flag,
					//							handlingChannel: '01',
					//							applCde: applCde
					//						};	
					//						ocrIdUploadeFile(param, flag);
					//					} else {
					//						mui.toast('图片不能大于2M', {type : 'div'});
					//					}
					var param = Object.assign({
						'applCde': applCde,
						'docName': url.substring(url.lastIndexOf('/') + 1),
						'operationFlag': '0',
						'docSeq': '',
						'picUploadFile': picUrl,
						'apptSeq': ''
					}, list.param);
					appUpLoadInfo(param).then(function (data) {
						plus.nativeUI.closeWaiting();
					}, function (err) {
						mCheck.toast(err.em);
						plus.nativeUI.closeWaiting();
					});
				};
			});
		});
	}

	function appUpLoadInfo(_ref) {
		var applCde = _ref.applCde,
		    docName = _ref.docName,
		    docKind = _ref.docKind,
		    docCde = _ref.docCde,
		    docKindDesc = _ref.docKindDesc,
		    apptSeq = _ref.apptSeq,
		    docTyp = _ref.docTyp,
		    picUploadFile = _ref.picUploadFile,
		    operationFlag = _ref.operationFlag,
		    docSeq = _ref.docSeq;

		var url = mBank.getApiURL() + 'appUpLoadInfo.do';
		var param = Object.assign({ 'flag': '0' }, arguments[0]);
		return new Promise(function (resolve, reject) {
			mBank.apiSend('post', url, param, function (data) {
				showImage(param.picUploadFile);
				resolve(data);
				setTimeout(function () {
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
				}, 1000);
			}, function (err) {
				reject(err);
			});
		});
	};

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
		};
	}

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();

		//    	mui.back = function(){
		//    		const view = plus.webview.getWebviewById(self.viewId);
		//    		mui.fire(view, 'updateNum');
		//    		plus.webview.hide(self);
		//			plus.webview.close(self);
		//    	}
		iconBack.addEventListener('tap', function () {
			mui.back();
		});
		list.applCde = applCde;
		list.param = self.param;
		$('.title')[0].innerHTML = self.param.docKindDesc;
		appDownloadFile(applCde, self.param.docTyp, self.param.docKind).then(function (data) {
			if (data.length > 0) {
				var str = '';
				data.forEach(function (item) {
					//					showImage(item.PAGE_URL);
					//					str += `<div class="img-info" style="display:none"><img src="${item.PAGE_URL}"></div>`;	
					if (item.format.substring(item.format.length - 3) == 'pdf') {
						str += '<div class="img-info" style="display:none"><img src="../../images/pdfIcon.png"></div>';
					} else {
						str += '<div class="img-info" style="display:none"><img src="' + item.PAGE_URL + '"></div>';
					}
				});
				imgList.innerHTML = imgList.innerHTML + str;
				var imgs = document.getElementsByTagName('img');
				console.log(imgs.length);
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
		},function(err){
				mCheck.callPortFailed(err.ec,err.em,"#waitingBox");
		});
//		mui('#imgList').on('tap', '#add', function(){
//			const btns =  [{title : '拍照'}, {title : '从相册选取'}];
//			plus.nativeUI.actionSheet({
//				cancel: '取消',
//				buttons: btns
//			}, function(e){
//				if(e.index === 1){
//					getCameraInterface();  //拍照
//				}else if(e.index === 2){
//					getPhotoInterface();   //从相册选取
//				}
//			})
//		})
	});
});