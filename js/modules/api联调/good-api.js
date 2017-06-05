layui.define('base-url', function(exports) {

	var baseApi = layui['base-url'];
	var url = {
		namespace:'good/',
		"getAll": {
			url: "good-list.json"
		}
	}
	
	var result = $.extend({},baseUrl, url);

	exports('good-api', result);

});