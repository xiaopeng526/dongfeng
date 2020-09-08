'use strict';

define(function (require, exports, module) {
	var mBank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mBank.addVconsole();
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	var applCde = localStorage.getItem('applCde');
	var newCarGrade = '';
	/* 
 		预审结论查询
  	*/
	$('#waitingBox').show();
	function queryDealerPreTrialConclusion(applCde){
		let _url = mBank.getApiURL() + 'queryDealerPreTrialConclusion.do';
		mBank.apiSend('post', _url, {
			"applCde" :  applCde  ,// 合同编号
		}, function (res) {
			$('#waitingBox').hide();
			var aprFlagRes = '';
			var riskGrade = res.riskGrade; // 双免
			if (res.applyAmt) $('#applyAmt').html(mCheck.addSeparator(res.applyAmt) + '元'); // 意向贷款金额
			if (res.firstScale) $('#firstScale').html(Math.round(res.firstScale*100) + '%'); // 意向比例
			if (res.adviselimit) $('#adviselimit').html(mCheck.addSeparator(res.adviselimit) + '元'); // 建议贷款金额
			if (res.advisepct) $('#advisepct').html(Math.round(res.advisepct*100) + '%'); // 建议比例		
			if (res.appConclusion){ 
				var appConclusion = res.appConclusion.substring(5);
				if(res.aprFlag == '3'&&(res.carType === '02'|| res.carType === '03')){
					if(res.appConclusion.indexOf('预审未准入')>=0){
						appConclusion = res.appConclusion;
						$('.advice').hide();
					}else{
						$('.advice').html('拒绝原因');
						appConclusion = res.appConclusion;
					}
				}else if((res.carType === '01' && res.aprFlag == '3')||(res.carType === '01' && res.aprFlag == '1' && riskGrade == 'L')){
					appConclusion = res.appConclusion;
					$('.advice').hide();
				}
				$('.appConclusion').html('<p>' + appConclusion + '</p>'); //预审建议
			}
			if (res.carType === '01') { // 本品牌新车  
				if (res.aprFlag == '1') { // 无预审建议，只显示官方建议金额和首付比例
					aprFlagRes = '预审通过';
					$('.custom').hide(); // 客户意向贷款金额和客户意向首付比例
					if(riskGrade == 'L'){
						$('.pre-result-foot').show().html('可免抵押 免保证人').css({
							color: '#dc5f73',
							fontWeight : 700,
							textAlign : 'center'
						})
						newCarGrade = 'sm';
					}
				} else if (res.aprFlag == '0'||res.aprFlag =='4') { // 显示预审建议、四个都显示，但官方建议金额和首付比例显示--
					aprFlagRes = '人工审核';
					$('#adviselimit, #advisepct').html('--');
					$('.pre-result-foot').show(); // 预审建议
				} else if (res.aprFlag == '3') { // 无预审建议，四个都显示，但官方建议金额和首付比例显示--
					aprFlagRes = '预审拒绝';
					$('#adviselimit, #advisepct').html('--');
					//$('.pre-result-foot').show(); // 预审建议
				}
			} else if (res.carType === '02' || res.carType === '03') { // 全品牌新车03、二手车02
				if (res.aprFlag == '1') { // 无预审建议，只显示客户意向贷款金额和首付比例
					aprFlagRes = '预审准入—通过';
					$('.mastor').hide(); // 客户意向贷款金额和客户意向首付比例
				} else if (res.aprFlag == '0') { // 显示预审建议、四个都显示，
					aprFlagRes = '预审准入—附条件';
					$('.pre-result-foot').show(); // 预审建议
				} else if(res.aprFlag == '4'){
					aprFlagRes = '人工审批';
					$('#adviselimit, #advisepct').html('--');
					$('.pre-result-foot').show(); // 预审建议
				}else if (res.aprFlag == '3') { //  显示预审建议、四个都显示，但官方建议金额和首付比例显示--
					aprFlagRes = '预审拒绝';
					$('#adviselimit, #advisepct').html('--');
					$('.pre-result-foot').show(); // 预审建议
				} 
			}
			// 是否可以 预审补录
			if (res.aprFlag == '3' && res.flag === 'Y') $('.mui-bar-footer').show();
			if (res.aprFlag == '1' || res.aprFlag == '0'||res.aprFlag=='4') $('.mui-bar-footer').show();
			$('.pre-result-head').html(aprFlagRes);
		}, function(err){
			mCheck.alert(err.em);
			$('#waitingBox').hide();
		});
	}
	mui.plusReady(function(){
		const self = plus.webview.currentWebview();
		self.setStyle({
            "popGesture":"none",    //窗口无侧滑返回功能
            "scrollIndicator":"none",
            "softinputMode": "adjustResize"
      	});
		mBank.isImmersed();
//		var applCde = self.applCde;
		var preResult = self.preResult || '';
		/* 预审结论查询 */
		queryDealerPreTrialConclusion(applCde);
		if (preResult) {
			$('.mui-bar-footer').show();
			$('#submit').text('返回');
		}
		$('#submit').on('tap', function () {
			if ($(this).text() === '预审补录') {
				mBank.openWindowByLoad('../Application/loanInfo.html', 'loanInfo', 'slide-in-right', {'newCarGrade': newCarGrade}); 
			} else if ($(this).text() === '返回') {
				$('#waitingBox').show();
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						$('#waitingBox').hide();
						plus.webview.hide(self.id);
						plus.webview.close(self.id);
					}
				});	
			}
		});
		
		mui.back = function(){
			if($('#waitingBox').is(':visible')){  //如果loading框显示，不能点击手机返回按键
				return;
			}
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					plus.webview.hide(self.id);
					plus.webview.close(self.id);
				}
			});	
		}
		
		back.addEventListener('tap', function(){
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					plus.webview.hide(self.id);
					plus.webview.close(self.id);
				}
			});		
		})
	})
})
