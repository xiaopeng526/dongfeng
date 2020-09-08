'use strict';

define(function (require, exports, module) {
	mui.init();
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	var userRole = localStorage.getItem("sessionUserRole");
	var applCde = localStorage.getItem('applCde');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	var searchValue = '';
	/* 
 	查询申请代办各节点数量 
  */
	function countDealerPreLoanNum() {
		var _url = mbank.getApiURL() + 'countDealerPreLoanNum.do';
		mbank.apiSend('post', _url, {}, function (res) {
			var all = 0;
			res.iStatuList.forEach(function (item) {
				all += Number(item.iCount);
			});
			$('.mui-scroll a').eq(0).children('span').html('(' + all + ')');
			res.iStatuList.forEach(function (item, index) {
				if (item.description == '录入中') {
					$('.mui-scroll a').eq(1).children('span').html('(' + item.iCount + ')');
				} else if (item.description == '签署中') {
					$('.mui-scroll a').eq(2).children('span').html('(' + item.iCount + ')');
				} else if (item.description == '审贷打回') {
					$('.mui-scroll a').eq(3).children('span').html('(' + item.iCount + ')');
				} else if (item.description == '处理中') {
					$('.mui-scroll a').eq(4).children('span').html('(' + item.iCount + ')');
				}
			});
		},function(err){
			mCheck.callPortFailed(err.ec, err.em,"#waitingBox");
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
  	查询申请代办各节点数量
   */
		countDealerPreLoanNum();

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
		$('.table-view').html('');
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
						queryDealerPreLoanList('99', 0, 1, true, searchValue);
						break;
					case 1:
						queryDealerPreLoanList('01', 1, 1, true, searchValue);
						break;
					case 2:
						queryDealerPreLoanList('02', 2, 1, true, searchValue);
						break;
					case 3:
						queryDealerPreLoanList('03', 3, 1, true, searchValue);
						break;
					case 4:
						queryDealerPreLoanList('04', 4, 1, true, searchValue);
						break;
				}
			},
			loadDownFn: function loadDownFn(me) {
				switch (index) {
					case 0:
						queryDealerPreLoanList('99', 0, pageNo[0].num, false, searchValue);
						break;
					case 1:
						queryDealerPreLoanList('01', 1, pageNo[1].num, false, searchValue);
						break;
					case 2:
						queryDealerPreLoanList('02', 2, pageNo[2].num, false, searchValue);
						break;
					case 3:
						queryDealerPreLoanList('03', 3, pageNo[3].num, false, searchValue);
						break;
					case 4:
						queryDealerPreLoanList('04', 4, pageNo[4].num, false, searchValue);
						break;
				}
			},
			threshold: 50
		});
		/* 
  aprFlag
  	01 录入中
  	02 签署中
  	03 审贷打回
  	04 处理中
  	99 全  部
  index tab 切换下标
  pageNum 页码
  customFSerach 查询条件
  */
		function queryDealerPreLoanList(aprFlag, index, pageNum, isUp, customFSerach) {
			var _url = mbank.getApiURL() + 'queryDealerPreLoanList.do',
			    turnPageShowNum = 5;
			mbank.apiSend('post', _url, {
				customFSerach: customFSerach,
				aprFlag: aprFlag,
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
					statusColor = '<span class="status fontColor font24" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>',
					    otherBtns = ''; // 其他按钮
					if (item.handlingChannel && item.handlingChannel === '02') {
						pcOrApp = '<div class="jumpPage flex pc">';
					}
					// 状态颜色
					if (item.outSts == '60' || item.outSts == '00' || item.outSts == 'S02' || item.outSts == '12' || item.outSts == 'S05') {
						statusColor = '<span class="status fontColor font24 green" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					} else if (item.outSts == 'S01' || item.outSts == '01' || item.outSts == '02' || item.outSts == '04' || item.outSts == '13' || item.outSts == '14' || item.outSts == '15' || item.outSts == '25' || item.outSts == '30' || item.outSts == '36' || item.outSts == '37' || item.outSts == "Q01") {
						statusColor = '<span class="status fontColor font24 blue" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					} else if (item.outSts == 'S03' || item.outSts == 'S04' || item.outSts == '16' || item.outSts == '24' || item.outSts == '26' || item.outSts == '27' || item.outSts == '40' || item.outSts == '14') {
						statusColor = '<span class="status fontColor font24 orange" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					}
					// 按钮
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
							otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t</div>';
						}
					}
					if (userRole === '03') {
						// 销售顾问
						if (item.outSts == '40') {
							if (item.handlingChannel && item.handlingChannel === '01') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u4FE1\u8D37\u6253\u56DE</a>';
							}
						} else if (item.outSts == '26') {
							if (item.handlingChannel && item.handlingChannel === '01') {
								if (item.flag === '100' || item.flag === '200' || item.flag === '300' || item.flag === '400') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t</div>';
								}
							}
						} else if (item.outSts == '25') {
							if (item.handlingChannel && item.handlingChannel === '01') {
								if (item.flag === '100' || item.flag === '200' || item.flag === '300' || item.flag === '400') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t</div>';
								}
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
								otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a></div>';
								if (item.flag === '100' || item.flag === '200' || item.flag === '300' || item.flag === '400') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t</div>';
								}
							}
						} else if (item.outSts == '01') {
							if (item.handlingChannel && item.handlingChannel === '01') {
								onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u7F16\u8F91</a>';
							}
						} else if (item.outSts == '12') {
							otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t</div>';
							if (item.handlingChannel && item.handlingChannel === '01') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t</div>';
							}
						} else if (item.outSts == '25') {
							if (item.handlingChannel && item.handlingChannel === '01') {
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t</div>';
								if (item.flag === '100' || item.flag === '200' || item.flag === '300' || item.flag === '400') {
									otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t\t</div>';
								}
							}
						}
					}
					var custName = '<span class="name">' + mCheck.dataIsNull(item.custName) + '</span>';
					if (item.custName && item.custName.length > 3) custName = '<span class="name min-name">' + mCheck.dataIsNull(item.custName) + '</span>';
					result += '\n\t\t\t\t\t\t<li class="table-view-cell" data-value="' + item.handlingChannel + '">\n\t\t\t\t\t\t\t<div class="flex">\n\t\t\t\t\t\t\t\t<span id="' + item.contNo + '" class="applCde fontColor font26">' + mCheck.dataIsNull(item.applCde) + '</span>\n\t\t\t\t\t\t\t\t<time class="applTime fontColor font26">' + mCheck.dataIsNull(item.lastChgDt) + '</time>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t' + pcOrApp + '\n\t\t\t\t\t\t\t\t' + custName + '\n\t\t\t\t\t\t\t\t<div class="price">\n\t\t\t\t\t\t\t\t\t<p>\u8D37\u6B3E\u91D1\u989D <small> ' + mCheck.dataIsNull(item.applyAmt) + ' </small> \u5143</p>\n\t\t\t\t\t\t\t\t\t<p>' + mCheck.dataIsNull(item.goodsModel) + '</p>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class="icon_Go">\n\t\t\t\t\t\t\t\t\t<i class="iconSymbol icon__go"></i>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class="flex">\n\t\t\t\t\t\t\t\t<p class="fontColor font24 more">\n\t\t\t\t\t\t\t\t\t<i class="iconSymbol icon__dorp"></i>  \u66F4\u591A\u64CD\u4F5C\n\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t' + onlyOneBtn + '\n\t\t\t\t\t\t\t\t' + statusColor + '\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t' + otherBtns + '\n\t\t\t\t\t\t</li>\n\t\t\t\t\t';
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
			var _this = this,
			    applCde = $(_this).parents('li').find('.applCde').text(),
			    status = $(_this).parents('li').find('.status').attr('data-value'),
			    contNo = $(_this).parents('li').find('.applCde').attr('id'),
			    // 合同编号
			node = $(_this).parents('li').find('.status').attr('data-node');
			localStorage.setItem('outSts', status);
			localStorage.setItem('nodeSign', node);
			localStorage.setItem('backFlag', '06');
			localStorage.setItem('applCde', applCde);
			if ($(_this).text() === '编辑') {
				// 预审信息补录界面
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../Application/loanInfo.html', 'loanInfo', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '签署中') {
				// 签署界面
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../CommonPage/signIng.html', 'signIng', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '待提交' && status === 'S02') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../CommonPage/signIng.html', 'signIng', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '待提交' && status === 'S05') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../Images/imageList.html', 'imageList', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '信贷打回' || $(_this).text() === '自动打回' || $(_this).text() === '审查打回') {
				// 影像及留言界面
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../Images/imageList.html', 'imageList', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '资料核查打回') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../Images/imageList5.html', 'imageList5', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '复核') {
				//  预审信息补录界面
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.setItem('typeFlag', '02');
						localStorage.setItem('typeFlagList', '01');
						mbank.openWindowByLoad('../../Application/loanInfo.html', 'loanInfo', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '补充申请资料') {
				// 影像及留言页面
				localStorage.setItem('typeFlag', '02');
				localStorage.setItem('typeFlagList', '02');
				mbank.openWindowByLoad('../../Images/imageList2.html', 'imageList2', 'slide-in-right');
			} else if ($(_this).text() === '申请修改录入') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../Application/loanInfo.html', 'loanInfo', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '贷款信息修改') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../Images/imageList3.html', 'imageList3', 'slide-in-right', {
							applCde: applCde,
							type: 'bulu',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '贷款信息修改通知') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
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
									mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
								});
							}
						}, 'div');
					}
				});
			} else if ($(_this).text() === '发送邮件') {
				mData.editLock(applCde, node, status,'','').then(function(dat){
					if(dat=='N'){
						return;
					}else{
						mbank.openWindowByLoad('../../ConSigning/conSignInfo.html', 'conSignInfo', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo,
							sendMail: 'Y',
							fromPage: 'preList',
							'outSts': status,
							'nodeSign': node
						});
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
			localStorage.setItem('backFlag', '06');
			mbank.openWindowByLoad('../../ConSigning/conSignDetail.html', 'conSignDetail', 'slide-in-right', {
				applCde: $(this).parent().find('.applCde').text(),
				outStatus: $(this).parent('li').find('.status').attr('data-value'),
				handlingChannel: $(this).parent().attr('data-value'),
				preList: 'preList' // 用于判断贷款详情显示哪个环节
			});
		});
		mCheck.isOneBtnLength('.table-view-cell', '.btn', '.more');
		mCheck.isOneBtnToggle('.table-view', '.more', '.btn');
		/* 
  	点击查询按钮，页面跳转
   */
		$('#searchIcon').on('tap', function () {
			mbank.openWindowByLoad('preListSearch.html', 'preListSearch', 'slide-in-right');
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
				// dropload.resetload(); // 重置
				queryDealerPreLoanList('99', 0, pageNo[0].num, false, searchValue);
			}
		});
		/* 
  	点击取消，页面返回 合同列表
   */
		$('.cancel').on('tap', function () {
			$('#search').val('');
			mbank.openWindowByLoad('preList.html', 'preList', 'slide-in-left');
		});
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
	});
});