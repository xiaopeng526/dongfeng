
/**
 * count 活体检测的种类数量  
 */
document.addEventListener("plusready", function() {
	var _BARCODE = 'pluginOpenLiveness', B = window.plus.bridge;
	var pluginOpenLiveness = {
		openLiveness : function(count, successCallback, errorCallback) {
			var success = typeof successCallback !== 'function' ? null
					: function(args) {
						successCallback(args);
					}, fail = typeof errorCallback !== 'function' ? null
					: function(code) {
						errorCallback(code);
					};
			callbackID = B.callbackId(success, fail);
			return B.exec(_BARCODE, "openLiveness", [ callbackID, count ]);
		}
	};
	window.plus.pluginOpenLiveness = pluginOpenLiveness;
}, true);