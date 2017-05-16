/**
 * 产品管理api
 * @author nabaonan
 */
var requireModules =[
	'base-url'
];

window.top.registeModule(window,requireModules);

layui.define('base-url', function(exports) {
	var $ = layui.jquery;
	var baseApi = layui['base-url'];
	var url = {
		namespace:'product/',
		'getProductLineList':{
			url:'productline-list.json'
		},
		'getUseStateSelect':{
			url:'use-state-select.json'
		},
		'getBusinessTypeSelect':{
			url:'business-type-select.json'
		},
		'getProductList':{
			url:'product-list.json'
		},
		'updateProductLineConfig':{
			url:'../true.json'
		},
		'updateProductline':{
			url:'../true.json'
		}
		
	}
	
	var result = $.extend({},baseApi, url);

	exports('product-api', result);

});