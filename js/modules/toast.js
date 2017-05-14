/**
 * 提示封装类
 * @author nabaonan
 * 
 */
layui.define('layer', function(exports) {

	var toast = {
		msg: function(msg, icon) {
			window.top.layer.msg(msg, {
				icon: icon, //0叹号,1对钩，2错误，3问号，4锁，5不高兴,6笑脸
				time: 1500 //（如果不配置，默认是3秒）
			});
		},
		warn: function(msg) {
			toast.msg(msg, 0);
		},
		success: function(msg) {
			toast.msg(msg, 1);
		},
		error: function(msg) {
			toast.msg(msg, 2);
		},
		question: function(msg) {
			toast.msg(msg, 3);
		},
		noSmile: function(msg) {
			toast.msg(msg, 4);
		},
		smile: function(msg) {
			toast.msg(msg, 5);
		}
	};

	exports('toast', toast);

});