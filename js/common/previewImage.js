! function(e, t) {
	"object" == typeof module && "object" == typeof module.exports ? module.exports = e.document ? t(e) : function(e) {
		if (!e.document) throw new Error("previewImage requires a window with a document");
		return t(e)
	} : t(e)
}("undefined" != typeof window ? window : this, function(e) {
	var t = {};
	t.isArray = function(e) {
		return "[object Array]" == Object.prototype.toString.call(e)
	}, t.all = function(e, t) {
		var i, s = [];
		return (i = t ? t.querySelectorAll(e) : document.querySelectorAll(e)) && i.length > 0 && (s = Array.prototype.slice
			.call(i)), s
	}, t.delegate = function(e, i, s, a) {
		e && e.addEventListener(i, function(i) {
			var n = t.all(s, e);
			if (n)
				for (var h = 0; h < n.length; h++)
					for (var o = i.target; o;) {
						if (o == n[h]) {
							a.call(o, i);
							break
						}
						if ((o = o.parentNode) == e) break
					}
		}, !1)
	};
	var i = function() {
		this.winw = e.innerWidth || document.body.clientWidth, this.winh = e.innerHeight || document.body.clientHeight,
			this.originWinw = this.winw, this.originWinh = this.winh, this.marginRight = 15, this.imageChageMoveX = this.marginRight +
			this.winw, this.imageChageNeedX = Math.floor(.5 * this.winw), this.cssprefix = ["", "webkit", "Moz", "ms", "o"],
			this.version = "1.0.3", this.imgLoadCache = new Object, this.scale = 1, this.maxScale = 4, this.maxOverScale = 6,
			this.openTime = .3, this.slipTime = .5, this.maxOverWidthPercent = .5, this.$box = !1, this.isPreview = !1;
		var t = document.createElement("style");
		t.innerText =
			"#__previewImage-container{-ms-touch-action:none;touch-action:none;-webkit-touch-action:none;line-height:100vh;background-color:#000;width:100vw;height:100vh;position:fixed;overflow:hidden;top:0;left:0;z-index: 2147483647;transition:transform .3s;-ms-transition:transform .3s;-moz-transition:transform .3s;-webkit-transition:transform .3s;-o-transition:transform .3s;transform:translate3d(100%,0,0);-webkit-transform:translate3d(100%,0,0);-ms-transform:translate3d(100%,0,0);-o-transform:translate3d(100%,0,0);-moz-transform:translate3d(100%,0,0)}#__previewImage-container .previewImage-text{position: fixed;top: 0;left: 0;right: 0;z-index: 10;display: flex;align-items: center;color:#FFF;width: 100%;height: 1.28rem;padding-left: .24rem;padding-right: .24rem;padding-top: .4rem;background:rgba(0,0,0,.6);background-size: 100%; }#__previewImage-container .previewImage-text .iconSymbol{position: absolute;font-size: 20px;color: #FFF;width: .88rem;line-height: .88rem;height: .88rem;z-index: 20;}#__previewImage-container .previewImage-text .iconSymbol.iconshanchu{right:0px;font-size:30px; color:#FFF;}#__previewImage-container .previewImage-text .previewImage-text-index{display:inline-block;position:absolute;left:45%;}#__previewImage-container .previewImage-box{width:999999rem;height:100vh}#__previewImage-container .previewImage-box .previewImage-item{width:100vw;height:100vh;margin-right:15px;float:left;text-align:center;background:url(http://static.luyanghui.com/svg/oval.svg) no-repeat center/auto}#__previewImage-container .previewImage-box .previewImage-item.previewImage-nobackground{background:none}#__previewImage-container .previewImage-box .previewImage-item .previewImage-image{vertical-align:middle;width:100%}#__previewImage-container .maskBox{position: fixed;top: 0;left: 0;bottom: 0;right: 0;z-index: 100;background-color: rgba(0,0,0,0.6);}#__previewImage-container .maskBox .promptBox{position: fixed;width: 75%;height:2.8rem;left: 13%;top: 40%;z-index: 500;background-color: #fff;border: 1px solid #ddd;border-radius: 12px;}#__previewImage-container .maskBox .progressInfo{width: 100%;height: 1.2rem;line-height: 1.2rem;font-size: .32rem;font-weight: 400;padding-left:0.5rem;padding-top:0.4rem;}#__previewImage-container .maskBox .btn-box{display: flex;text-align:center;justify-content: space-between;border-top: 1px solid rgba(222,222,222,0.9);font-size: .32rem;height: 1rem;line-height: 1rem;position:absolute;bottom:0rem;left:0rem;width:100%;}#__previewImage-container .maskBox .btn-box div{flex:1;color:#64A5D2;}#__previewImage-container .maskBox .btn-box div:first-child{flex:1;border-right:1px solid rgba(222,222,222,0.9);color:#666666;}",
			t.type = "text/css", this.$container = document.createElement("div"), this.$container.id =
			"__previewImage-container", this.$container.style.width = this.winw + "px", this.$container.style.height = this.winh +
			"px", document.body.appendChild(this.$container), document.head.appendChild(t), this.bind()
	};
	var iUrls, kImgId, sCurrent, JsCallback, fla = 0;
	var obj = {};
	return i.prototype.start = function(e, Scallback) {
		var i = e.urls,
			k = e.imgId,
			s = e.current;
		iUrls = i;
		kImgId = k;
		sCurrent = s;
		JsCallback = Scallback;
		if (i == '') {
			return;
		}
		if (this.$container.innerHTML = "", !i || !t.isArray(i) || 0 == i.length) throw new Error(
			"urls must be a Array and the minimum length more than zero");
		if (s) {
			var a = i.indexOf(s);
			a < 0 && (a = -1, console.warn("current isnot on urls,it will be the first value of urls!")), this.index = a
		} else this.index = 0, console.warn("current is empty,it will be the first value of urls!");
		this.urls = i, this.maxLen = i.length - 1, this.cIndex = this.maxLen + 1, this.bIndex = this.maxLen + 2, this.imgStatusCache =
			new Object, this.render()
	}, i.prototype.render = function() {
		var t = this;
		if (!1 === this.$box) {
			var i = document.createElement("div");
			i.className += "previewImage-box", this.$box = i
		} else this.$box.innerHTML = "";
		var s = document.createElement("div");
		this.$text = s, this.$text.className += "previewImage-text", this.$text.innerHTML =
			"<span class='iconSymbol icon__back' id='back'></span><span class='previewImage-text-index'>" + (this.index + 1) +
			"/" + (this.maxLen + 1) + "</span><span class='iconSymbol iconshanchu deleteImg'></span>", this.container = this.imgStatusCache[
				this.cIndex] = {
				elem: this.$container,
				x: this.winw,
				y: 0,
				m: 0,
				my: 0,
				scale: 1,
				scalem: 1
			}, this.box = this.imgStatusCache[this.bIndex] = {
				elem: this.$box,
				x: 0,
				y: 0,
				m: 0,
				my: 0,
				scale: 1,
				scalem: 1
			}, this.urls.forEach(function(i, s) {
				var a, n = document.createElement("div"),
					h = e.md5 ? md5(i + s) : i + s,
					o = t.imgLoadCache[h];
				o && o.isload ? (a = o.elem, n.className += " previewImage-nobackground") : ((a = new Image).className +=
					"previewImage-image", t.imgLoadCache[h] = {
						isload: !1,
						elem: a
					}, s == t.index && (a.src = i, a.onload = function() {
						n.className += " previewImage-nobackground", t.imgLoadCache[h].isload = !0
					})), t.imgStatusCache[s] = {
					hash: h,
					x: 0,
					m: 0,
					y: 0,
					my: 0,
					scale: t.scale,
					scalem: 1
				}, n.className += " previewImage-item", n.appendChild(a), t.$box.appendChild(n)
			}), this.$container.appendChild(this.$box), this.$container.appendChild(this.$text);
		var a = -this.imageChageMoveX * this.index;
		this.box.x = a, this.container.x = 0, this.$container.style.display = "block", setTimeout(function() {
			t.translateScale(t.bIndex, 0), t.translateScale(t.cIndex, t.openTime), t.isPreview = !0
		}, 50)
	}, i.prototype.bind = function() {
		var i = this.$container,
			s = this,
			a = function() {
				s.touchEndFun.call(s)
			},
			n = function() {
				this.winw = e.innerWidth || document.body.clientWidth, this.winh = e.innerHeight || document.body.clientHeight,
					this.originWinw = this.winw, this.originWinh = this.winh, this.$container.style.width = this.winw + "px", this.$container
					.style.height = this.winh + "px", this.imageChageMoveX = this.marginRight + this.winw;
				var t = -this.imageChageMoveX * this.index;
				try {
					this.box.x = t, this.translateScale(this.bIndex, 0)
				} catch (e) {}
			}.bind(this);
		e.addEventListener("resize", n, !1), t.delegate(i, 'click', '#back', function() {
			s.closePreview.call(s)
		}), t.delegate(i, 'click', '.deleteImg', function(e) {
			previewImage.creatView()
		}), t.delegate(i, 'click', '#cancelBtn', function(e) {
			var maskBox = document.getElementById('maskBox');
			maskBox.parentNode.removeChild(maskBox);
		}), t.delegate(i, 'click', '#conBtn', function() {
			previewImage.deletePreview(iUrls, JsCallback)
		}), t.delegate(i, "touchstart", ".previewImage-item", function() {
			s.touchStartFun.call(s)
		}), t.delegate(i, "touchmove", ".previewImage-item", function() {
			s.touchMoveFun.call(s)
		}), t.delegate(i, "touchend", ".previewImage-item", a), t.delegate(i, "touchcancel", ".previewImage-item", a)
	}, i.prototype.closePreview = function() {
		var e = this;
		this.imgStatusCache[this.cIndex].x = this.winw, this.translateScale(this.cIndex, this.openTime), this.imgStatusRewrite(),
			this.translateScale(this.index, this.slipTime), setTimeout(function() {
				e.$container.style.display = "none";
			}, 1e3 * this.slipTime), e.isPreview = !1
	}, i.prototype.creatView = function() {
		var s = document.createElement("div");
		this.$text = s, this.$text.className += "maskBox", this.$text.id += "maskBox", this.$text.innerHTML =
			"<div class='promptBox'><div class='progressInfo'>确认删除？</div><div class='btn-box'><div id='cancelBtn'>取消</div><div id='conBtn'>确认</div></div></div>",
			this.$container.appendChild(this.$text);
	}, i.prototype.deletePreview = function(iUrls, JsCallback) {
		var i = iUrls,
			k = kImgId,
			c = i[this.index];
		if (c) {
			var a = i.indexOf(c);
			if (a > -1) {
				i.splice(a, 1);
				k.splice(a, 1);
				obj = {
					urls: i,
					imgId: k,
					current: i[0]
				};
				if (JsCallback) {
					JsCallback(obj)
				}
				if (i.length == 0) {
					previewImage.closePreview();
				} else {
					previewImage.start(obj, JsCallback);
				}
			}
		}
	}, i.prototype.touchStartFun = function(e) {
		this.ts = this.getTouches(), this.allowMove = !0, this.statusX = 0, this.statusY = 0
	}, i.prototype.touchMoveFun = function(e) {
		this.tm = this.getTouches();
		var t = this.tm,
			i = this.ts;
		this.moveAction(i, t)
	}, i.prototype.touchEndFun = function(e) {
		this.$container;
		this.te = this.getTouches(), this.endAction(this.ts, this.te)
	}, i.prototype.moveAction = function(e, t) {
		if (this.allowMove) {
			var i = this.getIndexImage(),
				s = .3 * this.winw / i.scale,
				a = t.x0 - e.x0,
				n = t.y0 - e.y0;
			Math.abs(n) > 0 && event.preventDefault();
			var h = i.x + a,
				o = i.y + n,
				r = this.getAllow(this.index),
				l = this.allowX = r.x;
			this.allowY = r.y0;
			if (a <= 0 && (this.allowX = -l), n <= 0 && (this.allowY = r.y1), 1 == t.length)
				if (i.scale > 1) {
					if (o >= r.y0) {
						this.statusY = 1;
						g = o - r.y0;
						i.my = r.y0 - i.y + this.getSlowlyNum(g, s)
					} else if (o <= r.y1) {
						this.statusY = 1;
						g = o - r.y1;
						i.my = r.y1 - i.y + this.getSlowlyNum(g, s)
					} else this.statusY = 2, i.my = n;
					if (a < 0 && i.x <= -l) this.statusX = 1, this.box.m = a, this.index == this.maxLen && (this.box.m = this.getSlowlyNum(
						a)), this.translateScale(this.bIndex, 0), this.translateScale(this.index, 0);
					else if (a > 0 && i.x >= l) this.statusX = 2, this.box.m = a, 0 == this.index && (this.box.m = this.getSlowlyNum(
						a)), this.translateScale(this.bIndex, 0), this.translateScale(this.index, 0);
					else {
						if (0 == a) return;
						if (this.statusX = 3, i.m = a, h >= l) {
							this.statusX = 4;
							c = h - l;
							i.m = l - i.x + this.getSlowlyNum(c, s)
						}
						if (h <= -l) {
							this.statusX = 4;
							var c = h + l;
							i.m = -l - i.x + this.getSlowlyNum(c, s)
						}
						this.translateScale(this.index, 0)
					}
				} else if (Math.abs(n) > 5 && 5 != this.statusX) {
				var m = this.getJqElem(this.index),
					d = m.height - this.winh;
				if (n > 0 && o > 0) this.statusX = 7, this.allowY = 0, i.my = -i.y + this.getSlowlyNum(o, s);
				else if (n < 0 && o < -d)
					if (this.statusX = 7, m.height > this.winh) {
						var g = o + d;
						this.allowY = -d, i.my = -d - i.y + this.getSlowlyNum(g, s)
					} else this.allowY = 0, i.my = -i.y + this.getSlowlyNum(o, s);
				else this.statusX = 6, i.my = n;
				this.translateScale(this.index, 0)
			} else {
				if (6 == this.statusX) return;
				this.statusX = 5, 0 == this.index && a > 0 || this.index == this.maxLen && a < 0 ? this.box.m = this.getSlowlyNum(
					a) : this.box.m = a, this.translateScale(this.bIndex, 0)
			} else {
				var x = this.getScale(e, t),
					u = x * i.scale;
				if (u >= this.maxScale) {
					var w = u - this.maxScale;
					x = (u = this.maxScale + this.getSlowlyNum(w, this.maxOverScale)) / i.scale
				}
				i.scalem = x, this.translateScale(this.index, 0)
			}
		}
	}, i.prototype.endAction = function(e, t) {
		var i = this.getIndexImage(),
			s = t.x0 - e.x0,
			a = (t.y0, e.y0, t.time - e.time),
			n = 0;
		if (this.allowMove = !1, 1 == e.length) {
			switch (Math.abs(s) > 10 && event.preventDefault(), this.statusY) {
				case 1:
					i.y = this.allowY, i.my = 0, n = this.slipTime;
					break;
				case 2:
					i.y = i.y + i.my, i.my = 0
			}
			switch (this.statusX) {
				case 1:
					this.index != this.maxLen && (s <= -this.imageChageNeedX || a < 200 && s < -30) ? this.changeIndex(1) : (this.changeIndex(
						0), 0 != n && this.translateScale(this.index, n));
					break;
				case 2:
					0 != this.index && (s >= this.imageChageNeedX || a < 200 && s > 30) ? this.changeIndex(-1) : (this.changeIndex(0),
						0 != n && this.translateScale(this.index, n));
					break;
				case 3:
					i.x = i.x + i.m, i.m = 0, this.translateScale(this.index, n);
					break;
				case 4:
					i.x = this.allowX, i.m = 0, n = this.slipTime, this.translateScale(this.index, n);
					break;
				case 5:
					s >= this.imageChageNeedX || a < 200 && s > 30 ? this.changeIndex(-1) : s <= -this.imageChageNeedX || a < 200 &&
						s < -30 ? this.changeIndex(1) : this.changeIndex(0);
					break;
				case 6:
					i.y = i.y + i.my, i.my = 0;
					break;
				case 7:
					i.y = this.allowY, i.my = 0, this.translateScale(this.index, this.slipTime)
			}
		} else {
			event.preventDefault();
			var h = i.scale * i.scalem,
				o = this.getJqElem(this.index);
			i.scale = h;
			var r = this.getAllow(this.index);
			i.x > r.x ? (n = this.slipTime, i.x = r.x) : i.x < -r.x && (n = this.slipTime, i.x = -r.x), i.y > r.y0 ? (n = this
				.slipTime, i.y = r.y0) : i.y < r.y1 && (n = this.slipTime, i.y = r.y1), o.height * i.scale <= this.winh && (i.y =
				0), o.width * i.scale <= this.winw && (i.x = 0), i.scalem = 1, h > this.maxScale ? (i.scale = this.maxScale, n =
				this.slipTime) : h < 1 && (this.imgStatusRewrite(), n = this.slipTime), 0 != n && (this.changeIndex(0), this.translateScale(
				this.index, n))
		}
	}, i.prototype.getAllow = function(e) {
		var t, i, s = this.getJqElem(e),
			a = this.getIndexImage(e),
			n = Math.floor((s.width * a.scale - this.winw) / (2 * a.scale));
		return s.height * a.scale <= this.winh ? (t = 0, i = 0) : s.height <= this.winh ? i = -(t = Math.floor((s.height *
			a.scale - this.winh) / (2 * a.scale))) : (t = Math.floor(s.height * (a.scale - 1) / (2 * a.scale)), i = -Math.floor(
			(s.height * (a.scale + 1) - 2 * this.winh) / (2 * a.scale))), {
			x: n,
			y0: t,
			y1: i
		}
	}, i.prototype.getSlowlyNum = function(e, t) {
		t = t || this.winw * this.maxOverWidthPercent;
		return e < 0 ? -(1 - (e = -e) / (t + e)) * e : (1 - e / (t + e)) * e
	}, i.prototype.getScale = function(e, t) {
		var i = Math.sqrt(Math.pow(e.x1 - e.x0, 2) + Math.pow(e.y1 - e.y0, 2));
		return Math.sqrt(Math.pow(t.x1 - t.x0, 2) + Math.pow(t.y1 - t.y0, 2)) / i
	}, i.prototype.imgStatusRewrite = function(e) {
		var e = void 0 === e ? this.index : e,
			t = this.imgStatusCache[e];
		t.x = 0, t.y = 0, t.m = 0, t.my = 0, t.scale = 1, t.scalem = 1, e != this.index && this.translateScale(e, this.slipTime)
	}, i.prototype.changeIndex = function(e) {
		this.getIndexImage();
		var t = this.index;
		if (0 == this.index && -1 == e) this.index = this.index;
		else if (this.index == this.maxLen && 1 == e) this.index = this.index;
		else {
			this.index += e, this.$text.innerHTML =
				"<span class='iconSymbol icon__back' id='back'></span><span class='previewImage-text-index'>" + (this.index + 1) +
				"/" + (this.maxLen + 1) + "</span><span class='iconSymbol iconshanchu deleteImg'></span>";
			var i = this.imgStatusCache[this.index].hash,
				s = this.imgLoadCache[i];
			s.isload ? s.elem.parentNode.className += " previewImage-nobackground" : (s.elem.src = this.urls[this.index], s.elem
				.onload = function() {
					s.elem.parentNode.className += " previewImage-nobackground", s.isload = !0
				})
		}
		this.box.x = -this.imageChageMoveX * this.index, this.box.m = 0, t != this.index && this.imgStatusRewrite(t), this.translateScale(
			this.bIndex, this.slipTime)
	}, i.prototype.getIndexImage = function(e) {
		e = void 0 == e ? this.index : e;
		return this.imgStatusCache[this.index]
	}, i.prototype.translateScale = function(e, t) {
		var i = this.imgStatusCache[e];
		$elem = this.getJqElem(e);
		var s = i.scale * i.scalem,
			a = "scale3d(" + s + "," + s + ",1)  translate3d(" + (i.x + i.m) + "px," + (i.y + i.my) + "px,0px)",
			n = "transform " + t + "s ease-out";
		this.addCssPrefix($elem, "transition", n), this.addCssPrefix($elem, "transform", a)
	}, i.prototype.getJqElem = function(e) {
		var t;
		if ((e = void 0 == e ? this.index : e) <= this.maxLen) {
			var i = this.imgStatusCache[e].hash;
			t = this.imgLoadCache[i].elem
		} else {
			t = this.imgStatusCache[e].elem
		}
		return t
	}, i.prototype.addCssPrefix = function(e, t, i) {
		for (var s in this.cssprefix) {
			if ("" === this.cssprefix[s]) t = t.toLowerCase();
			else {
				var a = t.length;
				t = t.substr(0, 1).toUpperCase() + t.substr(1, a).toLowerCase()
			}
			if (void 0 !== document.body.style[t]) return void(e.style[t] = i)
		}
	}, i.prototype.getTouches = function(e) {
		var t = event.touches.length > 0 ? event.touches : event.changedTouches,
			i = {
				touches: t,
				length: t.length
			};
		return i.x0 = t[0].pageX, i.y0 = t[0].pageY, i.time = (new Date).getTime(), t.length >= 2 && (i.x1 = t[0].pageX, i.y1 =
			t[1].pageY), i
	}, e.previewImage = new i, "function" == typeof define && define.amd && define([], function() {
		return previewImage
	}), previewImage
});
