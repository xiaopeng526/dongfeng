'use strict';

var checkFun = function checkFun() {
	var domArr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	var nameClass = arguments[1];
	var a1 = arguments[2];
	var a2 = arguments[3];

	domArr = $(nameClass).siblings(a1, a2);
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = domArr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var dom = _step.value;

			var domName = $(dom).parent().find(nameClass).text();
			if (dom.value == '' && dom.targetName == 'input') {
				mui.toast('不能为空');
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
};