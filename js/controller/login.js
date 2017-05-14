var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'form',
	'layer',
	'login'
];

registeModule(window, requireModules);

layui.use(requireModules, function(
	form,
	layer,
	login
) {
	var $ = layui.jquery,
		f = form();
	// 验证
	f.verify({
		account: function(value) {
			if(value == "") {
				return "请输入用户名";
			}
		},

		password: function(value) {
			if(value == "") {
				return "请输入密码";
			}
		},

		code: function(value) {
			if(value == "") {
				return "请输入验证码";
			}
		}
	});
	// 提交监听
	f.on('submit(login)', function(data) {
		var user = data.field;
		login.login(user);
		return false;
	});

})