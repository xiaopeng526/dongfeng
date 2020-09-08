'use strict';

define(function (require, exports, module) {
	mui.init();
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	mbank.addVconsole();
	var mData = require('../../core/requestData');
	var userRole = localStorage.getItem("sessionUserRole");
	var searchValue = '';
	/* 
 	查询放款代办各节点数量
  */
	function countAppLendingListNum() {
		var _url = mbank.getApiURL() + 'countAppLendingListNum.do';
		mbank.apiSend('post', _url, {}, function (res) {
			var all = 0;
			res.iStatuList.forEach(function (item) {
				all += Number(item.iCount);
			});
			$('.mui-scroll a').eq(0).children('span').html('(' + all + ')');
			res.iStatuList.forEach(function (item, index) {
				if (item.description == '上传放款') {
					$('.mui-scroll a').eq(1).children('span').html('(' + item.iCount + ')');
				} else if (item.description == '放款打回') {
					$('.mui-scroll a').eq(2).children('span').html('(' + item.iCount + ')');
				} else if (item.description == '处理中') {
					$('.mui-scroll a').eq(3).children('span').html('(' + item.iCount + ')');
				} else if (item.description == '放款完成') {
					$('.mui-scroll a').eq(4).children('span').html('(' + item.iCount + ')');
				}
			});
		},function(err){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});
	}
	/* 
 	pc合同是否已签署
  */
	function acInfCount(applCde, status, node) {
		var _url = mbank.getApiURL() + 'acInfCount.do';
		mbank.apiSend('post', _url, {
			applCde: applCde
		}, function (res) {
			if (res.iCount == '0') {
				mData.unLock(applCde, node, status, '01').then(function(dat){
					if(dat=='Y'){
						return;
					}
				});
				mui.alert('请先到PC端打印合同', '提示', '确定', function (e) {}, 'div');
				
			} else {
				mbank.openWindowByLoad('../../Images/loanData.html', 'loanData', 'slide-in-right', {
					applCde: applCde,
					type: 'scfkzl',
					'outSts': status,
					'nodeSign': node
				});
			}
		},function(err){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});
	}
	/* 
 	贷款信息修改通知接口
  */
	function mofidyNotice(btn, applCde) {
		var _url = mbank.getApiURL() + 'AddOrUpdateDoc.do';
		mbank.apiSend('post', _url, {
			"applCde": applCde,
			"temp": 'tongzhi'
		}, function (res) {
			mui.alert('贷款信息修改通知成功', '提示', '确定', function (e) {
				$(btn).hide();
			}, 'div');
		},function(err){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		});
	}
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mbank.isImmersed();
		/* 
  	查询放款代办各节点数量
   */
		countAppLendingListNum();

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
		var dropload = $('#conSingList').dropload({
			scrollArea: window,
			domDown: {
				domNoData: '<div class="dropload-noData">无更多数据啦~~</div>'
			},
			loadUpFn: function loadUpFn(me) {
				// 下拉加载
				switch (index) {
					case 0:
						queryAppLendingList('99', 0, 1, true, searchValue);
						break;
					case 1:
						queryAppLendingList('01', 1, 1, true, searchValue);
						break;
					case 2:
						queryAppLendingList('02', 2, 1, true, searchValue);
						break;
					case 3:
						queryAppLendingList('03', 3, 1, true, searchValue);
						break;
					case 4:
						queryAppLendingList('04', 4, 1, true, searchValue);
						break;
				}
			},
			loadDownFn: function loadDownFn(me) {
				switch (index) {
					case 0:
						queryAppLendingList('99', 0, pageNo[0].num, false, searchValue);
						break;
					case 1:
						queryAppLendingList('01', 1, pageNo[1].num, false, searchValue);
						break;
					case 2:
						queryAppLendingList('02', 2, pageNo[2].num, false, searchValue);
						break;
					case 3:
						queryAppLendingList('03', 3, pageNo[3].num, false, searchValue);
						break;
					case 4:
						queryAppLendingList('04', 4, pageNo[4].num, false, searchValue);
						break;
				}
			},
			threshold: 50
		});
		/* 
  aprFlag
  	01 上传放款
  	02 放款打回
  	03 处理中
  	04 放款完成
  	99 全  部
  index tab 切换下标
  pageNum 页码
  customFSerach 查询条件
  */
		function queryAppLendingList(aprFlag, index, pageNum, isUp, customFSerach) {
			var _url = mbank.getApiURL() + 'queryAppLendingList.do',
			    turnPageShowNum = 5;
			mbank.apiSend('post', _url, {
				customFSerach: customFSerach,
				aprFlag: aprFlag,
				turnPageBeginPos: Number((pageNum - 1) * turnPageShowNum + 1),
				turnPageShowNum: turnPageShowNum
			}, function (res) {
				var iApplyInfo = res.iApplyInfo;
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
					statusColor = '<span class="status fontColor font24"  data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>',
					    otherBtns = '',
					    applyCode = '<span id="' + item.contNo + '" class="applCde fontColor font26">' + mCheck.dataIsNull(item.applCde) + '</span>'; // 其他按钮
					if (item.outSts == '11' && item.isAutoLending === 'Y') {
						applyCode = '<span id="' + item.contNo + '" class="applCde fontColor green font26">' + mCheck.dataIsNull(item.applCde) + '</span>'; // 其他按钮
					}
					// 办理渠道
					if (item.handlingChannel === '02') {
						pcOrApp = '<div class="jumpPage flex pc">';
					}
					// 状态
					if (item.outSts == '11' && item.isAutoLending === 'Y' || item.outSts == '12') {
						statusColor = '<span class="status fontColor font24 green" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					} else if (item.outSts == '11' || item.outSts == '08' || item.outSts == '09' || item.outSts == '17' || item.outSts == '18' || item.outSts == '29' || item.outSts == 'Q01' || item.outSts == 'Q70') {
						statusColor = '<span class="status fontColor font24 blue" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					} else if (item.outSts == '19' || item.outSts == '31' || item.outSts == '40' || item.outSts == '20' || item.outSts === '14' || item.outSts == 'Q80' || item.outSts == '28' || item.outSts == '38') {
						statusColor = '<span class="status fontColor font24 orange" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					}
					// 按钮
					if (userRole !== '01') {
						if (item.outSts == '08' && item.nodeFlag == 'DF_SCFKZL') {
							// 待放款 ===待上传放款资料未打印合同、上传放款资料已打印的合同、待上传放款资料已签署的合同		
							onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u4E0A\u4F20\u653E\u6B3E\u8D44\u6599</a>';
						}
						if (item.outSts == '08' || item.outSts == '19' || item.outSts == 'Q80' || item.outSts == '31') {
							otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t</div>';
							if (userRole === '03') {
								if (item.outSts == '19' || item.outSts == '31') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t</div>';
								}
							}
						} else if (item.outSts == '17' || item.outSts == 'Q70' || item.outSts == '09' || item.outSts == '18' || item.outSts == '29' || item.outSts == '11' || item.outSts == '20' || item.outSts == '38') {
							otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t</div>';
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
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u5408\u540C\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
							} else if (item.outSts == '19' || item.outSts == 'Q70' || item.outSts == '31') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u5408\u540C\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
							} else if (item.outSts == '17' || item.outSts == '09' || item.outSts == '18' || item.outSts == '29' || item.outSts == '11' || item.outSts == '20' || item.outSts == '38') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
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
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u5408\u540C\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t</div>';
							} else if (item.outSts == 'Q70') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u5408\u540C\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t</div>';
							} else if (item.outSts == '17' || item.outSts == '09' || item.outSts == '18' || item.outSts == '20') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t</div>';
							} else if (item.outSts == '29' || item.outSts == '11' || item.outSts == '38') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u653E\u6B3E\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
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
							pageNo[4].num = 2;
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
			    handlingChannel = $(_this).parents('li').attr('data-value'),
			    status = $(_this).parents('li').find('.status').attr('data-value'),
			    // 外部状态码
			applCde = $(_this).parents('li').find('.applCde').text(),
			    // 申请编码
			contNo = $(_this).parents('li').find('.applCde').attr('id'),
			    // 合同编号
			node = $(_this).parents('li').find('.status').attr('data-node');
			localStorage.setItem('outSts', status);
			localStorage.setItem('nodeSign', node);
			localStorage.setItem('backFlag', '02');
			localStorage.setItem('applCde', applCde);
			localStorage.removeItem('typeFlagList');
			if ($(_this).text() === '上传放款资料') {
				// 预审信息补录界面
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						if (handlingChannel == '01') {
							// app
							$('#waitingBox').hide();
							localStorage.setItem('typeFlag', '04');
							localStorage.removeItem('typeFlagList');
							mbank.openWindowByLoad('../../Images/loanData.html', 'loanData', 'slide-in-right', {
								applCde: applCde,
								type: 'scfkzl',
								'outSts': status,
								'nodeSign': node
							});
						} else if (handlingChannel == '02') {
							// pc
							$('#waitingBox').hide();
							acInfCount(applCde, status, node);
						}
					}
				});
			} else if ($(_this).text() === '重提放款任务' || $(_this).text() === '放款自动打回') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						if (handlingChannel == '01') {
							// app
							$('#waitingBox').hide();
							localStorage.setItem('typeFlag', '04');
							localStorage.removeItem('typeFlagList');
							mbank.openWindowByLoad('../../Images/loanData.html', 'loanData', 'slide-in-right', {
								applCde: applCde,
								'outSts': status,
								'nodeSign': node
							});
						} else if (handlingChannel == '02') {
							// pc
							$('#waitingBox').hide();
							acInfCount(applCde, status, node);
						}
					}
				});
			} else if ($(_this).text() === '复核打回') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '04');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../Images/loanData.html', 'loanData', 'slide-in-right', {
							applCde: applCde
						});
					}
				});
			} else if ($(_this).text() === '发送邮件') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '04');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../ConSigning/conSignInfo.html', 'conSignInfo', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo,
							sendMail: 'Y',
							fromPage: 'lendingList',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '补充申请资料') {
				localStorage.setItem('typeFlag', '04');
				localStorage.setItem('typeFlagList', '02');
				mbank.openWindowByLoad('../../Images/imageList2.html', 'imageList2', 'slide-in-right');
			} else if ($(_this).text() === '合同修改') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mui.confirm('合同修改会作废已存在的电子签，请确认是否要修改合同内容', ' ', ['取消', '确认'], function (e) {
							if (e.index == 1) {
								localStorage.setItem('typeFlag', '04');
								mbank.openWindowByLoad('../../ConSigning/conSignInfo.html', 'conSignInfo', 'slide-in-right', {
									applCde: applCde,
									contNo: contNo,
									modifyFlag: 'Y',
									fromPage: 'lendingList'
								});
							}
						}, 'div');
					}
				});
			} else if ($(_this).text() === '补充放款资料') {
				localStorage.setItem('typeFlag', '04');
				localStorage.setItem('typeFlagList', '03');
				mbank.openWindowByLoad('../../Images/loanData2.html', 'loanData2', 'slide-in-right');
			} else if ($(_this).text() === '复核') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '04');
						localStorage.setItem('typeFlagList', '01');
						mbank.openWindowByLoad('../../Images/loanData.html', 'loanData', 'slide-in-right', {
							applCde: applCde,
							type: 'fuhe'
						});
					}
				});
			} else if ($(_this).text() === '贷款信息修改') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '04');
						localStorage.setItem('typeFlagList', '04');
						mbank.openWindowByLoad('../../Images/imageList3.html', 'imageList3', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '贷款信息修改通知') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mui.confirm('修改任意信息后需重新打印核准函，确定提交？', ' ', ['取消', '确认'], function (e) {
							if (e.index === 1) mofidyNotice(_this, applCde);
						}, 'div');
					}
				});
			}
		});
		/* 
  	点击【>】跳转到 贷款详情（申请）页面 
  */
		$('.table-view').on('tap', '.jumpPage', function () {
			// 点击箭头进入贷款详情页面
			localStorage.setItem('applCde', $(this).parent().find('.applCde').text());
			localStorage.setItem('backFlag', '02');
			mbank.openWindowByLoad('../../ConSigning/conSignDetail.html', 'conSignDetail', 'slide-in-right', {
				applCde: $(this).parent().find('.applCde').text(),
				outStatus: $(this).parent('li').find('.status').attr('data-value'),
				handlingChannel: $(this).parent().attr('data-value')
			});
		});
		mCheck.isOneBtnLength('.table-view-cell', '.btn', '.more');
		mCheck.isOneBtnToggle('.table-view', '.more', '.btn');
		/* 
  	点击查询按钮，页面跳转
   */
		$('#searchIcon').on('tap', function () {
			mbank.openWindowByLoad('lendingListSearch.html', 'lendingListSearch', 'slide-in-right');
		});
		/* 
  	搜索查询
   */
		$('#search').on('keyup', function (e) {
			searchValue = $(this).val();
			index = 0;
			pageNo = [{ num: 1, tabLoadEnd: false }];
			if (searchValue !== '' && e.keyCode === 13) {
				$('.table-view').html('');
				dropload.resetload(); // 重置
				// queryAppLendingList('99', 0, pageNo[0].num, false, searchValue);
			}
		});
		/* 
  	点击取消，页面返回 合同列表 
   */
		$('.cancel').on('tap', function () {
			$('#search').val('');
			mbank.openWindowByLoad('lendingList.html', 'lendingList', 'slide-in-left');
		});
		/* 
  	小铃铛跳转
   */
		$('#bell').on('tap', function () {
			localStorage.removeItem('firstFlag');
			mbank.openWindowByLoad('../../HomePage/message.html', 'message', 'slide-in-right');
		});
		$('#back').on('tap', function () {
			localStorage.removeItem('firstFlag');
			mbank.openWindowByLoad('../../HomePage/homePage.html', 'homePage', 'slide-in-left');
		});
		mui.back = function () {
			localStorage.removeItem('firstFlag');
			mbank.openWindowByLoad('../../HomePage/homePage.html', 'homePage', 'slide-in-left');
		};
		/* plus.key.addEventListener('backbutton', function () {
  	
  }, false); */
	});
});