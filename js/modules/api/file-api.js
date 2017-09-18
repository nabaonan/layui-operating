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
		baseUrl:'https://www.easy-mock.com/mock/5959c7b39adc231f356facdc/file/',

		'uploadFile': {
			url: 'upload',
			type:'post'
		}

	}

	var result = $.extend({},baseApi, url);

	exports('file-api', result);

});
