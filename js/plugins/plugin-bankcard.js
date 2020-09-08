
/**
 * isDebuge 活体检测的种类数量
 * isAllCard 是不是扫描全卡
 * 返回是 
 */
document.addEventListener("plusready", function() {
                          
                          
                          
//	var _BARCODE = 'pluginOpenBankCard', B = window.plus.bridge;
//	var pluginOpenBankCard = {
//			openBankCardScan : function(isDebuge,isAllCard, successCallback, errorCallback) {
//			var success = typeof successCallback !== 'function' ? null
//					: function(args) {
//						successCallback(args);
//					}, fail = typeof errorCallback !== 'function' ? null
//					: function(code) {
//						errorCallback(code);
//					};
//			callbackID = B.callbackId(success, fail);
//			return B.exec(_BARCODE, "openBankCardScan", [ callbackID, isDebuge,isAllCard ]);
//		}
//	};
//	window.plus.pluginOpenBankCard = pluginOpenBankCard;
//                                                                            
  var _BARCODE = 'pluginCardScan', B = window.plus.bridge;
  var pluginCardScan = {
  openBankCardScan : function(isDebuge,isAllCard, successCallback, errorCallback) {
  var success = typeof successCallback !== 'function' ? null
  : function(args) {
  successCallback(args);
  }, fail = typeof errorCallback !== 'function' ? null
  : function(code) {
  errorCallback(code);
  };
  callbackID = B.callbackId(success, fail);
  return B.exec(_BARCODE, "openBankCardScan", [ callbackID, isDebuge,isAllCard ]);
  }
  };
  window.plus.pluginCardScan = pluginCardScan;                                                             
}, true);
