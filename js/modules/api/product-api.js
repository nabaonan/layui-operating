/**
 * 产品管理api
 * @author nabaonan
 */
var requireModules = [
	'base-url'
];

window.top.registeModule(window, requireModules);

layui.define('base-url', function(exports) {
	var $ = layui.jquery;
	var baseApi = layui['base-url'];
	var url = {
		namespace: 'product/',
		'getProductLineList': { //产品线管理列表
			url: 'productline-list.json'
		},
		'getDepartments': { //获取所属部门的多选的接口
			url: 'departments.json'
		},
		'getProductlineConfig': { //获取产品线配置信息接口
			url: 'productline-config.json'
		},
		'getProductlineKey': { //生成产品线密钥
			url: 'productline-key.json'
		},
		'getProductList': {
			url: 'product-list.json'
		},
		'updateProductLineConfig': {
			url: '../true.json'
		},
		'updateProductline': { //添加更新产品接口
			url: '../true.json'
		},
		'enableProductline': {
			url: '../true.json'
		},
		'exportProduct': {
			url: '../true.json'
		},
		'getAreaTree':{
			url:'area.json'
		},
		'auditProduct':{
			url:'../true.json'
		}

	}

	var result = $.extend({}, baseApi, url);

	exports('product-api', result);

});