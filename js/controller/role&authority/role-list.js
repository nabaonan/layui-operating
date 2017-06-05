var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'element',
	'form',
	'layer',
	'request',
	'role&authority-api',
	'table-util',
	'authority',
	'btns',
	'valid-login'
];

registeModule(window, requireModules, {
	'role&authority-api': 'api/role&authority-api'
});

//参数有顺序
layui.use(requireModules, function(
	element,
	form,
	layer,
	ajax,
	authorityApi,
	tableUtil,
	authority,
	btns

) {

	var $ = layui.jquery;
	var $table = $('#role-list');

	var controller = {
		init: function() {
			var navId = ajax.getFixUrlParams("navId");

			var totalBtns = authority.getNavBtns(navId);
			var btnObjs = btns.getBtns(totalBtns);
			controller.pageBtns = btns.getPageBtns(btnObjs);
			controller.rowBtns = btns.getRowBtns(btnObjs);
			controller.rowIconBtns = btns.getIconBtns(controller.rowBtns);
			
			$('#page-btns').html(btns.renderBtns(controller.pageBtns));
			controller.renderTable();
			controller.bindEvent();
		},

		renderTable: function() {
			tableUtil.renderTable($table, {
				dom: "t",
				url: authorityApi.getUrl('getRoleList').url,
				columns: [{
					data: 'groupName',
					title: '角色名称',
					width: '20%'
				}, {
					data: 'description',
					title: '角色描述',
					width: '40%'
				}, {
					title: '操作',
					render: function() {
						return btns.renderBtns(controller.rowIconBtns);
					}
				}]
			});
		},

		chooseAuth: function() {
			var rowData = tableUtil.getRowData($table, $(this));
			var url = webName + '/views/role&authority/authority-tree.html';

			var index = layer.open({
				type: 2,
				title: "修改权限",
				area: ['50%', '90%'],
				scrollbar: false,
				content: ajax.composeUrl(url, {
					check: true
				}),
				btn: ['确定了', '取消了'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					var authorityData = iframeWin.tree.getAuthorityData();
					var data = $.extend(true, authorityData, {
						userId: rowData.id
					});
					ajax.request(authorityApi.getUrl('updateAuthority'), data, function() {
						layer.close(index);
					});
				}
			});
		},

		refresh: function() {
			tableUtil.reloadData($table);
		},

		add: function() {
			var index = layer.open({
				type: 2,
				title: "添加角色",
				area: ['50%','80%'],
				offset: '10%',
				scrollbar: false,
				content: webName + '/views/role&authority/role-update.html'
			});
		},

		rowEdit: function() {
			var data = tableUtil.getRowData($('#role-list'), $(this));
			var url = ajax.composeUrl(webName + '/views/role&authority/role-update.html', data);
			var index = layer.open({
				type: 2,
				title: "修改权限",
				area: ['50%','80%'],
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


			//点击刷新
			$('body').on('click', '.refresh', controller.refresh);

			//点击添加
			$('body').on('click', '.add', controller.add);
			//点击编辑
			$('body').on('click', '.row-edit', controller.rowEdit);

		}
	};

	controller.init();
	
	//开方外部访问api
	window.list = {
		refresh: function() {
			controller.refresh();
		}
	}
	
});