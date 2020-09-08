'use strict';

define(function(require, exports, module) {
	var mBank = require('../../core/bank');
	var mData = require('../../core/requestData');
	var mCheck = require('../../core/check');
	mBank.addVconsole();
	var sessionStoreNo = localStorage.getItem('sessionStoreNo');
	var applCde = localStorage.getItem('applCde');
	var typeFlag = localStorage.getItem('typeFlag');
	var outSts = localStorage.getItem('outSts');
	var nodeSign = localStorage.getItem('nodeSign');
	var userRole = localStorage.getItem("sessionUserRole");
	var isCanEditAss = '';
	var sessionRiskFlag = '';
	var count = 0; // 判断车架号搜索是否被点击过
	//页面暂存数据
	var list = {
		'addFincTypOpt': '01',
		'canClick': true, //控制按钮重复点击
		'sessionRiskflag': '',
		'zrPrice': 0, //独立增融增融金额
		'isMarket': false, //默认没有查看选择保险超市
		'amountParam': {}, //贷款金额计算参数
		'minPct': '',
		'maxPct': '',
		'iLoanProductList': {
			typDesc: '', //贷款品种名称
			typCde: '', //贷款品种代码
			addFincInd: '', //是否允许增融
			addFincObj: '', //增融标的
			addFincTyp: '', //增融方式1、随车贷2、独立增融
			mtdTyp: '', //还款方式种类
			mtdClass: '', //还款方式细分
			defPct: '', //尾款比例
			maxPct: '', //最大尾款比例
			minPct: '', //最小尾款比例
			minAmt: '', //最小贷款金额
			maxAmt: '', //最大贷款金额
			maxFstPct: '', //最大首付比例
			fstPct: '', //最小首付比例
			typFreq: '', //还款间隔
			typVer: '', //贷款品种版本号
			tnrOptTyp: '', //申请期限类型M
			tnrOpt: '',//申请期限
			otherAmtLimitType: '',//其他金额上限类型
			otherAmtLimitRatio: '',//其他金额上限比例
			otherAmtLimitAmt: ''//其他金额上限金额
		}
	};
	//预审参数
	var loanParam = {
		'temp': '0',
		'applCde': '',
		'carType': '',
		'goodsKind': '',
		'sb_brand_nam': '',
		'sub_sb_brand_nam': '',
		'sub_sb_brand_cde': '',
		'goodsModel': '',
		'svm_mode_nam': '',
		'carSeries': '',
		'svc_class_nam': '',
		'mode_year_cde': '',
		'mode_year_nam': '',
		'firmPrice': '',
		'carPrice': '',
		'transmissionType': '',
		'registerTime': '',
		'distance': '',
		'VIN': '',
		'CltFrm': '',
		'gmCity': '',
		'licCity': '',
		'grpCde': '',
		'grpName': '',
		'gpsInd': '',
		'typSeq': '',
		'typCde': '',
		'typdesc': '',
		'minAmt': '',
		'maxAmt': '',
		'lt_fstpct': '',
		'lt_fstpcp': '',
		'typVer': '',
		'addFincInd': '',
		'addFincTyp': '',
		'addFincObj': '',
		'calMode': '',
		'fstPct': '',
		'fstPay': '',
		'applyAmt': '',
		'applyTnr': '',
		'loanIntRate': '',
		'noGuarantee': 'N',
		'cstLevel': '',
		'mtdDesc': '',
		'typFreq': '',
		'mtdCde': '',
		'applyTnrTyp': 'M',
		'restPct': '',
		'dueDay': '',
		'sumFeeAmt': '',
		'totalPrice': '',
		'sumApplyAmt': '',
		'sumFstPct': '',
		'wholeFstPay': '',
		'salerName': '',
		'XDName': '',
		'salerTel': '',
		'XDTel': '',
		'deaName': '',
		'riskGrade': '',
		'cfState': '',
		'purtax': '',
		'insurancetax': '',
		'otherServer': '',
		'gpsFinc': '',
		'decorateFinc': '',
		'loyalCust': 'N',
		'electrombile': 'N', //是否电动车
		'luxury': 'N', //是否豪华车
		'tenFlag': 'N', //二手车期限是否超过十年
		'isSuperFinancial': 'N', //是否增融
		'dueDayOpt': 'DD', //还款日类型
		'mortgage': 'N', //默认免抵押为否
		//独立增融
		'addFincServerList.typSeq': [],
		'addFincServerList.typFreq': [],
		'addFincServerList.addFincServerClass': [],
		'addFincServerList.addFincKind': [],
		'addFincServerList.addFincKindNam': [],
		'addFincServerList.addFincPrice': [],
		'addFincServerList.applyTnrTyp': [],
		'addFincServerList.fincApplyTnr': [],
		'addFincServerList.fincLoanIntRate': [],
		'addFincServerList.minAmt': [],
		'addFincServerList.maxAmt': [],
		'smp_fld_sellprice': '', // 二手车评估价
		'vheUseChar': '', //使用性质
		'lenAndQuaUpdate': 'N', //个人工修改标识
		'carLength': '', //车长
		'totalQuality': '', //总质量
		'carTypeGrade': '', //车型级别
		'carSeriesType': '', //车系类型
		'fuelType': '',//燃料类型
		'otherAmtLimitType':'',//其他金额上限类型
		'otherAmtLimitRatio':'',//其他金额上限比例
		'otherAmtLimitAmt':''//其他金额上限金额
	};

	// 品牌、子品牌、车系、生产年份、车型 默认 置灰且不可编辑；
	function isNotEdit(carType) {
		if (carType == '02') {
			if (count === 0) {
				$('#brandInput').addClass('disabled'); // 品牌
				$('#subBrandInput').attr('disabled', 'disabled').addClass('disabled'); // 子品牌
				$('#carLineInput').attr('disabled', 'disabled').addClass('disabled'); // 车系
				$('#yearTypeInput').attr('disabled', 'disabled').addClass('disabled'); // 生产年份
				$('#carModelInput').addClass('disabled'); // 车型
			} else {
				$('#brandInput').removeClass('disabled'); // 品牌
				$('#subBrandInput').removeAttr('disabled').removeClass('disabled'); // 子品牌
				$('#carLineInput').removeAttr('disabled').removeClass('disabled'); // 车系
				$('#yearTypeInput').removeAttr('disabled').removeClass('disabled'); // 生产年份
				$('#carModelInput').removeClass('disabled'); // 车型
			}
		}
	}
	if (userRole === '03') {
		// 销售顾问
		loanParam.salerName = localStorage.getItem('sessionName');
		loanParam.salerTel = localStorage.getItem("sessionTel");
	} else {
		// 信贷员
		loanParam.XDName = localStorage.getItem('sessionName');
		loanParam.XDTel = localStorage.getItem("sessionTel");
	}
	var isMortgage = function isMortgage(sessionRiskflag, mortgage, noGuarantee, riskGrade, cfState) {
		if (riskGrade == 'L' && cfState == '1') {
			$('#isOrNotUnmor').parent().show();
			$('#isOrNotAssure').parent().show();
			if (sessionRiskflag == 'B' && mortgage == 'Y' && noGuarantee == 'N') {
				$('#cusQuaInput').parent().show();
			} else {
				$('#cusQuaInput').parent().hide();
			}
		}
		if (sessionRiskflag == 'A') {
			if (mortgage == 'N') {
				$('#isOrNotAssure').parent().hide();
			}
		} else if (sessionRiskflag == 'B') {
			if (mortgage == 'N') {
				$('#isOrNotAssure').parent().hide();
				$('#cusQuaInput').parent().hide();
			} else if (mortgage == 'Y') {
				if (noGuarantee == 'Y') {
					$('#cusQuaInput').parent().hide();
				} else if (noGuarantee == 'N') {
					$('#isOrNotAssure').parent().hide();
					$('#cusQuaInput').parent().show();
				}
			}
		} else if (sessionRiskflag == 'C' || sessionRiskflag == 'D') {
			if (mortgage == 'Y' && noGuarantee == 'Y') {
				$('#isOrNotUnmor').parent().show();
				$('#isOrNotAssure').parent().show();
			} else if (mortgage == 'N') {
				$('#isOrNotUnmor').parent().hide();
				$('#isOrNotAssure').parent().hide();
			}
		}
	};
	//页面字段排序
	function insert(carType) {
		if (carType == '02') {
			$('#buyCityInput').parent().insertAfter($('#carTypeInput').parent());
			$('#licCityInput').parent().insertAfter($('#buyCityInput').parent());
			$('#carPriceInput').parent().insertAfter($('#assessPrice').parent());
			//插入车长，车重
			$('#carLengthInput').parent().insertAfter($('#useNature').parent());
			$('#carTotalInput').parent().insertAfter($('#carLengthInput').parent());
		}
	}
	//根据车辆类型显示隐藏信息
	var showFun = function showFun(type) {
		isNotEdit(type);
		//二手车
		if (type === '02') {
			$('#firstDateInput').parent().show();
			$('#frameNoInput').parent().show();
			$('#mileageInput').parent().show();
			// $('#isOrNotElc').parent().show();//是否是电动车
			// $('#isOrNotLuy').parent().show();//是否豪华车
			$('#assessPrice').parent().show();
			$('#useNature').parent().show();
			$('#yearTypeInput').siblings('.item-title')[0].innerHTML = '生产年份';
		} else {
			$('#firstDateInput').parent().hide();
			$('#frameNoInput').parent().hide();
			$('#mileageInput').parent().hide();
			$('#isOrNotElc').parent().hide();
			$('#isOrNotLuy').parent().hide();
			$('#assessPrice').parent().hide();
			$('#useNature').parent().hide();
			$('#yearTypeInput').siblings('.item-title')[0].innerHTML = '年型';
		}
		//全品牌
		if (type === '03') {
			$('#customerSourceInput').parent().show();
		} else {
			$('#customerSourceInput').parent().hide();
		}

		//二手车和全品牌新车
		if (type === '02' || type === '03') {
			/* 新增车长，总重量 */
			$('#carLengthInput').parent().show();
			$('#carTotalInput').parent().show();
			$('#subBrandInput').parent().show();
			$('#powerTypeInput').parent().show();//动力类型
			$('#buyCityInput').parent().show();
			$('#isOrNotUnmor').parent().hide();
		} else {
			$('#carLengthInput').parent().hide();
			$('#carTotalInput').parent().hide();
			$('#subBrandInput').parent().hide();
			$('#powerTypeInput').parent().hide();
			$('#buyCityInput').parent().hide();
			$('#isOrNotUnmor').parent().show();
		}
	};

	function amt(minAmt, maxAmt, loanAmt) {
		if (minAmt != '' && maxAmt != '') {
			if (Number(minAmt) > Number(loanAmt) || Number(loanAmt) > Number(maxAmt)) {
				mui.alert('贷款金额需要在' + minAmt + '元~' + maxAmt + '元之间', '提示', '确定', null, 'div');
				downPayRatioInput.value = '';
				downPaymoneyInput.value = '';
				loanMoneyInput.value = '';

				loanParam.fstPct = '';
				loanParam.applyAmt = '';
				loanParam.fstPay = '';
				loanParam.wholeFstPay = loanParam.fstPay;
				loanParam.sumFstPct = loanParam.fstPct;
				loanParam.sumApplyAmt = loanParam.applyAmt;
				return false;
			}
		} else if (minAmt != '' && maxAmt == '') {
			if (Number(minAmt) > Number(loanAmt)) {
				mui.alert('贷款金额需要大于' + minAmt + '元', '提示', '确定', null, 'div');
				downPayRatioInput.value = '';
				downPaymoneyInput.value = '';
				loanMoneyInput.value = '';
				loanParam.fstPct = '';
				loanParam.applyAmt = '';
				loanParam.fstPay = '';
				loanParam.wholeFstPay = loanParam.fstPay;
				loanParam.sumFstPct = loanParam.fstPct;
				loanParam.sumApplyAmt = loanParam.applyAmt;
				return false;
			}
		} else if (minAmt == '' && maxAmt != '') {
			if (Number(loanAmt) > Number(maxAmt)) {
				mui.alert('贷款金额需要小于' + maxAmt + '元', '提示', '确定', null, 'div');
				downPayRatioInput.value = '';
				downPaymoneyInput.value = '';
				loanMoneyInput.value = '';
				loanParam.fstPct = '';
				loanParam.applyAmt = '';
				loanParam.fstPay = '';
				loanParam.wholeFstPay = loanParam.fstPay;
				loanParam.sumFstPct = loanParam.fstPct;
				loanParam.sumApplyAmt = loanParam.applyAmt;
				return false;
			}
		}
		return true;
	}
	//清空页面
	function clearFun(type) {
		//选择车辆类型的时候
		if (type === '01') {
			//品牌清空
			brandInput.innerHTML = '';
			brandInput.classList.add('item-p-after2');
			loanParam.goodsKind = '';
			loanParam.sb_brand_nam = '';
			//产品线清空
			productLineInput.value = '';
			loanParam.grpCde = '';
			loanParam.grpName = '';
			loanParam.gpsInd = '';
		}
		//选择车辆类型或者品牌的时候
		if (type === '01' || type === '02') {
			//子品牌清空
			subBrandInput.value = '';
			loanParam.sub_sb_brand_cde = '';
			loanParam.sub_sb_brand_nam = '';
			//车系清空
			carLineInput.value = '';
			loanParam.carSeries = '';
			loanParam.svc_class_nam = '';
		}
		//选择车辆类型或者品牌或者子品牌的时候
		if (type === '01' || type === '02' || type === '03') {
			carLineInput.value = '';
			loanParam.carSeries = '';
			//车系清空
		}
		//选择车辆类型或者品牌或者子品牌或者车系的时候
		if (type === '01' || type === '02' || type === '03' || type === '04') {
			yearTypeInput.value = '';
			loanParam.mode_year_cde = ''; //年型清空
		}
		//选择车辆类型或者品牌或者子品牌或者车系或者年型的时候
		if (type === '01' || type === '02' || type === '03' || type === '04' || type === '05') {
			carModelInput.innerHTML = '';
			loanParam.goodsModel = ''; //车型清空
		}
		//选择车辆类型或者品牌或者子品牌或者车系或者年型或者车型的时候
		if (type === '01' || type === '02' || type === '03' || type === '04' || type === '05' || type === '06') {
			//动力类型为空
			loanParam.transmissionType = '';
			loanParam.firmPrice = '';
			list.svm_mel_ratio = '';
			guidPriceInput.value = '';
			powerTypeInput.value = '';
			carLengthInput.value = '';
			carTotalInput.value = '';
			//如果是新车或全品牌新车的时候，贷款产品为空
			if (type === '02' || type === '03' || type === '04' || type === '05' || type === '06') {
				if (loanParam.carType == '01' || loanParam.carType == '03') {
					loanProductsInput.value = '';

					list.isMarket = false;
					marketInput.value = '';
					loanParam.sumFeeAmt = '';

					loanParam.typSeq = '';
					$('#isOrNotZr').parent().hide();
					loanParam.isSuperFinancial = 'N';
					$('#zrType').parent().hide();
					$('#zrType').find('span').text('');
					loanParam.addFincTyp = '';

					$('.follow-list').hide();
					$('.ince-list').hide();
					$('.ince2-list').hide();
					purchaseInput.value = '';
					insuranceInput.value = '';
					otherSerInput.value = '';
					GPSInput.value = '';
					decorateInput.value = '';

					purchase2Input.value = '';
					insurance2Input.value = '';
					otherSer2Input.value = '';
					loanParam.purtax = '';
					loanParam.insurancetax = '';
					loanParam.otherServer = '';
					loanParam.gpsFinc = '';
					loanParam.decorateFinc = '';
					loanParam['addFincServerList.typSeq'] = [];
					loanParam['addFincServerList.typFreq'] = [];
					loanParam['addFincServerList.addFincServerClass'] = [];
					loanParam['addFincServerList.addFincKind'] = [];
					loanParam['addFincServerList.addFincKindNam'] = [];
					loanParam['addFincServerList.addFincPrice'] = [];
					loanParam['addFincServerList.applyTnrTyp'] = [];
					loanParam['addFincServerList.fincApplyTnr'] = [];
					loanParam['addFincServerList.fincLoanIntRate'] = [];
					loanParam['addFincServerList.minAmt'] = [];
					loanParam['addFincServerList.maxAmt'] = [];
				}
			}
		}
		//选择车辆类型或者产品线的时候
		if (type === '01' || type === '07') {

			list.isMarket = false;
			marketInput.value = '';
			loanParam.sumFeeAmt = '';

			loanProductsInput.value = '';
			loanParam.typSeq = '';
			$('#isOrNotZr').parent().hide();
			loanParam.isSuperFinancial = 'N';
			$('#zrType').parent().hide();
			$('#zrType').find('span').text('');
			loanParam.addFincTyp = '';

			$('.follow-list').hide();
			$('.ince-list').hide();
			$('.ince2-list').hide();
			purchaseInput.value = '';
			insuranceInput.value = '';
			otherSerInput.value = '';
			GPSInput.value = '';
			decorateInput.value = '';

			purchase2Input.value = '';
			insurance2Input.value = '';
			otherSer2Input.value = '';
			loanParam.purtax = '';
			loanParam.insurancetax = '';
			loanParam.otherServer = '';
			loanParam.gpsFinc = '';
			loanParam.decorateFinc = '';
			loanParam['addFincServerList.typSeq'] = [];
			loanParam['addFincServerList.typFreq'] = [];
			loanParam['addFincServerList.addFincServerClass'] = [];
			loanParam['addFincServerList.addFincKind'] = [];
			loanParam['addFincServerList.addFincKindNam'] = [];
			loanParam['addFincServerList.addFincPrice'] = [];
			loanParam['addFincServerList.applyTnrTyp'] = [];
			loanParam['addFincServerList.fincApplyTnr'] = [];
			loanParam['addFincServerList.fincLoanIntRate'] = [];
			loanParam['addFincServerList.minAmt'] = [];
			loanParam['addFincServerList.maxAmt'] = [];
		}
		//选择车型或者车架号时清空
		if (type === '01' || type === '06') {
			carTotalInput.value = '' //车长
			carLengthInput.value = '' //车重
			loanParam.carLength = ''; //车长
			loanParam.totalQuality = ''; //车总质量
			loanParam.carTypeGrade = ''; //车型级别
			loanParam.carSeriesType = ''; //车系类型
			loanParam.fuelType = ''; //燃料类型
			loanParam.lenAndQuaUpdate = ''; //判断是否人工修改
		}
	}
	//查询二手车期限是否超过十年
	var checkTotalDate = function checkTotalDate(firsTime) {
		var tnr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

		if (firsTime && firsTime != '') {
			var last = new Date(list.sysDate.substr(0, 4), parseInt(list.sysDate.substr(4, 2)) - 1 + parseInt(tnr), list.sysDate
				.substr(6, 2));
			var yearLast = new Date(parseInt(firsTime.substr(0, 4)) + 10, parseInt(firsTime.substr(5, 2)) - 1, firsTime.substr(
				8, 2));
			//const yearLast = new Date(parseInt(firsTime.substr(0,4))+10, parseInt(firsTime.substr(4,2))-1, firsTime.substr(6,2));
			if (last > yearLast) {
				loanParam.tenFlag = 'Y';
			} else {
				loanParam.tenFlag = 'N';
			}
		}
	};
	//随车贷计算车辆总价
	var getTolPri = function getTolPri(carPrice, guidPrice, purchTax, insurTax, posTax,decTax,otherTax) {
		guidPrice = parseFloat(guidPrice || 0);
		var packPrice = void 0;
		if (loanParam.isSuperFinancial === 'N' || loanParam.isSuperFinancial === '') {
			packPrice = parseFloat(carPrice || 0);
		} else if (loanParam.isSuperFinancial === 'Y') {
			if (loanParam.addFincTyp === '01') {//随车贷
				packPrice = parseFloat(carPrice || 0) + parseFloat(purchTax || 0) + parseFloat(insurTax || 0) + parseFloat(posTax || 0) + parseFloat(decTax || 0) + parseFloat(otherTax || 0) ;
			}
		}
		if (loanParam.carType === '01') {
			var svm = parseFloat(list.svm_mel_ratio || 1);
			if (packPrice > guidPrice * svm) {
				mui.alert('车价超出上限，请修改', '提示', '确定', null, 'div');
				return;
			}
		} else if (loanParam.carType === '02') {
			if (packPrice > guidPrice) {
				mui.alert('车辆总价不得大于厂商指导价', '提示', '确定', null, 'div');
			}
		}
		return packPrice.toString();
	};
	//输入其他服务后，算上限金额
	function limitAmount(closingPrice, carPrice, purchTax, insurTax, posTax,decTax,otherTax){
		var minPrice = void 0;
		var limitAmt = void 0;
		//车辆类型为‘二手车’并且 二手车评估价不为空
		if(loanParam.carType=='02'){
			if(closingPrice !=''){
				minPrice=(closingPrice *0.11) > carPrice ?carPrice : (closingPrice *0.11);
			}else{
				minPrice = carPrice;
			}
		}else if(loanParam.carType=='03'){
			minPrice = closingPrice > carPrice ? carPrice :closingPrice;
		}
		if(loanParam.otherAmtLimitType=='1'){
			limitAmt = (parseFloat(minPrice || 0) + parseFloat(purchTax || 0) + parseFloat(insurTax || 0) + parseFloat(posTax || 0) + parseFloat(decTax || 0))*loanParam.otherAmtLimitRatio;
		}else{
			limitAmt = loanParam.otherAmtLimitAmt;
		}
		if(limitAmt > otherTax){
			mCheck.alert('金额超出上限,请修改');
			return false;
		}
	}
	function isEmptyFun() {
		if (carTypeInput.value == '') {
			mCheck.alert('请选择车辆类型');
			return false;
		}
		if (brandInput.innerHTML == '') {
			mCheck.alert('请选择品牌');
			return false;
		}
		if (loanParam.carType == '02' || loanParam.carType == '03') {
			if (subBrandInput.value == '') {
				mCheck.alert('请选择子品牌');
				return false;
			}
			if (buyCityInput.value == '') {
				mCheck.alert('请选择购车城市');
				return false;
			}
			/* 新增车长度，总重 */
			if (carLengthInput.value == '') {
				mCheck.alert('请输入车的长度');
				return false;
			}
			if (carTotalInput.value == '') {
				mCheck.alert('请输入车的总重量');
				return false;
			}

		}
		if (carLineInput.value == '') {
			mCheck.alert('请选择车系');
			return false;
		}
		if (yearTypeInput.value == '') {
			if (loanParam.carType == '02') {
				mCheck.alert('请选择生产年份');
				return false;
			} else if (loanParam.carType == '01' || loanParam.carType == '03') {
				mCheck.alert('请选择年型');
				return false;
			}
		}
		if (carModelInput.value == '') {
			mCheck.alert('请选择车型');
			return false;
		}
		if (carPriceInput.value == '') {
			mCheck.alert('裸车价格不能为空');
			return false;
		}
		if (loanParam.carType == '03') {
			if (customerSourceInput.value == '') {
				mCheck.alert('请选择客户来源');
				return false;
			}
		}
		if (loanParam.carType == '02') {
			// 品牌、子品牌、车系、生产年份、车型任一为空时，提示错误信息“车型不能为空，请根据车架号查询车型”；
			if (!$('#brandInput').text() || !$('#subBrandInput').val() || !$('#carLineInput').val() || !$('#yearTypeInput').val() || !$('#carModelInput').text()) {
				mCheck.alert('车型不能为空，请根据车架号查询车型');
				return false;
			}
			if (firstDateInput.value == '') {
				mCheck.alert('请选择首次登记日期');
				return false;
			}
			if (frameNoInput.value == '') {
				mCheck.alert('请选择车架号');
				return false;
			}
			if (!mCheck.checkVIN(frameNoInput.value)) {
				mCheck.alert('车架号格式有误');
				return false;
			}
			if (mileageInput.value == '') {
				mCheck.alert('行驶里程不能为空');
				return false;
			}
		}
		if (licCityInput.value == '') {
			mCheck.alert('请选择上牌城市');
			return false;
		}
		if (productLineInput.value == '') {
			mCheck.alert('请选择产品线');
			return false;
		}
		if (loanProductsInput.value == '') {
			mCheck.alert('请选择贷款产品');
			return false;
		}
		if (calMethod.value == '') {
			mCheck.alert('请选择计算方式');
			return false;
		}
		if (downPayRatioInput.value == '') {
			mCheck.alert('首付比例不能为空');
			return false;
		}
		if (loanMoneyInput.value == '') {
			mCheck.alert('贷款金额不能为空');
			return false;
		}
		if ($('#reypayDayDetail').parent().is(':visible')) {
			if ($('#reypayDayDetail').val() == '') {
				mCheck.alert('请选择还款日');
				return false;
			}
		}
		//增融为空是否校验
		if (loanParam.isSuperFinancial == 'Y') {
			if (loanParam.addFincTyp == '01') {
				if(loanParam.purtax != ''){
					loanParam.purtax = parseInt(loanParam.purtax);
				}
				if(loanParam.insurancetax != ''){
					loanParam.insurancetax = parseInt(loanParam.insurancetax);
				}
				if(loanParam.decorateFinc != ''){
					loanParam.decorateFinc = parseInt(loanParam.decorateFinc);
				}
				if(loanParam.gpsFinc != ''){
					loanParam.gpsFinc = parseInt(loanParam.gpsFinc);
				}
				if(loanParam.otherServer != ''){
					loanParam.otherServer = parseInt(loanParam.otherServer);
				}
				//车辆类型为二手车，当“装饰”金额>0，保险金额为0时，不能提交
				if(loanParam.carType=='02'){
					if(loanParam.decorateFinc > 0 && (loanParam.insurancetax =='' || loanParam.insurancetax == 0)){
						mCheck.alert('装饰金额大于0，需填写保险金额');
						return false;
					} 
				}
				//车辆类型为本品牌新车、全品牌新车，当“装饰”金额>0，购置税金额、保险金额必须都大于0
				if(loanParam.carType=='01' || loanParam.carType=='03'){
					if((loanParam.decorateFinc > 0 && (loanParam.purtax != '' || loanParam.purtax != 0 ) &&(loanParam.insurancetax !='' || loanParam.insurancetax != 0 )) || loanParam.decorateFinc <=0){
					}else{
						mCheck.alert('装饰金额大于0，需填写购置税金额/保险金额');
						return false;
					}
				}
				//车辆类型非本品牌新车，GPS金额大于6000时，不能提交
				if(loanParam.carType=='02' || loanParam.carType=='03'){
					if(loanParam.gpsFinc > 6000){
						mCheck.alert('GPS上限6000元');
						return false;
						
					}
				}
				//车辆类型为“二手车”或“全品牌新车”时,“其他”校验
				if(loanParam.carType == '02'){
					limitAmount(assessPrice.value,loanParam.carPrice,loanParam.purtax, loanParam.insurancetax,loanParam.gpsFinc,loanParam.decorateFinc, loanParam.otherServer);
				}else if(loanParam.carType=='03'){
					limitAmount(loanParam.firmPrice,loanParam.carPrice,loanParam.purtax, loanParam.insurancetax,loanParam.gpsFinc,loanParam.decorateFinc, loanParam.otherServer);
				}
				
				if ((loanParam.purtax == '' || loanParam.purtax == '0') && (loanParam.insurancetax =='' || loanParam.insurancetax == '0' ) 
				&&(loanParam.gpsFinc == '' || loanParam.gpsFinc == '0') && (loanParam.decorateFinc == '' || loanParam.decorateFinc == '0')
				&& (loanParam.otherServer == '' ||loanParam.otherServer == '0' )) {
					mCheck.alert('请至少选择一个增融产品');
					return false;
				}
			}
		}
		if (!list.isMarket) {
			mCheck.alert('请选择费用及保险超市');
			return false;
		}

		if (list.sessionRiskflag == 'B' && loanParam.mortgage == 'Y' && loanParam.noGuarantee == 'N') {
			if (cusQuaInput.value == '') {
				mCheck.alert('请选择免抵押客户类型');
				return false;
			}
		}
		//gps产品校验未加
		return true;
	}
	mui.plusReady(function () {
		var self = plus.webview.currentWebview();
		self.setStyle({
			"popGesture": "none", //窗口无侧滑返回功能
			"scrollIndicator": "none",
			"softinputMode": 'adjustResize'
		});
		mBank.isImmersed();
		var isisCan = false;
		//查询经销商评级、该门店业务范围
		mData.queryriskflagsec(sessionStoreNo, applCde).then(function (data) {
			var businessScope = data.co_busiscope.split(',');
			list.carScope = CAR_TYPE.filter(function (item) {
				return businessScope.includes(item.value);
			});
			list.sessionRiskflag = data.co_riskflag;
			if (self.newCarGrade != 'sm') {
				if (list.sessionRiskflag != 'A' && list.sessionRiskflag != 'B') {
					$('#isOrNotUnmor').parent().hide();
					$('#isOrNotAssure').parent().hide();
				}
			}
		});
		sessionRiskFlag = localStorage.getItem("sessionRiskFlag");

		function cfapplInfoQuery(applCde, typeFlag) {
			//根据type值不同调用不同的.do.其中typeFlag=02为补录(直接从首页编辑进),typeFlag=01为预审（从预审结论页面进）
			if (typeFlag == '02') {
				var url = mBank.getApiURL() + 'cfapplInfoQuery.do';
				var param = {
					applCde: applCde
				};
				return new Promise(function(resolve, reject) {
					mBank.apiSend('post', url, param, function(data) {
						mCheck.formatObj(data);
						mCheck.assignObj(loanParam, data);
						mCheck.formateData(data.addFincServerList, 'addFincServerList', loanParam);
						resolve(data);
					}, function(err) {
						reject(err);
					});
				});
			} else if (typeFlag == '01') {
				var _url2 = mBank.getApiURL() + 'queryDealerAppLoanInfo.do';
				var _param = {
					applCde: applCde
				};
				return new Promise(function(resolve, reject) {
					mBank.apiSend('post', _url2, _param, function(data) {
						mCheck.formatObj(data);
						mCheck.assignObj(loanParam, data);
						loanParam.goodsKind = data.sb_brand_cde;
						loanParam.carSeries = data.svc_class_cde;
						loanParam.goodsModel = data.svm_mode_cde;
						loanParam.firmPrice = data.vehDirectPrice;
						loanParam.registerTime = '' + data.firstLicenseTime.substr(0, 4) + data.firstLicenseTime.substr(5, 2) +
							data.firstLicenseTime.substr(8, 2);
						loanParam.fstPct = data.firstScale;
						loanParam.fstPay = data.contFstPay;
						loanParam.totalPrice = data.carPrice;
						loanParam.calMode = '01';
						loanParam.wholeFstPay = loanParam.fstPay;
						loanParam.sumFstPct = loanParam.fstPct;
						loanParam.sumApplyAmt = loanParam.applyAmt;
						list.addFincTypOpt = data.addFincTypOpt;
						localStorage.setItem('typeFlag', '02');
						resolve(loanParam);
					}, function(err) {
						reject(err);
					});
				});
			}
		}
		$('#waitingBox').show(); //为了在页面查询方法调用完成之前不让点击保存下一步按钮
		loanParam.applCde = applCde; //单号

		//查询反显车辆及贷款信息
		cfapplInfoQuery(applCde, typeFlag).then(function(data) {
			$('#waitingBox').hide();
			isisCan = true;
			if (data.coRiskflag != '') {
				list.sessionRiskflag = data.coRiskflag;
			}
			showFun(data.carType);
			carTypeInput.value = mCheck.formatData(data.carType, CAR_TYPE);
			if (data.sb_brand_nam != "") {
				brandInput.innerHTML = data.sb_brand_nam;
				brandInput.classList.remove('item-p-after2');
			}
			list.svm_mel_ratio=data.svm_mel_ratio;
			subBrandInput.value = data.sub_sb_brand_nam;
			carLineInput.value = data.svc_class_nam;
			yearTypeInput.value = data.mode_year_nam;
			if (data.sb_brand_nam != "") {
				carModelInput.innerHTML = data.svm_mode_nam;
				carModelInput.classList.remove('item-p-after');
			}
			guidPriceInput.value = mCheck.addSeparator(loanParam.firmPrice);
			carPriceInput.value = mCheck.addSeparator(data.carPrice);

			customerSourceInput.value = mCheck.formatData(data.CltFrm, CUS_SOURCE);
			powerTypeInput.value = mCheck.formatData(data.transmissionType, POWER_TYPE);
			if (typeFlag == '02') {
				firstDateInput.value = mCheck.timeFormat(loanParam.registerTime);
			} else if (typeFlag == '01') {
				firstDateInput.value = mCheck.timeFormat(loanParam.registerTime);
			}
			if (data.carType == '02') {
				if (data.smp_fld_sellprice) {
					assessPrice.value = mCheck.addSeparator(data.smp_fld_sellprice);
					loanParam.smp_fld_sellprice = data.smp_fld_sellprice;
				} else {
					assessPrice.value = '';
					loanParam.smp_fld_sellprice = '';
				}
				if (data.vheUseChar) {
					useNature.value = mCheck.formatData(data.vheUseChar, USE_NATURE); // 使用性质 
					loanParam.vheUseChar = data.vheUseChar;
				} else {
					useNature.value = ''; // 使用性质 
					loanParam.vheUseChar = '';
				}

				insert('02');
			}
			frameNoInput.value = data.VIN;
			mileageInput.value = data.distance;
			carPrice2Input.value = mCheck.addSeparator(data.totalPrice);
			// if (data.electrombile == 'Y') {
			// 	$('#isOrNotElc').find('.yes').addClass('selected').siblings('span').removeClass('selected');
			// } else {
			// 	$('#isOrNotElc').find('.no').addClass('selected').siblings('span').removeClass('selected');
			// }
			//是否是豪华车
			// if (data.luxury == 'Y') {
			// 	$('#isOrNotLuy').find('.yes').addClass('selected').siblings('span').removeClass('selected');
			// } else {
			// 	$('#isOrNotLuy').find('.no').addClass('selected').siblings('span').removeClass('selected');
			// }
			buyCityInput.value = mCheck.formatCity(data.gmCity, CITY_DATA);
			licCityInput.value = mCheck.formatCity(data.licCity, CITY_DATA);

			productLineInput.value = data.grpName;
			loanProductsInput.value = data.typdesc;

			if (data.mtdTyp == '09' || data.mtdTyp == '06' && data.mtdClass == '02') {
				$('#wkbl').parent().show();
				$('#wkbl').val(parseFloat(data.restPct * 100).toFixed(2));
				list.minPct = data.minPct;
				list.maxPct = data.maxPct;
			} else {
				$('#wkbl').parent().hide();
				$('#wkbl').val('');
			}
			/*忠诚客户*/
			if (data.loyalCustShow == 'Y') {
				$('#isOrNotLoyal').parent().show();
			} else {
				$('#isOrNotLoyal').parent().hide();
			}
			if (data.loyalCust == 'Y') {
				$('#isOrNotLoyal').find('.yes').addClass('selected').siblings('span').removeClass('selected');
			} else {
				$('#isOrNotLoyal').find('.no').addClass('selected').siblings('span').removeClass('selected');
			}
			if (data.addFincInd == 'Y') {
				$('#isOrNotZr').parent().show();
				$('#zrType').parent().show();
				$('.follow-list').show();
			} else {
				$('#isOrNotZr').parent().hide();
				$('#zrType').parent().hide();
				$('.follow-list').hide();
			}
			if (data.isSuperFinancial == 'Y') {
				$('#isOrNotZr').find('.yes').addClass('selected').siblings('span').removeClass('selected');
				$('#zrType').parent().show();
				if (data.addFincTyp == '01') {
					$('#zrType').find('span').text('随车贷');
					$('#downPayRatioInput').siblings('.item-title').text('首付比例');
					$('#downPaymoneyInput').siblings('.item-title').text('首付金额');
					$('#LoanMoneyInput').siblings('.item-title').text('贷款金额');
					$('.follow-list').show();
					$('#total1').show();
					//随车贷显示
					$('.ince-list').hide();
					$('.ince2-list').hide();
					if(data.carType == '01'){
						GPSInput.readOnly = true;
						otherSerInput.readOnly = true;
					}else{
						if(data.otherAmtLimitType == "" || data.otherAmtLimitType == null){
							otherSerInput.readOnly = true;
						}
					}
					purchaseInput.value = mCheck.addSeparator(data.purtax);
					insuranceInput.value = mCheck.addSeparator(data.insurancetax);
					otherSerInput.value = mCheck.addSeparator(data.otherServer);
					//新增GPS和装饰
					GPSInput.value = mCheck.addSeparator(data.gpsFinc);
					decorateInput.value = mCheck.addSeparator(data.decorateFinc);
					carPrice2Input.value = mCheck.addSeparator(data.totalPrice);
				} else if (data.addFincTyp == '02') {
					$('#downPayRatioInput').siblings('.item-title').text('车辆首付比例');
					$('#downPaymoneyInput').siblings('.item-title').text('车辆首付金额');
					$('#LoanMoneyInput').siblings('.item-title').text('车辆贷款金额');
					$('#zrType').find('span').text('独立增融');
					//独立增融显示
					$('.ince-list').show();
					$('.ince2-list').show();
					//随车贷隐藏
					$('.follow-list').hide();
					$('#total1').hide();
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = data.addFincServerList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var item = _step.value;

							if (item.addFincServerClass == '01') {
								purchase2Input.value = mCheck.addSeparator(item.addFincPrice);
							} else if (item.addFincServerClass == '02') {
								insurance2Input.value = mCheck.addSeparator(item.addFincPrice);
							} else if (item.addFincServerClass == '99') {
								otherSer2Input.value = mCheck.addSeparator(item.addFincPrice);
							}
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}

					loanMoney3Input.value = mCheck.addSeparator(data.sumApplyAmt);
					carPrice3Input.value = mCheck.addSeparator(data.totalPrice);
					downPaymoney3Input.value = parseFloat(data.sumFstPct * 100).toFixed(2);
				}
			} else {
				$('#zrType').parent().hide();
				$('.follow-list').hide();
				$('#isOrNotZr').find('.no').addClass('selected').siblings('span').removeClass('selected');
			}
			calMethod.value = mCheck.formatData(data.calMode, CAL_METHOD);
			if (data.calMode == '01') {
				downPayRatioInput.disabled = false;
				loanMoneyInput.disabled = true;
			} else if (data.calMode == '02') {
				downPayRatioInput.disabled = true;
				loanMoneyInput.disabled = false;
			}

			list.amountParam.totalPrice = loanParam.totalPrice;
			list.amountParam.calMode = data.calMode;
			list.amountParam.fstPct = loanParam.fstPct;
			list.amountParam.applyAmt = loanParam.applyAmt;
			downPayRatioInput.value = loanParam.fstPct == '' ? '' : parseFloat(loanParam.fstPct * 100).toFixed(2);
			if (loanParam.fstPay == '') {
				downPaymoneyInput.value = '';
			} else {
				downPaymoneyInput.value = mCheck.addSeparator(loanParam.fstPay);
			}
			if (data.applyAmt == '') {
				loanMoneyInput.value = '';
			} else {
				loanMoneyInput.value = mCheck.addSeparator(data.applyAmt);
			}
			rateInput.value = data.loanIntRate == '' ? '' : parseFloat(data.loanIntRate * 100).toFixed(4);
			applytermInput.value = data.applyTnr;
			paymentMethodInput.value = data.mtdDesc;
			reypayDay.value = mCheck.formatData(data.dueDayOpt, REPAY);

			if (data.dueDayOpt == 'OT') {
				$('#reypayDayDetail').parent().show();
				reypayDayDetail.value = mCheck.formatData(data.dueDay, GD_DAY);
			} else {
				$('#reypayDayDetail').parent().hide();
			}
			if (typeFlag == '02') {
				isMortgage(list.sessionRiskflag, data.mortgage, data.noGuarantee, data.riskGrade, data.cfState);
				if (data.carType == '02' || data.carType == '03') {
					$('#isOrNotUnmor').parent().hide();
					$('#isOrNotAssure').parent().hide();
				}
				if (data.mortgage == 'Y') {
					$('#isOrNotUnmor').find('.yes').addClass('selected').siblings('span').removeClass('selected');
				} else {
					$('#isOrNotUnmor').find('.no').addClass('selected').siblings('span').removeClass('selected');
				}
				if (data.noGuarantee == 'Y') {
					$('#isOrNotAssure').parent().show();
					$('#isOrNotAssure').find('.yes').addClass('selected').siblings('span').removeClass('selected');
				} else {
					$('#isOrNotAssure').parent().hide();
					$('#isOrNotAssure').find('.no').addClass('selected').siblings('span').removeClass('selected');
				}
				cusQuaInput.value = mCheck.formatData(data.cstLevel, CUSTOMER_QUA);
			} else if (typeFlag == '01') {
				//预审
				if (self.newCarGrade == 'sm') {
					loanParam.noGuarantee = 'Y';
					loanParam.mortgage = 'Y';
					$('#isOrNotUnmor').find('.yes').addClass('selected').siblings('span').removeClass('selected');
					$('#isOrNotAssure').find('.yes').addClass('selected').siblings('span').removeClass('selected');
					$('#isOrNotUnmor').parent().show();
					$('#isOrNotAssure').parent().show();
					isCanEditAss = 'N';
				} else {
					if (sessionRiskFlag == "C" || sessionRiskFlag == "D") {
						loanParam.noGuarantee = 'N';
						loanParam.mortgage = 'N';
						$('#isOrNotAssure').parent().hide();
						$('#isOrNotUnmor').parent().hide();
					}
				}
			}

			if (data.sumFeeAmt != '') {
				list.isMarket = true;
			}
			if (data.sumFeeAmt == '') {
				marketInput.value = '';
			} else {
				marketInput.value = mCheck.addSeparator(data.sumFeeAmt);
			}
			loanParam.lenAndQuaUpdate = data.lenAndQuaUpdate ? data.lenAndQuaUpdate : 'N';//是否能人工修改标识
			loanParam.carLength = data.carLength; //车长
			loanParam.totalQuality = data.totalQuality; //车总质量
			loanParam.carTypeGrade = data.carTypeGrade?data.carTypeGrade : ''; //车型级别
			loanParam.carSeriesType = data.carSeriesType ? data.carSeriesType : ''; //车系类型
			loanParam.fuelType = data.fuelType?data.fuelType : ''; //燃料类型
			carLengthInput.value = data.carLength;
			carTotalInput.value = data.totalQuality;
			if (loanParam.lenAndQuaUpdate == 'N') {
				$('#carLengthInput').attr('disabled', 'disabled');
				$('#carTotalInput').attr('disabled', 'disabled');
			} else {
				$('#carLengthInput').removeAttr('disabled');
				$('#carTotalInput').removeAttr('disabled');
			}
		}, function(err) {
			mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			isisCan = true;
		});
		/*查询系统时间*/
		mData.getSystime().then(function(data) {
			list.sysDate = data.sysTime;
		});

		$("#brandInput").on('click', function() {
			document.activeElement.blur();
			//查询品牌列表
			mData.getCarBrand(loanParam.carType).then(function(data) {
				if (loanParam.carType == '02' || loanParam.carType == '03') {
					if (loanParam.carType == '02' && count === 0) return;
					mBank.openWindowByLoad('../CommonPage/selectList2.html', 'selectList2', 'slide-in-right', {
						processType: '02',
						carModelList: data,
						carModelSelected: brandInput.innerHTML
					});
				} else if (loanParam.carType == '01') {
					var currId = document.querySelector('p').id;
					var getArrVal = mData.changePro(data, currId);
					weui.picker(getArrVal.proVal, {
						onChange: function(item) {},
						onConfirm: function(item) {
							if (item[0].label === brandInput.innerHTML) {
								return;
							}
							clearFun('02');
							brandInput.innerHTML = item[0].label;
							brandInput.classList.remove('item-p-after2');
							loanParam.goodsKind = item[0].sb_brand_cde;
							loanParam.sb_brand_nam = item[0].sb_brand_nam;
						},
						title: '请选择品牌',
						defaultValue: [getArrVal.indSeq],
						id: currId
					})
				}
			}, function(err) {
				mCheck.toast(err.em);
			});
		});

		window.addEventListener('carBrandReverse', function(event) {
			if (event.detail.text == brandInput.innerHTML) {
				return;
			}
			clearFun('02');
			brandInput.innerHTML = event.detail.text;
			brandInput.classList.remove('item-p-after2');
			loanParam.goodsKind = event.detail.sb_brand_cde;
			loanParam.sb_brand_nam = event.detail.sb_brand_nam;
		});

		/*子品牌选择*/
		$("#subBrandInput").on('click', function() {
			document.activeElement.blur();
			if (loanParam.goodsKind == '') {
				mCheck.alert('品牌不能为空');
				return;
			}
			mData.getSubCarBrand(loanParam.carType, loanParam.goodsKind).then(function(data) {
				var getArrVal = mData.changePro(data, 'subBrandInput');
				weui.picker(getArrVal.proVal, {
					onChange: function(item) {},
					onConfirm: function(item) {
						if (item[0].label === subBrandInput.value) {
							return;
						}
						clearFun('03');
						subBrandInput.value = item[0].label;
						loanParam.sub_sb_brand_cde = item[0].sub_sb_brand_cde;
						loanParam.sub_sb_brand_nam = item[0].label;
					},
					title: '请选择子品牌',
					defaultValue: [getArrVal.indSeq],
					id: 'subBrandInput'
				})
			});
		});

		/*车系选择*/
		$("#carLineInput").on('click', function() {
			document.activeElement.blur();
			var subSbBrandCde = void 0;
			if (loanParam.carType === '01') {
				subSbBrandCde = '';
			} else {
				if (loanParam.sub_sb_brand_cde == '') {
					mCheck.alert('子品牌不能为空');
					return;
				} else {
					subSbBrandCde = loanParam.sub_sb_brand_cde;
				}
			}
			mData.getCarSeries(loanParam.carType, loanParam.goodsKind, subSbBrandCde).then(function(data) {
				var getArrVal = mData.changePro(data, 'carLineInput');
				weui.picker(getArrVal.proVal, {
					onChange: function(item) {},
					onConfirm: function(item) {
						if (item[0].label === carLineInput.value) {
							return;
						}
						clearFun('04');
						carLineInput.value = item[0].label;
						loanParam.carSeries = item[0].svc_class_cde;
						loanParam.svc_class_nam = item[0].label;
					},
					title: '请选择车系',
					defaultValue: [getArrVal.indSeq],
					id: 'carLineInput'
				});
			});
		});

		/*年型选择*/
		$("#yearTypeInput").on('click', function() {
			document.activeElement.blur();
			if (loanParam.carSeries == '') {
				mCheck.alert('车系不能为空');
				return;
			}
			var weTitle;
			if (loanParam.carType == "02") {
				weTitle = '请选择生产年份';
			} else {
				weTitle = "请选择年型";
			}

			mData.getCarModeYear(loanParam.carType, loanParam.goodsKind, loanParam.carSeries).then(function(data) {
				var getArrVal = mData.changePro(data, 'yearTypeInput');
				weui.picker(getArrVal.proVal, {
					onChange: function(item) {},
					onConfirm: function(item) {
						if (item[0].label === yearTypeInput.value) {
							return;
						}
						clearFun('05');
						yearTypeInput.value = item[0].label;
						loanParam.mode_year_cde = item[0].mode_year_cde;
						loanParam.mode_year_nam = item[0].label;
					},
					title: weTitle,
					defaultValue: [getArrVal.indSeq],
					id: 'yearTypeInput'
				})
			});
		});

		/*车型选择*/
		carModelInput.addEventListener('tap', function() {
			document.activeElement.blur();
			if (loanParam.mode_year_cde == '') {
				mCheck.alert('年型不能为空');
				return;
			}
			mData.getCarModel(loanParam.carType, loanParam.carSeries, loanParam.mode_year_cde).then(function(data) {
				if (loanParam.carType == '02' && count === 0) {
					return;
				}
				mBank.openWindowByLoad('../CommonPage/selectList.html', 'selectList', 'slide-in-right', {
					processType: '02',
					carModelList: data,
					carModelSelected: carModelInput.innerHTML
				});
			});
		});
	          /* 车型反显*/
		window.addEventListener('carModelReverse', function(event) {
			clearFun('06');
			// console.log(JSON.stringify(event.detail)) 
			list.carModelList = event.detail;
			carModelInput.innerHTML = event.detail.text;
			carModelInput.classList.remove('item-p-after');
			loanParam.goodsModel = event.detail.svm_mode_cde;
			loanParam.svm_mode_nam = event.detail.text;
			loanParam.transmissionType = event.detail.transmissionType;
			loanParam.firmPrice = event.detail.firmPrice;
			list.svm_mel_ratio = event.detail.svm_mel_ratio;
			guidPriceInput.value = mCheck.addSeparator(event.detail.firmPrice);

			if (loanParam.carType === '02' || loanParam.carType === '03') {
				powerTypeInput.value = mCheck.formatData(event.detail.transmissionType, POWER_TYPE);
					loanParam.carLength = event.detail.carLength; //车长
					loanParam.totalQuality = event.detail.totalQuality; //车总质量
					loanParam.carTypeGrade = event.detail.carTypeGrade ? event.detail.carTypeGrade : ''; //车型级别
					loanParam.carSeriesType = event.detail.carSeriesType ? event.detail.carSeriesType: ''; //车系类型
					loanParam.fuelType = event.detail.fuelType ? event.detail.fuelType : ''; //燃料类型
					/*车型选择后返回 车长，车重 */
					carLengthInput.value = event.detail.carLength;
					carTotalInput.value = event.detail.totalQuality;
					//根据返回的数据里是否有车重，车长字段的值，如果有，就反显，然后禁止修改。
					if (event.detail.carLength&&event.detail.totalQuality) {
							loanParam.lenAndQuaUpdate = 'N';//是否能人工修改标识
						$('#carLengthInput').attr('disabled', 'disabled');
						$('#carTotalInput').attr('disabled', 'disabled');
					} else {
						loanParam.lenAndQuaUpdate = 'Y';
						$('#carLengthInput').removeAttr('disabled');
					    $('#carTotalInput').removeAttr('disabled');
					}
			}
		});


		//输入车长keyup事件
		carLengthInput.addEventListener('keyup', function() {
			mCheck.checknum1(this);
			if (this.value.length > 5) {
				this.value = this.value.slice(0, 5);
			}
		});
		carLengthInput.addEventListener('blur', function() {
			loanParam.carLength = carLengthInput.value;
		});
		//输入车重
		carTotalInput.addEventListener('keyup', function() {
			mCheck.checknum1(this);
			if (this.value.length > 5) {
				this.value = this.value.slice(0, 5);
			}
		});
		carTotalInput.addEventListener('blur', function() {
			loanParam.totalQuality = carTotalInput.value;
		});

		$('#firstDateInput').parent().on('click', function() {
			document.activeElement.blur();
			var getVal = $("#firstDateInput").val();
			var pickDate = mData.selDate(getVal, list.sysDate);
			weui.datePicker({
				start: pickDate.startDate,
				end: pickDate.endDate,
				onChange: function(item) {},
				onConfirm: function(item) {
					var getDateVal = mData.clearDate(item[0].label, item[1].label, item[2].label);
					firstDateInput.value = getDateVal;
					loanParam.registerTime = getDateVal.replace('-', '').replace('-', '');
					checkTotalDate(loanParam.registerTime);
				},
				title: '选择首次登记日期',
				defaultValue: [pickDate.defY, pickDate.defM, pickDate.defD],
				id: 'firstDateInput'
			});
		});

		/*裸车价失去焦点*/
		carPriceInput.addEventListener('keyup', function() {
			mCheck.checknum(this);
		});
		carPriceInput.addEventListener('blur', function() {
			this.value = mCheck.removeSeparator(this.value);
			loanParam.carPrice = carPriceInput.value;
			if (loanParam.isSuperFinancial == 'N') {
				loanParam.totalPrice = getTolPri(loanParam.carPrice, loanParam.firmPrice);
				carPrice2Input.value = mCheck.addSeparator(loanParam.totalPrice);
			} else if (loanParam.isSuperFinancial == 'Y') {
				if (loanParam.addFincTyp == '01') {
					loanParam.totalPrice = getTolPri(loanParam.carPrice, loanParam.firmPrice, loanParam.purtax, loanParam.insurancetax,loanParam.gpsFinc, loanParam.decorateFinc, loanParam.otherServer);
					carPrice2Input.value = mCheck.addSeparator(loanParam.totalPrice);
				}
			}
			list.amountParam.totalPrice = loanParam.totalPrice;
			cfLoanAmt(list.amountParam);
			carPriceInput.value = mCheck.addSeparator(carPriceInput.value);
		});

		//购买城市选择
		$("#buyCityInput").on('click', function() {
			document.activeElement.blur();
			var getArrVal = mData.changePro(PRO_CITY, this.id, 2);
			var defPCA = getArrVal.indSeq.split(',');
			weui.picker(getArrVal.proVal, {
				onChange: function(item) {},
				onConfirm: function(item) {
					if (!item[1].label) {
						item[1].label = '-';
						item[1].value = 'undefined';
					}
					buyCityInput.value = item[0].label + ' ' + item[1].label;
					loanParam.gmCity = item[0].value + ',' + item[1].value;
				},
				title: '请选择购买城市',
				defaultValue: [defPCA[0], defPCA[1]],
				id: this.id
			});
		});

		//上牌城市选择
		$("#licCityInput").on('click', function() {
			document.activeElement.blur();
			var getArrVal = mData.changePro(PRO_CITY, this.id, 2);
			var defPCA = getArrVal.indSeq.split(',');
			weui.picker(getArrVal.proVal, {
				onChange: function(item) {},
				onConfirm: function(item) {
					if (!item[1].label) {
						item[1].label = '-';
						item[1].value = 'undefined';
					}
					licCityInput.value = item[0].label + ' ' + item[1].label;
					loanParam.licCity = item[0].value + ',' + item[1].value;
				},
				title: '请选择上牌城市',
				defaultValue: [defPCA[0], defPCA[1]],
				id: this.id
			});
		});
		//车架号blur事件
		frameNoInput.addEventListener('blur', function() {
			loanParam.VIN = frameNoInput.value;
		});

		// 根据车架号反显 车型信息
		window.addEventListener('carModelReverse1', function(event) {
			clearFun('01');
			list.carModelList = event.detail;
			brandInput.innerHTML = event.detail.goodsKindName; // 品牌
			subBrandInput.value = event.detail.carMfrsName; // 子品牌
			carLineInput.value = event.detail.seriseName; // 车系
			yearTypeInput.value = event.detail.mode_year_nam; // 生产年份
			carModelInput.innerHTML = event.detail.svm_mode_nam; // 车型名称
			guidPriceInput.value = mCheck.addSeparator(event.detail.firmPrice); // 厂商指导价
			if (loanParam.carType === '02') {
				// 动力类型
				powerTypeInput.value = mCheck.formatData(event.detail.transmissionType, POWER_TYPE);
	            carLengthInput.value = event.detail.carLength;
				carTotalInput.value = event.detail.totalQuality;
				loanParam.carLength = event.detail.carLength; //车长
				loanParam.totalQuality = event.detail.totalQuality; //车总质量
				loanParam.carTypeGrade = event.detail.carTypeGrade ? event.detail.carTypeGrade : ''; //车型级别
				loanParam.carSeriesType = event.detail.carSeriesType ? event.detail.carSeriesType : ''; //车系类型
				loanParam.fuelType = event.detail.fuelType ? event.detail.fuelType : ''; //燃料类型
                if (event.detail.carLength&&event.detail.totalQuality) {
                   	loanParam.lenAndQuaUpdate = 'N';//是否能人工修改标识
					$('#carLengthInput').attr('disabled', 'disabled');
					$('#carTotalInput').attr('disabled', 'disabled');
                } else {
					loanParam.lenAndQuaUpdate = 'Y';
					$('#carLengthInput').removeAttr('disabled');
                    $('#carTotalInput').removeAttr('disabled');
                }
			}
			brandInput.classList.remove('item-p-after2');
			carModelInput.classList.remove('item-p-after');
			loanParam.goodsKind = event.detail.goodsKindId; // 品牌
			loanParam.sb_brand_nam = event.detail.goodsKindName;
			loanParam.sub_sb_brand_cde = event.detail.carMfrsId; // 子品牌
			loanParam.sub_sb_brand_nam = event.detail.carMfrsName;
			loanParam.carSeries = event.detail.carSerise; // 车系
			loanParam.svc_class_nam = event.detail.seriseName;
			loanParam.mode_year_cde = event.detail.mode_year_cde; // 生产年份
			loanParam.mode_year_nam = event.detail.mode_year_nam;
			loanParam.goodsModel = event.detail.svm_mode_cde; // 车型
			loanParam.svm_mode_nam = event.detail.svm_mode_nam;
			loanParam.firmPrice = event.detail.firmPrice; // 厂商指导价
			loanParam.transmissionType = event.detail.transmissionType; // 动力类型
			// list.svm_mel_ratio = event.detail.svm_mel_ratio;
			$('#brandInput').attr('disabled', 'disabled');
			$('#subBrandInput').attr('disabled', 'disabled'); // 子品牌
			$('#carLineInput').attr('disabled', 'disabled'); // 车系
			$('#yearTypeInput').attr('disabled', 'disabled'); // 生产年份
			$('#carModelInput').attr('disabled', 'disabled'); // 车型
		});

		/*二手车使用性质*/
		$("#useNature").on('click', function() {
			document.activeElement.blur();
			var getArrVal = mData.changePro(USE_NATURE, this.id);
			weui.picker(getArrVal.proVal, {
				onChange: function(item) {},
				onConfirm: function(item) {
					$('#useNature').val(item[0].label).attr('data-value', item[0].value);
					loanParam.vheUseChar = mCheck.dataIsNull(item[0].value);
				},
				title: '请选择使用性质',
				defaultValue: [getArrVal.indSeq],
				id: this.id
			})
		})

		// 根据车架号查询车辆信息
		function rlCarModel(vehChassis, CityName) {
			var _url = mBank.getApiURL() + 'rlCarModel.do';
			mBank.apiSend('post', _url, {
				vehChassis: vehChassis,
				cityName: CityName // 申请单号
			}, function(res) {
				if (res.iCarModelList.length > 0) {
					count = 0;
					mBank.openWindowByLoad('../CommonPage/selectList1.html', 'selectList1', 'slide-in-right', {
						processType: '02',
						carModelList: res.iCarModelList,
						carModelSelected: carModelInput.innerHTML
					});
				} else {
					mui.alert('未找到匹配的车型，请手工选择', '提示', '确定', function(e) {
						count++;
						$('#brandInput').removeAttr('disabled').removeClass('disabled'); // 品牌
						$('#subBrandInput').removeAttr('disabled').removeClass('disabled'); // 子品牌
						$('#carLineInput').removeAttr('disabled').removeClass('disabled'); // 车系
						$('#yearTypeInput').removeAttr('disabled').removeClass('disabled'); // 生产年份
						$('#carModelInput').removeAttr('disabled').removeClass('disabled'); // 车型
					}, 'div');
				}
			}, function(err) {
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		}

		// 输入车架号时，判断搜索按钮是否被点击过
		$('#frameNoInput').on('input', function() {
			if (!$(this).val()) {
				mCheck.alert('请输入车架号');
				return;
			}
			isNotEdit('02');
		});

		// 点击车架号搜索按钮
		$('#frameNoInputSearch').on('tap', function (e) {
			if(e.target.tagName != 'INPUT') {
				$('input').blur();
			}
			if (frameNoInput.value == '') {
				count = 0;
				mCheck.alert('请输入车架号');
				return false;
			}
			if (!mCheck.checkVIN(frameNoInput.value)) {
				count = 0;
				mCheck.alert('车架号格式有误');
				return false;
			}
			if (!$('#buyCityInput').val()) {
				count = 0;
				mCheck.alert('请选择购车城市');
				return false;
			}
			// 根据输入的车架号、购买城市，检索车型，调用接口
			rlCarModel($('#frameNoInput').val(), $('#buyCityInput').val().split(' ')[1]);
		});

		// 二手车价格评估
		function CarPriceCal() {
			var _url = mBank.getApiURL() + 'CarPriceCal.do';
			var params = {
				modelID: loanParam.goodsModel,
				veh_type: loanParam.vheUseChar,
				vehChassis: $('#frameNoInput').val(),
				veh_range: $('#mileageInput').val(),
				cityName: $('#buyCityInput').val().split(' ')[1],
				veh_first_dt: $('#firstDateInput').val()
			};
			mBank.apiSend('post', _url, params, function (res) {
				if (res.flag == '-1') {
					mui.alert('未查询到车架号对应的车型，无法评估', '提示', '确定', function(e) {}, 'div');
				} else if (res.flag == '1') {
					mui.alert('选择车型与通过车架号查询的车型不一致，无法评估', '提示', '确定', function(e) {}, 'div');
				} else {
					if (res.smp_fld_sellprice) {
						$('#assessPrice').val(mCheck.addSeparator(res.smp_fld_sellprice)); // 二手车评估价
					} else {
						$('#assessPrice').val('');
					}
					loanParam.smp_fld_sellprice = res.smp_fld_sellprice;
				}
			},function(err){
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			});
		}

		// 评估按钮
		$('.assessPriceBtn').on('tap', function () {
			if (!$('#buyCityInput').val()) {
				mCheck.alert('请选择购车城市');
				return false;
			}
			if (!$('#frameNoInput').val()) {
				mCheck.alert('请输入车架号');
				return false;
			}
			if (!mCheck.checkVIN($('#frameNoInput').val())) {
				mCheck.alert('车架号格式有误');
				return false;
			}
			if (!$('#carModelInput').text()) {
				mCheck.alert('请选择车型');
				return false;
			}
			if (!$('#firstDateInput').val()) {
				mCheck.alert('请选择首次登记日期');
				return false;
			}
			if (!$('#mileageInput').val()) {
				mCheck.alert('请输入行驶里程');
				return false;
			}
			if ($('#mileageInput').val() == '0') {
				mCheck.alert('行驶里程不能为0');
				return false;
			}
			if (!$('#useNature').val()) {
				mCheck.alert('请选择使用性质');
				return false;
			}
			// 根据输入的车架号，查询该车架号对应的二手车车型，调用接口
			CarPriceCal();
		});

		//行驶公里数keyup事件
		mileageInput.addEventListener('keyup', function () {
			mCheck.checknum1(this);
			if (this.value.length > 10) {
				this.value = this.value.slice(0, 10);
			}
		});
		mileageInput.addEventListener('blur', function () {
			loanParam.distance = mileageInput.value;
		});

		//是否电动车选择
//		mui('#isOrNotElc').on('tap', 'span', function (e) {
//			document.activeElement.blur();
//			if ($(this).hasClass('selected')) {
//				return;
//			}
//			$(this).addClass('selected').siblings('span').removeClass('selected');
//			loanParam.electrombile = $(this).hasClass('yes') ? 'Y' : 'N';
//		});

		//是否豪华车选择
//		mui('#isOrNotLuy').on('tap', 'span', function (e) {
//			document.activeElement.blur();
//			if ($(this).hasClass('selected')) {
//				return;
//			}
//			$(this).addClass('selected').siblings('span').removeClass('selected');
//			loanParam.luxury = $(this).hasClass('yes') ? 'Y' : 'N';
//		});

		//客户来源选择
		$("#customerSourceInput").on('click', function () {
			document.activeElement.blur();
			var getArrVal=mData.changePro(CUS_SOURCE,this.id);
			weui.picker(getArrVal.proVal, {
				onChange: function(item) {},
				onConfirm: function(item) {
					customerSourceInput.value = item[0].label;
					loanParam.CltFrm = item[0].value;
				},
				title: '请选择客户来源',
				defaultValue: [getArrVal.indSeq],
				id: this.id
			});
		});

		//产品线选择
		$("#productLineInput").on('click', function() {
			document.activeElement.blur();
			mData.queryPGrpList(loanParam.carType).then(function(data) {
				var getArrVal = mData.changePro(data, 'productLineInput');
				weui.picker(getArrVal.proVal, {
					onChange: function(item) {},
					onConfirm: function(item) {
						if (item[0].label === productLineInput.value) {
							return;
						}
						clearFun('07');
						productLineInput.value = item[0].label;
						loanParam.grpCde = item[0].grpCde;
						loanParam.grpName = item[0].grpName;
						loanParam.gpsInd = item[0].gpsInd;
					},
					title: '请选择产品线',
					defaultValue: [getArrVal.indSeq],
					id: 'productLineInput'
				});
			});
		});

		//贷款产品选择
		$("#loanProductsInput").on('click', function() {
			document.activeElement.blur();
			if (carModelInput.innerHTML == '') {
				mCheck.alert('请先选择车型');
				return;
			}
			if (productLineInput.value == '') {
				mCheck.alert('请先选择产品线');
				return;
			}
			mData.queryLoanProduct(loanParam.carType, loanParam.grpCde, loanParam.goodsKind, loanParam.carSeries,
				loanParam.mode_year_cde, loanParam.goodsModel).then(function(data) {
				var getArrVal = mData.changePro(data, 'loanProductsInput');
				if (getArrVal.proVal != '') {
					weui.picker(getArrVal.proVal, {
						onChange: function(item) {},
						onConfirm: function(item) {
							//if (loanProductsInput.value === item[0].label) {
							//	return;
							//}
							list.iLoanProductList = item[0];
							loanProductsInput.value = item[0].label;
							var fstPctStr = loanParam.fstPct;
							mCheck.assignObj(loanParam, item[0]);
							loanParam.fstPct = fstPctStr;
							loanParam.mtdDesc = item[0].mtdName;
							loanParam.typdesc = item[0].typDesc;
							loanParam.applyTnr = item[0].tnrOpt;

							loanParam.lt_fstpct = item[0].fstPct;
							loanParam.lt_fstpcp = item[0].maxFstPct;
							
							applytermInput.value = loanParam.applyTnr;
							paymentMethodInput.value = loanParam.mtdDesc;

							loanParam.totalPrice = getTolPri(loanParam.carPrice, loanParam.firmPrice);
							carPrice2Input.value = mCheck.addSeparator(loanParam.totalPrice);
							list.amountParam.totalPrice = loanParam.totalPrice;
							cfLoanAmt(list.amountParam);

							if (list.iLoanProductList.mtdTyp == '09' || list.iLoanProductList.mtdTyp == '06' && list.iLoanProductList
								.mtdClass == '02') {
								$('#wkbl').parent().show();
								wkbl.value = (list.iLoanProductList.defPct * 100).toFixed(2);
								loanParam.restPct = list.iLoanProductList.defPct;
								list.minPct = list.iLoanProductList.minPct;
								list.maxPct = list.iLoanProductList.maxPct;
							} else {
								$('#wkbl').parent().hide();
								wkbl.value = '';
								loanParam.restPct = '';
							}

							loanParam.addFincInd = item[0].addFincInd;
							loanParam.addFincTyp = item[0].addFincTyp;
							if (list.iLoanProductList.addFincInd == 'Y') {
								$('#isOrNotZr').parent().show();
							} else {
								$('#isOrNotZr').parent().hide();
							}
							$('#isOrNotZr').find('.no').addClass('selected').siblings('.yes').removeClass('selected');
							$('#total1').show();
							loanParam.addFincObj = '';
							loanParam.isSuperFinancial = 'N';
							$('#zrType').parent().hide();
							$('#zrType').find('span').text('');
							//随车贷、独立增融隐藏
							$('.follow-list').hide();
							$('.ince-list').hide();
							purchase2Input.value = '';
							insurance2Input.value = '';
							otherSer2Input.value = '';
							purchaseInput.value = '';
							insuranceInput.value = '';
							otherSerInput.value = '';
							GPSInput.value = '';
							decorateInput.value = '';
							loanParam.purtax = '';
							loanParam.insurancetax = '';
							loanParam.otherServer = '';
							loanParam.gpsFinc = '';
							loanParam.decorateFinc = '';
							loanParam['addFincServerList.typSeq'] = [];
							loanParam['addFincServerList.typFreq'] = [];
							loanParam['addFincServerList.addFincServerClass'] = [];
							loanParam['addFincServerList.addFincKind'] = [];
							loanParam['addFincServerList.addFincKindNam'] = [];
							loanParam['addFincServerList.addFincPrice'] = [];
							loanParam['addFincServerList.applyTnrTyp'] = [];
							loanParam['addFincServerList.fincApplyTnr'] = [];
							loanParam['addFincServerList.fincLoanIntRate'] = [];
							loanParam['addFincServerList.minAmt'] = [];
							loanParam['addFincServerList.maxAmt'] = [];
							list.isMarket = false;
							marketInput.value = '';
							loanParam.sumFeeAmt = '';
							if (item[0].loyalCust == 'Y') {
								loanParam.loyalCust = 'Y';
								$('#isOrNotLoyal').parent().show();
								$('#isOrNotLoyal').find('.yes').addClass('selected').siblings('span').removeClass('selected');
							} else {
								loanParam.loyalCust = 'N';
								$('#isOrNotLoyal').parent().hide();
								$('#isOrNotLoyal').find('.no').addClass('selected').siblings('span').removeClass('selected');
							}
							var url111 = mBank.getApiURL() + 'queryLoanTypeDetail.do';
							var param111 = {
								'typSeq': loanParam.typSeq,
								'carType': loanParam.carType,
								'mtdCde': loanParam.mtdCde
							};
							mBank.apiSend('post', url111, param111, function(data) {
								loanParam.otherAmtLimitType = data.otherAmtLimitType;
								loanParam.otherAmtLimitRatio = data.otherAmtLimitRatio;
								loanParam.otherAmtLimitAmt = data.otherAmtLimitAmt;
								$('#loanProductsInput').mytips({
									tiptext: '温馨提示: ' + data.typDetail
								});
							}, function(err) {
								mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
							}, true);
						},
						title: '请选择贷款产品',
						defaultValue: [getArrVal.indSeq],
						id: 'loanProductsInput' + getArrVal.indSeq
					});
				}

			});
		});
		//尾款比例
		wkbl.addEventListener('keyup', function () {
			mCheck.checknum(this);
		});

		wkbl.addEventListener('blur', function () {
			if (list.minPct != '' && list.maxPct != '') {
				if (Number(this.value) > Number(list.maxPct * 100) || Number(this.value) < Number(list.minPct * 100)) {
					mCheck.alert('尾款比例在' + list.minPct * 100 + '%-' + list.maxPct * 100 + '%之间');
					this.value = '';
					loanParam.restPct = '';
					return;
				}
			}
			if (list.minPct != '' && list.maxPct == '') {
				if (Number(this.value) < Number(list.minPct * 100)) {
					mCheck.alert('尾款比例要大于' + list.minPct * 100 + '%');
					this.value = '';
					loanParam.restPct = '';
					return;
				}
			}
			if (list.minPct == '' && list.maxPct != '') {
				if (Number(this.value) > Number(list.maxPct * 100)) {
					mCheck.alert('尾款比例要小于' + list.maxPct * 100 + '%');
					this.value = '';
					loanParam.restPct = '';
					return;
				}
			}

			loanParam.restPct = parseFloat(this.value / 100).toFixed(2);
			this.value = parseFloat(this.value).toFixed(2);
		});

		//是否增融选择
		mui('#isOrNotZr').on('tap', 'span', function () {
			document.activeElement.blur();
			if ($(this).hasClass('selected')) {
				return;
			}
			if (loanParam.addFincInd == 'N' || loanParam.addFincInd == '') {
				return false;
			}
			$(this).addClass('selected').siblings('span').removeClass('selected');
			loanParam.isSuperFinancial = $(this).hasClass('yes') ? 'Y' : 'N';
			if (loanParam.isSuperFinancial == 'Y') {
				$('#zrType').parent().show();
				if (loanParam.addFincTyp == '01' || list.addFincTypOpt == '01') {
					$('#zrType').find('span').text('随车贷');
					$('.follow-list').show();
					$('.ince-list').hide();
					$('.ince2-list').hide();
					loanParam.addFincTyp = '01';
					if(loanParam.carType == '01'){
						GPSInput.readOnly = true;
						GPSInput.value=mCheck.addSeparator(0);
						otherSerInput.readOnly = true;
						otherSerInput.value = mCheck.addSeparator(0);
					}else{
						if(loanParam.otherAmtLimitType =='' || loanParam.otherAmtLimitType == null){
							otherSerInput.readOnly = true;
							otherSerInput.value = mCheck.addSeparator(0);
						}
					}
				} else if (loanParam.addFincTyp == '02' || list.addFincTypOpt == '02') {
					$('#zrType').find('span').text('独立增融');
					$('.follow-list').hide();
					$('.ince-list').show();
					$('.ince2-list').show();
					loanParam.addFincTyp = '02';
				}
			} else {
				$('#zrType').parent().hide();
				$('.follow-list').hide();
				$('.ince-list').hide();
				$('.ince2-list').hide();
				purchaseInput.value = '';
				insuranceInput.value = '';
				otherSerInput.value = '';
				GPSInput.value = '';
				decorateInput.value = '';
				loanParam.purtax = '';
				loanParam.insurancetax = '';
				loanParam.otherServer = '';
				loanParam.gpsFinc = '';
				loanParam.decorateFinc = '';

				purchase2Input.value = '';
				insurance2Input.value = '';
				otherSer2Input.value = '';
				loanParam['addFincServerList.typSeq'] = [];
				loanParam['addFincServerList.typFreq'] = [];
				loanParam['addFincServerList.addFincServerClass'] = [];
				loanParam['addFincServerList.addFincKind'] = [];
				loanParam['addFincServerList.addFincKindNam'] = [];
				loanParam['addFincServerList.addFincPrice'] = [];
				loanParam['addFincServerList.applyTnrTyp'] = [];
				loanParam['addFincServerList.fincApplyTnr'] = [];
				loanParam['addFincServerList.fincLoanIntRate'] = [];
				loanParam['addFincServerList.minAmt'] = [];
				loanParam['addFincServerList.maxAmt'] = [];

				loanParam.totalPrice = getTolPri(loanParam.carPrice, loanParam.firmPrice);
				carPrice2Input.value = mCheck.addSeparator(loanParam.totalPrice);
				list.amountParam.totalPrice = loanParam.totalPrice;
				cfLoanAmt(list.amountParam);
			}
		});

		//随车贷增融服务
		//购置税
		purchaseInput.addEventListener('keyup', function() {
			mCheck.checknum(this);
		});
		purchaseInput.addEventListener('blur', function() {
			this.value = mCheck.removeSeparator(this.value);
			loanParam.purtax = purchaseInput.value;
			loanParam.totalPrice = getTolPri(loanParam.carPrice, loanParam.firmPrice, loanParam.purtax, loanParam.insurancetax,loanParam.gpsFinc,loanParam.decorateFinc, loanParam.otherServer);
			carPrice2Input.value = mCheck.addSeparator(loanParam.totalPrice);
			list.amountParam.totalPrice = loanParam.totalPrice;
			cfLoanAmt(list.amountParam);
			purchaseInput.value = mCheck.addSeparator(purchaseInput.value);
		});
		//保险
		insuranceInput.addEventListener('keyup', function() {
			mCheck.checknum(this);
		});
		insuranceInput.addEventListener('blur', function() {
			this.value = mCheck.removeSeparator(this.value);
			loanParam.insurancetax = insuranceInput.value;
			loanParam.totalPrice = getTolPri(loanParam.carPrice, loanParam.firmPrice, loanParam.purtax, loanParam.insurancetax,loanParam.gpsFinc,loanParam.decorateFinc, loanParam.otherServer);
			carPrice2Input.value = mCheck.addSeparator(loanParam.totalPrice);
			list.amountParam.totalPrice = loanParam.totalPrice;
			cfLoanAmt(list.amountParam);
			insuranceInput.value = mCheck.addSeparator(insuranceInput.value);
		});
		//其他
		otherSerInput.addEventListener('keyup', function() {
			mCheck.checknum(this);
		});
		otherSerInput.addEventListener('blur', function() {
			this.value = mCheck.removeSeparator(this.value);
			loanParam.otherServer = otherSerInput.value;
			if(loanParam.carType == '02'){
				limitAmount(assessPrice.value,loanParam.carPrice,loanParam.purtax, loanParam.insurancetax,loanParam.gpsFinc,loanParam.decorateFinc, loanParam.otherServer);
			}else if(loanParam.carType=='03'){
				limitAmount(loanParam.firmPrice,loanParam.carPrice,loanParam.purtax, loanParam.insurancetax,loanParam.gpsFinc,loanParam.decorateFinc, loanParam.otherServer);
			}
			loanParam.totalPrice = getTolPri(loanParam.carPrice, loanParam.firmPrice, loanParam.purtax, loanParam.insurancetax,loanParam.gpsFinc,loanParam.decorateFinc, loanParam.otherServer);
			carPrice2Input.value = mCheck.addSeparator(loanParam.totalPrice);
			list.amountParam.totalPrice = loanParam.totalPrice;
			cfLoanAmt(list.amountParam);
			otherSerInput.value = mCheck.addSeparator(otherSerInput.value);
		});
		//GPS
		GPSInput.addEventListener('keyup', function() {
			mCheck.checknum(this);
		});
		GPSInput.addEventListener('blur', function() {
			this.value = mCheck.removeSeparator(this.value);
			loanParam.gpsFinc = GPSInput.value;
			loanParam.totalPrice = getTolPri(loanParam.carPrice, loanParam.firmPrice, loanParam.purtax, loanParam.insurancetax,loanParam.gpsFinc,loanParam.decorateFinc, loanParam.otherServer);
			carPrice2Input.value = mCheck.addSeparator(loanParam.totalPrice);
			list.amountParam.totalPrice = loanParam.totalPrice;
			cfLoanAmt(list.amountParam);
			GPSInput.value = mCheck.addSeparator(GPSInput.value);
		});
		//装饰
		decorateInput.addEventListener('keyup', function() {
			mCheck.checknum(this);
		});
		decorateInput.addEventListener('blur', function() {
			this.value = mCheck.removeSeparator(this.value);
			loanParam.decorateFinc = decorateInput.value;
			loanParam.totalPrice = getTolPri(loanParam.carPrice, loanParam.firmPrice, loanParam.purtax, loanParam.insurancetax,loanParam.gpsFinc,loanParam.decorateFinc, loanParam.otherServer);
			carPrice2Input.value = mCheck.addSeparator(loanParam.totalPrice);
			list.amountParam.totalPrice = loanParam.totalPrice;
			cfLoanAmt(list.amountParam);
			decorateInput.value = mCheck.addSeparator(decorateInput.value);
		});
		
		//计算方式
		$("#calMethod").on('click', function() {
			document.activeElement.blur();
			var getArrVal = mData.changePro(CAL_METHOD, this.id);
			weui.picker(getArrVal.proVal, {
				onChange: function(item) {},
				onConfirm: function(item) {
					if (calMethod.value == item[0].label) {
						return;
					}
					calMethod.value = item[0].label;
					loanParam.calMode = item[0].value;
					list.amountParam.totalPrice = loanParam.totalPrice;
					list.amountParam.calMode = item[0].value;

					downPayRatioInput.value = '';
					loanParam.fstPct = '';
					loanMoneyInput.value = '';
					loanParam.applyAmt = '';
					downPaymoneyInput.value = '';
					loanParam.fstPay = '';

					if (loanParam.calMode == '01') {
						downPayRatioInput.disabled = false;
						loanMoneyInput.disabled = true;
					} else if (loanParam.calMode == '02') {
						downPayRatioInput.disabled = true;
						loanMoneyInput.disabled = false;
					}
				},
				title: '请选择计算方式',
				defaultValue: [getArrVal.indSeq],
				id: this.id
			});
		});

		//首付比例输入事件
		downPayRatioInput.addEventListener('keyup', function() {
			mCheck.checknum(this);
		});
		downPayRatioInput.addEventListener('blur', function() {
			if (downPayRatioInput.value == '') {
				return;
			}
			loanParam.fstPct = parseFloat(downPayRatioInput.value / 100).toFixed(4);
			downPayRatioInput.value = parseFloat(loanParam.fstPct * 100).toFixed(2);
			if (loanParam.lt_fstpct != '' && loanParam.lt_fstpcp != '') {
				if (Number(loanParam.lt_fstpct) > Number(loanParam.fstPct) || Number(loanParam.fstPct) > Number(loanParam.lt_fstpcp)) {
					mui.alert('首付比例需要在' + loanParam.lt_fstpct * 100 + '%~' + loanParam.lt_fstpcp * 100 + '%之间', '提示', '确定', null, 'div');
					downPayRatioInput.value = '';
					downPaymoneyInput.value = '';
					loanMoneyInput.value = '';

					loanParam.fstPct = '';
					loanParam.applyAmt = '';
					loanParam.fstPay = '';
					loanParam.wholeFstPay = loanParam.fstPay;
					loanParam.sumFstPct = loanParam.fstPct;
					loanParam.sumApplyAmt = loanParam.applyAmt;
					return;
				}
			} else if (loanParam.lt_fstpct != '' && loanParam.lt_fstpcp == '') {
				if (Number(loanParam.lt_fstpct) > Number(loanParam.fstPct)) {
					mui.alert('首付比例需要大于' + loanParam.lt_fstpct * 100 + '%', '提示', '确定', null, 'div');
					downPayRatioInput.value = '';
					downPaymoneyInput.value = '';
					loanMoneyInput.value = '';
					loanParam.fstPct = '';
					loanParam.applyAmt = '';
					loanParam.fstPay = '';
					loanParam.wholeFstPay = loanParam.fstPay;
					loanParam.sumFstPct = loanParam.fstPct;
					loanParam.sumApplyAmt = loanParam.applyAmt;
					return;
				}
			} else if (loanParam.lt_fstpct == '' && loanParam.lt_fstpcp != '') {
				if (Number(loanParam.fstPct) > Number(loanParam.lt_fstpcp)) {
					mui.alert('首付比例需要小于' + loanParam.lt_fstpcp * 100 + '%', '提示', '确定', null, 'div');
					downPayRatioInput.value = '';
					downPaymoneyInput.value = '';
					loanMoneyInput.value = '';
					loanParam.fstPct = '';
					loanParam.applyAmt = '';
					loanParam.fstPay = '';
					loanParam.wholeFstPay = loanParam.fstPay;
					loanParam.sumFstPct = loanParam.fstPct;
					loanParam.sumApplyAmt = loanParam.applyAmt;
					return;
				}
			}

			list.amountParam.fstPct = loanParam.fstPct;
			var url = mBank.getApiURL() + 'CfLoanAmt.do';
			mBank.apiSend('post', url, list.amountParam, function(data) {
				loanParam.fstPay = data.fstPay;
				loanParam.applyAmt = data.applyAmt;
				loanParam.fstPct = data.fstPct;

				if (!amt(loanParam.minAmt, loanParam.maxAmt, loanParam.applyAmt)) {
					return;
				}

				loanParam.wholeFstPay = loanParam.fstPay;
				loanParam.sumFstPct = loanParam.fstPct;
				loanParam.sumApplyAmt = loanParam.applyAmt;
				downPaymoneyInput.value = mCheck.addSeparator(parseFloat(data.fstPay).toFixed(2).toString());
				loanMoneyInput.value = mCheck.addSeparator(parseFloat(data.applyAmt).toFixed(2).toString());
				downPayRatioInput.value = parseFloat(data.fstPct * 100).toFixed(2);
				var url2 = mBank.getApiURL() + 'getLoanInf.do';
				var param2 = {
					typSeq: loanParam.typSeq,
					loanAmt: loanParam.applyAmt
				};
				mBank.apiSend('post', url2, param2, function(data) {
					if (data.priceIntRat.indexOf('.') == 0) {
						data.priceIntRat = '0' + data.priceIntRat;
					}
					loanParam.loanIntRate = data.priceIntRat;
					rateInput.value = (data.priceIntRat * 100).toFixed(4);
				}, function(err) {
					mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
				}, true, false);
			}, function(err) {
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			}, true, false);
		});

		function cfLoanAmt(pars) {
			var url = mBank.getApiURL() + 'CfLoanAmt.do';
			mBank.apiSend('post', url, pars, function(data) {
				loanParam.fstPay = data.fstPay;
				loanParam.applyAmt = data.applyAmt;
				loanParam.fstPct = data.fstPct;
				if (loanParam.lt_fstpct != '' && loanParam.lt_fstpcp != '') {
					if (Number(loanParam.lt_fstpct) > Number(loanParam.fstPct) || Number(loanParam.fstPct) > Number(loanParam.lt_fstpcp)) {
						mui.alert('首付比例需要在' + loanParam.lt_fstpct * 100 + '%~' + loanParam.lt_fstpcp * 100 + '%之间', '提示', '确定', null, 'div');
						downPayRatioInput.value = '';
						downPaymoneyInput.value = '';
						loanMoneyInput.value = '';

						loanParam.fstPct = '';
						loanParam.applyAmt = '';
						loanParam.fstPay = '';
						loanParam.wholeFstPay = loanParam.fstPay;
						loanParam.sumFstPct = loanParam.fstPct;
						loanParam.sumApplyAmt = loanParam.applyAmt;
						return;
					}
				} else if (loanParam.lt_fstpct != '' && loanParam.lt_fstpcp == '') {
					if (Number(loanParam.lt_fstpct) > Number(loanParam.fstPct)) {
						mui.alert('首付比例需要大于' + loanParam.lt_fstpct * 100 + '%', '提示', '确定', null, 'div');
						downPayRatioInput.value = '';
						downPaymoneyInput.value = '';
						loanMoneyInput.value = '';
						loanParam.fstPct = '';
						loanParam.applyAmt = '';
						loanParam.fstPay = '';
						loanParam.wholeFstPay = loanParam.fstPay;
						loanParam.sumFstPct = loanParam.fstPct;
						loanParam.sumApplyAmt = loanParam.applyAmt;
						return;
					}
				} else if (loanParam.lt_fstpct == '' && loanParam.lt_fstpcp != '') {
					if (Number(loanParam.fstPct) > Number(loanParam.lt_fstpcp)) {
						mui.alert('首付比例需要小于' + loanParam.lt_fstpcp * 100 + '%', '提示', '确定', null, 'div');
						downPayRatioInput.value = '';
						downPaymoneyInput.value = '';
						loanMoneyInput.value = '';
						loanParam.fstPct = '';
						loanParam.applyAmt = '';
						loanParam.fstPay = '';
						loanParam.wholeFstPay = loanParam.fstPay;
						loanParam.sumFstPct = loanParam.fstPct;
						loanParam.sumApplyAmt = loanParam.applyAmt;
						return;
					}
				}
				if (!amt(loanParam.minAmt, loanParam.maxAmt, loanParam.applyAmt)) {
					return;
				}

				loanParam.wholeFstPay = loanParam.fstPay;
				loanParam.sumFstPct = loanParam.fstPct;
				loanParam.sumApplyAmt = loanParam.applyAmt;
				downPaymoneyInput.value = mCheck.addSeparator(parseFloat(data.fstPay).toFixed(2).toString());
				loanMoneyInput.value = mCheck.addSeparator(parseFloat(data.applyAmt).toFixed(2).toString());
				downPayRatioInput.value = parseFloat(data.fstPct * 100).toFixed(2);
				if (loanParam.typSeq == '') {
					return;
				}
				var url2 = mBank.getApiURL() + 'getLoanInf.do';
				var param2 = {
					typSeq: loanParam.typSeq,
					loanAmt: loanParam.applyAmt
				};
				mBank.apiSend('post', url2, param2, function(data) {
					if (data.priceIntRat.indexOf('.') == 0) {
						data.priceIntRat = '0' + data.priceIntRat;
					}
					loanParam.loanIntRate = data.priceIntRat;
					rateInput.value = (data.priceIntRat * 100).toFixed(4);
				}, null, true, false);
			}, function(err) {
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			}, true, false);
		}
		//贷款金额输入事件
		loanMoneyInput.addEventListener('keyup', function() {
			mCheck.checknum(this);
		});
		loanMoneyInput.addEventListener('blur', function() {
			if (loanMoneyInput.value == '') {
				return;
			}
			if (mCheck.removeSeparator(this.value) == loanParam.applyAmt) {
				return;
			}
			loanParam.applyAmt = mCheck.removeSeparator(this.value);
			//loanParam.applyAmt = loanMoneyInput.value;
			//console.log(loanParam.applyAmt);
			if (!amt(loanParam.minAmt, loanParam.maxAmt, loanParam.applyAmt)) {
				return;
			}
			list.amountParam.applyAmt = loanParam.applyAmt;
			var url = mBank.getApiURL() + 'CfLoanAmt.do';
			mBank.apiSend('post', url, list.amountParam, function(data) {
				loanParam.fstPay = data.fstPay;
				loanParam.applyAmt = data.applyAmt;
				loanParam.fstPct = data.fstPct;

				loanParam.wholeFstPay = loanParam.fstPay;
				loanParam.sumFstPct = loanParam.fstPct;
				loanParam.sumApplyAmt = loanParam.applyAmt;
				downPaymoneyInput.value = mCheck.addSeparator(parseFloat(data.fstPay).toFixed(2).toString());
				loanMoneyInput.value = mCheck.addSeparator(parseFloat(data.applyAmt).toFixed(2).toString());
				downPayRatioInput.value = parseFloat(data.fstPct * 100).toFixed(2);

				if (loanParam.lt_fstpct != '' && loanParam.lt_fstpcp != '') {
					if (Number(loanParam.lt_fstpct) > Number(loanParam.fstPct) || Number(loanParam.fstPct) > Number(loanParam.lt_fstpcp)) {
						mui.alert('首付比例需要在' + loanParam.lt_fstpct * 100 + '%~' + loanParam.lt_fstpcp * 100 + '%之间', '提示', '确定', null, 'div');
						downPayRatioInput.value = '';
						downPaymoneyInput.value = '';
						loanMoneyInput.value = '';

						loanParam.fstPct = '';
						loanParam.applyAmt = '';
						loanParam.fstPay = '';
						loanParam.wholeFstPay = loanParam.fstPay;
						loanParam.sumFstPct = loanParam.fstPct;
						loanParam.sumApplyAmt = loanParam.applyAmt;
						return;
					}
				} else if (loanParam.lt_fstpct != '' && loanParam.lt_fstpcp == '') {
					if (Number(loanParam.lt_fstpct) > Number(loanParam.fstPct)) {
						mui.alert('首付比例需要大于' + loanParam.lt_fstpct * 100 + '%', '提示', '确定', null, 'div');
						downPayRatioInput.value = '';
						downPaymoneyInput.value = '';
						loanMoneyInput.value = '';

						loanParam.fstPct = '';
						loanParam.applyAmt = '';
						loanParam.fstPay = '';
						loanParam.wholeFstPay = loanParam.fstPay;
						loanParam.sumFstPct = loanParam.fstPct;
						loanParam.sumApplyAmt = loanParam.applyAmt;
						return;
					}
				} else if (loanParam.lt_fstpct == '' && loanParam.lt_fstpcp != '') {
					if (Number(loanParam.fstPct) > Number(loanParam.lt_fstpcp)) {
						mui.alert('首付比例需要小于' + loanParam.lt_fstpcp * 100 + '%', '提示', '确定', null, 'div');
						downPayRatioInput.value = '';
						downPaymoneyInput.value = '';
						loanMoneyInput.value = '';

						loanParam.fstPct = '';
						loanParam.applyAmt = '';
						loanParam.fstPay = '';
						loanParam.wholeFstPay = loanParam.fstPay;
						loanParam.sumFstPct = loanParam.fstPct;
						loanParam.sumApplyAmt = loanParam.applyAmt;
						return;
					}
				}

				downPaymoneyInput.value = mCheck.addSeparator(parseFloat(data.fstPay).toFixed(2).toString());
				var url2 = mBank.getApiURL() + 'getLoanInf.do';
				var param2 = {
					typSeq: loanParam.typSeq,
					loanAmt: loanParam.applyAmt
				};
				mBank.apiSend('post', url2, param2, function(data) {
					if (data.priceIntRat.indexOf('.') == 0) {
						data.priceIntRat = '0' + data.priceIntRat;
					}
					loanParam.loanIntRate = data.priceIntRat;
					rateInput.value = (data.priceIntRat * 100).toFixed(4);
				}, function(err) {
					mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
				}, true, false);
			}, function(err) {
				mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
			}, true, false);
		});

		//还款日类型选择
		$("#reypayDay").on('click', function() {
			document.activeElement.blur();
			var getArrVal = mData.changePro(REPAY, this.id);
			weui.picker(getArrVal.proVal, {
				onChange: function(item) {},
				onConfirm: function(item) {
					if (item[0].label == reypayDay.value) {
						return;
					}
					reypayDay.value = item[0].label;
					loanParam.dueDayOpt = item[0].value;
					if (loanParam.dueDayOpt == 'OT') {
						$('#reypayDayDetail').parent().show();
					} else {
						$('#reypayDayDetail').parent().hide();
						reypayDayDetail.value = '';
						loanParam.dueDay = '';
					}
				},
				title: '请选择还款日类型',
				defaultValue: [getArrVal.indSeq],
				id: this.id
			});
		});
		//还款日
		$("#reypayDayDetail").on('click', function() {
			document.activeElement.blur();
			var getArrVal = mData.changePro(GD_DAY, this.id);
			weui.picker(getArrVal.proVal, {
				onChange: function(item) {},
				onConfirm: function(item) {
					reypayDayDetail.value = item[0].label;
					loanParam.dueDay = item[0].value;
				},
				title: '请选择还款日',
				defaultValue: [getArrVal.indSeq],
				id: this.id
			});
		});

		//是否免抵押选择
		mui('#isOrNotUnmor').on('tap', 'span', function() {
			document.activeElement.blur();
			if (sessionRiskFlag == 'S') {
				return;
			};
			if ($(this).hasClass('selected')) {
				return;
			}
			$(this).addClass('selected').siblings('span').removeClass('selected');
			loanParam.mortgage = $(this).hasClass('yes') ? 'Y' : 'N';
			if (sessionRiskFlag == 'A') {
				if (loanParam.mortgage == 'N') {
					loanParam.noGuarantee = 'N';
					$('#isOrNotAssure').parent().hide();
					$('#isOrNotAssure').find('.no').addClass('selected').siblings('span').removeClass('selected');
				} else if (loanParam.mortgage == 'Y') {
					loanParam.noGuarantee = 'N';
					$('#isOrNotAssure').parent().hide();
					$('#isOrNotAssure').find('.no').addClass('selected').siblings('span').removeClass('selected');
					loanParam.cstLevel = '';
					$('#cusQuaInput').parent().hide();
					$('#cusQuaInput').val('');
				}
			} else if (sessionRiskFlag == 'B') {
				if (loanParam.mortgage == 'N') {
					loanParam.noGuarantee = 'N';
					$('#isOrNotAssure').parent().hide();
					$('#isOrNotAssure').find('.no').addClass('selected').siblings('span').removeClass('selected');
					loanParam.cstLevel = '';
					$('#cusQuaInput').val('');
					$('#cusQuaInput').parent().hide();
				} else if (loanParam.mortgage == 'Y') {
					loanParam.noGuarantee = 'N';
					$('#isOrNotAssure').parent().hide();
					$('#isOrNotAssure').find('.no').addClass('selected').siblings('span').removeClass('selected');
					loanParam.cstLevel = '';
					$('#cusQuaInput').val('');
					$('#cusQuaInput').parent().show();
				}
			} else if (sessionRiskFlag == 'C' || sessionRiskFlag == 'D') {
				if (loanParam.mortgage == 'N') {
					$('#isOrNotUnmor').parent().hide();
					loanParam.noGuarantee = 'N';
					$('#isOrNotAssure').find('.no').addClass('selected').siblings('span').removeClass('selected');
					$('#isOrNotAssure').parent().hide();
				}
			}
			if (isCanEditAss == 'N') {
				//预审为新车,预审通过,低风险
				if (loanParam.mortgage == 'N') {
					loanParam.noGuarantee == 'N';
					$('#isOrNotAssure').find('.no').addClass('selected').siblings('span').removeClass('selected');
					$('#isOrNotAssure').parent().hide();
					if (list.sessionRiskflag == 'C' || list.sessionRiskflag == 'D') {
						$('#isOrNotUnmor').parent().hide();
					}
					if (list.sessionRiskflag == 'A' || list.sessionRiskflag == 'B') {}
				}
				//				if(loanParam.mortgage == 'Y'){
				//					loanParam.noGuarantee == 'Y';
				//					$('#isOrNotAssure').find('.yes').addClass('selected').siblings('span').removeClass('selected');
				//					$('#isOrNotAssure').parent().show();
				//				}
			}
		});

		//是否免担保选择
		//		mui('#isOrNotAssure').on('tap', 'span', function(){
		//			document.activeElement.blur();
		//			if($(this).hasClass('selected')){ return;}
		//			if(isCanEditAss == 'N'){
		//				return;
		//			}
		//			$(this).addClass('selected').siblings('span').removeClass('selected');	
		//			loanParam.noGuarantee = $(this).hasClass('yes') ? 'Y' : 'N';
		//			if(loanParam.noGuarantee == 'Y'){
		//				if(loanParam.mortgage == 'Y'){
		//					$('#cusQuaInput').parent().hide();
		//					loanParam.cstLevel = '';
		//					$('#cusQuaInput').val('');
		//				}
		//			}else if(loanParam.noGuarantee == 'N'){
		//				$('#cusQuaInput').parent().show();
		//				loanParam.cstLevel = '';
		//				$('#cusQuaInput').val('');
		//			}
		//		})

		//免抵押客户类型选择
		$("#cusQuaInput").on('click', function() {
			document.activeElement.blur();
			var getArrVal = mData.changePro(CUSTOMER_QUA, this.id);
			weui.picker(getArrVal.proVal, {
				onChange: function(item) {},
				onConfirm: function(item) {
					cusQuaInput.value = item[0].label;
					loanParam.cstLevel = item[0].value;
				},
				title: '请选择免抵押客户类型',
				defaultValue: [getArrVal.indSeq],
				id: this.id
			});
		});

		marketInput.addEventListener('tap', function() {
			document.activeElement.blur();
			$('.footer').show();
			if (loanParam.typSeq == '') {
				mCheck.alert('请选择贷款产品');
				return;
			}
			if (loanParam.applyAmt == '' || loanParam.applyAmt == '0' || loanParam.applyAmt == '0.00') {
				mCheck.alert('贷款金额不能为空');
				return;
			}
			list.isMarket = true;
			var param = {
				'loanSeq': loanParam.typSeq,
				'applyTnr': loanParam.applyTnr,
				'applyTnrTyp': loanParam.applyTnrTyp,
				'applyAmt': loanParam.applyAmt,
				'applCde': applCde
			};
			mBank.openWindowByLoad('../CommonPage/insuranceSupermaket.html', 'insuranceSupermaket', 'slide-in-right', {
				param: param
			});
		});
		window.addEventListener('sumFeeAmt', function(event) {
			marketInput.value = mCheck.addSeparator(event.detail.sumFeeAmt);
			loanParam.sumFeeAmt = event.detail.sumFeeAmt;
			$('.footer').show();
		});
		//贷款增融服务
		mui('#inceList').on('tap', 'input', function() {
			document.activeElement.blur();
			var param = {
				'typSeq': loanParam.typSeq,
				'addFincObj': $(this).attr('data-num')
			};
			mBank.openWindowByLoad('../CommonPage/buyRate.html', 'buyRate', 'slide-in-right', param);
		});
		window.addEventListener('updateAmt', function(event) {
			if (loanParam['addFincServerList.addFincServerClass'].includes(event.detail.addFincServerClass)) {
				var i = loanParam['addFincServerList.addFincServerClass'].indexOf(event.detail.addFincServerClass);
				loanParam['addFincServerList.typSeq'][i] = event.detail.typSeq;
				loanParam['addFincServerList.typFreq'][i] = event.detail.typFreq;
				loanParam['addFincServerList.addFincServerClass'][i] = event.detail.addFincServerClass;
				loanParam['addFincServerList.addFincKind'][i] = event.detail.addFincKind;
				loanParam['addFincServerList.addFincKindNam'][i] = event.detail.addFincKindNam;
				loanParam['addFincServerList.addFincPrice'][i] = event.detail.addFincPrice;
				loanParam['addFincServerList.applyTnrTyp'][i] = event.detail.fincApplyTnr;
				loanParam['addFincServerList.fincApplyTnr'][i] = event.detail.applyTnrTyp;
				loanParam['addFincServerList.fincLoanIntRate'][i] = event.detail.fincLoanIntRate;
				loanParam['addFincServerList.minAmt'][i] = event.detail.minAmt;
				loanParam['addFincServerList.maxAmt'][i] = event.detail.maxAmt;
			} else {
				loanParam['addFincServerList.typSeq'].push(event.detail.typSeq);
				loanParam['addFincServerList.typFreq'].push(event.detail.typFreq);
				loanParam['addFincServerList.addFincServerClass'].push(event.detail.addFincServerClass);
				loanParam['addFincServerList.addFincKind'].push(event.detail.addFincKind);
				loanParam['addFincServerList.addFincKindNam'].push(event.detail.addFincKindNam);
				loanParam['addFincServerList.addFincPrice'].push(event.detail.addFincPrice);
				loanParam['addFincServerList.applyTnrTyp'].push(event.detail.fincApplyTnr);
				loanParam['addFincServerList.fincApplyTnr'].push(event.detail.applyTnrTyp);
				loanParam['addFincServerList.fincLoanIntRate'].push(event.detail.fincLoanIntRate);
				loanParam['addFincServerList.minAmt'].push(event.detail.minAmt);
				loanParam['addFincServerList.maxAmt'].push(event.detail.maxAmt);
			}
			loanParam['addFincServerList.addFincPrice'].map(function(item) {
				return list.zrPrice += parseFloat(item);
			});
			loanParam.totalPrice = (parseFloat(loanParam.carPrice) + parseFloat(list.zrPrice)).toString();
			carPrice3Input.value = mCheck.addSeparator(loanParam.totalPrice);
			if (loanParam.applyAmt && loanParam.applyAmt != '') {
				loanParam.sumApplyAmt = (parseFloat(loanParam.applyAmt) + parseFloat(list.zrPrice)).toString();
				loanMoney3Input.value = mCheck.addSeparator(loanParam.sumApplyAmt);
				mData.cfLoanAmt({
					calMode: '02',
					totalPrice: loanParam.totalPrice,
					applyAmt: loanParam.sumApplyAmt
				}).then(function(data) {
					loanParam.wholeFstPay = data.fstPay;
					loanParam.sumFstPct = data.fstPct;
					downPaymoney3Input.value = parseFloat(loanParam.sumFstPct * 100).toFixed(2);
				});
			}
		});
		var cfapplLoanInfo = function cfapplLoanInfo(param) {
			var url = mBank.getApiURL() + 'cfDealerapplInfoSave.do';
			return new Promise(function(resolve, reject) {
				mBank.apiSend('post', url, param, function(data) {
					resolve(data);
				}, function(err) {
					reject(err);
				});
			});
		};

		function back1() {
			var backFlag = localStorage.getItem('backFlag');
			localStorage.removeItem('firstFlag');
			if (backFlag == '01') {
				mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
			} else if (backFlag == '02') {
				mBank.openWindowByLoad('../PreHearing/LendingList/lendingList.html', 'lendingList', 'slide-in-left');
			} else if (backFlag == '03') {
				mBank.openWindowByLoad('../comPage/loanList.html', 'loanList', 'slide-in-left');
			} else if (backFlag == '04') {
				mBank.openWindowByLoad('../ConSigning/conSignList.html', 'conSignList', 'slide-in-left');
			} else if (backFlag == '05') {
				mBank.openWindowByLoad('../PreHearing/NewPre/loanPreList.html', 'loanPreList', 'slide-in-left');
			} else if (backFlag == '06') {
				mBank.openWindowByLoad('../PreHearing/PreList/preList.html', 'preList', 'slide-in-left');
			} else {
				mBank.openWindowByLoad('../HomePage/homePage.html', 'homePage', 'slide-in-left');
			}
		}
		mui.back = function () {
			document.activeElement.blur();
			if ($('#waitingBox').is(':visible')) {
				//如果loading框显示，不能点击手机返回按键
				return;
			}
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back1();
				}
			});
		};

		back.addEventListener('tap', function () {
			document.activeElement.blur();
			$('#waitingBox').show();
			mData.unLock(applCde, nodeSign, outSts, '01').then(function(dat){
				if(dat=='Y'){
					$('#waitingBox').hide();
					back1();
				}
			});
		});

		/*保存按钮*/
		save.addEventListener('tap', function() {
			document.activeElement.blur();
			if (carTypeInput.value == '') {
				mCheck.alert('车辆类型不能为空');
				return false;
			}
			if (!list.canClick) {
				//如果为false, 不能点击
				return;
			}
			list.canClick = false;
			$('#waitingBox').show();
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					list.canClick = true;
					$('#waitingBox').hide();
					return;
				}else{
					loanParam.temp = '0';
					if (loanParam.mortgage == 'N') {
						loanParam.noGuarantee = 'N';
					}
					cfapplLoanInfo(loanParam).then(function (data) {
						list.canClick = true;
						$('#waitingBox').hide();
						mCheck.alert('保存成功');
					}, function (err) {
						list.canClick = true;
						mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
					});
				}
			});
			
		});
		/*下一步按钮*/
		next.addEventListener('tap', function() {
			document.activeElement.blur();
			if (!list.canClick) {
				//如果为false, 不能点击
				return;
			}
			list.canClick = false;
			$('#waitingBox').show();
			mData.queryLock(applCde, nodeSign, outSts,'','','').then(function(dat){
				if(dat=='N'){
					list.canClick = true;
					$('#waitingBox').hide();
					return;
				}else{
					if (!isEmptyFun()) {
						//如果校验没通过,可以再次点击下一步 
						list.canClick = true;
						$('#waitingBox').hide();
						return;
					}
					loanParam.temp = '';
					if (loanParam.mortgage == 'N') {
						loanParam.noGuarantee = 'N';
					}
					cfapplLoanInfo(loanParam).then(function (data) {
						mData.updateLock(applCde, nodeSign, outSts,'').then(function(dat){
							if(dat=='N'){
								list.canClick = true;
								$('#waitingBox').hide();
								return;
							}else{
								list.canClick = true; //如果保存成功,可以再次点击
								localStorage.setItem('carType', loanParam.carType);
								$('#waitingBox').hide();
								mBank.openWindowByLoad('./appInfo.html', 'appInfo', 'slide-in-right');
							}
						});
					}, function (err) {
						list.canClick = true;
						mCheck.callPortFailed(err.ec, err.em, '#waitingBox');
					});
				}
			});
		});
	});
});
