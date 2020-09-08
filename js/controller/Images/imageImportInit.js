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
	var typeArr=[];
	var fileSizeArr=[];
	var picUrlArr=[];
	var setNum=5;
	var picSize=0;
	var picFormat=0;
	var errFlag=0;
	var currentInd,fileLen;
	var imgListArr={
		'imgName':[],
		'imgPath':[]
	};
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mBank.isImmersed();
		list.applCde = applCde;
		list.param = self.param;

		mui.back = function () {
			var view = plus.webview.getWebviewById(self.id);
			plus.webview.hide(self);
			plus.webview.close(self);
		};
		back.addEventListener('tap', function () {
			mui.back();
		});
		list.applCde = applCde;
		/*点击添加按钮*/
		addImg.addEventListener('tap',function(){
			errFlag=0;
			var num =setNum;
			var btns = [{ title: '拍照' }, { title: '从相册选取' }];
			plus.nativeUI.actionSheet({
				cancel: '取消',
				buttons: btns
			}, function (e) {
				if (e.index === 1) {
					getCameraInterface(); //拍照
				} else if (e.index === 2) {
					getPhotoInterface(num); //从相册选取
				}
			});
		});
		 /*拍照*/
		function getCameraInterface() {
			imgListArr={
				'imgName':[],
				'imgPath':[]
			};
			errFlag=0,picSize=0,picFormat=0;
			typeArr=[],fileSizeArr=[];
			var isCamera = plus.camera.getCamera();
			var imageResolution = isCamera.supportedImageResolutions[3];//分辨率
			isCamera.captureImage(function (p) {
				plus.io.resolveLocalFileSystemURL(p, function (entry) {
					imgListArr['imgName'][0]=entry.name;
					imgListArr['imgPath'][0]=entry.toLocalURL();
					entry.file(function (file) {
						var imgType = file.fullPath.split('.')[1];
						typeArr.push(imgType);
						fileSizeArr.push(file.size);
						var fileReader = new plus.io.FileReader();
						fileReader.readAsDataURL(file);
						fileReader.onloadend = function(e) {
							var picUrl = e.target.result.toString();
							picUrlArr.push(picUrl);
							getImageUrl(fileSizeArr,typeArr,picUrlArr,1);
						}
					})
				}, function (e) {
					mui.toast('读取拍照文件错误：' + e.message, { type: 'div' });
				});
			}, function (e) {}, {
				filter: 'image',
				optimize:false,//是否优化图片
				resolution:imageResolution
			});
		};
		 /*从相册中选择照片*/
		function getPhotoInterface(num) {
			plus.gallery.pick(function(e) {
				imgListArr={
					'imgName':[],
					'imgPath':[]
				};
				errFlag=0,picSize=0,picFormat=0;
				typeArr=[],fileSizeArr=[];
				fileLen = e.files.length;
				for(var i=0;i<fileLen;i++){
					imgListArr['imgName'][i]=e.files[i].substr(e.files[i].lastIndexOf('/') + 1);
					imgListArr['imgPath'][i]=e.files[i];
					plus.io.resolveLocalFileSystemURL(e.files[i], function (entry) {
						entry.file(function (file) {
							var fileReader = new plus.io.FileReader();
							fileReader.readAsDataURL(file);
							fileReader.onloadend = function(e) {
								var picUrl = e.target.result.toString();
								picUrlArr.push(picUrl);
								getImageUrl(fileSizeArr,typeArr,picUrlArr,fileLen);
							}
							var imgType = file.fullPath.split('.')[1];
							fileSizeArr.push(file.size);
							typeArr.push(imgType);
						});
					});
 				}
			}, function(e) {
				mui.toast('读取相册文件错误：' + e.message, {
					type: 'div'
				});
			}, {
				filter: 'image',
				multiple : true,        //是否支持多选
				maximum  : num,         //最多选择的文件数量，上面设置了全局变量
				system   : false,       //是否使用系统文件选择界面，iOS下无效
				onmaxed  : function(){  //超出选择最大文件数时触发
					mui.toast( '最多选择' + num + '张图片' )
				}
			});
		};
		function getImageUrl(fileSizeArr,typeArr,picUrlArr,fileLen) {
			if(fileLen==typeArr.length){
				$('#waitingBox').show();
				for (var i=0;i<fileSizeArr.length;i++){
					if(fileSizeArr[i]>20 * 1024 * 1024){
						picSize++;
					}else if(typeArr.indexOf("HEIC")>=0||typeArr.indexOf("gif")>=0){
						picFormat++;
					}
				}
				afun(picUrlArr);
			}
			
		}
		function afun(picUrlArr){
			$('#waitingBox').hide();
			if(errFlag==0){
				if(picFormat>0){
					mCheck.alert('图片只支持png、jpg、jpeg格式。小贴士：将照片通过微信上传，再下载至相册，可帮助您把图片格式过滤正确。');
					errFlag++;
				}else if(picSize>0){
					mCheck.alert('原图格式过大，请用微信压缩图片后，再行上传');
					errFlag++;
				}else{
					$("#waitingBox").show();
					var self = plus.webview.currentWebview();
					mBank.openWindowByLoad('./imageImport.html', 'imageImport', 'slide-in-right',{
						param:list.param,
						viewId:self.viewId,
						imgList:imgListArr,
						fileSizeArr:fileSizeArr,
						typeArr:typeArr,
						picUrlArr:picUrlArr
					});
					setTimeout(function () {
						plus.webview.hide(self.id);
						plus.webview.close(self.id);
						$("#waitingBox").hide();
					}, 3600);
				}
			}
		}
	});
});