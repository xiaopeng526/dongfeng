'use strict';

define(function (require, exports, module) {
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	var applCde = localStorage.getItem('applCde');
	mbank.addVconsole();
	mui.init();
	/* 
 	消息推送是否已读
  */
	function updateSysMessage(messageId) {
		var _url = mbank.getApiURL() + 'updateSysMessage.do';
		mbank.apiSend('post', _url, {
			wlm_crt_usr: localStorage.getItem("logonId"),
			messageId: messageId
		}, function (res) {});
	}
	/* 
 	查询是否展示连接人
  */
	function queryJointFree(applCde, isJointFree) {
		var _url = mbank.getApiURL() + 'queryJointFree.do';
		mbank.apiSend('post', _url, {
			"applCde": applCde // 合同编号
		}, function (res) {
			// jointFree == 'Y' isJointFree == '是' || isJointFree == '否' 合同是否免共借 展示  
			// jointFree == 'N' isJointFree == '是' || isJointFree == '否' 合同是否免共借 不展示 
			if (res.jointFree === 'Y') {
				if (isJointFree) {
					if (isJointFree == '否') {
						$('#condition3').html('合同是否免共借 <i class="error">' + isJointFree + '</i>'); // 合同是否免共借
					} else {
						$('#condition3').html('合同是否免共借 <i>' + isJointFree + '</i>'); // 合同是否免共借
					}
					$('#condition3').show();
				} else {
					$('#condition3').hide();
				}
			} else {
				$('#condition3').hide();
			}
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});
	}
	/* 
 	获取贷款详情信息
  */
	var isJointFreeFlag = '';
	function getLoanDetail(applCde) {
		var _url = mbank.getApiURL() + 'CFLoanDetailsQuery.do';
		mbank.apiSend('post', _url, {
			applCde: applCde
		}, function (res) {
			isJointFreeFlag = res.isJointFree;
			if(res.isShow=='Y'&& res.riskGrd){
				$('#applCde').html(applCde + '<span style="color:#dc5f73;font-weight:600;"> （' + res.riskGrd + '）</span>'); // 申请编号
			}else{
				$('#applCde').text(applCde); // 申请编号
			}
			//if (res.riskGrd) $('.risk').text(' (' + res.riskGrd + ')'); // 风险等级 
			if (res.lastChgDt) $('#lastChgDt').text(res.lastChgDt); // 最后操作时间
			if (res.custName) $('#custName').text(res.custName); // 客户姓名
			if (res.carModel) $('#carType').text(res.carModel); // 车辆型号
			if (res.loanTyp) $('#loanProduct').text(res.loanTyp); // 贷款产品
			if (res.applyAmt) $('#loanAmount').text('￥' + mCheck.addSeparator(res.applyAmt)); // 贷款总金额
			if (res.applyTnr) $('#loanTime').text(res.applyTnr + '期'); // 申请期限
			if (res.loanIntRate) $('#loanRate').text((res.loanIntRate * 100).toFixed(2) + '%'); // 执行利率 
			$('#loanStatus').html(res.sts); // 贷款状态
			if (res.sts && res.sts.length > 6) $('.three p #loanStatus').css('font-size', '.24rem');
			if (res.applyAmt && res.applyAmt.length >= 10) $('.three p #loanAmount').css('font-size', '.24rem');
			if (res.mortgage) {
				if (res.mortgage == '否') {
					$('#condition1').html('免抵押 <i class="error">' + res.mortgage + '</i>'); //  是否免抵押
				} else {
					$('#condition1').html('免抵押 <i>' + res.mortgage + '</i>'); //  是否免抵押
				}
			}
			if (res.noGuarantee) {
				if (res.noGuarantee == '否') {
					$('#condition2').html('免担保 <i class="error">' + res.noGuarantee + '</i>'); // 是否免担保
				} else {
					$('#condition2').html('免担保 <i>' + res.noGuarantee + '</i>'); // 是否免担保
				}
			}
			if (res.carType == '02' || res.carType == '03') {
				$('#condition1').hide();
				$('#condition2').hide();
			}
			if (res.isJointFree) {
				if (res.isJointFree == '否') {
					$('#condition3').html('合同是否免共借 <i class="error">' + res.isJointFree + '</i>'); // 合同是否免共借
				} else {
					$('#condition3').html('合同是否免共借 <i>' + res.isJointFree + '</i>'); // 合同是否免共借
				}
				//$('#condition3').show();
			} else {
				$('#condition3').hide();
			}
			if (res.handlingChannel && res.handlingChannel === '02') $('#custName').addClass('custName');
			var loanAppPlan = res.loanAppPlan || '1';
			var receivingWay = res.receivingWay;
			applProcess(loanAppPlan, applCde, res.outSts, res.handlingChannel, receivingWay);
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});
	}
	function applProcess(flag, applCde, outStatus, handlingChannel, receivingWay) {
		if (flag == '1') {
			// 预审代办
			$('#preLoan').removeClass('suff reff').addClass('active').siblings().removeClass('active');
			$('#loanTyp, .loanIntRate, .applyTnr, .four').hide(); // 贷款产品 执行利率 申请期限 条件
			$('#pageLabel').text('预审信息');
			if (outStatus === '106' || outStatus === '111') $('.preLoan').css({ 'opacity': 1, height: '.8rem' }); // 预审结论
			if (handlingChannel === '02' && receivingWay != '01') {
				$('#preLoan').off('tap');
				$('#preLoan').removeClass('active reff suff');
			} else {
				handlingChannel = '01';
			}
		} else if (flag == '2') {
			// 申请代办
			$('#preApply').removeClass('suff reff').addClass('active').siblings().removeClass('active');
			$('#preApply').prev().addClass('reff').removeClass('suff');
			$('#condition3').hide();
			$('#pageLabel').text('申请信息');
			if (handlingChannel === '02' && receivingWay != '01') {
				$('#preLoan').off('tap');
				$('#preLoan').removeClass('active reff suff');
			} else {
				handlingChannel = '01';
			}
		} else if (flag == '3') {
			// 合同签订
			$('#preCon').removeClass('suff reff').addClass('active').siblings().removeClass('active');
			$('#preCon').prevAll().addClass('reff').removeClass('suff');
			$('#pageLabel').text('合同签订');
			if (handlingChannel === '02' && receivingWay != '01') {
				$('#preLoan').off('tap');
				$('#preLoan').removeClass('active reff suff');
			} else {
				handlingChannel = '01';
			}
		} else if (flag == '4') {
			// 放款代办
			$('#sufLoan').removeClass('suff reff').addClass('active').siblings().removeClass('active');
			$('#sufLoan').prevAll().addClass('reff').removeClass('suff');
			$('#pageLabel').text('放款信息');
			if (handlingChannel === '02' && receivingWay != '01') {
				$('#preLoan').off('tap');
				$('#preLoan').removeClass('active reff suff');
			} else {
				handlingChannel = '01';
			}
		} else if (flag == '5') {
			// 完成
			$('#loan').removeClass('suff reff').addClass('active').siblings().removeClass('active');
			$('#loan').prevAll().addClass('reff').removeClass('suff');
			$('.detail').children('li').hide();
			$('#loanHistory').show();
			if (handlingChannel === '02' && receivingWay != '01') {
				$('#preLoan').off('tap');
				$('#preLoan').removeClass('active reff suff');
			} else {
				handlingChannel = '01';
			}
		}
		queryJointFree(applCde, isJointFreeFlag);
		/* 
  	流程图片切换
   */
		$('.status-img').on('tap', 'li', function () {
			if (flag == '1' && $(this).index() == 0 && handlingChannel !== '02') {
				// 预审
				$(this).removeClass('reff suff').addClass('active').siblings().removeClass('active');
				$(this).siblings().off('tap');
				$('#loanTyp, .loanIntRate, .applyTnr, .four').hide(); // 贷款产品 执行利率 申请期限 条件
				$('#pageLabel').text('预审信息');
				if (outStatus === '106' || outStatus === '111') $('.preLoan').css({ 'opacity': 1, height: '.8rem' }); // 预审结论
				if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
			} else if (flag == '2') {
				// 申请
				if ($(this).index() == 0 && handlingChannel !== '02') {
					// 预审
					$(this).removeClass('reff suff').addClass('active').siblings().removeClass('active');
					$('#preApply').removeClass('reff').addClass('suff');
					$('#preApply').nextAll().off('tap');
					$('#condition3').hide();
					$('#pageLabel').text('预审信息');
					$('.detail').children('li').eq(0).show();
					$('.preLoan').css({ 'opacity': 1, height: '.8rem' }); // 预审结论
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				} else if ($(this).index() == 1) {
					// 申请
					$(this).removeClass('reff suff').addClass('active').siblings().removeClass('active');
					$(this).prev().removeClass('suff').addClass('reff');
					$(this).nextAll().off('tap');
					$('#condition3').hide();
					$('#pageLabel').text('申请信息');
					$('.detail').children('li').eq(0).show();
					$('.preLoan').css({ 'opacity': 0, height: 0 });
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				}
			} else if (flag == '3') {
				// 合同
				//queryJointFree(applCde, isJointFreeFlag);
				if ($(this).index() == 0 && handlingChannel !== '02') {
					// 预审
					$(this).removeClass('suff reff').addClass('active').siblings().removeClass('active');
					$('#preApply, #preCon').removeClass('reff').addClass('suff');
					$('#preCon').nextAll().off('tap');
					$('#pageLabel').text('预审信息');
					$('.detail').children('li').show();
					$('.preLoan').css({ 'opacity': 1, height: '.8rem' }); // 预审结论
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				} else if ($(this).index() == 1) {
					// 申请
					$(this).removeClass('suff reff').addClass('active').siblings().removeClass('active');
					$('#preLoan').removeClass('suff').addClass('reff');
					$('#preCon').removeClass('reff').addClass('suff');
					$('#preCon').nextAll().off('tap');
					$('#pageLabel').text('申请信息');
					$('.detail').children('li').eq(0).show();
					$('.preLoan').css({ 'opacity': 0, height: 0 });
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				} else if ($(this).index() == 2) {
					// 合同
					$(this).removeClass('suff reff').addClass('active').siblings().removeClass('active');
					$(this).prevAll().removeClass('suff').addClass('reff');
					$(this).nextAll().off('tap');
					$('#pageLabel').text('合同签订');
					$('.detail').children('li').eq(0).show();
					$('.preLoan').css({ 'opacity': 0, height: 0 });
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				}
			} else if (flag == '4') {
				// 放款
				if ($(this).index() == 0 && handlingChannel !== '02') {
					// 预审
					$(this).removeClass('suff reff').addClass('active').siblings().removeClass('active');
					$('#preApply, #preCon, #sufLoan').removeClass('reff').addClass('suff');
					$('#sufLoan').next().off('tap');
					$('#pageLabel').text('预审信息');
					$('.detail').children('li').show();
					$('.preLoan').css({ 'opacity': 1, height: '.8rem' }); // 预审结论
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				} else if ($(this).index() == 1) {
					// 申请
					$(this).removeClass('suff reff').addClass('active').siblings().removeClass('active');
					$('#preLoan').removeClass('suff').addClass('reff');
					$('#preCon, #sufLoan').removeClass('reff').addClass('suff');
					$('#sufLoan').next().off('tap');
					$('#pageLabel').text('申请信息');
					$('.detail').children('li').show();
					$('.preLoan').css({ 'opacity': 0, height: 0 });
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				} else if ($(this).index() == 2) {
					// 合同
					$(this).removeClass('reff suff').addClass('active').siblings().removeClass('active');
					$('#preLoan, #preApply').removeClass('suff').addClass('reff');
					$('#sufLoan').removeClass('reff').addClass('suff');
					$('#sufLoan').next().off('tap');
					$('#pageLabel').text('合同签订');
					$('.detail').children('li').eq(0).show();
					$('.preLoan').css({ 'opacity': 0, height: 0 });
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				} else if ($(this).index() == 3) {
					// 放款
					$(this).removeClass('reff suff').addClass('active').siblings().removeClass('active');
					$(this).prevAll().removeClass('suff').addClass('reff');
					$(this).next().off('tap');
					$('#pageLabel').text('放款信息');
					$('.detail').children('li').eq(0).show();
					$('.preLoan').css({ 'opacity': 0, height: 0 });
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				}
			} else if (flag == '5') {
				// 完成
				if ($(this).index() == 0 && handlingChannel !== '02') {
					// 预审
					$(this).removeClass('reff suff').addClass('active').siblings().removeClass('active');
					$(this).nextAll().removeClass('reff').addClass('suff');
					$('#pageLabel').text('预审信息');
					$('.detail').children('li').show();
					$('.preLoan').css({ 'opacity': 1, height: '.8rem' }); // 预审结论
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				} else if ($(this).index() == 1) {
					// 申请
					$(this).removeClass('reff suff').addClass('active').siblings().removeClass('active');
					$(this).prev().removeClass('suff').addClass('reff');
					$(this).nextAll().removeClass('reff').addClass('suff');
					$('#pageLabel').text('申请信息');
					$('.detail').children('li').show();
					$('.detail').children('li').eq(0).show();
					$('.preLoan').css({ 'opacity': 0, height: 0 });
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				} else if ($(this).index() == 2) {
					// 合同
					$(this).removeClass('reff suff').addClass('active').siblings().removeClass('active');
					$(this).prevAll().removeClass('suff').addClass('reff');
					$(this).nextAll().removeClass('reff').addClass('suff');
					$('#pageLabel').text('合同签订');
					$('.detail').children('li').eq(0).show();
					$('.preLoan').css({ 'opacity': 0, height: 0 });
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				} else if ($(this).index() == 3) {
					// 放款
					$(this).removeClass('reff suff').addClass('active').siblings().removeClass('active');
					$(this).prevAll().removeClass('suff').addClass('reff');
					$(this).next().removeClass('reff').addClass('suff');
					$('#pageLabel').text('放款信息');
					$('.detail').children('li').eq(0).show();
					$('.preLoan').css({ 'opacity': 0, height: 0 });
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				} else {
					// 完成
					$(this).removeClass('reff suff').addClass('active').siblings().removeClass('active');
					$(this).prevAll().removeClass('suff').addClass('reff');
					$('.detail').children('li').hide();
					$('#loanHistory').show(); // 贷款产品 执行利率  条件
					$('.preLoan').css({ 'opacity': 0, height: 0 });
					if (handlingChannel === '02') $('#preLoan').removeClass('active reff suff');
				}
			}
		});
	}

	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		var applCde = self.applCde || '';
		var message = self.message || '';
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();
		var contNo = self.contNo; // 合同编号 '2319051700002A';
		var outStatus = self.outStatus || '';
		//let handlingChannel = self.handlingChannel || '';
		//if (handlingChannel === '02') $('#custName').addClass('custName');
		/* 
  	调用贷款详情信息
   */
		getLoanDetail(applCde);
		/* 
  	点击li页面跳转
   */
		$('.detail').on('tap', 'li', function () {
			localStorage.setItem('applCde', applCde);
			if ($(this).children('label').text() == '贷款历史') {
				mbank.openWindowByLoad('../comPage/loanHistory.html', 'loanHistory', 'slide-in-right', {
					applCde: applCde
				});
			} else if ($(this).children('label').text() == '预审信息') {
				mbank.openWindowByLoad('../details/loanPre.html', 'loanPre2', 'slide-in-right', {
					applCde: applCde
				});
			} else if ($(this).children('label').text() == '申请信息') {
				mbank.openWindowByLoad('../details/loanInfo.html', 'loanInfo2', 'slide-in-right', {
					applCde: applCde
				});
			} else if ($(this).children('label').text() == '合同签订') {
				mbank.openWindowByLoad('./conSignInfo.html', 'conSignInfo', 'slide-in-right', {
					applCde: applCde,
					loadDetail: 'Y'
				});
			} else if ($(this).children('label').text() == '放款信息') {
				mbank.openWindowByLoad('../details/loanData.html', 'loanData2', 'slide-in-right', {
					applCde: applCde
				});
			} else if ($(this).children('label').text() == '预审结论') {
				mbank.openWindowByLoad('../CommonPage/preResult.html', 'preResult', 'slide-in-right', {
					preResult: 'preResult',
					applCde: applCde
				});
			}
		});
		// 
		if (message) {
			updateSysMessage(self.messageId);
			localStorage.removeItem('firstFlag');
			$('#back').on('tap', function () {
				mui.back = function () {
					mbank.openWindowByLoad('../HomePage/message.html', 'message', 'slide-in-left');
				};
			});
			mui.back = function () {
				mbank.openWindowByLoad('../HomePage/message.html', 'message', 'slide-in-left');
			};
		}
	});
});