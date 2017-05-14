var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'element',
	'form',
	'layer',
	'request',
	'form-util',
	'user-api',
	'table-util',
	'btns',
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
	userApi,
	tableUtil,
	btns
) {

	var form = layui.form();

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

			tableUtil.renderTable($('#user-list'), {
				url: userApi.getUrl('getAll').url,
				composeCondition: this.getQueryCondition,
				columns: [{
					title: '<input type="checkbox" class="my-checkbox" />',
					render: function() {
						return '<input type="checkbox" class="my-checkbox" />';
					}
				}, {
					"data": "id",
					"title": "id"
				}, {
					"data": "name",
					"title": "姓名"
				}, {
					"data": "job",
					"title": "职位"
				}, {
					"title": "管理",
					"render": function(data, type, row) {

						return "<button class='layui-btn layui-btn-small' >查看</button>" +
							"<button class='layui-btn layui-btn-small layui-btn-normal edit'  alt='更新到最新的时间'>修改</button>" +
							"<button class='layui-btn layui-btn-small layui-btn-danger delete'>删除</button>";
					}
				}]
			});

		}
	};

	MyController.init();

});