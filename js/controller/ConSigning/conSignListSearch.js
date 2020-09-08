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
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();

		 
  	/*点击选项卡，重新切换数据*/
  
		var index = 0,
		    pageNo = [{ num: 1, tabLoadEnd: false }];
		 
  	/*下拉加载*/
   
		$('.dropload-down').remove();
		var dropload = $('#conSingList').dropload({
			scrollArea: window,
			domDown: {
				domNoData: '<div class="dropload-noData">无更多数据啦~~</div>'
			},
			loadUpFn: function loadUpFn(me) {
				// 下拉加载
				queryContSignList('99', index, 1, true, searchValue);
			},
			loadDownFn: function loadDownFn(me) {
				queryContSignList('99', index, pageNo[0].num, false, searchValue);
			},
			threshold: 50
		});
		/* 
  	合同列表查询
  	aprFlag : 状态 01 待签订 02 签署中  99 全  部 
  	index 点击元素下标
  	customFSerach : 查询条件  支持申请编号/申请人姓名/身份证号码/合同批次号查询 
  */
		function queryContSignList(aprFlag, index, pageNum, isUp, customFSerach) {
			var _url = mbank.getApiURL() + 'queryContSignList.do',
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
		 
  	/*获取列表数据hide*/
   
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
					statusColor = '<span class="status fontColor font24" data-sts="' + item.outSts + '" data-value="' + item.flag + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>',
					    otherBtns = ''; // 其他按钮
					// 状态
					if (item.flag === '200' || item.outSts === '12') {
						statusColor = '<span class="status fontColor font24 green" data-sts="' + item.outSts + '" data-value="' + item.flag + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					} else if (item.flag === '000' || item.flag === '100' || item.outSts === '13' || item.outSts === '25' || item.flag === '010') {
						statusColor = '<span class="status fontColor font24 blue" data-sts="' + item.outSts + '" data-value="' + item.flag + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					}
					if (item.flag === '300' || item.flag === '400' || item.outSts === '14') {
						statusColor = '<span class="status fontColor font24 orange" data-sts="' + item.outSts + '" data-value="' + item.flag + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>';
					}
					// 按钮
					if (userRole !== '01') {
						if (item.flag === '000') {
							// 合同待生成 展示【合同生成】
							onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u5408\u540C\u751F\u6210</a>';
							otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
						} else if (item.flag === '100' || item.flag === '300' || item.flag === '400') {
							onlyOneBtn = '<a class="btn fontColor font24 active" href="javascript:;">\u7B7E\u7F72\u4E2D</a>';
							otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t</div>';
							if(item.flag === '300' || item.flag === '400'){
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>'
							}
						} else if (item.flag === '010') {
							// 合同生成中
							otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a></div>';
						}
					}
					if (userRole === '02' || userRole === '04') {
						if (item.flag === '000' || item.flag === '010') {
							// 合同待生成、生成中 
							otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t</div>';
							if((item.outSts=='08'||item.outSts=='Q80' ||item.outSts=='19')&&item.flag=='000'){
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
							}
							if (item.outSts == '25') {
							    if (item.flag=='000') {
							        otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
							    } else {
							        otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t</div>';
							    }
							}
						} else if (item.flag === '100' || item.flag === '300' || item.flag === '400') {
							otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t</div>';
							if((item.outSts=='08'||item.outSts=='Q80' ||item.outSts=='19')&&(item.flag=='300'||item.flag=='400')){
								otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';	
							}
							if (item.outSts == '25') {
							    if (item.flag=='300'||item.flag=='400') {
							        otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
							    } else {
							        otherBtns = '<div class="last-div">\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u53D1\u9001\u90AE\u4EF6</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8865\u5145\u7533\u8BF7\u8D44\u6599</a>\n\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539\u901A\u77E5</a>\n\t\t\t\t\t\t\t\t</div>';
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
		 
   /*按钮点击 ， 跳转页面 */
 
		$('.table-view').on('tap', '.btn', function () {
			$('#waitingBox').show();
			var _this = this,
			    applCde = $(_this).parents('li').find('.applCde').text(),
			    // 申请编码
			contNo = $(_this).parents('li').find('.applCde').attr('id'),
			    // 合同编号
			status = $(_this).parents('li').find('.status').attr('data-value'),
			    //外部状态   
			status1 = $(_this).parents('li').find('.status').attr('data-sts'),
			    node = $(_this).parents('li').find('.status').attr('data-node'); //节点标识
			localStorage.setItem('outSts', status1);
			localStorage.setItem('nodeSign', node);
			localStorage.setItem('backFlag', '04');
			localStorage.setItem('applCde', applCde);
			localStorage.removeItem('typeFlagList');
			if ($(_this).text() === '合同生成') {
				// 跳转到 合同输入信息 页面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mbank.openWindowByLoad('conSignInfo.html', 'conSignInfo', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo,
							modifyFlag: 'N',
							fromPage: 'conList'
						});
					}
				});
			} else if ($(_this).text() === '补充申请资料') {
				// 
				localStorage.setItem('typeFlag', '03');
				localStorage.setItem('typeFlagList', '02');
				mbank.openWindowByLoad('../Images/imageList2.html', 'imageList2', 'slide-in-right');
			} else if ($(_this).text() === '签署中') {
				// 跳转到 合同签署界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mbank.openWindowByLoad('conSigning.html', 'conSigning', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo, //合同编号
							fromPage: 'conList'
						});
					}
				});
			} else if ($(_this).text() === '发送邮件') {
				// 跳转到合同输入页面 -> 发送邮件页面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mbank.openWindowByLoad('conSignInfo.html', 'conSignInfo', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo,
							sendMail: 'Y',
							fromPage: 'conList'
						});
					}
				});
			} else if ($(_this).text() === '上传放款资料') {
				// 跳转到上传放款资料界面
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '04');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/loanData.html', 'loanData', 'slide-in-right', {
							applCde: $(_this).parents('li').find('.applCde').text(),
							type: 'scfkzl'
						});
					}
				});
			} else if ($(_this).text() === '合同修改') {
				// 先跳转到合同输入页面->废纸电子->保存提交
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mui.confirm('合同修改会作废已存在的电子签，请确认是否要修改合同内容', ' ', ['取消', '确认'], function (e) {
							if (e.index == 1) {
								mbank.openWindowByLoad('conSignInfo.html', 'conSignInfo', 'slide-in-right', {
									applCde: applCde,
									contNo: contNo,
									modifyFlag: 'Y',
									fromPage: 'conList'
								});
							}
						}, 'div');
					}
				});
			} else if ($(_this).text() === '贷款信息修改') {
				// 影像及留言
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
								});
							}
						}, 'div');
					}
				});
			}else if($(_this).text() === '转PC办理'){
				mData.editLock(applCde, node, status1,'','').then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mui.confirm('点击确定后办理渠道变更为经销商PC，在途电子签流程将作废，需在PC端下载并签署纸质合同。', ' ', ['取消', '确认'], function (e) {
							if (e.index === 1) {
								var _url = mbank.getApiURL() + 'transferAppLoanToOffline.do';
								mbank.apiSend('post', _url, {
									"applCde": applCde,
									"opTyp":'1'
								}, function (res) {
									$('#waitingBox').show();
									mData.unLock(applCde, node, status1, '01').then(function(dat){
										if(dat=='Y'){
											return;
										}
									});
									mui.alert(res.RET_MSG, "提示", "确定", function(){
										$('#waitingBox').hide();
										location.reload();
									}, 'div');
								},function(err){
									mCheck.callPortFailed(err.ec, err.em,"#waitingBox");
								});					
								// var _url = mbank.getApiURL() + 'AddOrUpdateDoc.do';
								// mbank.apiSend('post', _url, {
								// 	"applCde": applCde,
								// 	"temp": 'tongzhi'
								// }, function (res) {
								// 	mui.alert('贷款信息修改通知成功', '提示', '确定', function (e) {
								// 		$(_this).hide();
								// 	}, 'div');
								// });
							}else{
								setTimeout(function () {
									location.reload();
									mData.unLock(applCde, node, status1, '01').then(function(dat){
										if(dat=='Y'){
											return;
										}
									});
								}, 100);
							}
						}, 'div');
					}
				});
				
			}
		});
		 
  	/*点击【>】跳转到 贷款详情（合同）页面 */
  
		$('.table-view').on('tap', '.jumpPage', function () {
			// 点击箭头进入贷款详情页面
			var _this = this;
			localStorage.setItem('applCde', $(this).parent().find('.applCde').text());
			localStorage.setItem('backFlag', '04');
			mbank.openWindowByLoad('conSignDetail.html', 'conSignDetail', 'slide-in-right', {
				applCde: $(this).parent().find('.applCde').text(),
				outStatus: $(this).parent('li').find('.status').attr('data-value')
			});
		});
		 
  	/*操作按钮只有一个时，更多操作 置灰*/ 
  
		mCheck.isOneBtnLength('.table-view-cell', '.btn', '.more');
		
  	/* 操作按钮大于 1 个时，更多操作 切换 */
  
		mCheck.isOneBtnToggle('.table-view', '.more', '.btn');
		 
  	/*点击查询按钮，页面跳转*/
   
		$('#searchIcon').on('tap', function () {
			mbank.openWindowByLoad('conSignListSearch.html', 'conSignListSearch', 'slide-in-right');
		});
		 
  	/*搜索查询*/
   
		$('#search').on('keyup', function (e) {
			searchValue = $(this).val();
			pageNo = [{ num: 1, tabLoadEnd: false }];
			if (searchValue !== '' && e.keyCode === 13) {
				dropload.unlock();
				dropload.noData(false);
				$('.table-view').html('');
				dropload.resetload(); // 重置
				// queryContSignList('99', index, pageNo[0].num, false, searchValue);
			}
		});
		 
  	/*点击取消，页面返回 合同列表*/
   
		$('.cancel').on('tap', function () {
			$('#search').val('');
			mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
		});
	});
});