/**
 * 这里写绑定的键盘事件
 */

layui.define('jquery', function(exports) {
	var $ = layui.jquery;

	//禁用右键
	$(document).bind("contextmenu", function(e) {
		return false;
	});

	function bindKey(keyActionObj) {
		$(document).on('keydown', function(e) {
			var resultFlag = true; //标识是否需要终止程序执行
			$.each(keyActionObj, function(key, action) {
				if(e.keyCode == key) {
					var result = action();
					if(result == false) {
						resultFlag = false;
						return false;
					}
				}
			});
			if(!resultFlag) {
				return false;
			}

		});
	}

	bindKey({
		116: function() {
			$frame = $('.layui-tab-title', window.top.document).next('.layui-tab-content').find('.layui-tab-item.layui-show>iframe');
			$frame.attr('src', $frame.attr('src'));
			return false; //屏蔽F5刷新键   
		}
	});

//	window.onbeforeunload = function() {
//		if(location.href.indexOf('login.html') == -1){//如果不是登录则提示
//			event.returnValue = '如果刷新则历史标签将关闭，请点击f5刷新';
//		}
//	}

	exports('key-bind', {
		//这里可以扩展绑定监听事件
		bindKey: bindKey
	});
});