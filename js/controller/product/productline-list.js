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
	var $table = $('#productline-list');

	var controller = {
		init: function() {
			var navId = ajax.getFixUrlParams("navId");

			var totalBtns = authority.getNavBtns(navId);
			var btnObjs = btns.getBtns(totalBtns);
			controller.pageBtns = btns.getPageBtns(btnObjs);
			controller.rowBtns = btns.getRowBtns(btnObjs);
			controller.rowIconBtns = btns.getIconBtns(controller.rowBtns);

			$('#page-btns').html(btns.renderBtns(controller.pageBtns));


			$(function(){
				controller.renderBusinessType();
				controller.renderUseState();
				controller.bindEvent();
			});

			controller.renderTable();
		},

		renderBusinessType: function() {
			ajax.request(productApi.getUrl('getBusinessTypeSelect'), null, function(result) {
				
				result.data.unshift({
					key:'all',
					value:'全部'
				});
				formUtil.renderSelects('#business-type', result.data);
			});
		},

		renderUseState: function() {
			ajax.request(productApi.getUrl('getUseStateSelect'), null, function(result) {
				result.data.unshift({
					key:'all',
					value:'全部'
				});
				formUtil.renderSelects('#use-state', result.data);
			});
		},

		renderTable: function() {
			tableUtil.renderTable($table, {
				url: productApi.getUrl('getProductLineList').url,
				composeCondition:function(){
					return formUtil.composeData($('#condition'));
				},
				ordering:true,
				order: [[ 0, "desc" ]],
				columns: [
					{
						data: 'code',
						title: '编码'
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
						title: '生效时间'
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
		
		
		add: function() {
			var url = webName + '/views/product/productline-update.html';
			var index = layer.open({
				type: 2,
				title: "修改产品线",
				area: ['80%','80%'],
				offset: '10%',
				scrollbar: false,
				content: url
			});
		},
		
		rowEdit: function() {
			var data = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/product/productline-update.html', data);
			var index = layer.open({
				type: 2,
				title: "修改产品线",
				area: ['80%','80%'],
				offset: '10%',
				scrollbar: false,
				content: url
			});
		},
		
		rowConfig: function() {
			var data = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/product/productline-config.html', data);
			var index = layer.open({
				type: 2,
				title: "配置产品线",
				area: ['50%','50%'],
				offset: '10%',
				scrollbar: false,
				content: url
			});
		},
		
		rowView: function() {
			var data = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/product/productline-view.html', data);
			var index = layer.open({
				type: 2,
				title: "查看产品线",
				area: ['80%','80%'],
				offset: '10%',
				scrollbar: false,
				content: url
			});
		},
		

		bindEvent: function() {

			//渲染切换按钮
			$table.on('draw.dt', function() {
				new form().render();
			});
			
			//点击查询按钮
			$('#search-btn').on('click',function(){
				tableUtil.reloadData($table);
			});
			
			//点击行编辑按钮
			$table.on('click','.row-edit',controller.rowEdit);
			
			//点击行配置按钮
			$table.on('click','.row-config',controller.rowConfig);
			
			//点击行查看按钮
			$table.on('click','.row-view',controller.rowView);
			
			//添加产品线
			$('body').on('click','.add',controller.add);

		}
	};

	controller.init();
});