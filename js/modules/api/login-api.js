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
		namespace:'login/',
		'validLogin': {
			url: '../true.json'
		},
		'login': {
			url: 'login.json'
		},
		'logout': {
			url: '../true.json'
		},
		'getValidImg': {
			url:'../../image/v.png'
		}
	}
	
	var result = $.extend({},baseApi, url);

	exports('login-api', result);

});