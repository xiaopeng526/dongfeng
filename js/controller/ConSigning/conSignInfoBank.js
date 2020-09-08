'use strict';

define(function (require, exports, module) {
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	mui.init();
	/* 
 	开户银行查询
 */
	function queryBankName() {
		var _url = mbank.getApiURL() + 'queryBankName.do';
		mbank.apiSend('post', _url, {}, function (res) {
			var iBankList = res.iBankList;
			iBankList.forEach(function (item) {
				item.text = item['sa_acc_bank_name'];
				item.value = item['sa_acc_bank_cde'];
			});
			$('#amountBank').on('click', function () {
				var getArrVal=mData.changePro(iBankList,this.id);
	        	weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		            	$('#amountBank').val(item[0].label).attr('data-value', item[0].value);
		            },
		            title: '请选择开户银行',
		            defaultValue:[getArrVal.indSeq],
		            id:this.id
		        })
			});
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});
	}
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		var ac = self.ac;
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		mbank.isImmersed();
		/* 
  	开户银行 查询 
  */
		var applCde = self['applCde'],
		    appl_ac_nam = self['appl_ac_nam'],
		    city = '',
		    bankName = self.bankName;
		if (bankName) $('#appl_ac_bchname').text(bankName);
		queryBankName();

		/* 
  	选择开户行所在省 
   */
		$('#amountProvice').on('click', function () {
			var getArrVal=mData.changePro(ONLY_PRO,this.id);
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	                var cityName=item[0].label;
	                var proVal=JSON.parse(JSON.stringify(PRO_CITY).replace(/text/g,"label"));
	                for(var i=0;i<proVal.length;i++){
						if(cityName==proVal[i].label){
							city=proVal[i].children;
						}
					}
					$('#amountProvice').val(item[0].label).attr('data-value', item[0].value);
	            },
	            title: '请选择开户行所有省',
	            defaultValue:[getArrVal.indSeq],
	            id:this.id
	        });
		});
		/* 
  	选择开户行所在 市
  */
		$('#amountCity').on('click', function () {
			var getArrVal=mData.changePro(city,this.id);
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	                $('#amountCity').val(item[0].label).attr('data-value', item[0].value);
	            },
	            title: '请选择开户行所有市',
	            defaultValue:[getArrVal.indSeq],
	            id:this.id
	        });
		});
		/* 
  	点击 页面跳转到 银行列表 
  */
		$('#select-bank').on('tap', function () {
			if ($("#amountBank").val() !== '') {
				mbank.openWindowByLoad('conSignInfoSelectBank.html', 'conSignInfoSelectBank', 'slide-in-right', {
					sa_acc_bank_cde: $("#amountBank").attr('data-value'), // 开户行编码
					add_province: $("#amountProvice").attr("data-value"), // 所在省
					add_city: $("#amountCity").attr("data-value"), // 所在市
					sa_acc_bank: $("#amountBank").val(), // 开户行
					add_provinceC: $("#amountProvice").val(), // 开户省
					add_cityC: $("#amountCity").val(),
					'ac': ac
				});
			} else {
				mui.toast('开户银行不能为空', { type: 'div' });
			}
		});
		/* 
  	点击确定，页面跳转到 合同信息输入页面 
  */
		$('#next').on('tap', function () {
			var bankName = $("#amountBank").val() + '|' + $("#amountProvice").val() + '|' + $("#amountCity").val();
			var bankNameCode = $("#amountBank").attr('data-value') + '|' + $("#amountProvice").attr("data-value") + '|' + $("#amountCity").attr("data-value");
			var bankProvice = $("#amountProvice").val();
			var bankProviceCode = $("#amountProvice").attr("data-value");
			var chidView = plus.webview.getWebviewById("conSignInfo");
			mui.fire(chidView, "bankSelect", { bankName: bankName, bankNameCode: bankNameCode, ac: ac });
			mui.fire(chidView, "bankSelectRc", { bankName: bankName, bankNameCode: bankNameCode, bankProvice: bankProvice, bankProviceCode: bankProviceCode, ac: ac });
			plus.webview.hide(self.id);
			plus.webview.close(self.id);
		});
		window.addEventListener('depositBank', function (event) {
			// '开户行编码|开户行名称|开户支行编码|开户支行名称|开户省|开户市'
			$("#amountBank").val = event.sa_acc_bank_cde;
			$("#amountProvice").val = event.add_province;
			$("#amountCity").val = event.add_city;
		});
	});
});