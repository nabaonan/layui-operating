var webName = getWebName();
//window.top.registeModule(layui,['userApi','formUtil','tableUtil','request']);

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'element',
	'form',
	'layer',
	'request',
	'form-util',
	'table-util',
	'user-api',
	'valid-login'
];

registeModule(window, requireModules, {
	'good-api': 'api/good-api'
});
//参数有顺序
layui.use(requireModules, function(
	element,
	form,
	layer,
	request,
	formUtil,
	tableUtil,
	goodApi,
	userApi

) {
	var $ = layui.jquery;
	var MyController = {
		init: function() {
			MyController.renderTable();
		},
		getQueryCondition: function() {
			var searchParam = $('#condition').serialzeJSON();
			return searchParam;
		},
		renderTable: function() {

			tableUtil.renderTable($('#good-list'), {
				url: goodApi.getUrl('getAll').url,
				composeCondition: this.getQueryCondition,
				columns: [{
					"data": "id",
					"title": "id"
				}, {
					"data": "name",
					"title": "姓名"
				}]
			});

		}
	};

	MyController.init();

});