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
		namespace: '../../',
		'getProductLineList': { //产品线管理列表
			url: 'productline/query'
		},
		'getProductlineConfig': { //获取产品线配置信息接口
			url: 'productline/queryKey'
		},
		'getProductlineKey': { //生成产品线密钥
			url: 'productline/createKey'
		},
		'getProductList': {
			url: 'product/query',
			type:'get'
		},
		'updateProductLineConfig': {
			url: 'productline/config'
		},
		'updateProductline': { //添加更新产品接口
			url: 'productline/add'
		},
		'enableProductline': {
			url: 'productline/startUse'
		},
		'exportProduct': {
			url: 'product/export'
		},
		'getAreaTree':{
			url:'code/area'
		},
		'auditProduct':{
			url:'product/review'
		}

	}

	var result = $.extend({}, baseApi, url);

	exports('product-api', result);

});