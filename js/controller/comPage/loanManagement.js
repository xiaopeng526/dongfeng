'use strict';

define(function (require, exports, module) {
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	mui.init();
	var options = { "type": "date" };
	/* 日期插件*/
//	$('.time').on('tap', function () {
//		var _this = this;
//		mData.selectDate(options).then(function (res) {
//			$(_this).val(res.text);
//		});
//	});
	$(".time").on('click',function(){
		var _this=this;
		var deaId=this.id;
		var deaVal=$(_this).val();
		options.deaValYear = deaVal.substr(0, 4);
		options.deaValMonth = deaVal.substr(5, 2);
		options.deaValDay = deaVal.substr(8, 2);
		var startDate=options.beginYear+'-'+options.beginMonth+'-'+options.beginDay;
		var endDate=options.endYear+'-'+options.endMonth+'-'+options.endDay;
		weui.datePicker({
            start: startDate,
            end: endDate,
            onChange: function (item) {
            },
            onConfirm: function (item) {
            	var getDateVal=mData.clearDate(item[0].label,item[1].label,item[2].label);
            	$(_this).val(getDateVal);
            },
            title: '请选择申请日期',
            defaultValue:[options.deaValYear,options.deaValMonth,options.deaValDay],
            id:deaId
        });
	})
	/* 
 	获取服务器时间
  */
	function getNowdate() {
		var url = mbank.getApiURL() + "getSysTime.do";
		mbank.apiSend("post", url, {}, getSysSuc, sysFailFun, true);
	}
	function getSysSuc(data) {
		var sysDate = data.sysTime;
		var datetime = new Date(sysDate.substr(0, 4), parseInt(sysDate.substr(4, 2)) - 1, sysDate.substr(6, 2));
		options.beginYear = datetime.getFullYear() - 30;
		options.beginMonth = datetime.getMonth() + 1;
		options.beginDay = datetime.getDate();
		options.endYear = datetime.getFullYear() + 30;
		options.endMonth = datetime.getMonth() + 1;
		options.endDay = datetime.getDate();
		$('#applyEndTime').val(sysDate.substr(0, 4) + "-" + sysDate.substr(4, 2) + "-" + sysDate.substr(6, 2));
		$('#lendingEndTime').val(sysDate.substr(0, 4) + "-" + sysDate.substr(4, 2) + "-" + sysDate.substr(6, 2));
		var abcY = sysDate.substr(0, 4);
		var abcM = sysDate.substr(4, 2);
		var abcD = sysDate.substr(6, 2);
		if (parseInt(abcM) - 1 <= 0) {
			abcY = abcY - 1;
			abcM = "12";
		} else if (parseInt(abcM) - 1 < 10) {
			abcM = "0" + (parseInt(abcM) - 1);
		} else if (parseInt(abcM) - 1 >= 10) {
			abcM = parseInt(abcM) - 1;
		}
		$('#applyStartTime').val(abcY + "-" + abcM + "-" + abcD);
		$('#lendingStartTime').val(abcY + "-" + abcM + "-" + abcD);
	}
	function sysFailFun(err){
		mCheck.callPortFailed(err.ec, err.em,"#waitingBox");
	}
	function compairTime(a, b) {
		// 开始时间，结束时间
		if (!b) return true;
		var time1 = new Date(a).getTime();
		var time2 = new Date(b).getTime();
		if (a == '') {
			mui.toast("申请开始日期不能为空！", { type: 'div' });
			return false;
		};
		if (b == '') {
			mui.toast("申请结束日期不能为空！", { type: 'div' });
			return false;
		}
		if (time1 > time2) {
			mui.toast("申请开始日期不能大于结束日期！", { type: 'div' });
			return false;
		};
		//判断时间跨度是否大于3个月
		var arr1 = a.split('-');
		var arr2 = b.split('-');
		arr1[1] = parseInt(arr1[1]);
		arr1[2] = parseInt(arr1[2]);
		arr2[1] = parseInt(arr2[1]);
		arr2[2] = parseInt(arr2[2]);
		var flag = true;
		if (arr1[0] == arr2[0]) {
			//同年
			if (arr2[1] - arr1[1] > 3) {
				//月间隔超过3个月
				flag = false;
			} else if (arr2[1] - arr1[1] == 3) {
				//月相隔3个月，比较日
				if (arr2[2] > arr1[2]) {
					//结束日期的日大于开始日期的日
					flag = false;
				}
			}
		} else {
			//不同年
			if (arr2[0] - arr1[0] > 1) {
				flag = false;
			} else if (arr2[0] - arr1[0] == 1) {
				if (arr1[1] < 10) {
					//开始年的月份小于10时，不需要跨年
					flag = false;
				} else if (arr1[1] + 3 - arr2[1] < 12) {
					//月相隔大于3个月
					flag = false;
				} else if (arr1[1] + 3 - arr2[1] == 12) {
					//月相隔3个月，比较日
					if (arr2[2] > arr1[2]) {
						//结束日期的日大于开始日期的日
						flag = false;
					}
				}
			}
		}
		if (!flag) {
			mui.toast("开始日期和结束日期时间跨度不得超过3个月！", { type: 'div' });
			return false;
		}
		return true;
	}
	/* 
 	贷款状态
 */
	function pubApp() {
		var url = mbank.getApiURL() + "getPubAppByCode.do";
		mbank.apiSend("post", url, {
			aprCode: 'OUT_STS'
		}, function (res) {
			var appList = res.appList;
			appList.forEach(function (item) {
				item.text = item.appMes;
				item.value = item.appValue + '|' + item.appMes;
			});
			/* 贷款状态 */
			$('#loanStatus').on('click', function () {
				var _this = this;
				var getArrVal=mData.changePro(appList,this.id);
				weui.picker(getArrVal.proVal, {
					onChange: function (item) {
					},
					onConfirm: function (item) {
						$(_this).val(item[0].label).attr('data-value', item[0].value);
					},
					title: '请选择贷款状态',
					defaultValue:[getArrVal.indSeq],
					id:this.id
				});
			});
		},function(err){
			mCheck.callPortFailed(err.ec, err.em,"#waitingBox");
		});
	}
	/* 
 	获取消息数量
  */
	var queryCountsMessage = function queryCountsMessage() {
		var url = mbank.getApiURL() + 'queryCounts.do';
		var param = {
			wlm_crt_usr: localStorage.getItem("logonId")
		};
		mbank.apiSend("post", url, param, function (data) {
			if (data.aprFlag == null || data.aprFlag == '' || data.aprFlag == '0') {
				$('#iconBadge').html('').hide();
			} else {
				if (data.aprFlag >= 100) {
					$('#iconBadge').html('99+');
				} else {
					$('#iconBadge').html(data.aprFlag);
				}
				$('#iconBadge').show();
			}
		}, function(err){
			mCheck.callPortFailed(err.ec, err.em,"#waitingBox");
		}, true);
	};

	var userRole = localStorage.getItem("sessionUserRole");
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": "adjustResize"
		});
		var InScreen=mbank.isImmersed();

		/* 
  	获取服务器时间
   */
		getNowdate();
		/* 
  	贷款状态
   */
		pubApp();
		/* 
  	消息数量查询
  */
		queryCountsMessage();
		/* 
  	查询条件输入时，其他查询条件清空
   */
		$('#serchInput').on('keyup', function () {
			if ($(this).val()) {
				$('#applyStartTime').val('');
				$('#applyEndTime').val('');
				$('#loanStatus').val('');
			}
		});
		/* 
  	点击查询按钮
   */
		$('#searchBtn').on('tap', function () {
			var applyStartTime = $('#applyStartTime').val(),
			    applyEndTime = $('#applyEndTime').val(),
			    lendingStartTime = $('#lendingStartTime').val(),
			    lendingEndTime = $('#lendingEndTime').val(),
			    serchInput = $('#serchInput').val(),
			    loanStatus = $('#loanStatus').val();
			var time = applyStartTime.split('-');
			if (loanStatus) {
				loanStatus = $('#loanStatus').attr('data-value').split('|')[0];
			}
			if (serchInput) {
				applyStartTime = '';
				applyEndTime = '';
				loanStatus = '';
			}
			if (applyStartTime !== '' && applyEndTime !== '') {
				if (!compairTime(applyStartTime, applyEndTime)) return;
			}
			if (lendingStartTime !== '' && lendingEndTime !== '') {
				if (!compairTime(lendingStartTime, lendingEndTime)) return;
			}
			mbank.openWindowByLoad('loanList.html', 'loanList', 'slide-in-right', {
				startDateFSerach: applyStartTime, // 申请开始日期
				endDateFSerach: applyEndTime, // 申请结束日期
				lendingStartTime: lendingStartTime, // 放款开始日期
				lendingEndTime: lendingEndTime, // 放款结束日期
				customFSerach: serchInput,
				loanStatus: loanStatus // 贷款状态
			});
		});
		$('#homePage').on('tap', function () {
			// 首页
			localStorage.removeItem('firstFlag');
			mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-right');
		});
		$('#calculator').on('tap', function () {
			// 计算器
			mbank.openWindowByLoad('../Calculator/calculator.html', 'calculator', 'slide-in-right');
		});
		$('#mine').on('tap', function () {
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
		$('#bell').on('tap', function () {
			localStorage.removeItem('firstFlag');
			mbank.openWindowByLoad('../HomePage/message.html', 'message', 'slide-in-right', {
				message: 'message'
			});
		});
		$('#back').on('tap', function () {
			localStorage.removeItem('firstFlag');
			mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
		});
		mui.back = function () {
			localStorage.removeItem('firstFlag');
			mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
		};
	});
});