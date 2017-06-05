/**
 * 登录api
 */
var requireModules =[
	'base-url'
];
window.top.registeModule(window,requireModules);

layui.define(requireModules, function(exports) {
	
	var $ = layui.jquery;
	var baseApi = layui['base-url'];
	var url = {
		namespace:'../../login/',
		'validLogin': {
			url: 'getUserInfo'
		},
		'login': {
			url: 'doLogin'
		},
		'logout': {
			url: 'logout'
		},
		'getValidImg': {
			url:'checkcode'
		}
	}
	
	var result = $.extend({},baseApi, url);

	exports('login-api', result);

});