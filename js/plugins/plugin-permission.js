/**
 
/**
 * 
 * 
 */

document.addEventListener("plusready", function() {
	var _BARCODE = 'pluginPermission',B = window.plus.bridge;
	var pluginPermission = {
		requestPerssion: function(successCallback, errorCallback) {
			var success = typeof successCallback !== 'function' ? null :
				function(args) {
					successCallback(args);
				},
				fail = typeof errorCallback !== 'function' ? null :
				function(code) {
					errorCallback(code);
				};
			callbackID = B.callbackId(success, fail);
			return B.exec(_BARCODE, "requestPerssion", [callbackID]);
		}

	};
	window.plus.pluginPermission = pluginPermission;
}, true);