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
	'product-api',
	'date-util',
	'toast',
	'valid-login'
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
	productApi,
	dateUtil,
	toast

) {
	var $ = layui.jquery;
	var $table = $('#productline-list');

	var f = form();
	var count = 0;
	var controller = {
		init: function() {
			var navId = ajax.getFixUrlParams("navId");

			var totalBtns = authority.getNavBtns(navId);
			var btnObjs = btns.getBtns(totalBtns);
			controller.pageBtns = btns.getPageBtns(btnObjs);
			controller.rowBtns = btns.getRowBtns(btnObjs);
			controller.rowSwitchBtns = btns.getSwitchBtns(controller.rowBtns);
			controller.rowIconBtns = btns.getIconBtns(controller.rowBtns);

			$('#page-btns').html(btns.renderBtns(controller.pageBtns));
			
			controller.bindEvent();
			
			controller.renderBusinessType();
			controller.renderUseState();
			
			var interval = setInterval(function() {
				if(count == 2) {
					clearInterval(interval);
					f.render();
				}
			}, 0);
			controller.renderTable();
		},

		renderBusinessType: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'business_type'
			}, function(result) {
				formUtil.renderSelects('#business-type', result.data);
				count++;
			});
		},

		renderUseState: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'start_use'
			}, function(result) {
				
				formUtil.renderSelects('#use-state', result.data);
				count++;
			});
		},
		
		refresh: function() {
			tableUtil.reloadData($table);
		},

		renderTable: function() {
			tableUtil.renderTable($table, {
				url: productApi.getUrl('getProductLineList').url,
				composeCondition: function() {
					return formUtil.composeData($('#condition'));
				},
				ordering: true,
				order: [
					[0, "desc"]
				],
				columns: [{
						data: 'code',
						title: '编码'
					},
					{
						data: 'name',
						title: '产品线名称',
						sortable: false
					},
					{
						data: 'businessName',
						title: '业务类型',
						sortable: false
					},
					{
						data: 'portalAddress',
						title: '门户网址',
						sortable: false
					},
					{
						data: 'header',
						title: '负责人',
						sortable: false
					},
					{
						data: 'phone',
						title: '手机',
						sortable: false
					},
					{
						data: 'effDate',
						title: '生效时间',
						render: function(data) {
							if($.trim(data) !== '') {
								return dateUtil.formatStr(new Date(parseInt(data)), "yyyy-MM-dd");
							}
							return "";
						}
					},
					{
						title: '操作',
						sortable: false,
						render: function(data,type,row) {
							
							//由于每行的按钮启用禁用可能不一样，所以需要在这里写相关的按钮控制逻辑
							var isCheck = row.startUse == '1';//1启用2停用3禁用
							var disableSwitch = row.startUse == '3';
							var disable = false;
							var rowIconBtns = controller.rowIconBtns;
							var switchBtns = controller.rowSwitchBtns;
							var resultBtns = '';

							if(switchBtns) {
								$.each(switchBtns, function(index, item) {
									resultBtns += btns.renderSwitch(item.prop, item.name, isCheck,disableSwitch);
								});
							}

							if(rowIconBtns) {
								$.each(rowIconBtns, function(index, item) {
									resultBtns += btns.renderBtn(item.className, item.name, item.icon, disable);
								});
							}
							return resultBtns;
							
						
						}
					}
				]
			});
		},

		add: function() {
			var url = webName + '/views/product/productline-update.html';
			var index = layer.open({
				type: 2,
				title: "添加产品线",
				area: ['80%', '80%'],
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
				area: ['80%', '80%'],
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
				area: ['50%', '50%'],
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
				area: '80%',
				offset: '25%',
				scrollbar: false,
				content: url,
				success: function(layero) {
					layer.iframeAuto(index);	
				}
			});
		},

		switchOn: function(switchData) {
			var _this = this;
			var old = !_this.checked;
			var confirmText = _this.checked?'启用':'禁用';
			layer.confirm('确定'+confirmText+'产品线吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				var data = tableUtil.getRowData($table, $(_this));
				var willCheck = _this.checked;

				ajax.request(productApi.getUrl('enableProductline'), {
					productLine: data.id,
					type: (willCheck?'1':'2')//1启用，2禁用
				}, function() {
					layer.close(index);
					toast.success(confirmText+'成功！');
				}, true, function() {
					switchData.elem.checked = old;
					f.render();
					layer.close(index);
				});
			}, function() {
				switchData.elem.checked = old;
				f.render();
			});
		},

		bindEvent: function() {

			//渲染切换按钮
			$table.on('draw.dt', function() {
				f.on('switch(enable)', controller.switchOn);
			});
			//点击查询按钮
			$('#search-btn').on('click', function() {
				tableUtil.reloadData($table);
			});
			//点击行编辑按钮
			$table.on('click', '.row-edit', controller.rowEdit);
			//点击行配置按钮
			$table.on('click', '.row-config', controller.rowConfig);
			//点击行查看按钮
			$table.on('click', '.row-view', controller.rowView);
			//添加产品线
			$('body').on('click', '.add', controller.add);

		}
	};
//	对外开方接口
	window.list = {
		refresh: controller.refresh
	}

	controller.init();
});