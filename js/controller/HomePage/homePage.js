'use strict';

define(function (require, exports, module) {
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	var userRole = localStorage.getItem("sessionUserRole");
	setInterval(function () {
		autoScroll("#anment", $("#anment").height());
	}, 2000);
	var modifiFlag = false;
	var storey_box = document.getElementById("storey_box");
	var down_info1 = document.getElementById('down_info1');
	var wgtVer;
	/**
  * 跑马灯效果
  * 1、ele：跑马灯列表所在的div元素
  * 2、num：每个li元素的高度
  */
	function autoScroll(ele, num) {
		var _marginTop = '-' + num + 'px';
		$(ele).find('ul:first').animate({
			marginTop: _marginTop
		}, 300, function () {
			$(this).css({ marginTop: '0px' }).find('li:first').appendTo(this);
		});
	}
	/* 
 	快报信息
  */
	function queryNoticeList() {
		var _url = mbank.getApiURL() + 'queryNoticeList.do',
		    turnPageShowNum = 5,
		    result = '';
		mbank.apiSend('post', _url, {
			currentBusinessCode: 'CF004009',
			turnPageBeginPos: 1,
			turnPageShowNum: 3
		}, function (res) {
			if (res.iNoticeList.length === 0) {
				result = '暂无快报信息';
				$('.anment-content-ul').html(result);
			} else {
				res.iNoticeList.forEach(function (item) {
					result += '\n\t\t\t\t\t\t <li>' + item.cn_bul_title + '</li>\n\t\t\t\t\t';
				});
				$('.anment-content-ul').html(result);
			}
		}, function (err) {
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		}, true, false);
	}
	/* 
 	查询各环节待办环节数量
  */
	function countLoanToDoListNum() {
		var _url = mbank.getApiURL() + 'countLoanToDoListNum.do';
		mbank.apiSend('post', _url, {}, function (res) {
			res.iStatuList.forEach(function (item, index) {
				if (item.description == '预审') {
					$('.todo-list').eq(0).children('.todo-badge').html(item.iCount);
					if (res.iStatuList[3].iCount == 0) $('.todo-list').eq(0).children('.todo-badge').hide();
				} else if (item.description == '申请') {
					$('.todo-list').eq(1).children('.todo-badge').html(item.iCount);
					if (item.iCount == 0) $('.todo-list').eq(1).children('.todo-badge').hide();
				} else if (item.description == '合同') {
					$('.todo-list').eq(2).children('.todo-badge').html(item.iCount);
					if (item.iCount == 0) $('.todo-list').eq(2).children('.todo-badge').hide();
				} else if (item.description == '放款') {
					$('.todo-list').eq(3).children('.todo-badge').html(item.iCount);
					if (item.iCount == 0) $('.todo-list').eq(3).children('.todo-badge').hide();
				}
			});
		}, function (err) {
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		}, true, false);
	}
	/*
 	最新代办列表展示
  */
	function queryLoanToDoList(me, up) {
		var _url = mbank.getApiURL() + 'queryLoanToDoList.do',
		    result = '';
		mbank.apiSend('post', _url, {
			turnPageBeginPos: 1,
			turnPageShowNum: 5
		}, function (res) {
			if (res.iApplyInfo.length == 0) {
				$('.dropload-down').html('<div class="dropload-noData">无更多数据啦~</div>');
				me.lock();
				me.noData();
				return;
			} else if (res.iApplyInfo.length > 0) {
				res.iApplyInfo.forEach(function (item) {
					var pcOrApp = '<div class="jumpPage flex">',
					    onlyOneBtn = '',
					    // 只有一个按钮
					statusColor = '<span class="status fontColor font24" data-sts="' + item.outSts + '" data-value="' + item.outSts + '" data-node="' + item.nodeFlag + '">' + item.stsMsg + '</span>',
					    otherBtns = '',
					    // 其他按钮
					applyCode = '<span id="' + item.contNo + '" class="applCde fontColor font26">' + mCheck.dataIsNull(item.applCde) + '</span>'; // 其他按钮
					if (item.outSts == '11' && item.isAutoLending === 'Y') {
						applyCode = '<span id="' + item.contNo + '" class="applCde fontColor green font26">' + mCheck.dataIsNull(item.applCde) + '</span>'; // 其他按钮
					}
					if (item.handlingChannel && item.handlingChannel === '02') {
						pcOrApp = '<div class="jumpPage flex pc">';
					}
					if (item.flag && item.flag !== '200') {
						// 合同
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
								// 待签署 展示【合同签署】
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
											    otherBtns = '<div class="last-div"><a class="btn fontColor font24" href="javascript:;">\u8D37\u6B3E\u4FE1\u606F\u4FEE\u6539</a>\n\t\t\t\t\t\t\t\t\t\t<a class="btn fontColor font24" href="javascript:;">\u8f6c\u0050\u0043\u529e\u7406</a>\n\t\t\t\t\t\t\t\t</div>';
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
								// if (item.handlingChannel && item.handlingChannel === '01') {
								// 	otherBtns = `<div class="last-div"><a class="btn fontColor font24" href="javascript:;">贷款信息修改</a></div>`;
								// }
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
						// 申请
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
						} else if (item.outSts == '38' || item.outSts == '19' || item.outSts == '31' || item.outSts == '40' || item.outSts == '20' || item.outSts === '14' || item.outSts == 'Q80' || item.outSts == '28' || item.outSts == '38') {
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
					$('.table-view').html('');
					$('.table-view').append(result);
					me.resetload();
					if (up) {
						me.unlock();
						me.noData(false);
					}
				}, 300);
				if (res.iApplyInfo.length <= 5) {
					$('.dropload-down').hide();
					me.lock();
					me.noData();
					return;
				}
			}
		}, function (err) {
			$('.dropload-down').hide();
			me.lock();
			me.noData();
			me.resetload();
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		}, true, false);
	}
	//消息中心
	var queryCountsMessage = function queryCountsMessage() {
		var url = mbank.getApiURL() + 'queryCounts.do';
		var param = {
			wlm_crt_usr: localStorage.getItem("logonId")
		};

		mbank.apiSend("post", url, param, function (data) {
			if (data.aprFlag == null || data.aprFlag == '' || data.aprFlag == '0') {
				$('#iconBadge').html('');
				$('#iconBadge').hide();
			} else {
				if (data.aprFlag > 100) {
					$('#iconBadge').html('99+');
				} else {
					$('#iconBadge').html(data.aprFlag);
				}

				$('#iconBadge').show();
			}
		}, function(err){
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
		}, true, false);
	};
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none"
		});
		mbank.isIPhoneX();
		var InScreen=mbank.isImmersed();
		plus.screen.lockOrientation("portrait-primary"); //锁定屏幕方向：竖屏正方向
		plus.navigator.setStatusBarBackground('#fff');
		plus.navigator.setStatusBarStyle('dark'); //dark or light
		plus.navigator.closeSplashscreen(); //关闭程序启动界面
		var clientid = localStorage.getItem('clientid');
		var telephone = localStorage.getItem('sessionTel');
		var storeNo = localStorage.getItem('sessionStoreNo');
		var sessionid = localStorage.getItem('sessionId');
		/**
   * 版本更新,发布
   */
		// 获取本地应用资源版本号
		plus.runtime.getProperty(plus.runtime.appid, function (inf) {
			wgtVer = inf.version;
			checkUpdate(wgtVer);
		});
		//休眠方法
		function sleep(numberMillis) {
			var now = new Date();
			var exitTime = now.getTime() + numberMillis;
			while (true) {
				now = new Date();
				if (now.getTime() > exitTime) return;
			}
		}
		//判断进行更新
		function checkUpdate(v) {
			if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
				versionupdates("IOSVERSION", v);
			} else if (/(Android)/i.test(navigator.userAgent)) {
				versionupdates("ADRVERSION", v);
			} else {
				console.log("获取设备客户端信息失败 ！");
			}
		};
		function versionupdates(jix, v) {
			var reqData = {
				"aprFlag": "1",
				"flag": jix
			};
			var currentArr=[];
			var previousArr=[];
			$('#waitingBox').show();
			var url = mbank.getApiURL() + 'checkVersion.do';
			mbank.apiSend('post', url, reqData, function (data) {
				$('#waitingBox').hide();
				var currentArr = v.split(".");
				var previousArr = data.checkFlag.split(".");
				var minLength = Math.min(currentArr.length, previousArr.length),
					position = 0,
      				diff = 0;
    			//依次比较版本号每一位大小，当对比得出结果后跳出循环
			    while (position < minLength && ((diff = parseInt(currentArr[position]) - parseInt(previousArr[position])) == 0)){
			    	position++;
			    }
			    diff = (diff != 0) ? diff : 0;
				if(diff<0){
					plus.nativeUI.alert("当前应用有更新，请前往更新！", function (event) {
					mbank.removeCache();
					setTimeout(function(){
						if (event.index == 0) {
							if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
								plus.runtime.quit();
								plus.nativeUI.showWaiting("正在下载,请稍后……", {
									padlock: false
								});
								window.location = data.url;
							} else {
								var simulateLoading = function simulateLoading(container, progress) {
									if (typeof container === 'number') {
										progress = container;
										container = 'body';
									}
									setTimeout(function () {
										var totalSize = dtask.totalSize;
										var downloadedSize = dtask.downloadedSize;
										var a = parseFloat((downloadedSize / 1024 / 1024).toFixed(2) / (totalSize / 1024 / 1024).toFixed(2)).toFixed(2) * 100;
//										var preNum = document.getElementById("preNum");
										preNum.innerHTML = parseInt(a) + "%";
										progress = a;
										mui(container).progressbar().setProgress(progress);
										if (progress < 100) {
											simulateLoading(container, progress);
										} else {
											mui(container).progressbar().hide();
											plus.runtime.quit();
										}
										if (totalSize == downloadedSize) {
											storey_box.style.display = "none";
											down_info1.style.display = "none";
										}
									}, 1500);
								};

								storey_box.style.display = "block";
								down_info1.style.display = "block";
								var container = mui("#downProBar p");
								if (container.progressbar({
									progress: 0
								}).show()) {
									 simulateLoading(container, 0);
								}

								var dtask = plus.downloader.createDownload(data.url, {}, function (d, status) {
									if (status == 200) {
										plus.nativeUI.toast("正在加载安装包，请稍后");
										storey_box.style.display = "none";
										down_info1.style.display = "none";
										sleep(1000);
										var path = d.filename;
										plus.runtime.install(path); // 安装下载的apk文件
									} else {
										alert('Download failed:' + status);
									}
								});
								dtask.start();
							}
						} else {
							plus.runtime.quit();
						}
					 },200);
					}, "更新提示", "前往更新");
				}else{
					if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
						plus.nativeUI.closeWaiting();
					}
					if (!sessionid) {
						setTimeout(function () {
							mbank.openWindowByLoad("../login.html", 'login', 'slide-in-left')
						}, 0);
					} else {
						//判断是否自动登录
						if (localStorage.getItem('isLogin') != 'true' && clientid && telephone && storeNo) {
							signInFun();
						} else {
							queryNoticeList();
							queryCountsMessage();
							countLoanToDoListNum(); // 查询代办数量

							$('.dropload-down').remove();
							$('.list').dropload({
								scrollArea: window,
								loadUpFn: function loadUpFn(me) {
									// 下拉加载
									queryLoanToDoList(me, true);
									countLoanToDoListNum();
								},
								loadDownFn: function loadDownFn(me) {
									queryLoanToDoList(me, false);
								},
								threshold: 500
							});
						}
					}
				}
			}, versionFai, false);
		}
		function versionFai(data) {
			mCheck.callPortFailed(data.ec, data.em, '#waitingBox');
		}

		function signInFun() {
			localStorage.removeItem('sessionId');
			var url = mbank.getApiURL() + 'signIn.do';
			mbank.apiSend('get', url, {
				'clientid': clientid,
				'telephone': Base64.encode(telephone),
				'storeNo': Base64.encode(storeNo), 
				"codeFlag": "0"
			}, function (data) {
				localStorage.setItem('logonId', data.logonId);
				localStorage.setItem('sessionId', data.sessionId);
				localStorage.setItem('sessionName', data.session_customerNameCN); //存储登录用户名
				localStorage.setItem('sessionStoreNo', data.storeNo);
				localStorage.setItem("sessionUserRole", data.session_userRole);
				localStorage.setItem("sessionStoreName", data.session_storeName);
				localStorage.setItem("sessionTel", data.telephone);
				localStorage.setItem("clientid", clientid);
				localStorage.setItem('isLogin', 'true');
				
				queryNoticeList();
				queryCountsMessage();
				countLoanToDoListNum(); // 查询代办数量
				
				$('.dropload-down').remove();
				$('.list').dropload({
					scrollArea: window,
					loadUpFn: function loadUpFn(me) {
						// 下拉加载
						queryLoanToDoList(me, true);
						countLoanToDoListNum();
					},
					loadDownFn: function loadDownFn(me) {
						queryLoanToDoList(me, false);
					},
					threshold: 500
				});
			}, function (err) {
				mui.toast(err.em, { type: 'div' });
				localStorage.removeItem('clientid');
				mbank.openWindowByLoad('../login.html', 'login', 'slide-in-left');
			}, true, false);
		}

		var u = navigator.userAgent,
		    app = navigator.appVersion;
		var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
		// var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
		if (isAndroid) {
			requestPerssion();
		}
		function requestPerssion() {
			plus.pluginPermission.requestPerssion(function (result) {
				var msg = result.message;
				if (result.status == 0) {
					//alert(msg );
				} else {
						//					alert(msg);
					}
			}, function (result) {
				var msg = result.message;
				//				alert(msg);
			});
		}

		//安卓返回键事件
		var backButtonPress = 0; //返回按钮	
		mui.back = function (event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function () {
				backButtonPress = 0;
				
			}, 1000);
			return false;
		};

		

		/**
   * 获取设备推送的clientid
   * 清除应用图标上的数字角标（iOS可用）
   */

		plus.runtime.setBadgeNumber(0);
		if (mui.os.ios) {
			var GeTuiSdk = plus.ios.importClass('GeTuiSdk');
			GeTuiSdk.resetBadge();
		}
		/**
   * 监听点击消息事件
   */
		plus.push.addEventListener("click", function (msg) {

			// 清除应用图标上的数字角标（iOS可用）
			plus.runtime.setBadgeNumber(0);
			if (mui.os.ios) {
				var GeTuiSdk = plus.ios.importClass('GeTuiSdk');
				GeTuiSdk.resetBadge();
			}
			if (plus.os.name == 'iOS') {
				// iOS获取payload里的参数
			} else {
					// Android获取的payload要转成json格式
				}
			queryCountsMessage();
		}, false);
		/**
   * 监听收到消息事件
   */
		plus.push.addEventListener("receive", function (msg) {
			// 清除应用图标上的数字角标（iOS可用）
			plus.runtime.setBadgeNumber(0);
			if (mui.os.ios) {
				var GeTuiSdk = plus.ios.importClass('GeTuiSdk');
				GeTuiSdk.resetBadge();
			}
			if (plus.os.name == 'iOS') {
				// iOS获取payload里的参数
			} else {
					// Android获取的payload要转成json格式
				}
			queryCountsMessage();
		}, false);

		rangInfo.addEventListener('tap', function () {
			mbank.openWindowByLoad('./message.html', 'message', 'slide-in-right');
		});
		newPre.addEventListener('tap', function () {
			if (userRole == '01') {
				mCheck.alert('请使用销售顾问、信贷专员或超级信贷员账户创建新预审！');
				return;
			}
			localStorage.setItem('outSts', '100');
			localStorage.setItem('nodeSign', 'YS_SQLR');
			localStorage.setItem('backFlag', '01');
			localStorage.setItem('applCde', '');
			localStorage.setItem('typeFlag', '01');
			mbank.openWindowByLoad('../PreHearing/NewPre/loanPre.html', 'loanPre', 'slide-in-right', {
				'newPre': true //表明只有从这个入口进入的是新预审
			});
		});

		moreAnment.addEventListener('tap', function () {
			// 公告
			mbank.openWindowByLoad('../Notice/noticeList.html', 'noticeList', 'slide-in-right');
		});
		preList.addEventListener('tap', function () {
			// 预审代办
			mbank.openWindowByLoad('../PreHearing/NewPre/loanPreList.html', 'loanPreList', 'slide-in-right');
		});
		applyList.addEventListener('tap', function () {
			// 申请代办
			mbank.openWindowByLoad('../PreHearing/PreList/preList.html', 'preList', 'slide-in-right');
		});
		conList.addEventListener('tap', function () {
			// 合同签订
			mbank.openWindowByLoad('../ConSigning/conSignList.html', 'conSignList', 'slide-in-right');
		});
		loanList.addEventListener('tap', function () {
			// 放款代办
			mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-right');
		});
		calculator.addEventListener('tap', function () {
			// 计算器
			mbank.openWindowByLoad('../Calculator/calculator.html', 'calculator', 'slide-in-right');
		});
		loanPre.addEventListener('tap', function () {
			// 贷款管理
			mbank.openWindowByLoad('../comPage/loanManagement.html', 'loanManagement', 'slide-in-right');
		});
		mine.addEventListener('tap', function () {
			// 我的
			if(InScreen){
				mbank.openWindowByLoad('../Mine/mine.html', 'mine', 'slide-in-right','',{
					top:'-88px',
					bottom:'0',
				})
			}else{
				mbank.openWindowByLoad('../Mine/mine.html', 'mine', 'slide-in-right','',{
					top:'-64px',
					bottom:'0',
				})
			}
		});

		/* 
   * 点击按钮
   */
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
			    node = $(_this).parents('li').find('.status').attr('data-node'),
			    handlingChannel = $(_this).parents('li').attr('data-value'); //办理渠道
			localStorage.setItem('outSts', status1);
			localStorage.setItem('nodeSign', node);
			localStorage.setItem('backFlag', '01');
			localStorage.setItem('applCde', applCde);
			localStorage.removeItem('typeFlagList');
			if ($(_this).text() === '编辑' && status == '100') {
				// 预审信息录入界面
				//添加锁
				mData.editLock(applCde, node, status1, '999',"").then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../PreHearing/NewPre/loanPre.html', 'loanPre', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '删除') {
				//查询锁
				mData.editLock(applCde, node, status1, '999',"").then(function(dat){
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
									mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
								});
							}
						}, 'div');
					}
				});
			} else if ($(_this).text() === '签署中' && status == '101' || $(_this).text() === '签署中' && status == '102' || $(_this).text() === '签署中' && status == '103') {
				// 签署页面
				mData.editLock(applCde, node, status1, '999',"").then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../CommonPage/signIng.html', 'signIng', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '待提交' && status == '104') {
				// 签署页面
				mData.editLock(applCde, node, status1, '999',"").then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../CommonPage/signIng.html', 'signIng', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '预审结论') {
				// 签署页面
				mData.editLock(applCde, node, status1, '999',"").then(function(dat){
					if(dat=='N'){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '01');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../CommonPage/preResult.html', 'preResult', 'slide-in-right');
					}
				});	
			} else if ($(_this).text() === '编辑' && status == '00' || $(_this).text() === '编辑' && status == '60' || $(_this).text() === '编辑' && status == '01') {
				// 预审信息补录界面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Application/loanInfo.html', 'loanInfo', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '补充申请资料') {
				localStorage.setItem('typeFlag', '02');
				localStorage.setItem('typeFlagList', '02');
				mbank.openWindowByLoad('../Images/imageList2.html', 'imageList2', 'slide-in-right');
			} else if ($(_this).text() === '自动打回') {
				// 影像及留言界面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../Images/imageList.html', 'imageList', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '审查打回') {
				// 影像及留言界面打回界面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/imageList.html', 'imageList', 'slide-in-right');
					}
				});			
			} else if ($(_this).text() === '签署中' && status == 'S01' || $(_this).text() === '签署中' && status == 'S03' || $(_this).text() === '签署中' && status == 'S04'||$(_this).text() === '待提交' && status == 'S02') {
				// 签署界面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../CommonPage/signIng.html', 'signIng', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '待提交' && status == 'S05') {
				//影像及留言界面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/imageList.html', 'imageList', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '复核' && status1 == '30') {
				// 预审信息补录界面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.setItem('typeFlagList', '01');
						mbank.openWindowByLoad('../Application/loanInfo.html', 'loanInfo', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '信贷打回') {
				// 影像及留言界面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/imageList.html', 'imageList', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '资料核查打回') {
				// 影像及留言界面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '02');
						localStorage.removeItem('typeFlagList');
						mbank.openWindowByLoad('../Images/imageList5.html', 'imageList5', 'slide-in-right');
					}
				});
			} else if ($(_this).text() === '合同生成') {
				// 跳转到 合同输入信息 页面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../ConSigning/conSignInfo.html', 'conSignInfo', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo,
							modifyFlag: 'N',
							fromPage: 'homePage'
						});
					}
				});
			} else if ($(_this).text() === '补充申请资料') {
				localStorage.setItem('typeFlag', '03');
				localStorage.setItem('typeFlagList', '02');
				mbank.openWindowByLoad('../Images/imageList2.html', 'imageList2', 'slide-in-right');
			} else if ($(_this).text() == '签署中' && status == '100' || $(_this).text() === '签署中' && status == '300' || $(_this).text() === '签署中' && status == '400') {
				// 跳转到 合同签署界面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../ConSigning/conSigning.html', 'conSigning', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo, // 合同编号
							fromPage: 'homePage'
						});
					}
				});
			} else if ($(_this).text() === '发送邮件') {
				// 跳转到合同信息查看界面
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../ConSigning/conSignInfo.html', 'conSignInfo', 'slide-in-right', {
							applCde: applCde,
							contNo: contNo,
							sendMail: 'Y',
							fromPage: 'homePage'
						});
					}
				});
			} else if ($(_this).text() === '合同修改') {
				// 先调用废纸合同接口，再跳转
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mui.confirm('合同修改会作废已存在的电子签，请确认是否要修改合同内容', ' ', ['取消', '确认'], function (e) {
							if (e.index == 1) {
								mbank.openWindowByLoad('../ConSigning/conSignInfo.html', 'conSignInfo', 'slide-in-right', {
									applCde: applCde,
									contNo: contNo,
									modifyFlag: 'Y',
									fromPage: 'homePage'
								});
							}
						}, 'div');
					}
				});
			} else if ($(_this).text() === '贷款信息修改') {
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						localStorage.setItem('typeFlag', '03');
						localStorage.setItem('typeFlagList', '04');
						mbank.openWindowByLoad('../Images/imageList3.html', 'imageList3', 'slide-in-right');
					}
				});
			}else if($(_this).text() === '转PC办理'){
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
						$('#waitingBox').hide();
						return;
					}else{
						$('#waitingBox').hide();
						mui.confirm('点击确定后办理渠道变更为经销商PC，在途电子签流程将作废，需在PC端下载并签署纸质合同。', ' ', ['取消', '确认'], function (e) {
							if (e.index === 1) {
								//切换办理渠道
								var _url = mbank.getApiURL() + 'transferAppLoanToOffline.do';
								mbank.apiSend('post', _url, {
									"applCde": applCde,
									"opTyp":'1'
								}, function (res) {
									$('#waitingBox').show();
									mui.alert(res.RET_MSG, "提示", "确定", function(){
										$('#waitingBox').hide();
										location.reload();
										mData.unLock(applCde, node, status1, '01').then(function(dat){
											if(dat=='Y'){
												return;
											}
										});
									}, 'div');
								},function(err){
									mCheck.callPortFailed(err.ec, err.em,"#waitingBox");
								});
							}else{
								setTimeout(function () {
									location.reload();
									mData.unLock(applCde, node, status1, '01').then(function(dat){
										if(dat=='Y'){
											return;
										}
									});
								}, 1000);
							}
						}, 'div');
					}
				});
			} else if ($(_this).text() === '上传放款资料') {
				// 预审信息补录界面
				if (handlingChannel == '01') {
					if (status == '08') {
						// 合同签署成功
						mData.editLock(applCde, node, status1,"","").then(function(dat){
							if(dat=="N"){
								$('#waitingBox').hide();
								return;
							}else{
								$('#waitingBox').hide();
								localStorage.setItem('typeFlag', '04');
								localStorage.removeItem('typeFlagList');
								mbank.openWindowByLoad('../Images/loanData.html', 'loanData', 'slide-in-right', {
									applCde: applCde,
									type: 'scfkzl'
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
						} else {
							mData.editLock(applCde, node, status1,"","").then(function(dat){
								if(dat=="N"){
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
					}, function (err) {
						$('#waitingBox').hide();
						mCheck.alert(err.em);
					}, true);
				}
			} else if ($(_this).text() === '重提放款任务' || $(_this).text() === '放款自动打回') {
				if (handlingChannel == '01') {
					localStorage.setItem('typeFlag', '04');
					localStorage.removeItem('typeFlagList');
					mData.editLock(applCde, node, status1,"","").then(function(dat){
						if(dat=="N"){
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
				} else {
					var _url2 = mbank.getApiURL() + "acInfCount.do";
					var _params2 = { applCde: applCde };
					mbank.apiSend('get', _url2, _params2, function (data) {
						if (data.iCount == "0") {
							$('#waitingBox').hide();
							mCheck.toast("请先到pc端打印合同信息");
						} else {
							mData.editLock(applCde, node, status1,"","").then(function(dat){
								if(dat=="N"){
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
					}, function (err) {
						$('#waitingBox').hide();
						mCheck.alert(err.em);
					}, true);
				}
			} else if ($(_this).text() === '复核打回') {
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
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
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
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
							'backFlag': '01'
						});
					}
				});
			} else if ($(_this).text() === '补充放款资料') {
				// 预审信息补录界面
				localStorage.setItem('typeFlag', '04');
				localStorage.setItem('typeFlagList', '03');
				mbank.openWindowByLoad('../Images/loanData2.html', 'loanData2', 'slide-in-right');
			} else if ($(_this).text() === '贷款信息修改') {
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
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
				mData.editLock(applCde, node, status1,"","").then(function(dat){
					if(dat=="N"){
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
									mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
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
			localStorage.setItem('backFlag', '01');
			mbank.openWindowByLoad('../ConSigning/conSignDetail.html', 'conSignDetail', 'slide-in-right', {
				applCde: $(this).parent().find('.applCde').text(),
				outStatus: $(this).parent('li').find('.status').attr('data-value'),
				handlingChannel: $(this).parent('li').attr('data-value'),
				loanPreList: true // 用于判断贷款详情显示哪个环节
			});
		});
		mCheck.isOneBtnLength('.table-view-cell', '.btn', '.more');
		mCheck.isOneBtnToggle('.table-view', '.more', '.btn');
	});
});
