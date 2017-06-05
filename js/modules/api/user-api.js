
/**
 * 用户管理api
 */
var requireModules =[
	'base-url'
];

window.top.registeModule(window,requireModules);
layui.define('base-url', function(exports) {
	var baseApi = layui['base-url'];//这里的名字必须和模块输出的名字一样，但是使用layui.use自动传参就可以自己随意起名
	
	var url = {
		namespace: 'user/',
		"getAll": {
			url: "user-list.json"
		}
	}
	//下面这种避免不同api相同key取值相同的问题
	var result = $.extend({}, baseApi, url);

	exports('user-api', result);
});