'use strict';

/*
    * @author gaojuhong
    * @email 1174825758@qq.com
    * @qq 1174825758
    * @lastdate 2016-10-28
    * 插件功能 ：实现焦点图功能
    * 描述，代码结构要求
*/
;(function ($) {
    var pluginName = 'mytips',
        defaults = {
        tiptext: '',
        tipclass: 'mytipsWrap flex',
        tiptimer: 2000
    };
    $.fn[pluginName] = function (options) {
        if (window.tips) return;
        var settings = $.extend({}, defaults, options);
        $('.' + settings.tipclass).remove();
        var tips = $('<div><div class="myTipsCont"></div></div>').appendTo('body');
        tips.attr('class', settings.tipclass);
        tips.children('.myTipsCont').html(settings.tiptext);
        window.tips = tips;
        tips.css({
            // width : '100%',
            // height: '100%',
            // position: 'fixed',
            // zIndex : 1011,
            // left : '0',
            // top: 0,
            // background : 'rgba(0,0,0,.4)'
            left: '50%',
            bottom: '1.08rem',
            marginLeft: '-3rem'
        });
        setTimeout(function () {
            tips.remove();
            window.tips = null;
        }, settings.tiptimer);
    };
})(jQuery);