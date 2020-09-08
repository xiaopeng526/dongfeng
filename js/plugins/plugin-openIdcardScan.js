/**
 * side 正面反面 0是正面 1是反面 
 *                0时  payload.picOne 为正面整个图  payload.picTwo 是头像的截图
 *                1时  payload.picOne 为反面整个图
 * isVertical 是否竖屏   true 是竖屏  false 是横屏
 *                  
 */
document.addEventListener("plusready", function() {
	var _BARCODE = 'pluginOpenIdcardScan', B = window.plus.bridge;
	var pluginOpenIdcardScan = {
			openIdcardScan : function(side, isVertical, successCallback, errorCallback) {
			var success = typeof successCallback !== 'function' ? null
					: function(args) {
						successCallback(args);
					}, fail = typeof errorCallback !== 'function' ? null
					: function(code) {
						errorCallback(code);
					};
			callbackID = B.callbackId(success, fail);
			return B.exec(_BARCODE, "openIdcardScan", [ callbackID,side,isVertical]);
		}
	};
	window.plus.pluginOpenIdcardScan = pluginOpenIdcardScan;
}, true);