
/**
 * 登录需要的参数
 * A、用户名
 * B、密码
 * C、验证码
 * D、手机型号
 * 
 * 
 * signIn(loginName, passwd, verifyCode, phoneModel, successCallback, errorCallback) ;
 * signIn(Argus, successCallback, errorCallback) ;
 * 
 * signInSync(loginName, passwd, verifyCode, phoneModel) ;
 * signInSync(Argus) ;
 * 
 */

document.addEventListener("plusready",  function()
                          {
                          var _BARCODE = 'pluginLogin',
                          B = window.plus.bridge;
                          var pluginLogin =
                          {
                          TouchIDLogin : function(successCallback, errorCallback)
                          {
                          var success = typeof successCallback !== 'function' ? null : function(args)
                          {
                          successCallback(args);
                          },
                          fail = typeof errorCallback !== 'function' ? null : function(code)
                          {
                          errorCallback(code);
                          };
                          callbackID = B.callbackId(success, fail);
                          return B.exec(_BARCODE, "TouchIDLogin", [callbackID]);
                          }
                          };
                          window.plus.pluginLogin = pluginLogin;
                          }, true );





