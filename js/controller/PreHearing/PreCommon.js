'use strict';

/*预审外部状态*/
var PRE_OUTSTS = [{ value: '01', text: '预审录入' }, { value: '02', text: '征信授权中' }, { value: '03', text: '征信授权失败' }, { value: '04', text: '待提交' }, { value: '05', text: '预审准入' }, { value: '06', text: '预审拒绝' }];

/*预审节点标识*/
var PRE_NODEFLAG = [{ value: '01', text: '预审录入' }, { value: '02', text: '签署中' }, { value: '03', text: '已提交' }];

/*预审操作按钮*/
var PRE_OPERATION = [{ value: '01', text: '编辑' }, { value: '02', text: '删除' }, { value: '03', text: '签署中' }, { value: '04', text: '待提交' }, { value: '05', text: '预审补录' }];

/*页面显示按钮*/
var preFun = function preFun(nodeflag, outsts) {
	if (nodeflag === '01' && outsts === '01') {
		console.log('编辑', '删除');
	}

	if (nodeflag === '02') {
		if (outsts === '02' || outsts === '03') {
			console.log('签署中', '删除');
		}
		if (outsts === '04') {
			console.log('待提交');
		}
	}

	if (nodeflag === '03') {
		if (outsts === '05') {
			console.log('预审补录');
		}
		if (outsts === '06') {
			console.log('');
		}
	}
};