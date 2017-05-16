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
	'btns',
	'authority',
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
	authorityApi,
	tableUtil,
	btns,
	authority,
	toast
) {

	var $ = layui.jquery;

	var $table = $('#sys-user-list');
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

			controller.renderTable();
			controller.bindEvent();
		},

		renderTable: function() {
			tableUtil.renderTable($table, {
				url: authorityApi.getUrl('getAllUsers').url,
				columns: [{
					data: 'name',
					title: '用户名',
					width: '10%'
				}, {
					data: 'deptName',
					title: '部门名称',
					width: '10%'
				}, {
					data: 'role',
					title: '角色类型',
					width: '10%'
				}, {
					data: 'email',
					title: '邮箱',
					width: '10%'
				}, {
					data: 'realName',
					title: '真实姓名',
					width: '20%'
				}, {
					title: '所属部门',

					render: function() {
						return '<div class="layui-btn layui-btn-small choose-dept">选择部门</div>';
					}
				}, {
					title: '操作',
					width: '40%',
					render: function(data, type, row) {
						//由于每行的按钮启用禁用可能不一样，所以需要在这里写相关的按钮控制逻辑
						var isCheck = false;
						var disable = false;
						var rowIconBtns = controller.rowIconBtns;
						var switchBtns = controller.rowSwitchBtns;
						var resultBtns = '';

						if(switchBtns) {
							$.each(switchBtns, function(index, item) {
								resultBtns += btns.renderSwitch(item.prop, item.name, isCheck);
							});
						}

						if(rowIconBtns) {
							$.each(rowIconBtns, function(index, item) {
								resultBtns += btns.renderBtn(item.className, item.name, item.icon, disable);
							});
						}
						return resultBtns;
					}
				}]
			});
		},

		add: function() {
			var index = layer.open({
				type: 2,
				title: "添加用户",
				area: '80%',
				offset: '10%',
				scrollbar: false,
				content: webName + '/views/role&authority/sys-user-update.html',
				success: function(ly, index) {
					layer.iframeAuto(index);
				}
			});
		},

		edit: function() {
			var data = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/role&authority/sys-user-update.html', data);
			console.log('url=%s', url);
			var index = layer.open({
				type: 2,
				title: "修改用户",
				area: '80%',
				offset: '10%',
				scrollbar: false,
				content: url,
				success: function(ly, index) {
					layer.iframeAuto(index);
				}
			});
		},

		refresh: function() {
			tableUtil.reloadData($table);
		},

		resetPwd: function() {
			var $this = $(this);
			layer.confirm('确定重置密码吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {
				var data = tableUtil.getRowData($table, $this);
				ajax.request(authorityApi.getUrl('resetPwd'), {
					userId: data.id,
				}, function() {
					toast.success('重置密码成功！请在列表中查看');
					controller.refresh();
				});
				layer.close(index);
			});
		},

		bindEvent: function() {

			//渲染切换按钮
			$table.on('draw.dt', function() {
				var f = form();
				f.on('switch(enable)', function(switchData) {
					var _this = this;
					var old = !_this.checked;
					layer.confirm('确定启动用户吗?', {
						icon: 3,
						title: '提示',
						closeBtn: 0
					}, function(index) {

						var data = tableUtil.getRowData($table, $(_this));
						var willCheck = _this.checked;

						ajax.request(authorityApi.getUrl('enableUser'), {
							userId: data.id,
							checked: willCheck
						}, function() {
							toast.success('操作成功');
						}, true, function() {
							switchData.elem.checked = old;
							f.render();
							layer.close(index);
						});
					}, function() {
						switchData.elem.checked = old;
						f.render();
					});

				});
				f.render();
			});

			$table.on('click', '.choose-dept', function() {
				console.log('点击了');
				var data = tableUtil.getRowData($table, $(this));
				var url = webName + '/views/role&authority/dept-tree.html';

				var index = layer.open({
					type: 2,
					title: "修改所属部门",
					area: ['50%', '300px'],
					offset: '10%',
					scrollbar: false,
					content: ajax.composeUrl(url, data),
					btn: ['确定了', '取消了'],
					yes: function(index, layero) {
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var datas = iframeWin.tree.getSelectData();
						ajax.request(authorityApi.getUrl('updateAuthority'),{
							deptId:datas[0].id,//
							userId:data.id
						},function(){
							toast.success('修改部门成功');
						});
						
						layer.close(index);
					}
				});
			});

			//点击添加
			$('body').on('click', '.add', controller.add);
			//点击修改
			$('body').on('click', '.row-edit', controller.edit);
			//点击刷新
			$('body').on('click', '.refresh', controller.refresh);
			//点击重置密码
			$('body').on('click', '.row-reset-pwd', controller.resetPwd);

		}
	};

	controller.init();
});