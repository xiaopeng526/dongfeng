'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var applCde = localStorage.getItem('applCde');
	mBank.addVconsole();
	var api = "https://api.faceid.com/faceid/v1/ocridcard";
	var api1 = "https://api.megvii.com/faceid/v2/verify";
	var stdate = new Date();
	var Name = '',
	    Sex = '',
	    Cardnum = '',
	    UserBirday = '',
	    Valid_date = '',
	    this_UserImg = '',
	    User_cidImg = '',
	    BornDate = '',
	    GenRole = '';
	var cidimg_01, cidimg_02, User_feimg;
	var idInfo10 = void 0;
	var idInfoN = {
		'idNo': '',
		'custName': '',
		'sex': '',
		'Birth': '',
		'endDate': '',
		'applTyp': '',
		'reverSrc':'',
		'frontSrc':''
	};
	function conzmFun(name, sex, birth, cidNo) {
		var isTr=mCheck.idCardFormate(cidNo);
		if(isTr){
			$('#conBox').show();
			$('#zmInfos').show();
			$('#fmInfos').hide();
			$('#name').val(name);
			$('#sex').val(sex);
			$('#birth').val(birth);
			$('#cidNo').val(cidNo);
		}else{
			mCheck.alert("身份证号码格式不正确");
			frontImg.src = '';
			$('#conBox').hide();
			$('#zmInfos').hide();
		}
	}
	function confmFun(youxiaoqi, starDate, overDate) {
		$('#conBox').show();
		$('#zmInfos').hide();
		$('#fmInfos').show();
		$('#changQi').removeAttr('checked');
		$('#duanQi').removeAttr('checked');
		if (youxiaoqi.indexOf('长期') >= 0 || youxiaoqi.indexOf('永久') >= 0) {
			$('#changQi').prop('checked', 'true');
		} else {
			$('#duanQi').prop('checked', 'true');
		}
		if(checkDateFun(starDate)&&checkDateFun(overDate)){
			$('#starDate').val(starDate);
			$('#overDate').val(overDate);
		}else{
			mCheck.alert("日期不正确");
			reverImg.src = "";
			$('#conBox').hide();
			$('#fmInfos').hide();
		};
	}
	function checkDateFun(dateVal){
		var reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
		var regExp = new RegExp(reg);
		if(dateVal.indexOf('长期') >= 0|| dateVal.indexOf('永久') >= 0){
			return true;
		}else{
			if(!regExp.test(dateVal)){
				return false;
			}else{
				return true;
			}
		}
	}
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		var quality = 99;
		if (plus.os.name == 'iOS') {
			quality = 55;
		} else {
			quality = 99;
		}
		idInfoN.applTyp = self.applTyp;
		var getCameraInterface = function getCameraInterface() {
			var isCamera = plus.camera.getCamera();
			isCamera.captureImage(function (p) {
				plus.io.resolveLocalFileSystemURL(p, function (entry) {
					compressImage(entry.toLocalURL(), entry.name);
				}, function (e) {
					mui.toast('读取拍照文件错误：' + e.message, { type: 'div' });
				});
			}, function (e) {}, { filter: 'image' });
		};
		var getPhotoInterface = function getPhotoInterface(flag) {
			plus.gallery.pick(function (e) {
				//e表示相册中的路径，name表示选中的相册名字
				var name = e.substr(e.lastIndexOf('/') + 1);
				plus.io.resolveLocalFileSystemURL(e, function (entry) {
					entry.file(function (file) {
						if (file.size > 2 * 1024 * 1024 && file.size <= 10 * 1024 * 1024) {
							if (plus.os.name == 'iOS') {
								quality = 1;
							} else {
								quality = 80;
							}
							compressImage(e, name, flag);
						} else if (file.size >= 0.6 * 1024 * 1024 && file.size <= 2 * 1024 * 1024) {
							if (plus.os.name == 'iOS') {
								quality = 40;
							} else {
								quality = 95;
							}
							compressImage(e, name, flag);
						} else if (file.size > 10 * 1024 * 1024) {
							mCheck.alert('原图格式过大，请用微信压缩图片后，再行上传');
						} else {
							var name2 = "_doc/upload" + name;
							getImageUrl(e, name2, flag);
						}
					});
				});
			}, function (e) {
				mui.toast('读取相册文件错误：' + e.message, { type: 'div' });
			}, { filter: 'image' });
		};
		function compressImage(url, fileName, flag) {
			var name = "_doc/upload" + fileName;
			plus.zip.compressImage({
				src: url, // src: (String 类型 )压缩转换原始图片的路径
				dst: name, // 压缩转换目标图片的路径 
				format: 'jpg',
				quality: quality, //quality: (Number 类型 )压缩图片的质量.取值范围为1-100
				overwrite: true //overwrite: (Boolean 类型 )覆盖生成新文件  	
			}, function (zip) {
				getImageUrl(zip.target, name, flag);
			}, function () {
				mui.toast('压缩图片失败，请稍候再试', { type: 'div' });
			});
		}
		var getImageUrl = function getImageUrl(url, fileName, flag) {
			plus.io.resolveLocalFileSystemURL(url, function (entry) {
				entry.file(function (file) {
					var fileReader = new plus.io.FileReader();
					fileReader.readAsDataURL(file);
					fileReader.onloadend = function (e) {
						var picUrl = e.target.result.toString();
						var base64 = picUrl.split(';')[0];
						var imgType = base64.split('/')[1];
						// ajax 请求逻辑
						if (imgType == 'png' || imgType == 'jpg' || imgType == 'jpeg' || imgType == 'JPG' || imgType == 'JPEG' || imgType == 'PNG') {
							if (file.size <= 2 * 1024 * 1024) {
								showImage(picUrl, flag);
								var param = {
									IdImgDataZH: picUrl,
									IdImgDataF: picUrl,
									flag: flag,
									handlingChannel: '01',
									applCde: applCde
								};
								ocrIdUploadeFile(param, flag);
							} else {
								mCheck.alert('原图格式过大，请用微信压缩图片后，再行上传');
							}
						} else {
							mCheck.alert('图片只支持png、jpg、jpeg格式。小贴士：将照片通过微信上传，再下载至相册，可帮助您把图片格式过滤正确。');
						}
					};
				});
			});
		};
		var ocrIdUploadeFile = function ocrIdUploadeFile(param, flag) {
			$('#waitingBox').show();
			var url = mBank.getApiURL() + 'ocrIdUploadeFile.do';
			return new Promise(function (resolve, reject) {
				mBank.apiSend('post', url, param, function (data) {
					$('#waitingBox').hide();
					if (flag == '0') {
						Name = data.name;
						if (data.indivSex == '男') {
							Sex = '0';
						} else if (data.indivSex == '女') {
							Sex = '1';
						}
						Cardnum = data.idNo;
						var month = data.birthdayMonth < 10 ? "0" + data.birthdayMonth : data.birthdayMonth;
						var day = data.birthdayDay < 10 ? "0" + data.birthdayDay : data.birthdayDay;
						UserBirday = data.birthdayYear + "" + month + "" + day;
						idInfoN.idNo = Cardnum;
						idInfoN.custName = Name;
						idInfoN.sex = Sex;
						idInfoN.Birth = UserBirday;
						var birthday = data.birthdayYear + "-" + month + "-" + day;
						conzmFun(Name, data.indivSex, birthday, Cardnum);
					} else if (flag == '1') {
						if (data.valid_date == null) {
							return;
						}
						Valid_date = data.valid_date;
						idInfoN.endDate = Valid_date;
						confmFun(idInfoN.endDate, Valid_date.split("-")[0].replace(/\./g, "-"), Valid_date.split("-")[1].replace(/\./g, "-"));
					}
				}, function (err) {
					mCheck.toast(err.em);
					hideImage(flag);
					$('#waitingBox').hide();
				});
			});
		};
		var showImage = function showImage(url, flag) {
			if (flag == '1') {
				reverImg.src = url;
			} else if (flag == '0') {
				frontImg.src = url;
			}
		};
		function hideImage(flag) {
			if (flag == '1') {
				reverImg.src = '';
			} else if (flag == '0') {
				frontImg.src = '';
			}
		}
		front.addEventListener('tap', function () {
			var btns = [{ title: '拍照' }, { title: '从相册选取' }];
			plus.nativeUI.actionSheet({
				cancel: '取消',
				buttons: btns
			}, function (e) {
				if (e.index === 1) {
					plus.pluginOpenIdcardScan.openIdcardScan('0', 'false', function (result) {
						if (result.status) {
							var message = result.message;
							var payload = result.payload;
							cidimg_01 = payload.picOne;
							$('#waitingBox').show();
							canvas(payload.picOne, '1');
						} else {
							plus.nativeUI.toast(result.message);
						}
					}, function (result) {
						plus.nativeUI.toast(result);
					});
				} else if (e.index === 2) {
					getPhotoInterface('0'); //从相册选取
				}
			});
		});
		reverse.addEventListener('tap', function () {
			var btns = [{ title: '拍照' }, { title: '从相册选取' }];
			plus.nativeUI.actionSheet({
				cancel: '取消',
				buttons: btns
			}, function (e) {
				if (e.index === 1) {
					plus.pluginOpenIdcardScan.openIdcardScan('1', 'false', function (result) {
						if (result.status) {
							var message = result.message;
							var payload = result.payload;
							cidimg_02 = payload.picOne;
							$('#waitingBox').show();
							canvas(payload.picOne, '1');
						} else {
							plus.nativeUI.toast(result.message);
						}
					}, function (result) {
						plus.nativeUI.toast(result);
					});
				} else if (e.index === 2) {
					getPhotoInterface('1'); //从相册选取
				}
			});
		});
		function canvas(dataUrl, num) {
			var b = new plus.nativeObj.Bitmap();
			b.loadBase64Data(dataUrl, function () {
				console.log("创建成功");
			}, function () {
				console.log("创建失败");
			});
			b.save('_doc/photo/_www/img1.png', { overwrite: true }, function (i) {
				createUpload(i.target);
			}, function (e) {
				$('#waitingBox').hide();
				mui.toast('检测失败!', { type: 'div' });
			});
		}
		function createUpload(thrid) {
			var task = plus.uploader.createUpload(api, { method: "POST" }, function (t, status) {
				if (status == 200) {
					var listinfo = JSON.parse(t.responseText); //扫描正面信息
					var legality = JSON.stringify(listinfo.legality).replace(/\s/ig, '');
					if (JSON.parse(legality).IDPhoto < 0.8) {
						mui.toast("身份证无法识别，请重新扫描拍摄!(请使用身份证原件进行扫描)", { type: 'div' });
						if (t.responseText.indexOf("name") >= 0) {
							Name = "";Sex = "";Cardnum = "";UserBirday = "";
						} else {
							Valid_date = "";
						}
						$('#waitingBox').hide();
						return;
					}
					if (t.responseText.indexOf("name") >= 0) {
						frontImg.src = "data:image/png;base64," + cidimg_01;
						Name = listinfo.name;
						if (listinfo.gender == '男') {
							Sex = '0';
						} else if (listinfo.gender == '女') {
							Sex = '1';
						}
						GenRole = listinfo.gender;
						Cardnum = listinfo.id_card_number;
						var month = listinfo.birthday.month < 10 ? "0" + listinfo.birthday.month : listinfo.birthday.month;
						var day = listinfo.birthday.day < 10 ? "0" + listinfo.birthday.day : listinfo.birthday.day;
						UserBirday = listinfo.birthday.year + "" + month + "" + day;
						BornDate = listinfo.birthday.year + "-" + month + "-" + day;
						upLoadImg('01');
					} else {
						reverImg.src = "data:image/png;base64," + cidimg_02;
						Valid_date = listinfo.valid_date;
						upLoadImg('02');
					}
				} else {
					mui.toast("Upload failed: " + status, { type: 'div' });
					$('#waitingBox').hide();
				}
			});
			task.addData("api_key", "IDG2cR6eTvl44Rz3SLo0oTDZYnd7zt2P");
			task.addData("api_secret", "0dyLkeUrbJQllzLl04t5i8VDqGBQRA8q");
			task.addData("legality", "1");
			task.addFile(thrid, { key: "image", name: "image" });
			task.addEventListener("statechanged", onStateChanged, false);
			task.start();
		}
		// 监听上传任务状态
		function onStateChanged(upload, status) {
			if (upload.state == 4 && status == 200) {}
		}
		function upLoadImg(type) {
			var imgData01 = {
				"flag": "0",
				"applCde": applCde,
				"docName": "39108219831209.png",
				"docKind": "1007_01",
				"docCde": "",
				"docKindDesc": "",
				"apptSeq": "",
				"docTyp": "1007",
				"picUploadFile": frontImg.src,
				"operationFlag": "0",
				"docSeq": "",
				"aprFlag": 'Z'
			};
			var imgData02 = {
				"flag": "0",
				"applCde": applCde,
				"docName": "545743895437953.png",
				"docKind": "1007_01",
				"docCde": "",
				"docKindDesc": "",
				"apptSeq": "",
				"docTyp": "1007",
				"picUploadFile": reverImg.src,
				"operationFlag": "0",
				"docSeq": "",
				"aprFlag": 'F'
			};
			var url = mBank.getApiURL() + 'appOCRUploadFileInfo.do';
			if (type == '01') {
				mBank.apiSend('post', url, imgData01, function (data) {
					idInfoN.idNo = Cardnum;
					idInfoN.custName = Name;
					idInfoN.sex = Sex;
					idInfoN.Birth = UserBirday;
					$('#waitingBox').hide();
					conzmFun(Name, GenRole, BornDate, Cardnum);
				}, function (err) {
					frontImg.src = "";
					$('#conBox').hide();
					$('#zmInfos').hide();
					$('#waitingBox').hide();
					if (err.ec == 'MSGEC2000099') {
						mCheck.alert(err.em);
					} else {
						mCheck.callPortFailed(err.ec, err.em);
					}
				}, true);
			}
			if (type == '02') {
				mBank.apiSend('post', url, imgData02, function (data) {
					idInfoN.endDate = Valid_date;
					$('#waitingBox').hide();
					confmFun(Valid_date, Valid_date.split("-")[0].replace(/\./g, "-"), Valid_date.split("-")[1].replace(/\./g, "-"));
				}, function (err) {
					reverImg.src = "";
					$('#conBox').hide();
					$('#fmInfos').hide();
					$('#waitingBox').hide();
					if (err.ec == 'MSGEC2000099') {
						mCheck.alert(err.em);
					} else {
						mCheck.callPortFailed(err.ec, err.em);
					}
				}, true);
			}
		}

		reSb.addEventListener('tap', function () {
			if ($('#zmInfos').is(':visible')) {
				idInfoN.idNo = '';
				idInfoN.custName = '';
				idInfoN.sex = '';
				idInfoN.Birth = '';
				hideImage('0');
			} else {
				idInfoN.endDate = '';
				hideImage('1');
			}
			$('#conBox').hide();
		});
		conBtn.addEventListener('tap', function () {
			$('#conBox').hide();
		});
		var view = plus.webview.getWebviewById(self.viewId);
		submit.addEventListener('tap', function () {
			idInfoN.frontSrc=frontImg.src;
			idInfoN.reverSrc=reverImg.src;
			if(frontImg.src.indexOf("data:image/jpeg;base64")==0 || frontImg.src.indexOf("data:image/png;base64")==0 ){
				if (idInfoN.idNo == '' || idInfoN.custName == '' || idInfoN.sex == '' || idInfoN.Birth == '') {
					mCheck.toast('身份证正面信息未正确识别，请重新扫描');
					return;
				}
				if (idInfoN.Birth.length < 8) {
					mCheck.toast('身份证正面信息未正确识别，请重新扫描');
					return;
				}
			}
			if(reverImg.src.indexOf("data:image/jpeg;base64")==0 || reverImg.src.indexOf("data:image/png;base64")==0){
				if (idInfoN.endDate == '') {
					mCheck.toast('身份证反面信息未正确识别，请重新扫描');
					return;
				}
				if (idInfoN.endDate.split("-")[1].replace(/\./g, "").length < 8 && idInfoN.endDate.indexOf('长') < 0) {
					mCheck.toast('身份证反面信息未正确识别，请重新扫描');
					return;
				}
				if (idInfoN.endDate.split("-")[1].replace(/\./g, "").length == '8') {
					var eddate = new Date(idInfoN.endDate.split("-")[1].replace(/\./g, "/"));
					if (stdate > eddate) {
						mCheck.toast('证件到期日不能小于当前日期');
						return;
					}
				}
			}
			mui.fire(view, 'idReverse', idInfoN);
			mui.back();
		});
	});
});