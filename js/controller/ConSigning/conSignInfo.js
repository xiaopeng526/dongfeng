'use strict';

define(function (require, exports, module) {
	mui.init();
	var mbank = require('../../core/bank');
	var mCheck = require('../../core/check');
	var mData = require('../../core/requestData');
	mbank.addVconsole();
	var list = { //页面暂存数据
		'canClick': true, //控制按钮重复点击
	}
	var applCde = localStorage.getItem('applCde');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	var loanContNo = '',// 合同编号
		goodsSeq = '',// 车辆流水号
		channelFlag = '',// 进件渠道标识
		channelType = '',// 经销商渠道类型	
		carType = '',// 车辆类型
		currentNodeFlag = '',//此申请当前流程节点
		verifyFlag = 'N',// 没有打印过合同
		controlFlag = '',//防重复提交
		accFlag = '',// 账号 
		fileFlag = '',// 车架号
		acSub = '0',// 还款账号
		rcSub = '0',// 收款账号
		isFullFlag = '',
		subFlag = '',// 开户凭证
		flagN = true,// 账号格式是否校验正确
		acFlagCode = '0',
	    rcFlagCode = '0',
	    fromPage = '',
	    REGFADONGJI = new RegExp(/^[0-9a-zA-Z ]+$/); // 发动机号校验


	/* 处理后台返回数据为空的字段 */
	function dataIsNull(data) {
		data = data || '';
		if (data === null || data === undefined || data === 'undefined' || data.toString().trim() === '' || data === 'null' || data === 'undefined,undefined') {
			return '';
		}
		return data;
	}
	/* 还款账号信息 证件号码和证件类型 默认不可点击 */
	$('#idtype').off('tap');
	/* 
 *	基本信息 查询
 */
	function contBasInfo(applCde, modifiFlag, sendMail, loadDetail) {
		var _url = mbank.getApiURL() + 'queryContBasInfo.do';
		mbank.apiSend('post', _url, {
			"currentBusinessCode": "CF005001",
			"applCde": applCde // 申请单号
		}, function (res) {
			applCde = res.applCde;
			loanContNo = res.loanContNo, // 合同编号
			goodsSeq = res.goodsSeq; // 车辆流水号
			channelType = res.channelTyp; // 经销商渠道类型
			carType = res.carType; // 车辆类型
			verifyFlag = res.verifyFlag; //是否打印过合同
			currentNodeFlag = res.temp; // 此申请当前流程节点
			var intRate = res.intRate,// 利率
			 	fltsSbsyVal = res.fltsSbsyVal,// 经销商贴息
				operationFlag = res.operationFlag; // 操作节点，用于判断上牌城市修改次数
			intRate = dataIsNull(intRate) < 1 ? intRate * 100 : intRate; // 利率
			fltsSbsyVal = dataIsNull(fltsSbsyVal) < 1 ? fltsSbsyVal * 100 : fltsSbsyVal; // 经销商贴息
			$('#custname').text(dataIsNull(res.custname)); // 客户姓名
			$('#typDesc').text(dataIsNull(res.typDesc)); // 货款品种
			$('#vehcarprice').text(mCheck.addSeparator(dataIsNull(res.vehcarprice)) + ' 元'); // 车辆价格
			$('#contLoanAmt').text(mCheck.addSeparator(dataIsNull(res.contLoanAmt)) + ' 元'); // 贷款金额
			if (dataIsNull(intRate) !== '') $('#intRate').text(dataIsNull(intRate).toFixed(2) + ' %');
			if (dataIsNull(fltsSbsyVal) !== '') $('#fltsSbsyVal').text(dataIsNull(fltsSbsyVal).toFixed(2) + ' %');
			$('#lic_city').val(mCheck.formatCity(dataIsNull(res.lic_city), CITY_DATA)).attr('data-value', res.lic_city); // 上牌省市
			/* 
   *	只有当为审批通过、资料核实和上传放款资料节点才能编辑合同信息
   */
			if (verifyFlag == 'N' || modifiFlag == 'Y' || modifiFlag == 'N') {
				// 未打印过合同或修改页面
				if (carType === '02') {
					// 二手车不能编辑车架号和上传车架号
					$('#veh_chassis').prop('disabled', true);
					$('#vehCarmer').hide(); // 车架号相机
				}
			} else {
				// 打印过合同页面不可编辑
				if (currentNodeFlag == 0) {
					$('input').prop('disabled', true).off('tap'); // 不可点击
					$('.info .icon__go').hide();
					$('#amountBank').off('tap'); // 开户银行不可跳转页面- 还款账号信息
					$('#vehCarmer, #accCarmer, #recAccCarmer').hide(); // 车架号、账号相机
				}
			}
			if (sendMail == 'Y' || loadDetail == 'Y') {
				$('input').prop('disabled', true).off('tap'); // 不可点击
				$('.info .icon__go').hide();
				$('#amountBank').off('tap'); // 开户银行不可跳转页面- 还款账号信息
				$('#vehCarmer, #accCarmer, #recAccCarmer').hide(); // 车架号、账号相机
			}
			if (channelType == '10') {
				// 渠道类型经销商为二手车 收款账号信息 展示, 否则不展示
				$('.receipt-amount-info').show();
			}
		},function(err){
			mCheck.callPortFailed(err.ec, err.em);
		});
	}
	/*
 	之前PF单号方法
 */
	function rcKindChange(applCde, modifiFlag) {
		$('#certTypeLi, #certNoLi').css({ opacity: 0, height: 0 }); // 证件类型、证件号码、账号相机不显示
		$('#certType, #certNo, #recAccCarmer').hide();
		$('#rc_oragnizename_li, #rc_province_li').css({ height: '.8rem', opacity: 1 }); // 开户机构
		$('#appl_rc_no').attr('disable', true);
		$('#appl_rc_bchname').next().hide();
		$('#rc_oragnizename').show();
		var _url = mbank.getApiURL() + 'queryCoorAccInfo.do';
		mbank.apiSend('post', _url, assembParam(applCde, modifiFlag), function (res) {
			$('#appl_rc_nam').val(dataIsNull(res.co_acctname)); // 账号户名
			$('#appl_rc_bchname').val(dataIsNull(res.co_banknam)).attr('data-value', dataIsNull(res.co_bankcde)); // 开户银行
			$('#appl_rc_no').val(dataIsNull(res.co_acctno)); // 账号
			$('#rc_province').val(res.provinceName).attr('data-value', res.add_province); // 开户行所在地省
			$('#rc_oragnizename').val(dataIsNull(res.co_bchnam)).attr('data-value', dataIsNull(res.co_bchcde)); // 开户机构	
			$('#appl_rc_nam, #appl_rc_bchname,#appl_rc_no, #rc_province, #rc_oragnizename').prop('disabled', true);
		});
	}
	/* 
 	合同信息 查询（车辆信息、还款证号信息、收款账号信息）
 */
	function queryOffInfo(applCde, modifiFlag) {
		var _url = mbank.getApiURL() + 'oldOfferInfQuery.do';
		mbank.apiSend('post', _url, {
			"applCde": applCde // 申请单号
		}, function (res) {
			channelFlag = res.channelFlag; // 进件渠道标识	
			channelType = res.channelType; // 经销商渠道类型
			/* 收款账号信息 */
			var appl_ac_bch = res.appl_ac_bch,// 还款银行编码
				alipay_no = res.alipay_no,//   支付宝账号
				appl_rc_bch = res.appl_rc_bch,//   开户银行编码
				appl_rc_bchname = res.appl_rc_bchname,//   开户银行名称
				rc_oragnizename = res.rc_oragnizename,//  开户机构
				rc_oragnize = res.rc_oragnize,// 开户机构编码
				certType = res.certType,// 证件类型
				certNo = res.certNo,// 证件号码
				rc_province = res.rc_province; // 开户行所在地（省）
			if (res.appl_rc_kind) {
				// 收款账户信息   银行账户类型
				$('#appl_rc_kind').val(mCheck.formatData(dataIsNull(res.appl_rc_kind), BANK_AMOUNT_TYPE)).attr('data-value', dataIsNull(res.appl_rc_kind)); // 如果为二手车 银行账户类型
			} else {
				$('#appl_rc_kind').val('经销商账户').attr('data-value', '01');
			}
			/* 车辆信息 */
			$('#veh_chassis').val(dataIsNull(res.veh_chassis)); // 车架号
			$('#veh_engin_no').val(dataIsNull(res.veh_engin_no)); // 发动机号
			/* 还款账号信息 */
			if (res.appl_ac_kind) {
				$('#appl_ac_kind').val(mCheck.formatData(dataIsNull(res.appl_ac_kind), AMOUNT_TYPE)).attr('data-value', dataIsNull(res.appl_ac_kind)); // 银行账户类型
			} else {
				$('#appl_ac_kind').val('个人账户').attr('data-value', '06'); // 银行账户类型
			}
			$('#appl_ac_nam').val(dataIsNull(res.appl_ac_nam)).attr('data-value', dataIsNull(res.appl_ac_nam) + '|' + dataIsNull(res.idtype) + '|' + dataIsNull(res.idNo)); // 账户户名
			$('#appl_ac_bchname').val(dataIsNull(res.appl_ac_bchname)).attr('data-value', dataIsNull(res.appl_ac_bch)); // 开户银行
			$('#appl_ac_no').val(dataIsNull(res.appl_ac_no)); // 账号
			$('#idtype').val(mCheck.formatData(dataIsNull(res.idtype), CARD_TYPE)).attr('data-value', dataIsNull(res.idtype)); // 证件类型
			//$('#idtype').val(res.idtype);
			$('#idNo').val(dataIsNull(res.idNo)); // 证件号码
			if (appl_ac_bch === '104') {} // 根据银行判断 账户户名是否可下列表选择

			/* 收款账号信息 */
			$('#appl_rc_nam').val(dataIsNull(res.appl_rc_nam)); // 账号户名
			$('#appl_rc_bchname').val(dataIsNull(res.appl_rc_bchname)).attr('data-value', dataIsNull(res.appl_rc_bch)); // 开户银行
			$('#appl_rc_no').val(dataIsNull(res.appl_rc_no)); // 账号
			$('#certType').val(mCheck.formatData(dataIsNull(res.certType), CARD_TYPE)).attr('data-value', dataIsNull(res.certType)); // 证件类型
			$('#certNo').val(dataIsNull(res.certNo)); // 证件号码
			$('#rc_province').val(res.provinceName).attr('data-value', res.rc_province); // 开户行所在地省
			$('#rc_oragnizename').val(dataIsNull(res.rc_oragnizename)).attr('data-value', dataIsNull(res.rc_oragnize)); // 开户机构
			if (channelType !== '10' && channelType !== '12' && channelType !== '13') {
				//非经销商二手车和天猫
				$('#appl_rc_kind').prop('disabled', true); // 银行类型选择 不可编辑状态
			}
			if (channelType === '12' && channelType === '13') {
				// 渠道为天猫(天猫标致、天猫雪铁龙)，默认为支付宝账号，只读不可修改
				$('#appl_rc_kind').off('tap');
				//$('#appl_rc_kind').val('经销商账户').attr('data-value', '05');
			}
			if (channelType == '10') {
				// 渠道类型经销商为二手车 收款账号信息 展示, 否则不展示
				if ($('#appl_rc_kind').attr('data-value') !== '01') $('#rc_province_li').css({ height: '.8rem', opacity: 1 });
				$('.receipt-amount-info').show();
			}
			if ($('#appl_rc_kind').attr('data-value') === '01') {
				rcKindChange(applCde, modifiFlag);
			} else {
				$('#rc_oragnizename').hide();
			}
		});
	}
	/* 
 	账户户名 查询
 */
	function pageInit(applCde) {
		var _url = mbank.getApiURL() + 'queryAccName.do';
		mbank.apiSend('post', _url, {
			"applCde": applCde // 申请单号
		}, function (res) {
			var userInfo = res.iRelList;
			userInfo.forEach(function (item) {
				item.text = item.relName;
				item.value = item.relName + '|' + item.idtype + '|' + item.idNo;
			});
			/* 账户户名点击 */
			$('#appl_ac_nam').on('click', function () {
				var getArrVal=mData.changePro(userInfo,this.id);
		        weui.picker(getArrVal.proVal, {
		            onChange: function (item) {
		            },
		            onConfirm: function (item) {
		                $('#appl_ac_nam').val(item[0].label).attr('data-value', item[0].value);
						var idTypeValue = item[0].value.split('|')[1];
						var idTypeNo = item[0].value.split('|')[2];
						$('#idtype').val(mCheck.formatData(idTypeValue, CARD_TYPE)).attr('data-value', idTypeValue); // 证件类型 
						$('#idNo').val(idTypeNo); // 证件号码
		            },
		            title: '请选择账户户名',
		            defaultValue:[getArrVal.indSeq],
		            id:this.id
		        });
			});
		});
	}
	/* 
 	ajax 请求将base64 图片传到后台
 */
	function doDocsUpload(picUrl, applCde) {
		var accName = void 0,
		    accIdNo = void 0,
		    certType = void 0;
		if (accFlag === 'ac') {
			// 还款
			accName = $('#appl_ac_nam').val(); // 账户户名
			accIdNo = $('#idNo').val(); // 证件类型
			certType = $('#idtype').attr('data-value'); // 证件号码
		} else if (accFlag === 'rc') {
			// 收款
			accName = $('#appl_rc_nam').val(); // 账号户名
			accIdNo = $('#certNo').val(); // 证件类型
			certType = $('#certType').attr('data-value'); // 证件号码
		}
		var _url = mbank.getApiURL() + 'appOcrContMake.do';
		mbank.apiSend('post', _url, {
			'flag': fileFlag, // 标志位 
			"applCde": applCde, // 申请单号
			'keyType': 'appl_seq',
			'keyValue': applCde,
			'name': accName,
			'idNo': accIdNo,
			'busstype': 'UPLOADIMG',
			'certType': certType,
			'filePath': picUrl
		}, function (res) {
			plus.nativeUI.closeWaiting();
			var reAccNo = res.card_number,	// 银行账号
				reAccName = res.holder_name,	//姓名
				reOpenBan = res.issuer,	//开户银行	
				issuerCde = res.bch_cde,	//开户行编号
				returnCode = res.code;
			if (fileFlag == 'hgz' || fileFlag == 'gmfp') {
				// 车架号 车辆合格证、购买发票		
				$("#veh_chassis").val(res.vehicle_certification_model_vin); //车架号
				$("#veh_engin_no").val(res.vehicle_certification_engine_number); //发动机号
			}
			if (fileFlag == 'acc') {
				if (accFlag == "ac") {
					if (issuerCde == "103" || issuerCde == "104" || issuerCde == "403") {
						// $('#appl_ac_nam').val(reAccName); // 账户户名
						$("#appl_ac_no").val(reAccNo); // 还款账号
						$('#appl_ac_bchname').val(reOpenBan).attr('data-value', issuerCde); // 开户银行
						if (returnCode != '0') {
							if (returnCode == 'N') {
								// 还款账号  
								mui.alert('还款账户证件类型非身份证，请自行核实账号和户名是否匹配', ' ', '确定', function (e) {}, 'div');
							} else {
								mui.alert('还款账号和身份信息不符,请核对账号和户名信息', ' ', '确定', function (e) {}, 'div');
							}
						}
					} else {
						// $('#appl_ac_nam').val(''); // 账户户名
						$("#appl_ac_no").val(''); // 还款账号
						$('#appl_ac_bchname').val('').attr('data-value', ''); // 开户银行
						mui.toast('该银行卡暂不支持', { type: 'div' });
					}
				} else if (accFlag == "rc") {
					// 收款账户信息 -没有开户行限制 直接反显卡号，如果开户行cde返回则反显在开户行上，如果为空不显示	  
					// $('#appl_rc_nam').val(reAccName); // 账户户名
					$("#appl_rc_no").val(reAccNo); // 收款账号
					if (issuerCde) {
						$('#appl_rc_bchname').val(reOpenBan).attr('data-value', issuerCde); // 开户银行
					} else {
						$('#appl_rc_bchname').val('').attr('data-value', ''); // 开户银行
					}
					if (returnCode != '0') {
						if (returnCode == 'N') {
							mui.alert('收款账户证件类型非身份证，请自行核实账号和户名是否匹配', ' ', '确定', function (e) {}, 'div');
						} else {
							mui.alert('收款账号和身份信息不符,请核对账号和户名信息', ' ', '确定', function (e) {}, 'div');
						}
					}
				}
			}
		}, function (err) {
			plus.nativeUI.closeWaiting();
			mCheck.alert(err.em);
		});
	}
	/* 
 	校验账号是否正确
 	bankCode, 开户银行编码
 	accno 账号id
 */
	function checkAccNo(bankCode, accno) {
		flagN = true;
		var accNo = $('#' + accno).val(); // 账号
		if (bankCode !== '' || bankCode !== null) {
			if (accNo !== '') {
				// 账户
				if (bankCode == '403') {
					// 邮储银行只校验账号位数，不校验格式
					if (accNo.length == 18 || accNo.length == 19) {
						flagN = true;
					} else {
						$('#' + accno).val('');
						mui.toast('请输入18位或19位账号', { type: 'div' });
						flagN = false;
					}
				} else {
					var _url = mbank.getApiURL() + 'checkAccNo.do';
					mbank.apiSend('post', _url, {
						accno: accNo
					}, function (res) {
						if (res.flag == 'false') {
							flagN = false;
							$('#' + accno).val('');
							mui.toast('账号输入格式有误', { type: 'div' });
						} else {
							flagN = true;
						}
					}, function (err) {
						$('#' + accno).val('');
						flagN = false;
						mCheck.alert(err.em);
					}, true, false);
				}
				return flagN;
			}
		} else {
			mui.toast('请先选择开户银行', { type: 'div' });
			return;
		}
	}
	/* 
 	车架号双融校验
 */
	function checkPFVIN(veh_chassis) {
		var _url = mbank.getApiURL() + 'checkVINSRon.do';
		mbank.apiSend('post', _url, {
			'VIN': veh_chassis,
			'flag': 'cfC'
		}, function (res) {
			if (res.iCount !== '0') {
				//双融
				mui.toast('温馨提示：' + dataIsNull(res.storeName) + '未结清该车批发融资。', { type: 'div' });
			}
		});
	}
	/* 
 	车架号重复校验
  */
	function checkVINRepeat(VIN, applCde) {
		var _url = mbank.getApiURL() + 'checkVINRepeat.do',
		    count = '',
		    em = '';
		if (VIN) {
			mbank.apiSend('post', _url, {
				'VIN': VIN,
				'applCde': applCde
			}, function (res) {
				count = res.iCount;
				em = res.errorMsg;
			});
		} else {
			mui.toast('车架号不能为空', { type: 'div' });
		}
		return { 'count': count, 'em': em };
	}
	/* 
 	三要素验证（验证还款、收款账号开户凭证是否已上传）
  */
	function doDocsUploadThree(applCde, contNo, modifiFlag, picUrl) {
		var _url = mbank.getApiURL() + 'upLoadSinglePic.do';
		mbank.apiSend('post', _url, {
			'docTyp': '2001',
			'applCde': applCde,
			'docKind': 'UNTYPE',
			'busstype': 'UPLOADIMG',
			'filePath': picUrl
		}, function (res) {
			plus.nativeUI.closeWaiting();
			controlFlag = '0'; // 防止重复提交
			if (acFlagCode === '1' && rcFlagCode === '1') {
				if (subFlag == 'ac' && acSub == '1') {
					if (rcSub === '1') {
						// submitData(applCde, contNo, modifiFlag); // 合同维护接口
						subSaveInf(applCde, contNo, modifiFlag); // 保存信息接口
					} else {
						mui.toast('请上传收款开户凭证！', { type: 'div' });
					}
				} else if (subFlag == 'rc' && rcSub == '1') {
					if (acSub === '1') {
						subSaveInf(applCde, contNo, modifiFlag); // 保存信息接口
					} else {
						mui.toast('请上传还款开户凭证！', { type: 'div' });
					}
				}
			} else if (acFlagCode === '1' && rcFlagCode !== '1') {
				subSaveInf(applCde, contNo, modifiFlag); // 保存信息接口
			} else if (acFlagCode !== '1' && rcFlagCode === '1') {
				subSaveInf(applCde, contNo, modifiFlag); // 保存信息接口
			}
		}, function (err) {
			controlFlag = '0';
			if (subFlag == 'ac') acSub = '0';
			if (subFlag == 'rc') rcSub = '0';
			mCheck.alert(err.em);
			$('#waitingBox').hide();
			plus.nativeUI.closeWaiting();
		}, true, false);
	}
	/* 
 	点击保存时，校验三要素是否已通过
  */
	function loanSave(applCde, contNo, modifiFlag) {
		//  接口调用成功，但未测试三要素是否符合条件
		var _url = mbank.getApiURL() + '3MCheck.do';
		mbank.apiSend('post', _url, assembParam(applCde, modifiFlag), function (res) {
			var iCode = res.code;
			var acCode = res.temp1; //还款账号
			var rcCode = res.temp2; //收款账号
			acFlagCode = res.temp1;
			rcFlagCode = res.temp2;
			if (acCode !== '1' && rcCode !== '1') {
				if (modifiFlag == 'Y') {
					invalidDgSign(applCde, contNo, modifiFlag);
				} else {
					subSaveInf(applCde, contNo, modifiFlag);
				}
			} else {
				// 账号三要素不通过
				setTimeout(function () {
					if (acCode == '1' && rcCode == '1') {
						// 还收款账号三要素同时不通过
						$('#acShow').text('还款、收款');
						//doDocsUploadThree(applCde, 'ac');
					} else if (acCode == '1' && rcCode !== '1') {
						// 还款账号凭证
						$('#collection').hide();
						$('#acShow').text('还款');
						// doDocsUploadThree(applCde, 'ac');
					} else if (acCode !== '1' && rcCode == '1') {
						// 收款账号凭证
						$('#acShow').text('收款');
						$('#repayment').hide();
						//doDocsUploadThree(applCde, 'rc');
					}
					$('#waitingBox').hide();
					$('.telMask').show();
					list.canClick=true;
				}, 500);
			}
		}, function (err) {
			mCheck.alert(err.em);
			list.canClick = true;
			$('#waitingBox').hide();
		});
	}
	/*
 	提交数据
 */
	function submitData(applCde, contNo, modifiFlag) {
		var _url = mbank.getApiURL() + 'PFandPactPart.do';
		mbank.apiSend('post', _url, assembParam(applCde, modifiFlag), function (res) {
			setTimeout(function () {
				$('#waitingBox').hide();
				var jointFree = res.jointFree;
				list.canClick=true;
				mbank.openWindowByLoad('conSignInit.html', 'conSignInit', 'slide-in-right', {
					contNo: contNo, // 合同编号
					applCde: applCde,
					jointFree: jointFree, // 是否展示共借人信息
					fromPage: fromPage
				});
			}, 500);
		}, function (err) {
			mCheck.alert(err.em);
			list.canClick = true;
			$('#waitingBox').hide();
		});
	}
	/* 
 	保存
 */
	function subSaveInf(applCde, contNo, modifiFlag) {
		var _url = mbank.getApiURL() + 'cfofferInfoSave.do';
		mbank.apiSend('post', _url, assembParam(applCde, modifiFlag), function (res) {
			submitData(applCde, contNo, modifiFlag);
		}, function (err) {
			controlFlag = '0';
			mCheck.alert(err.em);
			list.canClick = true;
			$('#waitingBox').hide();
		});
	}
	/* 
 	作废电子签合同， modifiFlag = 'Y' 修改过合同，先废除电子签合同，再做三要素验证，再保存提交
  */
	function invalidDgSign(applCde, contNo, modifiFlag) {
		var _url = mbank.getApiURL() + 'invalidDgSign.do';
		mbank.apiSend('post', _url, {
			keyValue: contNo, // 合同编号
			docType: '03' // 电子签类型 
		}, function (res) {
			mui.alert('已签署的电子签作废成功，请点击确定按钮重新发起签署', '提示', '确定', function (e) {
				subSaveInf(applCde, contNo, modifiFlag);
			}, 'div');
		}, function (err) {
			mCheck.alert(err.em);
			list.canClick = true;
			$('#waitingBox').hide();
		});
	}
	/* 
 	获取页面中所有数据
  */
	function assembParam(applCde, modifiFlag) {
		if (channelType == '10') {
			//经销商二手车
			if ($('#appl_rc_nam').val() !== '' && $('#appl_rc_no').val() != '' && $('#appl_rc_kind').val() !== '' && $('#appl_rc_bchname').val() !== '' && $('#appl_ac_bchname').val() !== '' && $('#appl_ac_no').val() !== '' && $('#appl_ac_kind').val() != '' && $('#appl_ac_bchname').val() !== '' && $('#idtype').val() !== '' && $('#idNo').val() !== '') {
				if ($('#appl_rc_kind').attr('data-value') == '02' || $('#appl_rc_kind').attr('data-value') == '03') {
					//收款账号为卖家个人账户或者买家个人账户
					if ($('#certType').val() !== '' && $('#certNo').val() !== '') {
						isFullFlag = 1;
					} else {
						isFullFlag = 0;
					}
				} else {
					isFullFlag = 1;
				}
			} else {
				isFullFlag = 0;
			}
		} else {
			//其他渠道类型
			if ($('#appl_ac_nam').val() !== "" && $('#appl_ac_no').val() !== '' && $('#appl_ac_kind').val() !== '' && $('#appl_ac_bchname').val() !== '' && $('#idtype').val() !== '' && $('#idNo').val() !== '') {
				isFullFlag = 1;
			} else {
				isFullFlag = 0;
			}
		}
		var lic_city = $('#lic_city').attr('data-value');
		return {
			'applCde': applCde, // 申请编号 1
			"channelType": channelType, // 经销商渠道类型	
			'isFullFlag': isFullFlag,
			'flag': '0',
			'modifyFlag': modifiFlag, // 是否修改过合同
			// 车辆信息
			'veh_chassis': $('#veh_chassis').val(), // 车架号1
			'veh_engin_no': $('#veh_engin_no').val(), // 发动机号1
			'lic_province': lic_city ? lic_city.split(',')[0] : '', // 1
			'lic_city': lic_city ? lic_city.split(',')[1] : '', // 上牌城市 1
			/* 还款账号信息 */
			'appl_ac_kind': $('#appl_ac_kind').attr('data-value'), // 银行账户类型1
			'appl_ac_nam': $('#appl_ac_nam').val(), //账户户名1
			'appl_ac_bch': $('#appl_ac_bchname').attr('data-value'), //开户行编码
			'appl_ac_no': $('#appl_ac_no').val(), // 账号1
			'idNo': $('#idNo').val(), // 证件号码1
			'idtype': $('#idtype').attr('data-value'), // 证件类型1
			/* 收款账号信息 */
			'appl_rc_kind': $('#appl_rc_kind').attr('data-value'), // 如果为二手车 银行账户类型1
			'appl_rc_nam': $('#appl_rc_nam').val(), // 账号户名1
			'appl_rc_bch': $('#appl_rc_bchname').attr('data-value'), //开户行编码1
			'appl_rc_no': $('#appl_rc_no').val(), // 账号1
			'certNo': $('#certNo').val(), // 证件号码1
			'certType': $('#certType').attr('data-value'), // 证件类型1
			'rc_province': $('#rc_province').attr('data-value'), // 开户行所在地省
			'rc_oragnizename': $('#rc_oragnizename').val(), // 开户机构代码
			'rc_oragnize': $('#rc_oragnizename').attr('data-value')
		};
	}
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			'softinputMode': 'adjustResize'
		});
		mbank.isImmersed();
		var applCde = self.applCde; //  申请编号; 
		var contNo = self.contNo; // 合同编号 ;
		var quality = 99;
		if (plus.os.name == 'iOS') {
			quality = 55;
		} else {
			quality = 99;
		}
		var modifiFlag = self.modifyFlag || 'N'; // 是否修改合同
		var sendMail = self.sendMail || 'N'; // 页面是否从发送邮件过来
		var loadDetail = self.loadDetail || 'N'; // 页面从贷款详情过来，合同信息不可编辑 
		fromPage = self.fromPage || '';
		if (loadDetail === 'Y') $('#submit').text('返回');

		var quality = 99;
		if (plus.os.name == 'iOS') {
			quality = 55;
		} else {
			quality = 99;
		}
		// 基本信息
		contBasInfo(applCde, modifiFlag, sendMail, loadDetail);
		// 合同信息 查询（车辆信息、还款证号信息、收款账号信息）
		queryOffInfo(applCde, modifiFlag);
		// 账户户名
		pageInit(applCde);
		/* 
  	发动机格式验证
   */
		$("#veh_engin_no").blur(function () {
			var _this = this;
			if (!REGFADONGJI.test($(_this).val()) && $(_this).val() != '') {
				$("#veh_engin_no").val("");
				mui.toast('发动机号格式错误', { type: 'div' });
			}
		});
		/* 
  	车架号失去焦点  校验
  */
		$('#veh_chassis').on('blur', function () {
			var _this = this;
			if ($(_this).val() == '') {
				mui.toast('车架号不能为空', { type: 'div' });
				return;
			}
			if (!mCheck.checkVIN($(_this).val())) {
				mui.toast('车架号格式错误', { type: 'div' });
				return;
			} else {
				if (carType == '01' || carType == '03') {
					// 新车做车架号重复校验
					var VINcount = checkVINRepeat($(_this).val(), applCde).count;
					var VINem = checkVINRepeat($(_this).val(), applCde).em;
					if (VINcount !== '' && VINcount !== null && VINcount !== '0') {
						$(_this).val("");
						mui.toast(VINem, { type: 'div' });
					} else {
						checkPFVIN($(_this).val()); // 校验双融
					}
				}
			}
		});
		/* 
  	上牌城市选择 
  */
		$('#lic_city').on('click', function () {
			var getArrVal=mData.changePro(PRO_CITY,this.id,2);
			var defPCA=getArrVal.indSeq.split(',');
			weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	            	$('#lic_city').val(item[0].label + ' ' + item[1].label);
					$('#lic_city').attr('data-value', item[0].value + ',' + item[1].value);
	            },
	            title: '请选择上牌城市',
	            defaultValue:[defPCA[0],defPCA[1]],
	            id:this.id
	       });
		});
		/* 
  	还款账号信息  点击开户银行  页面跳转 到 开户银行 
  */
		$('#amountBank').on('tap', function () {
			mbank.openWindowByLoad('conSignInfoBank.html', 'conSignInfoBank', 'slide-in-right', {
				applCde: applCde,
				'appl_ac_nam': $('#appl_ac_nam').val(), // 账户户名
				'ac': 'ac'
			});
		});
		/* 
  	开户银行选择 “中国农业银行”、“中国银行”、“中国邮政银行”
  */
		window.addEventListener('bankSelect', function (event) {
			var bankName = event.detail.bankName; // 开户银行|省|市
			var bankNameCode = event.detail.bankNameCode;
			var bankProvice = event.detail.bankProvice;
			var bankProviceCode = event.detail.bankProviceCode;
			var ac = event.detail.ac;
			if (ac === 'ac') {
				if (bankName) $('#appl_ac_bchname').val(bankName.split('|')[0]).attr('data-value', bankNameCode.split('|')[0]); // 开户银行
			}
			if (bankProvice && bankProviceCode) $('#rc_province').val(bankProvice).attr('data-value', bankProviceCode);
		});

		/* 
  	开户银行选择具体列表
  */
		window.addEventListener('bankSelectDetail', function (event) {
			// '开户行编码|开户行名称|开户支行编码|开户支行名称|开户省|开户市'
			var bankDetail = event.detail.bankDetail;
			var bankProvice = event.detail.bankProvice;
			var bankProviceCode = event.detail.bankProviceCode;
			var ac = event.detail.ac;
			if (ac === 'ac') {
				if (bankDetail) $('#appl_ac_bchname').val(bankDetail.split('|')[1]).attr('data-value', bankDetail.split('|')[0]);
			}
		});
		/* 
  	还款、收款 证件类型
   */
		// $('#idtype').on('tap', function () {
		// 	mData.selectData(CARD_TYPE, 1).then(item => {
		// 		$('#idtype').val(item[0].text).attr('data-value', item[0].value);
		// 	});
		// });
		$('#certType').on('click', function () {
			var getArrVal=mData.changePro(CARD_TYPE,this.id);
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	                $('#certType').val(item[0].label).attr('data-value', item[0].value);
	            },
	            title: '请选择证件类型',
	            defaultValue:[getArrVal.indSeq],
	            id:this.id
	        });
		});
		/* 
  	还款、收款证件号码验证
   */
		$("#idNo").blur(function () {
			if (!$(this).val()) {
				mui.toast('还款证件号码不能为空', { type: 'div' });
			}
		});
		$("#certNo").blur(function () {
			if (!mCheck.checkIdNumber($(this).val())) {
				mui.toast('收款证件号码错误', { type: 'div' });
			}
		});
		/* 
  	还款、收款 账号格式校验
   */
		$('#appl_ac_no').on('blur', function () {
			var bankCode = $('#appl_ac_bchname').attr('data-value');
			if (!checkAccNo(bankCode, 'appl_ac_no')) return;
		});
		$('#appl_rc_no').on('blur', function () {
			var bankCode = $('#appl_rc_bchname').attr('data-value');
			if (!checkAccNo(bankCode, 'appl_rc_no')) return;
		});
		/* 
  	点击收款所在城市
   */
		$('#rc_province').on('click', function () {
			$('#rc_oragnizename').hide();
			var getArrVal=mData.changePro(ONLY_PRO,this.id);
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	                $('#rc_province').val(item[0].label);
					$('#rc_province').attr('data-value', item[0].value);
	            },
	            title: '请选开户银行所在地',
	            defaultValue:[getArrVal.indSeq],
	            id:this.id
	        });
		});
		/* 
  	收款账号信息 - 银行账户类型 选择 
  */
		var rc_kind = '';
		$('#appl_rc_kind').on('click', function () {
			var getArrVal=mData.changePro(BANK_AMOUNT_TYPE,this.id);
	        weui.picker(getArrVal.proVal, {
	            onChange: function (item) {
	            },
	            onConfirm: function (item) {
	                rc_kind = item[0].value;
					$('#appl_rc_kind').val(item[0].label).attr('data-value', item[0].value);
					if ($('#appl_rc_kind').attr('data-value') === '01') {
						rcKindChange(applCde, modifiFlag);
					} else {
						$('#appl_rc_nam, #appl_rc_bchname, #appl_rc_no, #certType, #certNo, #rc_province').val('');
						$('#appl_rc_nam, #appl_rc_bchname,#appl_rc_no, #rc_province, #rc_oragnizename').prop('disabled', false);
						$('#appl_rc_bchname').next().show();
						$('#rc_oragnizename_li').css({ height: 0, opacity: 0 });
						$('#certTypeLi, #certNoLi').css({ height: '.8rem', opacity: 1 });
						$('#certType, #certNo, #recAccCarmer').show();
						$('#rc_oragnizename').hide();
					}
	            },
	            title: '请选择银行账户类型',
	            defaultValue:[getArrVal.indSeq],
	            id:this.id
	        });
		});
		$('#appl_rc_bchname').on('tap', function () {
			if ($('#appl_rc_kind').attr('data-value') !== '01') {
				mbank.openWindowByLoad('conSignInfoBank.html', 'conSignInfoBank', 'slide-in-right', {
					applCde: applCde,
					'appl_rc_nam': $('#appl_rc_nam').val(), // 账户户名
					'ac': 'rc'
				});
			}
		});
		/* 
  	开户银行选择 “中国农业银行”、“中国银行”、“中国邮政银行”
  */
		window.addEventListener('bankSelectRc', function (event) {
			var bankName = event.detail.bankName; // 开户银行|省|市
			var bankNameCode = event.detail.bankNameCode;
			var bankProvice = event.detail.bankProvice;
			var bankProviceCode = event.detail.bankProviceCode;
			var ac = event.detail.ac;
			if (ac === 'rc') {
				if (bankName) $('#appl_rc_bchname').val(bankName.split('|')[0]).attr('data-value', bankNameCode.split('|')[0]); // 开户银行
				if (bankProvice && bankProviceCode) $('#rc_province').val(bankProvice).attr('data-value', bankProviceCode);
			}
		});
		/* 
  	开户银行选择具体列表
  */
		window.addEventListener('bankSelectDetailRc', function (event) {
			//'开户行编码|开户行名称|开户支行编码|开户支行名称|开户省|开户市'
			var bankDetail = event.detail.bankDetail;
			var add_provinceC = event.detail.add_provinceC;
			var add_province = event.detail.add_province;
			var ac = event.detail.ac;
			if (ac === 'rc') {
				if (bankDetail) $('#appl_rc_bchname').val(bankDetail.split('|')[1]).attr('data-value', bankDetail.split('|')[0]);
				$('#rc_province').val(mCheck.formatCity(bankDetail.split('|')[4], CITY_DATA)).attr('data-value', bankDetail.split('|')[4]);
			}
		});
		/* 
  	点击 车架号 调用原生摄像头 | 相机 选项 
  */
		$('#vehCarmer').on('tap', function () {
			// 车辆合格证、 车辆购买发票
			document.activeElement.blur();
			mui.confirm('上传车辆合格证或车辆购买发票', ' ', ['车辆购买发票', '车辆合格证'], function (e) {
				if (e.index === 0) {
					fileFlag = 'gmfp'; // 车辆购买发票	
				} else if (e.index === 1) {
					fileFlag = 'hgz'; // 车辆合格证  
				}
				showActionSheet();
			}, 'div');
		});
		/* 
  	关闭车架号上传窗口
   */
		$('#close').on('tap', function () {
			$('.mui-popup, .mui-popup-backdrop').hide();
			$('.mui-popup-backdrop').css('opacity', 0).remove();
		});
		$('#appl_ac_no').on('focus', function () {
			if (!$('#appl_ac_nam').val()) {
				mui.toast('请先选择账户户名', { type: 'div' });
				return;
			}
		});
		/* 账号开户凭证 */
		$('#repayment').on('tap', function () {
			subFlag = 'ac';
			acSub = '1';
			setTimeout(function () {
				$('.telMask').hide();
				showActionSheet();
			}, 100);
		});
		/* 收款账号开户凭证 */
		$('#collection').on('tap', function () {
			subFlag = 'rc';
			rcSub = '1';
			setTimeout(function () {
				$('.telMask').hide();
				showActionSheet();
			}, 100);
		});
		/* 
  	点击 还款账号 调用原生摄像头 | 相机 选项 
  */
		$('#accCarmer').on('tap', function () {
			document.activeElement.blur();
			if (!$('#appl_ac_nam').val()) {
				mui.toast('请先选择账户户名', { type: 'div' });
				return;
			}
			accFlag = 'ac';
			fileFlag = 'acc';
			showActionSheet();
		});
		$('#appl_rc_no').on('focus', function () {
			if ($('#appl_rc_nam').val() === '') {
				// 账户户名不能为空
				mui.toast('请先选择收款账户户名', { type: 'div' });
				return;
			}
		});
		/* 
  	点击 收款账号 调用原生摄像头 | 相机 选项
  */
		$('#recAccCarmer').on('tap', function () {
			document.activeElement.blur();
			if ($('#appl_rc_nam').val() === '') {
				// 账户户名不能为空
				mui.toast('请先选择收款账户户名', { type: 'div' });
				return;
			}
			if ($('#appl_rc_kind').attr('data-value') !== '01') {
				if (!$('#certType').attr('data-value') || !$('#idtype').val()) {
					mui.toast('请先选择证件类型', { type: 'div' });
					return;
				}
				if (!$('#certNo').val()) {
					mui.toast('请选输入证件号码', { type: 'div' });
					return;
				}
			}
			accFlag = "rc";
			fileFlag = 'acc';
			showActionSheet();
		});
		/* 
  	选择摄像头和相册 选项 
  */
		function showActionSheet() {
			var btns = [{ title: '拍照' }, { title: '从相册选取' }];
			plus.nativeUI.actionSheet({
				cancel: '取消',
				buttons: btns
			}, function (e) {
				if (e.index === 1) {
					getCameraInterface();
				} else if (e.index === 2) {
					getPhotoInterface();
				}
			});
		}
		/* 
  	调用摄像头 
  */
		function getCameraInterface() {
			var isCamera = plus.camera.getCamera();
			isCamera.captureImage(function (p) {
				plus.io.resolveLocalFileSystemURL(p, function (entry) {
					plus.nativeUI.showWaiting('扫描中，请稍候...', {
						padlock: false
					});
					compressImage(entry.toLocalURL(), entry.name);
					// showImage(entry.toLocalURL(), entry.name);
				}, function (e) {
					// plus.nativeUI.toast("读取拍照文件错误：" + e.message);
				});
			}, function (e) {}, { filter: 'image' });
		}
		/* 
  	调用相册 
  */
		function getPhotoInterface() {
			plus.gallery.pick(function (e) {
				var name = e.substr(e.lastIndexOf('/') + 1);
				plus.nativeUI.showWaiting('扫描中，请稍候...', {
					padlock: false
				});
				plus.io.resolveLocalFileSystemURL(e, function (entry) {
					entry.file(function (file) {
						//						if(file.size >= 2 * 1024 * 1024){
						//							compressImage(e, name);
						//						}else{
						//							let name2 = "_doc/upload" + name;
						//							showImage(e, name2);
						//						}
						if (file.size > 2 * 1024 * 1024 && file.size <= 10 * 1024 * 1024) {
							if (plus.os.name == 'iOS') {
								quality = 1;
							} else {
								quality = 80;
							}
							compressImage(e, name);
						} else if (file.size >= 0.6 * 1024 * 1024 && file.size <= 2 * 1024 * 1024) {
							if (plus.os.name == 'iOS') {
								quality = 40;
							} else {
								quality = 95;
							}
							compressImage(e, name);
						} else if (file.size > 10 * 1024 * 1024) {
							mCheck.alert('原图格式过大，请用微信压缩图片后，再行上传');
							plus.nativeUI.closeWaiting();
						} else {
							var name2 = "_doc/upload" + name;
							showImage(e, name2);
						}
					});
				});
			}, function (e) {
				//plus.nativeUI.toast("读取相册文件错误：" + e.message);
			}, {
				filter: 'image'
			});
		}
		/* 
  	根据路径读取到文件 
  */
		function showImage(url, fileName) {
			plus.io.resolveLocalFileSystemURL(url, function (entry) {
				entry.file(function (file) {
					var fileReader = new plus.io.FileReader();
					fileReader.readAsDataURL(file);
					fileReader.onloadend = function (e) {
						var picUrl = e.target.result.toString();
						var base64 = picUrl.split(';')[0];
						var imgType = base64.split('/')[1];
						// ajax 请求逻辑
						if (imgType == 'png' || imgType == 'jpg' || imgType == 'jpeg' || imgType == 'JPG' || imgType == 'JPEG' || imgType == 'PNG') {
							if (file.size <= 2 * 1024 * 1024) {
								if (subFlag == 'ac' && acSub == '1' || subFlag == 'rc' && rcSub == '1') {
									doDocsUploadThree(applCde, contNo, modifiFlag, picUrl);
								} else {
									doDocsUpload(picUrl, applCde);
								}
							} else {
								mCheck.alert('原图格式过大，请用微信压缩图片后，再行上传');
								plus.nativeUI.closeWaiting();
							}
						} else {
							mCheck.alert('图片只支持png、jpg、jpeg格式。小贴士：将照片通过微信上传，再下载至相册，可帮助您把图片格式过滤正确。');
							plus.nativeUI.closeWaiting();
						}
					};
				});
			});
		}
		/* 
  	压缩图片 
  */
		function compressImage(url, fileName) {
			var name = "_doc/upload" + fileName;
			plus.zip.compressImage({
				src: url, // src: (String 类型 )压缩转换原始图片的路径  
				dst: name, // 压缩转换目标图片的路径 
				format: 'jpg',
				quality: quality, //quality: (Number 类型 )压缩图片的质量.取值范围为1-100
				overwrite: true //overwrite: (Boolean 类型 )覆盖生成新文件  	
			}, function (zip) {
				showImage(zip.target, name);
			}, function () {
				//plus.nativeUI.toast("压缩图片失败，请稍候再试");
			});
		}
		/* 
  	点击input 阻止键盘弹起
   */
		$('input[name="onlyread"]').on('focus', function () {
			document.activeElement.blur();
		});
		/* 
  	下一步并保存
  */
		$('#submit').on('tap', function () {
			if ($(this).text() == '下一步') {
				document.activeElement.blur();
				if (!list.canClick) {
					//如果为false, 不能点击
					return;
				}
				list.canClick = false;
				mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
					if(dat=='N'){
						list.canClick = true;
						return;
					}else{
						if (sendMail == 'Y') {
							list.canClick = true;
							mbank.openWindowByLoad('conSignMail.html', 'conSignMail', 'slide-in-right', {
								applCde: applCde,
								contNo: contNo,
								fromPage: fromPage
							});
						} else {
							// 车架号校验
							if ($('#veh_chassis').val() != '') {
								if (!mCheck.checkVIN($('#veh_chassis').val())) {
									mui.toast('车架号号格式错误', { type: 'div' });
									list.canClick = true;
									return;
								}
							} else {
								mui.toast('车架号不能为空', { type: 'div' });
								list.canClick = true;
								$('#waitingBox').hide();
								return;
							}
							if (mCheck.checkVIN($('#veh_chassis').val())) {
								// 新车做车架号重复校验
								if (carType == '01' || carType == '03') {
									var VINcount = checkVINRepeat($('#veh_chassis').val()).count;
									var VINem = checkVINRepeat($('#veh_chassis').val()).em;
									if (VINcount !== '' && VINcount !== null && VINcount !== '0') {
										mui.toast(VINem, { type: 'div' });
										list.canClick = true;
										return;
									} else {
										checkPFVIN($('#veh_chassis').val()); // 校验双融
									}
								}
							}
							// 发送机号校验
							if ($('#veh_engin_no').val() != '' && !REGFADONGJI.test($('#veh_engin_no').val())) {
								mui.toast('发动机号格式错误', { type: 'div' });
								list.canClick = true;
								return;
							}
							// 还款 银行账户类型
							if ($('#appl_ac_kind').val() == '' || $('#appl_ac_kind').attr('data-value') == '') {
								mui.toast('还款银行账户类型不能为空', { type: 'div' });
								list.canClick = true;
								return;
							}
							// 还款 账户户名
							if ($('#appl_ac_nam').val() === '') {
								mui.toast('还款账户户名不能为空', { type: 'div' });
								list.canClick = true;
								return;
							}
							// 还款 开户银行
							if ($('#appl_ac_bchname').val() === '' || $('#appl_ac_bchname').attr('data-value') === '') {
								//  || $('#appl_ac_bchname').attr('data-value') !== ''
								mui.toast('还款开户银行不能为空', { type: 'div' });
								list.canClick = true;
								return;
							}
							// 还款 账户验证
							if ($('#appl_ac_no').val() !== '') {
								var bankCode = $('#appl_ac_bchname').attr('data-value');
								if (!checkAccNo(bankCode, 'appl_ac_no')){
									list.canClick = true;
									return;
								} 
							} else {
								mui.toast('还款账号不能为空', { type: 'div' });
								list.canClick = true;
								return;
							}
							// 还款 证件类型
							if ($('#idtype').val() === '' || $('#idtype').attr('data-value') === '') {
								mui.toast('还款证件类型不能为空', { type: 'div' });
								list.canClick = true;
								return;
							}
							// 还款 证件号码验证
							if ($('#idNo').val() !== '') {
								if (!mCheck.checkIdNumber($('#idNo').val())) {
									mui.toast('还款证件号码错误', { type: 'div' });
									list.canClick = true;
									return;
								}
							} else {
								mui.toast('还款证件号码不能为空', { type: 'div' });
								list.canClick = true;
								return;
							}
							// 收款 银行账户类型
							if ($('#appl_rc_kind').val() === '' || $('#appl_rc_kind').attr('data-value') == '') {
								mui.toast('收款银行账户类型不能为空', { type: 'div' });
								list.canClick = true;
								return;
							}
							// 收款 账户户名
							if ($('#appl_rc_nam').val() === '') {
								mui.toast('收款账户户名不能为空', { type: 'div' });
								list.canClick = true;
								return;
							}
							if ($('#appl_rc_kind').attr('data-value') !== '01') {
								// 收款  证件类型
								if ($('#certType').val() === '' || $('#certType').attr('data-value') === '') {
									mui.toast('收款证件类型不能为空', { type: 'div' });
									list.canClick = true;
									return;
								}
								// 收款 证件号码
								if ($('#certNo').val() !== '') {
									if (!mCheck.checkIdNumber($('#certNo').val())) {
										mui.toast('收款证件号码错误', { type: 'div' });
										list.canClick = true;
										return;
									}
								} else {
									mui.toast('收款证件号码不能为空', { type: 'div' });
									list.canClick = true;
									return;
								}
							}
							// 收款 开户银行
							if ($('#appl_rc_bchname').val() === '' || $('#appl_rc_bchname').attr('data-value') == '') {
								//  || $('#appl_rc_bchname').attr ('data-value') !== ''
								mui.toast('收款开户银行不能为空', { type: 'div' });
								list.canClick = true;
								return;
							}
							// 收款 账号
							if ($('#appl_rc_kind').attr('data-value') == '01') {
								if ($('#appl_rc_no').val() == '') {
									mui.toast('收款账号不能为空', { type: 'div' });
									list.canClick = true;
									return;
								}
							} else {
								if ($('#appl_rc_no').val()) {
									var _bankCode = $('#appl_rc_bchname').attr('data-value');
									if (!checkAccNo(_bankCode, 'appl_rc_no')) {
										list.canClick = true;
										return;
									}
								} else {
									mui.toast('收款账号不能为空', { type: 'div' });
									list.canClick = true;
									return;
								}
							}
							if (!$('#rc_province').attr('data-value')) {
								mui.toast('收款开户银行所在地(省)不能为空', { type: 'div' });
								list.canClick = true;
								return;
							}
							$('#waitingBox').show();
							loanSave(applCde, contNo, modifiFlag); // 三要素验证通过，并且保存提交
						}
					}
				});
			} else if ($(this).text() == '返回') {
				mui.back();
			}
		});
		$('#back').on('tap', function () {
			$('#waitingBox').show();
			localStorage.removeItem('firstFlag');
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='N'){
					$('#waitingBox').hide();
					return;
				}else{
					if (fromPage == 'conList') {
						mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
					} else if (fromPage == 'loanList') {
						mbank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
					} else if (fromPage == 'homePage') {
						mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
					} else if (fromPage == 'lendingList') {
						mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
					} else if (fromPage == 'preList') {
						mbank.openWindowByLoad('../PreHearing/PreList/preList.html', 'preList', 'slide-in-left');
					} else if (loadDetail === 'Y') {
						mui.back();
					}
				}
			});
			
		});
		if (fromPage == 'conList') {
			mui.back = function () {
				if ($('#waitingBox').is(':visible')) {
					//如果loading框显示，不能点击手机返回按键
					return;
				}
				$('#waitingBox').show();
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						$('#waitingBox').hide();
						mbank.openWindowByLoad('conSignList.html', 'conSignList', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'loanList') {
			mui.back = function () {
				if ($('#waitingBox').is(':visible')) {
					//如果loading框显示，不能点击手机返回按键
					return;
				}
				$('#waitingBox').show();
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'homePage') {
			localStorage.removeItem('firstFlag');
			mui.back = function () {
				if ($('#waitingBox').is(':visible')) {
					//如果loading框显示，不能点击手机返回按键
					return;
				}
				$('#waitingBox').show();
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'homePage') {
			localStorage.removeItem('firstFlag');
			mui.back = function () {
				if ($('#waitingBox').is(':visible')) {
					//如果loading框显示，不能点击手机返回按键
					return;
				}
				$('#waitingBox').show();
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'lendingList') {
			mui.back = function () {
				if ($('#waitingBox').is(':visible')) {
					//如果loading框显示，不能点击手机返回按键
					return;
				}
				$('#waitingBox').show();
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
					}
				});
			};
		} else if (fromPage == 'preList') {
			mui.back = function () {
				if ($('#waitingBox').is(':visible')) {
					//如果loading框显示，不能点击手机返回按键
					return;
				}
				$('#waitingBox').show();
				mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
					if(dat=='Y'){
						$('#waitingBox').hide();
						mbank.openWindowByLoad('../PreHearing/PreList/preList.html', 'preList', 'slide-in-left');
					}
				});
			};
		}
	});
});