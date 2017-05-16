var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'element',
	'form',
	'layer',
	'request',
	'table-util',
	'authority',
	'btns',
	'form-util',
	'product-api'
	/*,
		'valid-login'*/
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
	element,
	form,
	layer,
	ajax,
	tableUtil,
	authority,
	btns,
	formUtil,
	productApi

) {
	var $ = layui.jquery;
	var $table = $('#product-list');

	var controller = {
		init: function() {
			var navId = ajax.getFixUrlParams("navId");

			var totalBtns = authority.getNavBtns(navId);
			var btnObjs = btns.getBtns(totalBtns);
			controller.pageBtns = btns.getPageBtns(btnObjs);
			controller.rowBtns = btns.getRowBtns(btnObjs);
			controller.rowIconBtns = btns.getIconBtns(controller.rowBtns);

			$('#page-btns').html(btns.renderBtns(controller.pageBtns));

			controller.bindEvent();
			controller.renderTable();
		},
		
		
		renderTable: function() {
			tableUtil.renderTable($table, {
				url: productApi.getUrl('getProductList').url,
				columns: [
					{
						data:function(){
							return '<input type="checkbox" class="my-checkbox" />';
						}
					},
				
					{
						data: 'code',
						title: '编码',
						sortable:false
					},
					{
						data: 'name',
						title: '产品线名称',
						sortable:false
					},
					{
						data: 'businessType',
						title: '业务类型',
						sortable:false
					},
					{
						data: 'portalAddress',
						title: '门户网址',
						sortable:false
					},
					{
						data: 'header',
						title: '负责人',
						sortable:false
					},
					{
						data: 'phone',
						title: '手机',
						sortable:false
					},
					{
						data: 'effDate',
						title: '生效时间',
						sortable:false
					},
					{
						title: '操作',
						render: function() {
							return btns.renderBtns(controller.rowIconBtns);
						}
					}
				]
			});
		},

		bindEvent: function() {

			//渲染切换按钮
			$table.on('draw.dt', function() {
				new form();
			});
			
			
		}
	};

	controller.init();
});