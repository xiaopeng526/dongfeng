'use strict';

var CON_OUTSTS = [{ value: '01', text: '待签署' }, { value: '02', text: '签署中' }, { value: '03', text: '签署失败' }, { value: '04', text: '签署成功' }];

var CON_NODEFLAG = [{ value: '01', text: '待签署' }, { value: '02', text: '签署中' }];

var CON_OPERATION = [{ value: '01', text: '合同签署' }, { value: '02', text: '签署中' }, { value: '03', text: '发送邮件' }, { value: '04', text: '上传放款资料' }];

/*页面显示按钮*/
var conFun = function conFun(nodeflag, outsts) {
	if (nodeflag === '01' && outsts === '01') {
		console.log('合同签署');
	}

	if (nodeflag === '02') {
		if (outsts === '02' || outsts === '03') {
			console.log('签署中', '发送邮件');
		}
		if (outsts === '04') {
			console.log('上传放款资料');
		}
	}
};