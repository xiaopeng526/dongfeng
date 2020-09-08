'use strict';
define(function(require, exports, module) {
	var mBank = require('../../core/bank');
	var mCheck = require('../../core/check');
	// mBank.addVconsole();
	var applCde = localStorage.getItem('applCde');
	var typeFlag = localStorage.getItem('typeFlag');
	var list = {
		applCde: '',
		param: {}
	};
	var isisCan = false;
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
	var html = '',
		errEc = '',
		picFlag = '';
	var setNum = 5;
	var j = 0,
		loadIndex = 1;
	var sort;
	var errFlag = 0;
	var picSize = 0;
	var picFormat = 0;
	var imgListArr = {
		'imgName': [],
		'imgPath': []
	};
	var typeArr = [];
	var fileSizeArr = [];
	var picUrlArr = [];
	var succIndex = [],
		failIndex = [],
		failResone = [],
		newFailReson = [];
	var reSuccIndex = [],
		reFailIndex = [];
	var fileLen, succCount = 0,
		failCount = 0;
	var failResonHtml = '',
		failIndexHtml = '';
	mui.plusReady(function() {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
		list.applCde = applCde;
		list.param = self.param;
		var quality = 95;
		if (plus.os.name == 'iOS') {
			quality = 0.5;
		} else {
			quality = 95;
		}
		getImageUrl(self.fileSizeArr, self.typeArr, self.picUrlArr, self.imgList, self.fileSizeArr.length);
		for (var i in self.imgList['imgPath']) {
			if (i == 4) {
				$("#addImg").hide();
			} else {
				$("#addImg").show();
			}
		}
		mui.back = function() {
			setTimeout(function() {
				plus.webview.hide(self.id);
				plus.webview.close(self.id);
			}, 1000);
			var view = plus.webview.getWebviewById('imageInfo');
			mui.fire(view, 'updatePic');
		};
		back.addEventListener('tap', function() {
			mui.back();
		});
		list.applCde = applCde;
		/*点击添加按钮*/
		addImg.addEventListener('tap', function() {
			var num = setNum;
			var ulImgs = document.getElementById('ul_imgs')
			if (ulImgs.querySelector('.photo-box')) {
				var box = ulImgs.getElementsByClassName('photo-box');
				num -= box.length;
			}
			var btns = [{
				title: '拍照'
			}, {
				title: '从相册选取'
			}];
			plus.nativeUI.actionSheet({
				cancel: '取消',
				buttons: btns
			}, function(e) {
				if (e.index === 1) {
					getCameraInterface(); //拍照
				} else if (e.index === 2) {
					getPhotoInterface(num); //从相册选取
				}
			});
		});
		mui("ul li").on('longtap', 'img', function() {
			if (document.querySelector("ul li .img-father").className.indexOf('shake') != -1)
				return;
		});
		/*拍照*/
		function getCameraInterface() {
			imgListArr = {
				'imgName': [],
				'imgPath': []
			};
			errFlag = 0, picSize = 0, picFormat = 0;
			typeArr = [], fileSizeArr = [];
			var isCamera = plus.camera.getCamera();
			var imageResolution = isCamera.supportedImageResolutions[3];//分辨率
			isCamera.captureImage(function(p) {
				plus.io.resolveLocalFileSystemURL(p, function(entry) {
					imgListArr['imgName'][0] = entry.name;
					imgListArr['imgPath'][0] = entry.toLocalURL();
					entry.file(function(file) {
						var imgType = file.fullPath.split('.')[1];
						typeArr.push(imgType);
						fileSizeArr.push(file.size);
						var fileReader = new plus.io.FileReader();
						fileReader.readAsDataURL(file);
						fileReader.onloadend = function(e) {
							var picUrl = e.target.result.toString();
							picUrlArr.push(picUrl);
							getImageUrl(fileSizeArr, typeArr, picUrlArr, imgListArr, 1);
							// plus.gallery.save(entry.toLocalURL(),
							//    function() {
							//       // mui.toast('保存成功');
							// 	}, function() {
							// 		mui.toast('保存失败，请重试！');
							//  });
						}
					})
				}, function(e) {
					mui.toast('读取拍照文件错误：' + e.message, {
						type: 'div'
					});
				});
			}, function(e) {}, {
				filter: 'image',
				optimize:false,
				resolution:imageResolution
			});
		};
		
		/*从相册中选择照片*/
		function getPhotoInterface(num) {
			plus.gallery.pick(function(e) {
				imgListArr = {
					'imgName': [],
					'imgPath': []
				};
				typeArr = [], fileSizeArr = [];
				errFlag = 0, picSize = 0, picFormat = 0;
				fileLen = e.files.length;
				var getFlag = 0;
				for (var i = 0; i < fileLen; i++) {
					imgListArr['imgName'][i] = e.files[i].substr(e.files[i].lastIndexOf('/') + 1);
					imgListArr['imgPath'][i] = e.files[i];
					plus.io.resolveLocalFileSystemURL(e.files[i], function(entry) {
						entry.file(function(file) {
							var imgType = file.fullPath.split('.')[1];
							fileSizeArr.push(file.size);
							typeArr.push(imgType);
							var fileReader = new plus.io.FileReader();
							fileReader.readAsDataURL(file);
							fileReader.onloadend = function(e) {
							var picUrl = e.target.result.toString();
								picUrlArr.push(picUrl);
								getFlag++;
								if (getFlag == fileLen) {
									getImageUrl(fileSizeArr, typeArr, picUrlArr, imgListArr, fileLen);
								}
							}
							
						});
					});
				}
			}, function(e) {
				mui.toast('读取相册文件错误：' + e.message, {
					type: 'div'
				});
			}, {
				filter: 'image',
				multiple: true, //是否支持多选
				maximum: num, //最多选择的文件数量，上面设置了全局变量
				system: false, //是否使用系统文件选择界面，iOS下无效
				onmaxed: function() { //超出选择最大文件数时触发
					mui.toast('最多选择' + num + '张图片')
				}
			});
		};
		function getImageUrl(fileSizeArr, typeArr, picUrlArr, imgList, fileLen) {
			$('#waitingBox').show();
			var i = 0;
			compressImage(fileSizeArr,imgList["imgPath"], imgList["imgName"], picUrlArr, i,typeArr);
		}
		
		function compressImage(fileSizeArr,urlArr, fileNameArr, picUrlArr, i,typeArr) {
			if(i < urlArr.length) {
				if (fileSizeArr[i] > 2 * 1024 * 1024 && fileSizeArr[i] <= 20 * 1024 * 1024) {
					if (plus.os.name == 'iOS') {
						quality = 1;
					} else {
						quality = 80;
					}
					compression(fileSizeArr,urlArr, fileNameArr, picUrlArr, i,typeArr);
				} else if (fileSizeArr[i] >= 0.6 * 1024 * 1024 && fileSizeArr[i] <= 2 * 1024 * 1024) {
						if (plus.os.name == 'iOS') {
							quality = 40;
						} else {
							quality = 95;
						}
					compression(fileSizeArr,urlArr, fileNameArr, picUrlArr,i,typeArr);
				} else if (fileSizeArr[i] > 20 * 1024 * 1024) {
						picSize++;
					unCompression(urlArr, fileNameArr,picUrlArr, i,typeArr);
				} else if (typeArr.indexOf("HEIC") >= 0 || typeArr.indexOf("gif") >= 0) {
					picFormat++;
					unCompression(fileSizeArr,urlArr, fileNameArr, picUrlArr, i,typeArr);
				}else {
					unCompression(fileSizeArr,urlArr, fileNameArr,picUrlArr,i,typeArr);
				}
			}
		}
		function unCompression(fileSizeArr,urlArr, fileNameArr, picUrlArr, i,typeArr) {//小图片不压缩
			afun(urlArr[i],i==urlArr.length-1);
			compressImage(fileSizeArr,urlArr, fileNameArr, picUrlArr, i+1,typeArr);
		}
		/*大图片压缩方法*/
		function compression(fileSizeArr,urlArr, fileNameArr, picUrlArr,i,typeArr) {
			var name = "_doc/upload" + fileNameArr[i];
			plus.zip.compressImage({
				src: urlArr[i], // src: (String 类型 )压缩转换原始图片的路径
				dst: name, // 压缩转换目标图片的路径 
				format: 'jpg',
				quality: quality, //quality: (Number 类型 )压缩图片的质量.取值范围为1-100
				overwrite: true //overwrite: (Boolean 类型 )覆盖生成新文件  
			}, function(zip) {
				afun(zip.target,i==urlArr.length-1,zip.size);
				compressImage(fileSizeArr,urlArr, fileNameArr, picUrlArr, i+1,typeArr);
			}, function() {
				mui.toast('压缩图片失败，请稍候再试', {
					type: 'div'
				});
				document.getElementById("ul_imgs").innerHTML = '';
			});
		}
	

		function afun(imgPath, flagShow,imgSize) {
			if (errFlag == 0) {
				if (picFormat > 0) {
					mCheck.alert('图片只支持png、jpg、jpeg格式。小贴士：将照片通过微信上传，再下载至相册，可帮助您把图片格式过滤正确。');
					errFlag++;
				} else if (picSize > 0) {
					mCheck.alert('原图格式过大，请用微信压缩图片后，再行上传');
					errFlag++;
				} else {
					insertPhoto(imgPath, '',flagShow,imgSize);
				}
			}
		}
		/*将选择的图片转base64并加入到页面中*/
		function insertPhoto(data, flag,flagShow,imgSize) {
			if (flag != '') {
				html = '';
			}
			var pathImg;
			var imgClass; //img的class名
			var img = new Image(); //创建image对象并转换base64码
			var bitmap = new plus.nativeObj.Bitmap(data);
			bitmap.load(bitmap.id, function() { // 从本地加载Bitmap图片 
				var dataSrc = bitmap.toBase64Data();
				img.src = dataSrc;
			}, function(e) {
				console.log('加载图片失败：' + JSON.stringify(e));
			});
			img.onload = function() {
				//创建canvas画布
				var canvas = document.createElement("canvas"); 
				//在css中不要直接给img设置宽高,否则此处会获取到css设置的值
				var width = img.width;
				var height = img.height;
				canvas.width = width; //设置新的图片的宽度
				canvas.height = height; //设置新的图片的长度
				var ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, width, height); //绘图
				var dataURL = canvas.toDataURL("image/jpeg", 0.8); //供img标签使用的src路径
				pathImg = data;
				if (flag == "S") {
					j = j + 1;
					html += '<li data-li="' + j +
						'" class="photo-box"><div class="img-father"><div class="img-container drag-handle"><img class="' + imgClass +
						'" id="img' + j +
						'"data-preview-src="' + dataURL + '" src="' + data + '" /></div>' +
						'<div class="maskBox"><b style="background:#7BC468">成功</b></div></div></li>'
				} else if (flag == "F") {
					j = j + 1;
					html += '<li data-li="' + j +
						'" class="photo-box"><div class="img-father"><div class="img-container drag-handle"><img class="' + imgClass +
						'" id="img' + j +
						'"data-preview-src="' + dataURL + '" src="' + data + '" /></div>' +
						'<div class="maskBox"><b style="background:#F96C6C">失败</b></div></div></li>'

				} else {
					//将最后拿到的图片类名和src放入页面中
					j = j + 1;
					html += '<li data-li="' + j +
						'" class="photo-box"><div class="img-father"><div class="img-container drag-handle"><img class="' + imgClass +
						'" id="img' + j +
						'"data-preview-src="' + dataURL + '" src="' + data + '" /></div>' +
						'<div class="maskBox" style="display:none;"><b></b></div></div></li>'
				}
				document.getElementById("ul_imgs").innerHTML = html;
				var ulImgs = document.getElementById('ul_imgs');
				if (ulImgs.querySelector('.photo-box')) {
					var box = ulImgs.getElementsByClassName('photo-box');
					if(box.length >= 5){
						$("#addImg").hide();
					} else {
						$("#addImg").show();
					}
				}	
				imagePreview();
				if(j==self.typeArr.length){
					$("#uploadPic").show();
					$("#waitingBox").hide();
				}else{
					if(flagShow){
						setTimeout(function() {
							$("#waitingBox").hide();
						}, 1500);
					}
				}
				//重传失败，添加按钮、上传按钮隐藏
				if($("#reUploadPic").is(':visible')){
					$("#addImg").hide();
					$("#uploadPic").hide();
				}
			}
		}
	

		function imagePreview(f) {
			var urls = [];
			var imgId = [];
			var imgs2 = preObj.all('img', preObj.all('#ul_imgs')[0]);
			imgs2.forEach(function(v, i) {
				urls.push(v.src);
				imgId.push(v.id);
			});
			if (f == 'flag') {
				preObj.delegate(document.querySelector('#ul_imgs'), 'click', '.maskBox', function() {
					var current = $(this).siblings('div').find("img").attr('src');
					var obj = {
						urls: urls,
						imgId: imgId,
						current: current
					};
					previewImage.start(obj, function(data) {
						if (data.urls.length == 0) {
							$("#ul_imgs li:eq(0)").remove();
							html='';
						} else {
							//失败预览后，再点重传按钮
							reFailIndex=[],reSuccIndex=[];
							j = Number(data.imgId[0].split('img')[1]) - 1;
							for (var i = 0; i < data.urls.length; i++) {
								var k = Number(data.imgId[i].split('img')[1]);
								if (failIndex.includes(k)) {
									reFailIndex.push(k);
									picFlag = 'F';
									insertPhoto(data.urls[i], picFlag);
								} else if (succIndex.includes(k)) {
									reSuccIndex.push(k);
									picFlag = 'S';
									insertPhoto(data.urls[i], picFlag);
								}
							}
						}
					});
				});
			} else {
				preObj.delegate(document.querySelector('#ul_imgs'), 'click', 'img', function() {
					var current = this.src;
					var obj = {
						urls: urls,
						imgId: imgId,
						current: current
					};
					previewImage.start(obj, function(data) {
						if (data.urls.length == 0) {
							$("#ul_imgs li:eq(0)").remove();
							html='';
						} else {
							for (var i = 0; i < data.urls.length; i++) {
								j = 0;
								insertPhoto(data.urls[i], "flag");
							}
						}
					});
				});
			}
		}

		var touchtime, item_offset = {
			left: '',
			top: ''
		};
		setSortable(false);

		function setSortable(isTriggerByBtn) {
			sort = new Sortable(document.getElementById("ul_imgs"), {
				chosenClass: 'sort-chosen',
				ghostClass: 'sort-ghost',
				delay: 150,
				animation: 400,
				handle: '.drag-handle',
				isDropAnimation: false, //DragDrop时是否对DragEl启用滑动效果
				ghostScale: 1.2, //DragGhostEl 缩放效果
				onStart: function(evt) { // 拖拽
					touchtime = evt.timeStamp;
					item_offset.left = evt.item.offsetLeft;
					item_offset.top = evt.item.offsetTop;
					var itemEl = evt.item;
				},
				onEnd: function(evt) { // 拖拽
					var itemEl = evt.item;
					var timespan = evt.timeStamp - touchtime;
					if (timespan < 200) {} else if (itemEl.offsetLeft == item_offset.left && itemEl.offsetTop == item_offset.top) {} else {
						reset_order();
					}
					touchtime = null;
				},
			});
		};

		function reset_order() {
			//重新进行排序 为data-li 与id 属性赋值
			[].forEach.call(document.querySelectorAll("#ul_imgs li"), function(item, index) {
				var li = item;
				li.setAttribute('data-li', index + 1);
				imagePreview();
			});
			var Img = document.querySelectorAll("#ul_imgs li img");
			for (var i = 0; i < Img.length; i++) {
				var index = i + 1;
				var Image = 'img' + index;
				Img[i].setAttribute("id", Image);
			}
		};

		function proValue(load, boxNum) {
			$("#singleVal").html(load);
			var dataProgress = Math.round(100 / boxNum) * load;
			mui("#progressTip").progressbar().setProgress(dataProgress);
			if (load <= boxNum) {
				if (load == boxNum) {
					setTimeout(function() {
						isisCan = true;
						$("#conBtn").css('color', "#44A4CC");
						if ($("#progressInfo").is(':hidden')) {
							$("#progressBar").hide();
							$("#progressInfo").show();
							$("#btn-box").show();
							$("#succCount").html(succCount);
							$("#failCount").html(failCount);
							if(failCount>0){
								for (var k = 1; k <= newFailReson.length; k++) {
									failResonHtml += '<li>' + k + '.' + newFailReson[k - 1] + '</li>';
								}
								$("#failReson").append(failResonHtml);
							}
							
						}
					}, 1000);
				} 
			}
		}
		var load = 0;
		function progressFun(boxNum) {
			failIndex=[];
			imgSend(0, boxNum)
		}
		function imgSend(i, boxNum) {
			var currPicIndex;
			load=i+1;
			if (reFailIndex.length > 0) {
				currPicIndex = reFailIndex[i];
			} else {
				currPicIndex = i + 1;
			}
			var picUrl = $("#img" + currPicIndex).attr("data-preview-src");
			var docFilePath = $("#img" + currPicIndex).attr("src");
			var docName = docFilePath.substring(docFilePath.lastIndexOf('/') + 1);
			var paramArr = Object.assign({
				'applCde': applCde,
				'docName': docName,
				'operationFlag': '0',
				'picUploadFile': picUrl,
				'docSeq': '',
				'apptSeq': '',
				'flag': '0'
			}, list.param);
			var url = mBank.getApiURL() + 'appUpLoadInfo.do';
			var result= mBank.apiSend('post', url, paramArr, function(data) {
				proValue(load, boxNum);
				succIndex.push(currPicIndex);
				$("#img" + currPicIndex).parent('div').siblings('div').find("b").html("成功");
				$("#img" + currPicIndex).parent('div').siblings('div').find("b").css("background", "#7BC468");
				succCount++;
				if(i < boxNum - 1) {
					i = i + 1;
					setTimeout(function() {
						imgSend(i, boxNum);
					}, 100);
				}
			}, function(err) {
				proValue(load, boxNum);
				failIndex.push(currPicIndex);
				failResone.push(err.em);
				$("#img" + currPicIndex).parent('div').siblings('div').find("b").html("失败");
				$("#img" + currPicIndex).parent('div').siblings('div').find("b").css("background", "#F96C6C");
				if (newFailReson.indexOf(err.em) == -1) {
					newFailReson.push(err.em);
				}
				failCount++;
				if(i < boxNum - 1) {
					i = i + 1;
					setTimeout(function() {
						imgSend(i, boxNum);
					}, 100);
				}
			}, '', false);
			//中途断网，上传失败
			if(result==false){
				var err='网络中断'
				proValue(load, boxNum);
				failIndex.push(currPicIndex);
				failResone.push(err);
				$("#img" + currPicIndex).parent('div').siblings('div').find("b").html("失败");
				$("#img" + currPicIndex).parent('div').siblings('div').find("b").css("background", "#F96C6C");
				if (newFailReson.indexOf(err) == -1) {
					newFailReson.push(err);
				}
				failCount++;
				if(i < boxNum - 1) {
					i = i + 1;
					setTimeout(function() {
						imgSend(i, boxNum);
					}, 100);
				}
			}
		}
		
		/*弹出框提示信息*/
		$("#conBtn").on("tap", function() {
			if (!isisCan) {
				return;
			} else {
				$("#addImg").hide();
				if ($("#progressInfo").is(':hidden')) {
					$("#progressBar").hide();
					$("#progressInfo").show();
					$("#succCount").html(succCount);
					$("#failCount").html(failCount);
					if(failCount>0){
						for (var k = 1; k <= newFailReson.length; k++) {
						failResonHtml += '<li>' + k + '.' + newFailReson[k - 1] + '</li>';
					     }
					    $("#failReson").append(failResonHtml);
					}
					
				} else {
					$("#conBox").hide();
					$("#progressBar").hide();
					$("#progressInfo").hide();
					$(".maskBox").show();
					if (failCount > 0) {
						$("#uploadPic").hide();
						$("#reUploadPic").show();
						$("#completePic").show();
						imagePreview('flag');
					} else {
						$("#uploadPic").hide();
						$("#reUploadPic").hide();
						$("#completePic").hide();
						setTimeout(function() {
							plus.webview.hide(self.id);
							plus.webview.close(self.id);
						}, 1000);
						var view = plus.webview.getWebviewById('imageInfo');
						mui.fire(view, 'updatePic');
					}
				}
			}
		});
		/*点击《上传》按钮*/
		$("#uploadPic").on('tap', function() {
			if(navigator.onLine){
				var ulImgs = document.getElementById('ul_imgs');
				if(!ulImgs.getElementsByClassName('photo-box').length){
					mui.toast('请选择一张图片',{type:'div'});
					return false;
				}
				$("#conBox").show();
				$("#progressBar").show();
				if (ulImgs.querySelector('.photo-box')) {
					var box = ulImgs.getElementsByClassName('photo-box');
					$("#countVal").html("/" + box.length);
				}
				$("#singleVal").html(1);
				$("#btn-box").hide();
				setTimeout(function() {
					progressFun(box.length);
				}, 1500);
				newFailReson=[]
			}else{
				mui.toast("请开启网络后,重试",{type: 'div'});
			}
		})
		/*点击<完成>按钮操作*/
		$("#completePic").on("tap", function() {
			newFailReson=[];
			setTimeout(function() {
				plus.webview.hide(self.id);
				plus.webview.close(self.id);
			}, 1000);
			var view = plus.webview.getWebviewById('imageInfo');
			mui.fire(view, 'updatePic');
		});
		/*点击<重新失败项>按钮操作*/
		$("#reUploadPic").on("tap", function() {
			if(navigator.onLine){
				newFailReson=[],failResonHtml = '', failIndexHtml = '';
				failCount = 0, succCount = 0, loadIndex = 1;
				isisCan = false;
				$("#conBtn").css("color", "#ADA9A4");
				$("#btn-box").hide();
				mui($("#progressTip")).progressbar().setProgress(0);
				$("#failReson").html("");
				$("#conBox").show();
				$("#progressBar").show();
				$(".maskBox").hide();
				if (picFlag != "") {
					if (reSuccIndex.length > 0) {
						for (var i = reSuccIndex.length; i >= 0; i--) {
							var removeIndex = reSuccIndex[i - 1];
							$("#ul_imgs li[data-li=" + removeIndex + "]").remove();
						}
					}
					$("#singleVal").html(1);
					$("#countVal").html("/" + reFailIndex.length);
					setTimeout(function() {
						progressFun(reFailIndex.length);
						picFlag = "";
					}, 1000);
				} else {
					reFailIndex = [], reSuccIndex = [];
					for (var i = succIndex.length; i >= 0; i--) {
						var removeIndex = succIndex[i - 1];
						$("#ul_imgs li[data-li=" + removeIndex + "]").remove();
					}
					$("#singleVal").html(1);
					$("#countVal").html("/" + failIndex.length);
					for (var k = 0; k < failIndex.length; k++) {
						reFailIndex.push(failIndex[k]);
					}
					for (var k = 0; k < succIndex.length; k++) {
						reSuccIndex.push(succIndex[k]);
					}
					setTimeout(function() {
						progressFun(failIndex.length);
					}, 1000);
				}
			}else{
				mui.toast("请开启网络后,重试",{type: 'div'});
			}	
		});
	});
});
