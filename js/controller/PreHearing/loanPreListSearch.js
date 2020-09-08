'use strict';

define(function (require, exports, module) {
	mui.init();
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	var userRole = localStorage.getItem("sessionUserRole");
	var searchValue = '';
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mbank.isImmersed();
		 
  	/*点击选项卡，重新切换数据*/
  
		var index = 0,
		    pageNo = [{ num: 1, tabLoadEnd: false }];
		 
  	/*dropload 下拉加载更多*/
   
		$('.dropload-down').remove();
		var dropload = $('#conSingList').dropload({
			scrollArea: window,
			domDown: {
				domNoData: '<div class="dropload-noData">无更多数据啦~~</div>'
			},
			loadUpFn: function loadUpFn(me) {
				// 上拉刷新
				queryDealerPreTriaList('DEFAULT', 0, 1, true, searchValue);
			},
			loadDownFn: function loadDownFn(me) {
				queryDealerPreTriaList('DEFAULT', 0, pageNo[0].num, false, searchValue);
			},
			threshold: 50
		});
		/* 
  	获取预审代办列表数据
  	nodeFlag 节点状态
  		YS_SQLR 录入中
  		YS_ZXQS 签署中
  		YS_SQTJ 已提交
  		DEFAULT 全  部
  	index tab 切换下标
  	pageNum 页码
  	customFSerach 查询条件
   */
		function queryDealerPreTriaList(nodeFlag, index, pageNum, isUp, customFSerach) {
			var _url = mbank.getApiURL() + 'queryDealerPreTriaList.do',
			    turnPageShowNum = 5;
			mbank.apiSend('post', _url, {
				customFSerach: customFSerach,
				nodeFlag: nodeFlag,
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
					//  100 预审录入 101 征信授权中 102 征信授权失败 103 征信授权超时 104 待提交 105 预审处理中 106 预审准入 111 预审拒绝
					var pcOrApp = '<div class="jumpPage flex">',
					    onlyOneBtn = '',
					    // 只有一个按钮
					statusColor = '<span class="status fontColor font24" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>',
					    otherBtns = ''; // 其他按钮
					// 状态颜色
					if (item.outSts == '100' || item.outSts == '104' || item.outSts == '106') {
						statusColor = '<span class="status fontColor font24 green" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					} else if (item.outSts == '102' || item.outSts == '103' || item.outSts == '111' || item.outSts == '14') {
						// 111预审拒绝 
						statusColor = '<span class="status fontColor font24 orange" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					} else if (item.outSts == '101' || item.outSts == '105' || item.outSts == "Q01" || item.outSts === '112') {
						//  105预审处理中
						statusColor = '<span class="status fontColor font24 blue" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					}
					// 按钮
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
				}
			}
		}

		 
  	/*按钮点击*/
   
		$('.table-view').on('tap', '.btn', function () {
			$('#waitingBox').show();
			var _this = this,
			    applCde = $(_this).parents('li').find('.applCde').text(),
			    status = $(_this).parents('li').find('.status').attr('data-value'),
			    node = $(_this).parents('li').find('.status').attr('data-node');
			localStorage.setItem('outSts', status);
			localStorage.setItem('nodeSign', node);
			localStorage.setItem('backFlag', '05');
			localStorage.setItem('applCde', applCde);
			if ($(_this).text() === '编辑') {
				// 预审信息录入界面
				mData.editLock(applCde, node, status, '999','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('loanPre.html', 'loanPre', 'slide-in-right', {
							'applCde': applCde,
							'type': 'yushen',
							'outSts': status,
							'nodeSign': node
						});
					}
				});	
			} else if ($(_this).text() === '删除') {
				mData.editLock(applCde, node, status, '999','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mui.confirm('请确认是否删除该笔预审？', ' ', ['取消', '确认'], function (e) {
							if (e.index === 1) {
								// 调用删除接口
								var _url = mbank.getApiURL() + 'deleteDealerPreTrial.do';
								mbank.apiSend('post', _url, {
									applCde: applCde
								}, function (res) {
									$(_this).parents('li').remove();
									countDealerPreTrialNum();
								},function(err){
									mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
								});
							}
						}, 'div');
					}
				});
			} else if ($(_this).text() === '签署中') {
				// 签署页面
				mData.editLock(applCde, node, status, '999','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../CommonPage/signIng.html', 'signIng', 'slide-in-right', {
							'applCde': applCde,
							'type': 'yushen',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			} else if ($(_this).text() === '待提交') {
				// 签署页面
				mData.editLock(applCde, node, status, '999','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../CommonPage/signIng.html', 'signIng', 'slide-in-right', {
							'applCde': applCde,
							'type': 'yushen',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
				
			} else if ($(_this).text() === '预审结论') {
				// 签署页面
				mData.editLock(applCde, node, status, '999','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../../CommonPage/preResult.html', 'preResult', 'slide-in-right', {
							'applCde': applCde,
							'type': 'yushen',
							'outSts': status,
							'nodeSign': node
						});
					}
				});
			}
		});
		 
  	/*点击【>】跳转到 贷款详情（预审）页面 */
  
		$('.table-view').on('tap', '.jumpPage', function () {
			// 点击箭头进入贷款详情页面
			localStorage.setItem('applCde', $(this).parent().find('.applCde').text());
			localStorage.setItem('backFlag', '05');
			mbank.openWindowByLoad('../../ConSigning/conSignDetail.html', 'conSignDetail', 'slide-in-right', {
				applCde: $(this).parent().find('.applCde').text(),
				outStatus: $(this).parent('li').find('.status').attr('data-value'),
				loanPreList: true // 用于判断贷款详情显示哪个环节
			});
		});
		$('.table-view-cell').each(function () {
			if ($(this).find('.btn').length === 1) $(this).find('.more').css('color', '#ddd');
		});
		mCheck.isOneBtnLength('.table-view-cell', '.btn', '.more');
		mCheck.isOneBtnToggle('.table-view', '.more', '.btn');
		 
  	/*点击查询按钮，页面跳转*/
   
		$('#searchIcon').on('tap', function () {
			mbank.openWindowByLoad('loanPreListSearch.html', 'loanPreListSearch', 'slide-in-right');
		});
		 
  	/*搜索查询*/
   
		$('#search').on('keyup', function (e) {
			searchValue = $(this).val();
			index = 0;
			pageNo = [{ num: 1, tabLoadEnd: false }];
			if (searchValue !== '' && e.keyCode === 13) {
				dropload.unlock();
				dropload.noData(false);
				$('.table-view').html('');
				dropload.resetload(); // 重置
				// queryDealerPreTriaList('DEFAULT', 0, pageNo[0].num, false, searchValue);
			}
		});
		
  	/* 点击取消，页面返回 合同列表 */
  
		$('.cancel').on('tap', function () {
			$('#search').val('');
			mbank.openWindowByLoad('loanPreList.html', 'loanPreList', 'slide-in-left');
		});
		// $('#back').on('tap', function () {
		// 	mbank.openWindowByLoad('../../HomePage/homePage.html', 'homePage', 'slide-in-left');
		// });
		// plus.key.addEventListener('backbutton', function () {
		// 	mbank.openWindowByLoad('../../HomePage/homePage.html', 'homePage', 'slide-in-left');
		// }, false); 
	});
});