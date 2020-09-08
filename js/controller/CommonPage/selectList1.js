'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var list = {};
	var carModelItem = {};
	var carModelItemText = '';
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mBank.isImmersed();
		var str = '';
		var vehTrimid = '';

		// 车型信息查询
		function queryCarMessage(modelId) {
			var _url = mBank.getApiURL() + 'queryCarMessage.do';
			if (modelId) {
				mBank.apiSend('post', _url, {
					modelID: modelId
				}, function (res) {
					// console.log(JSON.stringify(res))
					carModelItem.totalQuality=res.totalQuality;//车重
				    carModelItem.carLength=res.carLength;//车长
					carModelItem.carTypeGrade=res.carTypeGrade; //车型级别
					carModelItem.carSeriesType=res.carSeriesType; //车系类型
					carModelItem.fuelType=res.fuelType; //燃料类型
					carModelItem.goodsKindId = mCheck.dataIsNull(res.goodsKindId); // 品牌id
					carModelItem.goodsKindName = mCheck.dataIsNull(res.goodsKindName); // 品牌名称
					carModelItem.carMfrsId = mCheck.dataIsNull(res.carMfrsId); // 子品牌Id
					carModelItem.carMfrsName = mCheck.dataIsNull(res.carMfrsName); // 子品牌名称
					carModelItem.carSerise = mCheck.dataIsNull(res.carSerise); // 车系id
					carModelItem.seriseName = mCheck.dataIsNull(res.seriseName); // 车系名称
					carModelItem.mode_year_cde = mCheck.dataIsNull(res.mode_year_cde); // 生产年份代码
					carModelItem.mode_year_nam = mCheck.dataIsNull(res.mode_year_nam); // 生产年份
					carModelItem.svm_mode_cde = mCheck.dataIsNull(res.modelID); // 车型ID
					carModelItem.svm_mode_nam = mCheck.dataIsNull(res.modelName); // 车型名称
					carModelItem.firmPrice = mCheck.dataIsNull(res.firmPrice); // 厂商指导价
					carModelItem.transmissionType = mCheck.dataIsNull(res.transmissionType); // 动力类型
					if (carModelItemText && carModelItemText != self.carModelSelected) {
						mui.fire(loanPreWebview, 'carModelReverse1', carModelItem);
					}
					mui.back();
				},function(err){
					mCheck.callPortFailed(err.ec, err.em);
				});
			} else {
				mui.alert('请先选择车型', '提示', '确定', function (e) {}, 'div');
			}
		}
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = self.carModelList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var item = _step.value;

				//			if(self.carModelSelected === item.text) {
				//				str += `<div class="df-list-item" style="background-color: #eee">
				//						${item.text}
				//					</div>`;
				//			}else {
				str += '<div class="df-list-item" style="display:block;" data-vehTrimid="' + item.vehTrimid + '">\t\n\t\t\t\t\t\t<p class="item-p">' + item.vehTrimname + '</p>\n\t\t\t\t\t\t<p class="item-p">\u8F66\u8F86\u6307\u5BFC\u4EF7 ' + mCheck.addSeparator(item.guidePrice) + '</p>\n\t\t\t\t</div>';
				//			}		
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

		carModelListBox.innerHTML = str;
		var loanPreWebview = void 0;
		if (self.processType === '02') {
			//补录阶段
			loanPreWebview = plus.webview.getWebviewById('loanInfo');
		} else {
			loanPreWebview = plus.webview.getWebviewById('loanPre');
		}
		mui('#carModelListBox').on('tap', '.df-list-item', function () {
			$(this).toggleClass('active').siblings().removeClass('active');
			carModelItemText = self.carModelList[$(this).index()].vehTrimname;
			carModelItem.text = self.carModelList[$(this).index()].vehTrimname;
			vehTrimid = $(this).attr('data-vehTrimid');
		});
		$('#submit').on('tap', function () {
			queryCarMessage(vehTrimid);
		});
	});
});