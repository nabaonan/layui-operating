/**
 * 商品api
 */
var requireModules = [
	'base-url'
];
window.top.registeModule(window, requireModules);

layui.define(requireModules, function(exports) {
	var $ = layui.jquery;
	var baseUrl = layui['base-url'];
	var url = {
		namespace: 'commodity/',
		'getCommodityList': {
			url: 'commodity-list.json'
		},
		'submitSelectCommodityIds': {
			url: 'commodityProducts-datas.json' //新增商品--》选择商品--》点击提交调用的
		},
		'getCommodityData': {
			url: 'commodity-data.json' //新增商品--》选择商品--》点击提交调用的
		},
		'getCommoditySaledate': {
			url: 'saledate.json'
		},
		'updateSaledate': {
			url: '../true.json'
		},
		
		'updateCommodityDesc':{
			url:'../true.json'
		},
		
		'getCommodityDesc':{
			url:'commodity-desc.json'
		},
		'updateCommodity':{//新增商品
			url:'../true.json'
		},
		'auditCommoditys':{
			url:'../true.json'
		},
		'deleteCommoditys':{
			url:'../true.json'
		},
		'copyCommoditys':{
			url:'../true.json'
		},
		'export':{
			url:'../true.json'
		},
		'getCommodityViewData':{
			url:'commodity-view-data.json'
		},
		'saleCommodity':{
			url:'../true.json'
		},
		'updateRowAudit':{
			url:'../true.json'
		}
	}

	var result = $.extend({}, baseUrl, url);

	exports('commodity-api', result);

});