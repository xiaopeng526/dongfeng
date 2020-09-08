/*jshint multistr:true, curly: false */
/*global jQuery:false, define: false */
/**
 * jRange - Awesome range control
 *
 * Written by
 * ----------
 * Nitin Hayaran (nitinhayaran@gmail.com)
 *
 * Licensed under the MIT (MIT-LICENSE.txt).
 *
 * @author Nitin Hayaran
 * @version 0.1-RELEASE
 *
 * Dependencies
 * ------------
 * jQuery (http://jquery.com)
 *
 **/
;
(function($, window, document, undefined) {
	'use strict';

	var jRange = function() {
		return this.init.apply(this, arguments);
	};
	var num=0,touNum=0,x3=0;
	jRange.prototype = {
		defaults: {
			onstatechange: function() {},
			isRange: false,
			showLabels: true,
			showScale: true,
			step: 1,
			format: '%s',
			theme: 'theme-green',
			width: 300,
			state:0,
			disable: false,
			stu:1,
			carPrice: 10000,
			param: {}
		},
		template: '<div class="slider-container">\
			<div class="back-bar">\
                <div class="selected-bar"></div>\
                <div class="pointer low"></div><div class="pointer-label">123456</div>\
                <div class="pointer high"></div><div class="pointer-label">456789</div>\
                <div class="clickable-dummy"></div>\
            </div>\
            <div class="scale"></div>\
		</div>',
		init: function(node, options) {
			this.options       = $.extend({}, this.defaults, options);
			this.inputNode     = $(node);
			this.options.value = this.inputNode.val() || (this.options.isRange ? this.options.from + ',' + this.options.from : this.options.from);
			this.domNode       = $(this.template);
			this.domNode.addClass(this.options.theme);
			this.inputNode.after(this.domNode);
			this.domNode.on('change', this.onChange);
			this.domNode.on('click',this.ontouchend);
			this.pointers      = $('.pointer', this.domNode);
			this.lowPointer    = this.pointers.first();
			this.highPointer   = this.pointers.last();
			this.labels        = $('.pointer-label', this.domNode);
			this.lowLabel      = this.labels.first();
			this.highLabel     = this.labels.last();
			this.scale         = $('.scale', this.domNode);
			this.bar           = $('.selected-bar', this.domNode);
			this.clickableBar  = this.domNode.find('.clickable-dummy');
			this.interval      = this.options.to - this.options.from;
			this.render();
		},
		render: function() {
			// Check if inputNode is visible, and have some width, so that we can set slider width accordingly.
			if (this.inputNode.width() === 0 && !this.options.width) {
				console.log('jRange : no width found, returning');
				return;
			} else {
//				this.domNode.css("width","100%");
//				this.domNode.width("100%");
				this.inputNode.hide();
			}
			if (this.isSingle()) {
				this.lowPointer.hide();
				this.lowLabel.hide();
			}
			if (!this.options.showLabels) {
				this.labels.hide();
			}
			this.attachEvents();
			if (this.options.showScale) {
				this.renderScale();
			}
			this.setValue(this.options.value);
		},
		isSingle: function() {
			if (typeof(this.options.value) === 'number') {
				return true;
			}
			return (this.options.value.indexOf(',') !== -1 || this.options.isRange) ?
				false : true;
		},
		attachEvents: function() {
			this.clickableBar.click($.proxy(this.barClicked, this));
			this.pointers.on('mousedown touchstart', $.proxy(this.onDragStart, this));
			this.pointers.bind('dragstart', function(event) {
				event.preventDefault();
			});
		},
		onDragStart: function(e) {
			if ( this.options.disable || (e.type === 'mousedown' && e.which !== 1)) {
				return;
			}
			e.stopPropagation();
			e.preventDefault();
			var pointer = $(e.target);
			
			this.pointers.removeClass('last-active');
			pointer.addClass('focused last-active');
			this[(pointer.hasClass('low') ? 'low' : 'high') + 'Label'].addClass('focused');
			$(document).on('mousemove.slider touchmove.slider', $.proxy(this.onDrag, this, pointer));
			$(document).on('mouseup.slider touchend.slider touchcancel.slider', $.proxy(this.onDragEnd, this));
		},
		onDrag: function(pointer, e) {
			e.stopPropagation();
			e.preventDefault();
			if (e.originalEvent.touches && e.originalEvent.touches.length) {
				e = e.originalEvent.touches[0];
			} else if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
				e = e.originalEvent.changedTouches[0];
			}

			var position = e.clientX - this.domNode.offset().left;
			this.domNode.trigger('change', [this, pointer, position]);
		},
		onDragEnd: function(e) {
			this.pointers.removeClass('focused');
			this.labels.removeClass('focused');
			$(document).off('.slider');
			this.domNode.trigger('click', [this]);
		},
		barClicked: function(e) {
			if(this.options.disable) return;
			var x = e.pageX - this.clickableBar.offset().left;
			x3=this.clickableBar.offset().left;
			var x2=e.pageX;
			var span_num=-1;
			if($('>span',this.scale).size()>2){
				$('>span',this.scale).each(function(){
					if($(this).offset().left>x2){
						if($(this).offset().left-x2<span_num){
							x=$(this).offset().left-x3-2;
						}
						return false;
					}else{
						if(span_num<0){
							span_num=x2-$(this).offset().left;
							x=$(this).offset().left-x3-2;
						}else{
							if(x2-$(this).offset().left<span_num){
								span_num=x2-$(this).offset().left;
								x=$(this).offset().left-x3-2;
							} 
						}
					}
				})
			}
			if (this.isSingle())
				this.setPosition(this.pointers.last(), x, true, true);
			else {
				var pointer = Math.abs(parseInt(this.pointers.first().css('left'), 10) - x + this.pointers.first().width() / 2) < Math.abs(parseInt(this.pointers.last().css('left'), 10) - x + this.pointers.first().width() / 2) ?
					this.pointers.first() : this.pointers.last();
				this.setPosition(pointer, x, true, true);
			}
		},
		onChange: function(e, self, pointer, position) {
			var min, max;
			if (self.isSingle()) {
				min = 0;
				max = self.domNode.width();
			} else {
				min = pointer.hasClass('high') ? self.lowPointer.position().left + self.lowPointer.width() / 2 +"%": 0;
				max = pointer.hasClass('low') ? self.highPointer.position().left + self.highPointer.width() / 2 : self.domNode.width();
			}
			var value = Math.min(Math.max(position, min), max);
			touNum=value;
			self.setPosition(pointer, value, true);
		},
		ontouchend: function(e, self, pointer, position){
			e.preventDefault();
			if(touNum==0){
			}else{
				var span_num=-1,x=0;
				x3=$(this).find('.clickable-dummy').offset().left;
				touNum=touNum+x3;
				if($('>span',self.scale).size()>2){
					$('>span',self.scale).each(function(){
						if($(this).offset().left>touNum){
							if($(this).offset().left-touNum<span_num){
								x=$(this).offset().left-x3-2;
							}
							return false;
						}else{
							if(span_num<0){
								span_num=touNum-$(this).offset().left;
								x=$(this).offset().left-x3-2;
							}else{
								if(touNum-$(this).offset().left<span_num){
									span_num=touNum-$(this).offset().left;
									x=$(this).offset().left-x3-2;
								} 
							}
						}
					})
					touNum=0;
					if (self.isSingle())
						self.setPosition(self.pointers.last(), x, true, true);
					else {
						var pointer = Math.abs(parseInt(self.pointers.first().css('left'), 10) - x + self.pointers.first().width() / 2) < Math.abs(parseInt(this.pointers.last().css('left'), 10) - x + this.pointers.first().width() / 2) ?
							self.pointers.first() : self.pointers.last();
						self.setPosition(pointer, x, true, true);
					}
				}
			}
		},
		setPosition: function(pointer, position, isPx, animate) {
			var leftPos,
				lowPos = this.lowPointer.position().left,
				highPos = this.highPointer.position().left,
				circleWidth = this.highPointer.width() / 2;
			if (!isPx) {
				position = this.prcToPx(position);
			}
			if (pointer[0] === this.highPointer[0]) {
				highPos = Math.round(position - circleWidth);
			} else {
				lowPos = Math.round(position - circleWidth);
			}
			pointer[animate ? 'animate' : 'css']({
				'left': Math.round(position - circleWidth)
			});
			if (this.isSingle()) {
				leftPos = 0;
			} else {
				leftPos = lowPos + circleWidth;
			}
			this.bar[animate ? 'animate' : 'css']({
				'width': Math.round(highPos + circleWidth - leftPos),
				'left': leftPos
			});
			this.showPointerValue(pointer, position, animate);
			this.isReadonly();
		},
		// will be called from outside
		setValue: function(value) {
			var values = value.toString().split(',');
			this.options.value = value;
			var prc = this.valuesToPrc(values.length === 2 ? values : [0, values[0]]);
			if (this.isSingle()) {
				this.setPosition(this.highPointer, prc[1]);
			} else {
				this.setPosition(this.lowPointer, prc[0]);
				this.setPosition(this.highPointer, prc[1]);
			}
		},
		renderScale: function() {
			var s = this.options.scale || [this.options.from, this.options.to];
			var prc = Math.round((100 / (s.length - 1)) * 10) / 10;
			var str = '';
			for (var i = 0; i < s.length; i++) {
				if(s.length==2&&i==s.length-1){
					str += '<span style="right: ' + i *(0)+ '%">' + (s[i] != '|' ? '<i>' + s[i] + '</i>' : '') + '</span>';
				}else{
					str += '<span style="left: ' + i * prc + '%">' + (s[i] != '|' ? '<ins>' + s[i] + '</ins>' : '') + '</span>';
				}
			}
			this.scale.html(str);
			$('ins', this.scale).each(function() {
				if($(this).outerWidth()<=0){
					$(this).css({
						marginLeft: -7.5
					});
				}else{
					$(this).css({
						marginLeft: -$(this).outerWidth() / 2
					});
				}
			});
		},
		getBarWidth: function() {
			var values = this.options.value.split(',');
			if (values.length > 1) {
				return parseInt(values[1], 10) - parseInt(values[0], 10);
			} else {
				return parseInt(values[0], 10);
			}
		},
		showPointerValue: function(pointer, position, animate) {
			var label = $('.pointer-label', this.domNode)[pointer.hasClass('low') ? 'first' : 'last']();
			var text;
			var textArray = ["%","元","个月"];
			var value = this.positionToValue(position);
			if ($.isFunction(this.options.format)) {
				var type = this.isSingle() ? undefined : (pointer.hasClass('low') ? 'low' : 'high');
				text = this.options.format(value, type);
			} else {
				text = this.options.format.replace('%s', value+""+textArray[this.options.state]);
			}
			var width = label.html(text).width(),
				left = position - width / 2;
			left = Math.min(Math.max(left, 0), this.options.width - width);
			label[animate ? 'animate' : 'css']({
				left: left
			});
			this.setInputValue(pointer, value);
		},
		valuesToPrc: function(values) {
			var lowPrc = ((values[0] - this.options.from) * 100 / this.interval),
				highPrc = ((values[1] - this.options.from) * 100 / this.interval);
			return [lowPrc, highPrc];
		},
		prcToPx: function(prc) {
			return (this.domNode.width() * prc) / 100;
		},
		positionToValue: function(pos) {
			var value = (pos / this.domNode.width()) * this.interval;
			value = value + this.options.from;
			if(this.options.stu ==0){
				if(value<=this.interval/2){ //this.in
					return Math.round(value / this.options.step) * this.options.step;
				}else if(value>this.interval/2){
					return Math.round(value / (this.options.step*2)) * (this.options.step*2);
				}
			}else{
				return Math.round(value / this.options.step) * this.options.step;
			}
		},
		addSeparator: function(money) {
			if(isNaN(money)) {
				return 0; 
			}
			if(/[^0-9\.]/.test(money)) {
	    		return 0;
	    	}
			money = money.toString();
			money = money.replace(/^(\d*)$/, '$1.');  //将数字替换为数字. 例如112替换成112.
	    	money = (money + '00').replace(/(\d*\.\d\d)\d*/, '$1');  //112.00 => 112.00
	    	money = money.replace('.', ',');
	    	var REG = /(\d)(\d{3},)/; 
	    	while(REG.test(money)){
	    		money = money.replace(REG, '$1,$2');
	    	}       
	    	money = money.replace(/,(\d\d)$/, '.$1');
	    	return money.replace(/^\./, '0.');	
		},
		setInputValue: function(pointer, v) {
			// if(!isChanged) return;
			if (this.isSingle()) {
				this.options.value = v.toString();
			} else {
				var values = this.options.value.split(',');
				if (pointer.hasClass('low')) {
					this.options.value = v + ',' + values[1];
				} else {
					this.options.value = values[0] + ',' + v;
				}
			}
			if (this.inputNode.val() !== this.options.value) {
				if(this.inputNode.attr("ID") == "downPayRatio" && carPriceInput.value != '') {
					this.options.carPrice = carPriceInput.carPrice;
					var money = parseFloat((this.options.value/100)*this.options.carPrice);	//首付金额
					downPayAmount.firstScale = this.options.value/100;
					downPayAmount.contFstPay = money;
					downPayAmount.innerHTML = this.addSeparator(downPayAmount.contFstPay);
					downPayAmount.applyAmt = this.options.carPrice - downPayAmount.contFstPay;
					loanAmount.innerHTML = this.addSeparator(downPayAmount.applyAmt);
				}
//				if(this.inputNode.attr("ID")=="monthlySupply"){
//					var money=parseFloat((this.options.value/100)*($("#CarMoney2").html().split("万")[0]));
//					$("#Car_upmoney").html(Math.round(money*100)/100+"万");
//					var money2=($("#CarMoney2").html().split("万")[0]-money)*10000;		//贷款金额
//					var num=$("#qixian").val();
//					var payment=money2*0.010825*(Math.pow((1+0.010825),num))/(Math.pow((1+0.010825),num)-1);
//					$("#Car_MonthPayment").html(payment.toFixed(2));
//				}
				num=this.options.value;
				/*if(this.inputNode.attr("ID")=="qixian"){
					var monthlySupply=1-($("#monthlySupply").val()/100)
					var money2=parseFloat(($("#CarMoney2").html().split("万")[0]*10000)*monthlySupply);
					if(this.options.value<18){
						num=12;
					}else if(this.options.value<24){
						num=18;
					}else if(this.options.value<36){
						num=24;
					}else if(this.options.value<48){
						num=36;
					}else if(this.options.value<60){
						num=48;
					}
					var Payment=money2*0.010825*(Math.pow((1+0.010825),num))/(Math.pow((1+0.010825),num)-1);
					$("#Car_MonthPayment").html(Payment.toFixed(2));
				}*/
				if(this.options.state==2){
					if(this.options.value<18){
						num=12;
					}else if(this.options.value<24){
						num=18;
					}else if(this.options.value<36){
						num=24;
					}else if(this.options.value<48){
						num=36;
					}else if(this.options.value<60){
						num=48;
					}
				}
				this.inputNode.val(num);
				this.options.onstatechange.call(this, this.options.value);
			}
		},
		getValue: function() {
			return this.options.value;
		},
		isReadonly: function(){
			this.domNode.toggleClass('slider-readonly', this.options.disable);
		},
		disable: function(){
			this.options.disable = true;
			this.isReadonly();
		},
		enable: function(){
			this.options.disable = false;
			this.isReadonly();
		},
		toggleDisable: function(){
			this.options.disable = !this.options.disable;
			this.isReadonly();
		}
	};

	/*$.jRange = function (node, options) {
		var jNode = $(node);
		if(!jNode.data('jrange')){
			jNode.data('jrange', new jRange(node, options));
		}
		return jNode.data('jrange');
	};

	$.fn.jRange = function (options) {
		return this.each(function(){
			$.jRange(this, options);
		});
	};*/

	var pluginName = 'jRange';
	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function(option) {
		var args = arguments,
			result;

		this.each(function() {
			var $this = $(this),
				data = $.data(this, 'plugin_' + pluginName),
				options = typeof option === 'object' && option;
			if (!data) {
				$this.data('plugin_' + pluginName, (data = new jRange(this, options)));
				$(window).resize(function() {
					data.setValue(data.getValue());
				}); // Update slider position when window is resized to keep it in sync with scale
			}
			// if first argument is a string, call silimarly named function
			// this gives flexibility to call functions of the plugin e.g.
			//   - $('.dial').plugin('destroy');
			//   - $('.dial').plugin('render', $('.new-child'));
			if (typeof option === 'string') {
				result = data[option].apply(data, Array.prototype.slice.call(args, 1));
			}
		});

		// To enable plugin returns values
		return result || this;
	};

})(jQuery, window, document);