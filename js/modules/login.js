/**
 * 登录有关操作
 * @author nabaonan
 */

var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'request',
	'login-api',
	'redirect'
];

registeModule(window,requireModules);

layui.define(requireModules,function(exports) {
	var ajax = layui.request;
	var loginApi = layui['login-api'];
	var redirect =  layui.redirect;
	var $ = layui.jquery;
	var login = {

		getLoginInfo: function() {
			var user = sessionStorage.getItem("login");
			if('undefined'==user||undefined==user||''==user){
				redirect("login.html");
			}else{
				return JSON.parse(user);
			}
		},
		
		setLoginInfo: function(data) {
			
			sessionStorage.setItem('login',JSON.stringify(data));
		},
		
		login: function(userData,errorCall){
			ajax.request(loginApi.getUrl('login'), userData, function(result) {
				login.setLoginInfo(result.data);
				redirect('index.html');
			},true,errorCall);
		},

		removeLogin: function() {
			sessionStorage.removeItem("login");
		},

		backToLogin: function(result) {
			this.removeLogin();
			redirect('login.html');
		}
	};

	exports("login", login);
});