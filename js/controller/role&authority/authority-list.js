var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'layer',
	'request',
	'role&authority-api',
	'tree-table',
	'toast',
	'authority',
	'btns',
	'valid-login'
	

];
//这里注册没有初始化注册过的 模块路径，如果是modules下有子集 的模块需要在这里注册
registeModule(window, requireModules, {
	'role&authority-api': 'api/role&authority-api'
});

layui.use(requireModules, function(
	layer,
	ajax,
	roleApi,
	treeTable,
	toast,
	authority,
	btns
) {
	
	var controller = {

		init: function() {
			var navId = ajax.getFixUrlParams("navId");
			
			var totalBtns = authority.getNavBtns(navId);
			var btnObjs = btns.getBtns(totalBtns);
			controller.pageBtns = btns.getPageBtns(btnObjs);
			$('#page-btns').html(btns.renderBtns(controller.pageBtns));
			
			controller.renderTable();
			controller.bindEvent();
		},

		renderTable: function() {
			delete this.selectRow;
			//请求后台获取数据
			ajax.request(roleApi.getUrl('getAllAutorityList'), null, function(result) {
				treeTable.init($('#authority-list'), {
					data: result.data,
					column: 0,
					initialState: "expanded",
					alias: {
						pid: 'parentId'
					},
					columns: [{
						title: "menuName",
						name: "权限名称"
					}, {
						title: 'menuUrl',
						name: '权限链接'
					}],
					events: {
						click: controller.clickRow
					}
				});
			});
		},

		add: function() {
			var index = layer.open({
				type: 2,
				title: "添加权限",
				area: ['80%','80%'],
				offset: '10%',
				scrollbar: true,
				content: webName + '/views/role&authority/authority-update.html'
			});

		},
		
		deleteAuth: function() {
			
			if(!controller.selectRow) {
				toast.warn('请选择节点');
				return;
			}

			layer.confirm('确定删除这个权限吗?', {
				icon: 3,
				title: '提示'
			}, function(index) {
				ajax.request(roleApi.getUrl('deleteAuthority'), {
					id:controller.selectRow.id
				},
				function() {
					controller.renderTable();
					layer.close(index);
				});
			});

		},

		edit: function() {

			if(!controller.selectRow) {
				toast.warn('请选择节点');
				return;
			}

			var url = webName + '/views/role&authority/authority-update.html';

			var index = layer.open({
				type: 2,
				title: "修改权限",
				area: ['80%','80%'],
				offset: '10%',
				scrollbar: true,
				content: ajax.composeUrl(url, controller.selectRow)
			});
		},

		refresh: function() {
			controller.renderTable();
		},

		clickRow: function(data) {
			var rowData = $('tr[data-tt-id="'+data.parentId+'"]').data('rowData');			
			data.fatherName = rowData?rowData.menuName:'';
			controller.selectRow = data;
			
		},

		bindEvent: function() {
			//点击添加
			$('body').on('click', '.add', controller.add);
			//点击修改
			$('body').on('click', '.edit', controller.edit);
			//点击删除
			$('body').on('click', '.delete', controller.deleteAuth);
			//点击刷新
			$('body').on('click', '.refresh', controller.refresh);

		}
	};

	controller.init();

	//开方外部访问api
	window.authorityList = {
		
		refreshTable: function() {
			controller.renderTable();
		}
	}
});