/**
 * 上传文件api
 */
var requireModules =[
	'base-url'
];
window.top.registeModule(window,requireModules);

layui.define(requireModules, function(exports) {
	
	var $ = layui.jquery;
	var baseApi = layui['base-url'];
	var url = {
		namespace:'/',
		'uploadFile': {
			url: 'true.json'
		}
	
	}
	
	var result = $.extend({},baseApi, url);

	exports('file-api', result);

});