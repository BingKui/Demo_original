;
(function($) {
	$.fn.UISeedPass = function(options) {
		return new pass(options, this);
	}
	var pass = function(options, element) {
		var _th = this;
		_th.el = $(element);
		_th.index = 0;
		_th.init(options);
	}
	pass.prototype = {
		init: function(options) {
			var _th = this;
			_th.opts = $.extend({}, {
				title: "支付", //标题
				info: "话费充值", //信息
				num: "100", //金额
				tip: "资金池密码", //提示
				checkFun: function() {}, //校验函数
				callback: function() {} //回调函数
			}, options);
			var _pass = _th.createDiv("ui-pass").appendTo($('body'));
			//弹窗
			var _dialog = _th.createDiv("ui-pass-window").appendTo(_pass);
			var _title = _th.createDiv("ui-window-title").html(_th.opts.title).appendTo(_dialog);
			//增加关闭按钮
			$("<span></span>").addClass("ui-window-close").appendTo(_title).on("touchend",function(){
				_th.close();
			});
			_th.createDialogContent().appendTo(_dialog);
			_th.createInputList().appendTo(_dialog);
			//键盘
			_th.createDiv("ui-pass-keyboard").html(_th.createKeyBoard()).appendTo(_pass);
			_th.addClick();
			_th.addActive();
			_th.passDialog = _pass;
			_th.el.on("touchend", function() {
				_th.passDialog.show();
			});
		},
		createKeyBoard: function() {
			return '<ul class="ui-keyboard" style="font-size:20px;">' +
				'<li class="symbol"><span class="off">1</span></li>' +
				'<li class="symbol"><span class="off">2</span></li>' +
				'<li class="symbol btn_number_"><span class="off">3</span></li>' +
				'</ul>' +
				'<ul class="ui-keyboard" style="font-size:20px;">' +
				'<li class="tab"><span class="off">4</span></li>' +
				'<li class="symbol"><span class="off">5</span></li>' +
				'<li class="symbol btn_number_"><span class="off">6</span></li>' +
				'</ul>' +
				'<ul class="ui-keyboard" style="font-size:20px;">' +
				'<li class="tab"><span class="off">7</span></li>' +
				'<li class="symbol"><span class="off">8</span></li>' +
				'<li class="symbol btn_number_"><span class="off">9</span></li>' +
				'</ul>' +
				'<ul class="ui-keyboard" style="font-size:20px;">' +
				'<li class="cancle btn_number_"><span class="off">取消</span></li>' +
				'<li class="symbol"><span class="off">0</span></li>' +
				'<li class="delete lastitem"><span class="off">删除</span></li>' +
				'</ul>';
		},
		createDialogContent: function() {
			var _th = this;
			var content = '<div class="money">' +
				'<p class="info">' + _th.opts.info + '</p>' +
				'<p class="num">￥' + _th.opts.num + '</p>' +
				'</div>' +
				'<div class="bottom-item">' +
				'<div class="tip">' + _th.opts.tip + '</div>' +
				'<div class="error-msg"></div>' +
				'</div>';
			return _th.createDiv("ui-window-content").html(content);
		},
		createInputList: function() {
			var content = '<form id="password">' +
				'<input class="pass-item" disabled="disabled" type="password" maxlength="1" readonly="readonly" />' +
				'<input class="pass-item" disabled="disabled" type="password" maxlength="1" readonly="readonly" />' +
				'<input class="pass-item" disabled="disabled" type="password" maxlength="1" readonly="readonly" />' +
				'<input class="pass-item" disabled="disabled" type="password" maxlength="1" readonly="readonly" />' +
				'<input class="pass-item" disabled="disabled" type="password" maxlength="1" readonly="readonly" />' +
				'<input class="pass-item" disabled="disabled" type="password" maxlength="1" readonly="readonly" />' +
				'</form>';
			return this.createDiv("ui-window-passlist").html(content);
		},
		addClick: function() {
			var _th = this;
			var passwords = $('.pass-item');
			var character;
			$('.ui-keyboard li').click(function() {
				if ($(this).hasClass('delete')) {
					//隐藏错误信息
					_th.closeError();
					//判断第六位是否有值
					if ($(passwords[5]).val() != '') {
						_th.index = 6;
						$(passwords[--_th.index % 6]).val('');
					} else {
						$(passwords[--_th.index % 6]).val('');
						if ($(passwords[0]).val() == '') {
							_th.index = 0;
						}
					}
					return false;
				}
				if ($(this).hasClass('cancle')) {
					//关闭支付框
					_th.close();
					return false;
				}
				if ($(this).hasClass('symbol') || $(this).hasClass('tab')) {
					//判断是否是输入的最后一位
					//最后一位为空，倒数第二位不空，即输入最后一位数字
					if ($(passwords[5]).val() == '' && $(passwords[4]).val() != '') {
						character = $(this).text();
						$(passwords[_th.index++ % 6]).val(character);
						var temp_rePass_word = '';
						for (var i = 0; i < passwords.length; i++) {
							temp_rePass_word += $(passwords[i]).val();
						}
						//保存输入的密码
						_th.pass_val = temp_rePass_word;
						//执行校验函数
						_th.opts.checkFun();
						//console.log(_th.pass_val);
					} else {
						if ($(passwords[5]).val() == '') {
							character = $(this).text();
							$(passwords[_th.index++ % 6]).val(character);
						} else {
							//校验
							_th.opts.checkFun();
						}
					}
				}
				return false;
			});
		},
		addActive: function() {
			$('.ui-keyboard li').on("touchstart", function() {
				$(this).css({
					"background": "#ccc",
					"color": "#fff"
				});
			}).on("touchend", function() {
				$(this).css({
					"background": "#fff",
					"color": "#333"
				});
			});
			$('.ui-window-close').on("touchstart", function() {
				$(this).css({
					"background": "#ccc",
					"color": "#fff"
				});
			}).on("touchend", function() {
				$(this).css({
					"background": "#fff",
					"color": "#333"
				});
			});
		},
		open: function() {
			this.passDialog.show();
		},
		close: function() {
			//设置默认值第一位
			this.index = 0;
			//关闭错误信息
			this.closeError();
			//清除输入值
			var passwords = $('.pass-item');
			for (var i = 0; i < 6; i++) {
				$(passwords[i]).val('');
			}
			this.passDialog.hide();
			//执行回调函数
			this.opts.callback();
		},
		openError: function(str) {
			$(".error-msg").html(str).show();
		},
		closeError: function() {
			if ($(".error-msg").is(":visible")) {
				$(".error-msg").hide();
			}
		},
		getInputValue: function() {
			return this.pass_val;
		},
		createDiv: function(className) {
			return $("<div></div>").addClass(className);
		}
	}
})(jQuery)