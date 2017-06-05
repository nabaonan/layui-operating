/**
 * 验证登录，所有页面需要引用该组件，直接访问会进行登录验证，如果后台session中没有登录信息，前台需要控制跳转
 * @author nabaonan
 */
var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'request',
	'login',
	'login-api'
];

registeModule(window, requireModules);

layui.define(requireModules, function(exports) {
	var ajax = layui.request,
	loginApi = layui['login-api'],
	login = layui.login;

	function validLogin() {
		//只有sessionstorage中有信息并且window。top。name是index才能通过
		var pageName = window.top.location.pathname.split("/").pop();
		var userInfo = login.getLoginInfo();
		
		ajax.request(loginApi.getUrl('validLogin'), userInfo, function(result) {
			if(pageName !== 'index.html') {
				login.backToLogin();
			}
		}, true, function() {
			login.backToLogin();
		});
	}

	validLogin();

	exports("valid-login", validLogin);
});