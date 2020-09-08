'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(function (require, exports, module) {
	mui.init();
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	var userRole = localStorage.getItem("sessionUserRole");
	var modifiFlag = false; // 是否修改过合同
	/* 
 	查询贷款管理各节点数量
  */
	function countAppLoanCompListNum(startDateFSerach, endDateFSerach, customFSerach, loanStatus) {
		var _url = mbank.getApiURL() + 'countAppLoanCompListNum.do';
		mbank.apiSend('post', _url, {
			startDateFSerach: startDateFSerach,
			endDateFSerach: endDateFSerach,
			aprFlag: loanStatus,
			customFSerach: customFSerach
		}, function (res) {
			var all = 0;
			res.iStatuList.forEach(function (item) {
				all += Number(item.iCount);
			});
			$('.mui-scroll a').eq(0).children('span').html('(' + all + ')');
			res.iStatuList.forEach(function (item, index) {
				if (item.description == '预审') {
					$('.mui-scroll a').eq(1).children('span').html('(' + item.iCount + ')');
				} else if (item.description == '申请') {
					$('.mui-scroll a').eq(2).children('span').html('(' + item.iCount + ')');
				} else if (item.description == '合同') {
					$('.mui-scroll a').eq(3).children('span').html('(' + item.iCount + ')');
				} else if (item.description == '放款') {
					$('.mui-scroll a').eq(4).children('span').html('(' + item.iCount + ')');
				}
			});
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});
	}
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();

		/* //安卓返回键事件
  var backButtonPress = 0;	//返回按钮	
  mui.back = function(event) {
  backButtonPress++;
  if(backButtonPress > 1) {
  plus.runtime.quit();
  } else {
  plus.nativeUI.toast('再按一次退出应用');
  }
  setTimeout(function() {
  backButtonPress = 0;
  }, 1000);
  return false;
  } */
		var startDateFSerach = self.startDateFSerach || ''; // 申请开始日期
		var endDateFSerach = self.endDateFSerach || ''; // 申请结束日期
		var lendingStartTime = self.lendingStartTime || '';
		var lendingEndTime = self.lendingEndTime || '';
		var customFSerach = self.customFSerach || ''; // 查询条件
		var loanStatus = self.loanStatus || ''; // 贷款状态
		/* 
  	查询贷款管理各节点数量
   */
		countAppLoanCompListNum(startDateFSerach, endDateFSerach, customFSerach, loanStatus);

		function lock() {
			// 锁定
			dropload.lock('down');
			dropload.noData();
		}
		function unlock() {
			// 解锁
			dropload.unlock();
			dropload.noData(false);
		}
		function isLock(condition) {
			if (!condition) {
				unlock();
			} else {
				lock();
			}
		}
		/* 
  	点击选项卡，重新切换数据
  */
		var index = 0,
		    pageNo = [{ num: 1, tabLoadEnd: false }, { num: 1, tabLoadEnd: false }, { num: 1, tabLoadEnd: false }, { num: 1, tabLoadEnd: false }, { num: 1, tabLoadEnd: false }];
		$('#sliderSegmentedControl').on('tap', 'a', function () {
			index = $(this).index();
			if ($(this).hasClass('mui-active')) return;
			$('.table-view').html('');
			$('.dropload-down').show();
			pageNo = [{ num: 1, tabLoadEnd: false }, { num: 1, tabLoadEnd: false }, { num: 1, tabLoadEnd: false }, { num: 1, tabLoadEnd: false }, { num: 1, tabLoadEnd: false }];
			switch (index) {
				case 0:
					isLock(pageNo[0].tabLoadEnd);
					break;
				case 1:
					isLock(pageNo[1].tabLoadEnd);
					break;
				case 2:
					isLock(pageNo[2].tabLoadEnd);
					break;
				case 3:
					isLock(pageNo[3].tabLoadEnd);
					break;
				case 4:
					isLock(pageNo[4].tabLoadEnd);
					break;
			}
			dropload.resetload(); // 重置
		});
		/* 
  	dropload 下拉加载更多
   */
		$('.dropload-down').remove();
		var dropload = $('#conSingList').dropload(_defineProperty({
			scrollArea: window,
			threshold: "50",
			domDown: {
				domNoData: '<div class="dropload-noData">无更多数据啦~</div>'
			},
			loadUpFn: function loadUpFn(me) {
				// 下拉加载
				switch (index) {
					case 0:
						queryAppLoanCompList('99', 0, 1, true, loanStatus, customFSerach, startDateFSerach, endDateFSerach);
						break;
					case 1:
						queryAppLoanCompList('01', 1, 1, true, loanStatus, customFSerach, startDateFSerach, endDateFSerach);
						break;
					case 2:
						queryAppLoanCompList('02', 2, 1, true, loanStatus, customFSerach, startDateFSerach, endDateFSerach);
						break;
					case 3:
						queryAppLoanCompList('03', 3, 1, true, loanStatus, customFSerach, startDateFSerach, endDateFSerach);
						break;
					case 4:
						queryAppLoanCompList('04', 4, 1, true, loanStatus, customFSerach, startDateFSerach, endDateFSerach);
						break;
				}
			},
			loadDownFn: function loadDownFn(me) {
				switch (index) {
					case 0:
						queryAppLoanCompList('99', 0, pageNo[0].num, false, loanStatus, customFSerach, startDateFSerach, endDateFSerach);
						break;
					case 1:
						queryAppLoanCompList('01', 1, pageNo[1].num, false, loanStatus, customFSerach, startDateFSerach, endDateFSerach);
						break;
					case 2:
						queryAppLoanCompList('02', 2, pageNo[2].num, false, loanStatus, customFSerach, startDateFSerach, endDateFSerach);
						break;
					case 3:
						queryAppLoanCompList('03', 3, pageNo[3].num, false, loanStatus, customFSerach, startDateFSerach, endDateFSerach);
						break;
					case 4:
						queryAppLoanCompList('04', 4, pageNo[4].num, false, loanStatus, customFSerach, startDateFSerach, endDateFSerach);
						break;
				}
			}
		}, 'threshold', 50));
		/* flag 
  	99 全部
  	01 预审
  	02 申请
  	03 合同
  	04 放款
  index tab 切换下标
  pageNum 页码
  aprFlag 外部状态
  serchInput 查询条件
  startDateFSerach 申请开始时间
  endDateFSerach 申请结束时间
  */
		function queryAppLoanCompList(flag, index, pageNum, isUp, outSts, serchInput, startDateFSerach, endDateFSerach) {
			var _url = mbank.getApiURL() + 'queryAppLoanCompList.do',
			    turnPageShowNum = 5;
			mbank.apiSend('post', _url, {
				flag: flag,
				startDateFSerach: startDateFSerach,
				aprFlag: outSts,
				customFSerach: serchInput,
				endDateFSerach: endDateFSerach,
				turnPageBeginPos: Number((pageNum - 1) * turnPageShowNum + 1),
				turnPageShowNum: turnPageShowNum
			}, function (res) {
				getListData(res, turnPageShowNum, pageNum, isUp);
			}, function (err) {
				$('.dropload-down').hide();
				dropload.lock();
				dropload.noData();
				dropload.resetload();
				mCheck.alert(err.em);
			});
		}
		function getListData(res, turnPageShowNum, pageNum, isUp) {
			var result = '';
			if (res.iApplyInfo.length === 0) {
				$('.dropload-down').html('<div class="dropload-noData">无更多数据啦~</div>');
				dropload.lock();
				dropload.noData();
				return;
			} else {
				res.iApplyInfo.forEach(function (item) {
					var pcOrApp = '<div class="jumpPage flex">',
					    onlyOneBtn = '',
					    // 只有一个按钮
					statusColor = '<span class="status fontColor font24" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>',
					    otherBtns = '',
					    applyCode = '<span id="' + item.contNo + '" class="applCde fontColor font26">' + mCheck.dataIsNull(item.applCde) + '</span>'; // 其他按钮
					if (item.outSts == '11' && item.isAutoLending === 'Y') {
						applyCode = '<span id="' + item.contNo + '" class="applCde fontColor green font26">' + mCheck.dataIsNull(item.applCde) + '</span>'; // 其他按钮
					}
					if (item.handlingChannel && item.handlingChannel === '02') {
						pcOrApp = '<div class="jumpPage flex pc">';
					}
					if (item.flag && item.flag !== '200') {
						if (item.outSts === '12' || item.flag === '020') {
							statusColor = '<span class="status fontColor font24 green" data-sts="' + item.outSts + '" data-value="' + item.flag + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						} else if (item.flag === '000' || item.flag === '100' || item.outSts === '13' || item.flag === '010') {
							statusColor = '<span class="status fontColor font24 blue" data-sts="' + item.outSts + '" data-value="' + item.flag + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						} else if (item.flag === '300' || item.flag === '400' || item.outSts === '14') {
							statusColor = '<span class="status fontColor font24 orange" data-sts="' + item.outSts + '" data-value="' + item.flag + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						}
						if (item.outSts == '25' || item.outSts == '26') {
							if (item.flag === '000' || item.flag === '100') {
								statusColor = '<span class="status fontColor font24 blue" data-sts="' + item.outSts + '" data-value="' + item.flag + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
							} else if (item.flag === '300' || item.flag === '400') {
								statusColor = '<span class="status fontColor font24 orange" data-sts="' + item.outSts + '" data-value="' + item.flag + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
							}
						}
						if (userRole !== '01') {
							// if (item.outSts == '08') {
							// 	onlyOneBtn = `<a class="btn fontColor font24 active" href="javascript:;">上传放款资料</a>`;
							// 	otherBtns = `<div class="last-div">
							// 		<a class="btn fontColor font24" href="javascript:;">发送邮件</a>
							// 		<a class="btn fontColor font24" href="javascript:;">补充申请资料</a>
							// 	</div>`;	
							// 	if (item.handlingChannel && item.handlingChannel === '01') {
							// 		if (userRole == '03') { 
							// 			otherBtns = `<div class="last-div">
							// 				<a class="btn fontColor font24" href="javascript:;">合同修改</a>
							// 				<a class="btn fontColor font24" href="javascript:;">发送邮件</a>
							// 				<a class="btn fontColor font24" href="javascript:;">补充申请资料</a>
							// 			</div>`;
							// 		} else  if (userRole == '02' || userRole == '04') {
							// 			otherBtns = `<div class="last-div">
							// 				<a class="btn fontColor font24" href="javascript:;">合同修改</a>
							// 				<a class="btn fontColor font24" href="javascript:;">发送邮件</a>
							// 				<a class="btn fontColor font24" href="javascript:;">补充申请资料</a>
							// 				<a class="btn fontColor font24" href="javascript:;">贷款信息修改</a>
							// 			</div>`;
							// 		}
							// 	}			
							// }
							if (item.flag === '000') {
								// 待生成 展示【合同生成】
								if (item.handlingChannel && item.handlingChannel === '01') {
									onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u5408\u540C\u751F\u6210</a>';
								}
								if (item.outSts !== '26') {
									otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t</div>';
									if (item.handlingChannel && item.handlingChannel === '01') {
										otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
									}									
								} else {
									if (item.handlingChannel && item.handlingChannel === '01') {
										otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
									}
								}
							} else if (item.flag === '010') {
								otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a></div>';
							} else if (item.flag === '100' || item.flag === '300' || item.flag === '400') {
								if (item.handlingChannel && item.handlingChannel === '01') {
									onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u7B7E\u7F72\u4E2D</a>';
								}
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
							} else if (item.outSts == '25') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
							}
						}
						if (userRole === '03') {
							if (item.flag === '100' || item.flag === '300' || item.flag === '400') {
								if (item.handlingChannel && item.handlingChannel === '01') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t</div>';
									if(item.flag=='300'||item.flag=='400'){
										otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
									}
								}
							}
						} else if (userRole === '02' || userRole === '04') {
							if (item.flag === '000' || item.flag === '010') {
								// 待生成、生成中
								if (item.handlingChannel && item.handlingChannel === '01') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t</div>';
									if((item.outSts=='08'||item.outSts=='Q80' ||item.outSts=='19')&& item.flag=='000'){
										otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
									}
									if (item.outSts == '25') {
										if (item.flag=='000') {
											otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
										} else {
											otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t\t\t</div>';
										}
									}
									if (item.outSts == '26') {
										if (item.handlingChannel && item.handlingChannel === '01') {
											otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a></div>';
											if (item.flag=='000') {
											    otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a></div>';
										    }
										}
									}
								}
							} else if (item.flag === '100' || item.flag === '300' || item.flag === '400') {
								if (item.handlingChannel && item.handlingChannel === '01') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t</div>';
									if((item.outSts=='08'||item.outSts=='Q80' ||item.outSts=='19')&& (item.flag=='300'||item.flag=='400')){
										otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
									}
									if (item.outSts == '25') {
										if (item.flag=='300'||item.flag=='400') {
											otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
										} else {
											otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t\t\t</div>';
										}
									}
									if (item.outSts == '26') {
										if (item.handlingChannel && item.handlingChannel === '01') {
											otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t\t\t</div>';
											if (item.flag=='300'||item.flag=='400') {
											    otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
										    }
										}
									}
								}
							}
							if (item.outSts == '26') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u8D44\u6599\u6838\u67E5\u6253\u56DE</a>';
							}
						}
					} else if (!item.flag || item.flag == '200') {
						// 预审
						if (item.outSts == '100' || item.outSts == '104' || item.outSts == '106') {
							statusColor = '<span class="status fontColor font24 green" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						} else if (item.outSts == '102' || item.outSts == '103' || item.outSts == '111') {
							// 111预审拒绝 
							statusColor = '<span class="status fontColor font24 orange" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						} else if (item.outSts == '101' || item.outSts == '105' || item.outSts == "Q01" || item.outSts === '112') {
							//  105预审处理中
							statusColor = '<span class="status fontColor font24 blue" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						}
						// 申请
						if (item.outSts == '60' || item.outSts == '00' || item.outSts == 'S02' || item.outSts == '12' || item.outSts == 'S05') {
							statusColor = '<span class="status fontColor font24 green" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						}
						if (item.outSts == 'S01' || item.outSts == '01' || item.outSts == '02' || item.outSts == '04' || item.outSts == '13' || item.outSts == '14' || item.outSts == '15' || item.outSts == '25' || item.outSts == '30' || item.outSts == '36' || item.outSts == '37') {
							statusColor = '<span class="status fontColor font24 blue" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						}
						if (item.outSts == 'S03' || item.outSts == 'S04' || item.outSts == '16' || item.outSts == '24' || item.outSts == '26' || item.outSts == '27' || item.outSts == '40') {
							statusColor = '<span class="status fontColor font24 orange" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						}
						// 放款
						if (item.outSts == '11' && item.isAutoLending === 'Y' || item.outSts == '12' || item.flag === '020') {
							statusColor = '<span class="status fontColor font24 green" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						} else if (item.outSts == '11' || item.outSts == '08' || item.outSts == '09' || item.outSts == '17' || item.outSts == '18' || item.outSts == '29' || item.outSts == 'Q01' || item.outSts == 'Q70') {
							statusColor = '<span class="status fontColor font24 blue" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						} else if (item.outSts == '19' || item.outSts == '31' || item.outSts == '40' || item.outSts == '20' || item.outSts === '14' || item.outSts == 'Q80' || item.outSts == '28' || item.outSts == '38') {
							statusColor = '<span class="status fontColor font24 orange" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						}
						// 预审
						if (userRole !== '01') {
							if (item.outSts == '100') {
								// 录入中 状态 预审录入  【编辑】、【删除】
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u7F16\u8F91</a>';
								otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u5220\u9664</a></div>';
							} else if (item.outSts == '101') {
								// 签署中 征信授权中 状态 征信授权中 【签署中】、【删除】
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u7B7E\u7F72\u4E2D</a>';
								//otherBtns = `<div class="last-div"><a class="btn fontColor font24" href="javascript:;">删除</a></div>`;
							} else if (item.outSts == '102' || item.outSts == '103') {
								// 签署中 征信授权中 状态 征信授权中 【签署中】、【删除】
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u7B7E\u7F72\u4E2D</a>';
								otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u5220\u9664</a></div>';
							} else if (item.outSts == '104') {
								// 签署中 征信授权成功 状态 待提交 ，【待提交】
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u5F85\u63D0\u4EA4</a>';
							} else if (item.outSts == '106') {
								// 已提交 预审准入 状态 预审准入 ，【预审结论】
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u9884\u5BA1\u7ED3\u8BBA</a>';
							} else if (item.outSts == '111') {
								// 预审拒绝
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u9884\u5BA1\u7ED3\u8BBA</a>';
							}
						}
						// 补录
						if (userRole !== '01') {
							if (item.outSts == '60' || item.outSts == '00') {
								// 申请录入
								if (item.handlingChannel && item.handlingChannel === '01') {
									onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u7F16\u8F91</a>';
								}
							} else if (item.outSts == 'S01' || item.outSts == 'S03' || item.outSts == 'S04') {
								// 签署中 签署超时 签署失败
								if (item.handlingChannel && item.handlingChannel === '01') {
									onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u7B7E\u7F72\u4E2D</a>';
								}
							} else if (item.outSts == 'S02' || item.outSts == 'S05') {
								// 签署成功
								if (item.handlingChannel && item.handlingChannel === '01') {
									onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u5F85\u63D0\u4EA4</a>';
								}
							} else if (item.outSts == '02' || item.outSts == '13' || item.outSts == '04' || item.outSts == '14' || item.outSts == '15' || item.outSts == '16') {
								// 审查处理中、修改处理中
								otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a></div>';
							} else if (item.outSts == '25') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
							}
						}
						if (userRole === '03') {
							// 销售顾问
							if (item.outSts == '40') {
								if (item.handlingChannel && item.handlingChannel === '01') {
									onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u4FE1\u8D37\u6253\u56DE</a>';
								}
							}
						} else if (userRole === '02' || userRole === '04') {
							// 02 一般信贷员 04 渠道信贷员
							if (item.outSts == '30') {
								// 销售顾问提交的申请
								if (item.handlingChannel && item.handlingChannel === '01') {
									onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u590D\u6838</a>';
								}
							} else if (item.outSts == '24') {
								if (item.handlingChannel && item.handlingChannel === '01') {
									onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u81EA\u52A8\u6253\u56DE</a>';
								}
							} else if (item.outSts == '27') {
								if (item.handlingChannel && item.handlingChannel === '01') {
									onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u5BA1\u67E5\u6253\u56DE</a>';
								}
							} else if (item.outSts == '26') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u8D44\u6599\u6838\u67E5\u6253\u56DE</a>';
								if (item.handlingChannel && item.handlingChannel === '01') {
									if (item.flag == '200') {
										otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t\t</div>';
									} else {
										otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a></div>';
									}
								}
							} else if (item.outSts == '01') {
								if (item.handlingChannel && item.handlingChannel === '01') {
									onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u7F16\u8F91</a>';
								}
							} else if (item.outSts == '12') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
								if (item.handlingChannel && item.handlingChannel === '01') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t</div>';
								}
							} else if (item.outSts == '25') {
								if (item.handlingChannel && item.handlingChannel === '01') {
									if (item.flag == '200') {
										otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t\t\t</div>';
									} else {
										otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t\t\t</div>';
									}
								}
							}
						}
						// 放款
						if (userRole !== '01') {
							if (item.outSts == '08' && item.nodeFlag == 'DF_SCFKZL') {
								// 待放款 ===待上传放款资料未打印合同、上传放款资料已打印的合同、待上传放款资料已签署的合同		
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u4E0A\u4F20\u653E\u6B3E\u8D44\u6599</a>';
							}
							if (item.outSts == '08' || item.outSts == '19' || item.outSts == 'Q80' || item.outSts == '31') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
								if (userRole === '03') {
									if (item.outSts == '19' || item.outSts == '31') {
										otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t</div>';
									}
								}
							} else if (item.outSts == '17' || item.outSts == 'Q70' || item.outSts == '09' || item.outSts == '18' || item.outSts == '29' || item.outSts == '11' || item.outSts == '20' || item.outSts == '38') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
							}
						}
						if (userRole === '03') {
							// 销售顾问
							if (item.outSts == 'Q80') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u590D\u6838\u6253\u56DE</a>';
							}
							if (item.handlingChannel === '01') {
								// app
								if (item.outSts == '08' || item.outSts == 'Q80') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u5408\u540C\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t</div>';
								} else if (item.outSts == '19' || item.outSts == 'Q70' || item.outSts == '31') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u5408\u540C\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t</div>';
								} else if (item.outSts == '17' || item.outSts == '09' || item.outSts == '18' || item.outSts == '29' || item.outSts == '11' || item.outSts == '20' || item.outSts == '38') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t</div>';
								}
							}
						} else if (userRole === '02' || userRole === '04') {
							if (item.outSts == '19') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u91CD\u63D0\u653E\u6B3E\u4EFB\u52A1</a>';
							} else if (item.outSts == '31') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u653E\u6B3E\u81EA\u52A8\u6253\u56DE</a>';
							} else if (item.outSts == 'Q70') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u590D\u6838</a>';
							}
							if (item.handlingChannel === '01') {
								// app
								if (item.outSts == '08' || item.outSts == '19' || item.outSts == 'Q80' || item.outSts == '31') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u5408\u540C\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t</div>';
								} else if (item.outSts == 'Q70') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u5408\u540C\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t</div>';
								} else if (item.outSts == '17' || item.outSts == '09' || item.outSts == '18' || item.outSts == '20') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t\t</div>';
								} else if (item.outSts == '29' || item.outSts == '11' || item.outSts == '38') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t</div>';
								}
							}
						}
					}
					if (item.handlingChannel === '02') {
						// 放款
						if (item.outSts == '11' && item.isAutoLending === 'Y' || item.outSts == '12' || item.flag === '020') {
							statusColor = '<span class="status fontColor font24 green" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						} else if (item.outSts == '11' || item.outSts == '08' || item.outSts == '09' || item.outSts == '17' || item.outSts == '18' || item.outSts == '29' || item.outSts == 'Q01' || item.outSts == 'Q70') {
							statusColor = '<span class="status fontColor font24 blue" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						} else if (item.outSts == '19' || item.outSts == '31' || item.outSts == '40' || item.outSts == '20' || item.outSts === '14' || item.outSts == 'Q80' || item.outSts == '28' || item.outSts == '38') {
							statusColor = '<span class="status fontColor font24 orange" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
						}
						// 按钮
						if (userRole !== '01') {
							if (item.outSts == '08' && item.nodeFlag == 'DF_SCFKZL') {
								// 待放款 ===待上传放款资料未打印合同、上传放款资料已打印的合同、待上传放款资料已签署的合同		
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u4E0A\u4F20\u653E\u6B3E\u8D44\u6599</a>';
							}
							if (item.outSts == '08' || item.outSts == '19' || item.outSts == 'Q80' || item.outSts == '31') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
								if (userRole === '03') {
									if (item.outSts == '19' || item.outSts == '31') {
										otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t</div>';
									}
								}
							} else if (item.outSts == '17' || item.outSts == 'Q70' || item.outSts == '09' || item.outSts == '18' || item.outSts == '29' || item.outSts == '11' || item.outSts == '20' || item.outSts == '38') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
							}
						}
						if (userRole === '03') {
							// 销售顾问
							if (item.outSts == 'Q80') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u590D\u6838\u6253\u56DE</a>';
							}
						} else if (userRole === '02' || userRole === '04') {
							if (item.outSts == '19') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u91CD\u63D0\u653E\u6B3E\u4EFB\u52A1</a>';
							} else if (item.outSts == '31') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u653E\u6B3E\u81EA\u52A8\u6253\u56DE</a>';
							} else if (item.outSts == 'Q70') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u590D\u6838</a>';
							}
						}
					}
					var custName = '<span class="name">' + mCheck.dataIsNull(item.custName) + '</span>';
					if (item.custName && item.custName.length > 3) custName = '<span class="name min-name">' + mCheck.dataIsNull(item.custName) + '</span>';
					result += '\n\t\t\t\t\t\t<li class="table-view-cell" data-value="' + item.handlingChannel + '">\n\t\t\t\t\t\t\t<div class="flex">\n\t\t\t\t\t\t\t\t' + applyCode + '\n\t\t\t\t\t\t\t\t<time class="applTime fontColor font26">' + mCheck.dataIsNull(item.lastChgDt) + '</time>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t' + pcOrApp + '\n\t\t\t\t\t\t\t\t' + custName + '\n\t\t\t\t\t\t\t\t<div class="price">\n\t\t\t\t\t\t\t\t\t<p>\u8D37\u6B3E\u91D1\u989D <small> ' + mCheck.dataIsNull(item.applyAmt) + ' </small> \u5143</p>\n\t\t\t\t\t\t\t\t\t<p>' + mCheck.dataIsNull(item.goodsModel) + '</p>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class="icon_Go">\n\t\t\t\t\t\t\t\t\t<i class="iconSymbol icon__go"></i>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class="flex">\n\t\t\t\t\t\t\t\t<p class="fontColor font24 more">\n\t\t\t\t\t\t\t\t\t<i class="iconSymbol icon__dorp"></i>  \u66F4\u591A\u64CD\u4F5C\n\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t' + onlyOneBtn + '\n\t\t\t\t\t\t\t\t' + statusColor + '\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t' + otherBtns + '\n\t\t\t\t\t\t</li>\n\t\t\t\t\t';
				});
				setTimeout(function () {
					if (pageNum == 1) $('.table-view').html('');
					$('.table-view').append(result);
					dropload.resetload();
					if (isUp) {
						if (Number(pageNum - 1) * turnPageShowNum + turnPageShowNum < res.turnPageTotalNum) {
							pageNo[0].num = 2;
							pageNo[1].num = 2;
							pageNo[2].num = 2;
							pageNo[3].num = 2;
						}
						dropload.unlock();
						dropload.noData(false);
					}
				}, 300);
				/* if(res.iApplyInfo.length < turnPageShowNum){ */
				if (Number(pageNum - 1) * turnPageShowNum + turnPageShowNum >= res.turnPageTotalNum) {
					dropload.lock();
					dropload.noData();
					return;
				}
				if (!isUp) {
					if (index == 0) pageNo[0].num++;
					if (index == 1) pageNo[1].num++;
					if (index == 2) pageNo[2].num++;
					if (index == 3) pageNo[3].num++;
					if (index == 4) pageNo[4].num++;
				}
			}
		}
		/* 
  	点击按钮
   */
		$('.table-view').on('tap', '.btn', function () {
			$('#waitingBox').show();
			var _this = this,
			    applCde = $(_this).parents('li').find('.applCde').text(),
			    // 申请编码
			contNo = $(_this).parents('li').find('.applCde').attr('id'),
			    // 合同编号
			status = $(_this).parents('li').find('.status').attr('data-value'),
			    status1 = $(_this).parents('li').find('.status').attr('data-sts'),
			    node = $(_this).parents('li').find('.status').attr('data-node'),
			    //节点标识
			handlingChannel = $(_this).parents('li').attr('data-value'); //办理渠道;  
			localStorage.setItem('outSts', status1);
			localStorage.setItem('nodeSign', node);
			localStorage.setItem('backFlag', '03');
			localStorage.setItem('applCde', applCde);
			localStorage.removeItem('typeFlagList');
			if ($(_this).text() === '编辑' && status == '100') {
				// 预审信息录入界面
				mData.editLock(applCde, node, status1, '999','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../PreHearing/NewPre/loanPre.html', 'loanPre', 'slide-in-right', {
							'applCde': applCde,
							'type': 'yushen',
							'backFlag': '02',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '删除') {
				mData.editLock(applCde, node, status1, '999','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mui.confirm('请确认是否删除该笔预审？', ' ', ['取消', '确认'], function (e) {
							if (e.index === 1) {
								var _url = mbank.getApiURL() + 'deleteDealerPreTrial.do';
								mbank.apiSend('post', _url, {
									applCde: applCde
								}, function (res) {
									$(_this).parents('li').remove();
									countLoanToDoListNum();
								},function(err){
									mCheck.callPortFailed(err.ec, err.em,"#waitingBox");
								});
							}
						}, 'div');
					}
				});
			} else if ($(_this).text() === '签署中' && status == '101' || $(_this).text() === '签署中' && status == '102' || $(_this).text() === '签署中' && status == '103') {
				// 签署页面
				mData.editLock(applCde, node, status1, '999','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../CommonPage/signIng.html', 'signIng', 'slide-in-right', {
							'applCde': applCde,
							'type': 'yushen',
							'backFlag': '02',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '待提交' && status == '104') {
				// 签署页面
				mData.editLock(applCde, node, status1, '999','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../CommonPage/signIng.html', 'signIng', 'slide-in-right', {
							'applCde': applCde,
							'type': 'yushen',
							'backFlag': '02',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '预审结论') {
				// 签署页面
				mData.editLock(applCde, node, status1, '999','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../CommonPage/preResult.html', 'preResult', 'slide-in-right', {
							'applCde': applCde,
							'type': 'yushen',
							'backFlag': '02',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '编辑' && status == '00' || $(_this).text() === '编辑' && status == '60' || $(_this).text() === '编辑' && status == '01') {
				// 预审信息补录界面
				mData.editLock(applCde, node, status1, '','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Application/loanInfo.html', 'loanInfo', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node,
							'backFlag': '02'
						});
					}
				});
			} else if ($(_this).text() === '签署中' && status == 'S01' || $(_this).text() === '签署中' && status == 'S03' || $(_this).text() === '签署中' && status == 'S04') {
				// 签署界面
				mData.editLock(applCde, node, status1, '','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../CommonPage/signIng.html', 'signIng', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node,
							'backFlag': '02'
						});
					}
				});
			} else if ($(_this).text() === '待提交' && status == 'S02') {
				// 签署界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../CommonPage/signIng.html', 'signIng', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node,
							'backFlag': '02'
						});
					}
				});
			} else if ($(_this).text() === '待提交' && status == 'S05') {
				//影像及留言界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/imageList.html', 'imageList', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node,
							'backFlag': '02'
						});
					}
				});
			} else if ($(_this).text() === '资料核查打回') {
				// 影像及留言界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/imageList5.html', 'imageList5', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '信贷打回') {
				// 影像及留言界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/imageList.html', 'imageList', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node,
							'backFlag': '02'
						});
					}
				});
			} else if ($(_this).text() === '自动打回') {
				// 影像及留言界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/imageList.html', 'imageList', 'slide-in-right', {
							applCde: applCde,
							'outSts': status,
							'nodeSign': node,
							type: 'bulu',
							'backFlag': '02'
						});
					}
				});
			} else if ($(_this).text() === '审查打回') {
				// 影像及留言界面打回界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/imageList.html', 'imageList', 'slide-in-right', {
							applCde: applCde,
							'outSts': status,
							'nodeSign': node,
							type: 'bulu',
							'backFlag': '02'
						});
					}
				});
			} else if ($(_this).text() === '补充申请资料') {
				localStorage.setItem('typeFlag', '02');
				localStorage.setItem('typeFlagList', '02');
				mbank.openWindowByLoad('../Images/imageList2.html', 'imageList2', 'slide-in-right');
			} else if ($(_this).text() === '复核' && status1 == '30') {
				// 预审信息补录界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.setItem('typeFlagList', '01');
						mbank.openWindowByLoad('../Application/loanInfo.html', 'loanInfo', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node,
							'backFlag': '02'
						});
					}
				});
				
			} else if ($(_this).text() === '合同生成') {
				// 跳转到 合同输入信息 页面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../ConSigning/conSignInfo.html', 'conSignInfo', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo,
							modifyFlag: 'N',
							'outSts': status,
							'nodeSign': node,
							fromPage: 'homePage'
						});
					}
				});
			} else if ($(_this).text() === '补充申请资料') {
				// 
				localStorage.setItem('typeFlag', '03');
				localStorage.setItem('typeFlagList', '02');
				mbank.openWindowByLoad('../Images/imageList2.html', 'imageList2', 'slide-in-right');
			} else if ($(_this).text() === '签署中' && status == '100' || $(_this).text() === '签署中' && status == '300' || $(_this).text() === '签署中' && status == '400') {
				// 跳转到 合同签署界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../ConSigning/conSigning.html', 'conSigning', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo, // 合同编号
							'outSts': status,
							'nodeSign': node,
							fromPage: 'homePage'
						});
					}
				});
			} else if ($(_this).text() === '发送邮件') {
				// 跳转到合同信息查看界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../ConSigning/conSignInfo.html', 'conSignInfo', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo,
							sendMail: 'Y',
							'outSts': status,
							'nodeSign': node,
							fromPage: 'homePage'
						});
					}
				});
			} else if ($(_this).text() === '合同修改') {
				// 先调用废纸合同接口，再跳转
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mui.confirm('合同修改会作废已存在的电子签，请确认是否要修改合同内容', ' ', ['取消', '确认'], function (e) {
							if (e.index == 1) {
								mbank.openWindowByLoad('../ConSigning/conSignInfo.html', 'conSignInfo', 'slide-in-right', {
									applCde: applCde,
									contNo: contNo,
									'outSts': status,
									'nodeSign': node,
									modifyFlag: 'Y',
									fromPage: 'homePage'
								});
							}
						}, 'div');
					}
				});
			} else if ($(_this).text() === '贷款信息修改') {
				// 
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '03');
						localStorage.setItem('typeFlagList', '04');
						mbank.openWindowByLoad('../Images/imageList3.html', 'imageList3', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '上传放款资料') {
				// 放款环节上传放款资料
				if (handlingChannel == '01') {
					if (status == '08') {
						// 合同签署成功
						mData.editLock(applCde, node, status1,'','').then(function(dat){
							if(dat=='N'){
								$('#waitingBox').hide();
								return;
							}else{
								$('#waitingBox').hide();
								localStorage.setItem('typeFlag', '04');
								localStorage.removeItem('typeFlagList');
								mbank.openWindowByLoad('../Images/loanData.html', 'loanData', 'slide-in-right', {
									applCde: applCde,
									type: 'scfkzl',
									'outSts': status,
									'nodeSign': node
								});
							}
						});
					}
				} else if (handlingChannel == '02') {
					// pc
					var _url = mbank.getApiURL() + "acInfCount.do";
					var _params = { applCde: applCde };
					mbank.apiSend('get', _url, _params, function (data) {
						if (data.iCount == "0") {
							$('#waitingBox').hide();
							mCheck.toast("请先到pc端打印合同信息");
							mData.unLock(applCde, node, status1, '01').then(function(dat){
								if(dat=='Y'){
									return;
								}
							});
						} else {
							mData.editLock(applCde, node, status1,'','').then(function(dat){
								if(dat=='N'){
									$('#waitingBox').hide();
									return;
								}else{
									$('#waitingBox').hide();
									localStorage.setItem('typeFlag', '04');
									localStorage.removeItem('typeFlagList');
									mbank.openWindowByLoad('../Images/loanData.html', 'loanData', 'slide-in-right', {
										applCde: applCde,
										type: 'scfkzl',
										'outSts': status,
										'nodeSign': node
									});
								}
							});
						}
					}, null, true);
				}
			} else if ($(_this).text() === '重提放款任务' || $(_this).text() === '放款自动打回') {
				if (handlingChannel == '01') {
					localStorage.setItem('typeFlag', '04');
					localStorage.removeItem('typeFlagList');
					mData.editLock(applCde, node, status1,'','').then(function(dat){
						if(dat=='N'){
							$('#waitingBox').hide();
							return;
						}else{
							$('#waitingBox').hide();
							mbank.openWindowByLoad('../Images/loanData.html', 'loanData', 'slide-in-right', {
								applCde: applCde,
								'outSts': status,
								'nodeSign': node
							});
						}
					});
				} else if (handlingChannel == '02') {
					var _url2 = mbank.getApiURL() + "acInfCount.do";
					var _params2 = { applCde: applCde };
					mbank.apiSend('get', _url2, _params2, function (data) {
						if (data.iCount == "0") {
							$('#waitingBox').hide();
							mCheck.toast("请先到pc端打印合同信息");
						} else {
							mData.editLock(applCde, node, status1,'','').then(function(dat){
								if(dat=='N'){
									$('#waitingBox').hide();
									return;
								}else{
									$('#waitingBox').hide();
									localStorage.setItem('typeFlag', '04');
									localStorage.removeItem('typeFlagList');
									mbank.openWindowByLoad('../Images/loanData.html', 'loanData', 'slide-in-right', {
										applCde: applCde,
										'outSts': status,
										'nodeSign': node
									});
								}
							});
						}
					}, null, true);
				}
			} else if ($(_this).text() === '复核打回') {
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '04');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/loanData.html', 'loanData', 'slide-in-right', {
							applCde: applCde,
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '补充放款资料') {
				// 预审信息补录打回界面
				localStorage.setItem('typeFlag', '04');
				localStorage.setItem('typeFlagList', '03');
				mbank.openWindowByLoad('../Images/loanData2.html', 'loanData2', 'slide-in-right');
			} else if ($(_this).text() === '复核' && status1 == 'Q70') {
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '04');
						localStorage.setItem('typeFlagList', '01');
						mbank.openWindowByLoad('../Images/loanData.html', 'loanData', 'slide-in-right', {
							applCde: applCde,
							type: 'fuhe',
							'outSts': status,
							'nodeSign': node,
							'backFlag': '02'
						});
					}
				});
			} else if ($(_this).text() === '贷款信息修改') {
				// 
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '04');
						localStorage.setItem('typeFlagList', '04');
						mbank.openWindowByLoad('../Images/imageList3.html', 'imageList3', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '贷款信息修改通知') {
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mui.confirm('修改任意信息后需重新打印核准函，确定提交？', ' ', ['取消', '确认'], function (e) {
							if (e.index === 1) {
								var _url = mbank.getApiURL() + 'AddOrUpdateDoc.do';
								mbank.apiSend('post', _url, {
									"applCde": applCde,
									"temp": 'tongzhi'
								}, function (res) {
									mui.alert('贷款信息修改通知成功', '提示', '确定', function (e) {
										$(_this).hide();
									}, 'div');
								},function(err){
									mCheck.callPortFailed(err.ec, err.em,"#waitingBox");
								});
							}
						}, 'div');
					}
				});
			}
		});
		/* 
  	点击【>】跳转到 贷款详情（预审）页面 
  */
		$('.table-view').on('tap', '.jumpPage', function () {
			// 点击箭头进入贷款详情页面
			localStorage.setItem('applCde', $(this).parent().find('.applCde').text());
			localStorage.setItem('backFlag', '03');
			mbank.openWindowByLoad('../ConSigning/conSignDetail.html', 'conSignDetail', 'slide-in-right', {
				applCde: $(this).parent().find('.applCde').text(),
				outStatus: $(this).parent('li').find('.status').attr('data-value'),
				handlingChannel: $(this).parent().attr('data-value'),
				loanPreList: true // 用于判断贷款详情显示哪个环节
			});
		});
		mCheck.isOneBtnLength('.table-view-cell', '.btn', '.more');
		mCheck.isOneBtnToggle('.table-view', '.more', '.btn');
		$('#back').on('tap', function () {
			mbank.openWindowByLoad('loanManagement.html', 'loanManagement', 'slide-in-left');
		});
		mui.back = function () {
			mbank.openWindowByLoad('loanManagement.html', 'loanManagement', 'slide-in-left');
		};
		/* plus.key.addEventListener('backbutton', function () {
  	
  }, false); */
	});
});