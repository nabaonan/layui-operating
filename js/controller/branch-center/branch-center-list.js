/**
 * 这个页面是公用的页面，添加商品选择商品的时候需要用，商品定价，审核商品也用
 */

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
	'branch-center-api',
	'role&authority-api',
	'authority',
	'btns',
	'date-util',
	'daterange-util',
	'toast',
	'key-bind',
	'valid-login'
];

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
	element,
	form,
	layer,
	ajax,
	formUtil,
	tableUtil,
	branchCenterApi,
	roleApi,
	authority,
	btns,
	dateUtil,
	daterangeUtil,
	toast,
	keyBind
) {
	var $ = layui.jquery;
	var f = form();

	var $table = $('#branch-center-list');

	var count = 0;

	var controller = {
		init: function() {

			var navId = ajax.getFixUrlParams("navId");
			if(navId) {
				var totalBtns = authority.getNavBtns(navId);
				var btnObjs = btns.getBtns(totalBtns);
				controller.pageBtns = btns.getPageBtns(btnObjs);
				controller.rowBtns = btns.getRowBtns(btnObjs);
				controller.rowSwitchBtns = btns.getSwitchBtns(controller.rowBtns);
				controller.rowIconBtns = btns.getIconBtns(controller.rowBtns);
				$('#page-btns').html(btns.renderBtns(controller.pageBtns));
			}

			controller.renderEffStatus();
			controller.renderAuditStatus();
			controller.renderEnableStatus();
			controller.renderSignRep();

			var interval = setInterval(function() {
				if(count == 4) {
					clearInterval(interval);
					controller.renderTable();
					f.render();
				}
			}, 0);

			controller.bindEvent();
		},

		getQueryCondition: function() {
			var data = formUtil.composeData($('#condition'));
			var ids = $('.choose-area-input').data('ids');
			data.areaListAll = ids?ids.split(','):[];
			return data;
		},

		renderTable: function() {

			var enableStatusConfig = {
					'1': '启用',
					'0': '停用'
				},
				auditStatusConfig = {
					'1': '未提审',
					'2': '审核中',
					'3': '审核通过',
					'4': '审核驳回',
					'5': '编辑未提审',
					'6': '编辑审核中',
					'7': '编辑审核驳回'
				};

			tableUtil.renderTable($table, {
				url: branchCenterApi.getUrl('getBranchCenterList').url,
				composeCondition: this.getQueryCondition,
				processing: true,
				columns: [{
					title: '<input type="checkbox" lay-filter="all" lay-skin="primary">',
					data: function() {
						return '<input type="checkbox" lay-skin="primary">';
					}
				}, {
					title: '分中心代码',
					data: 'centerCode',
					width: '10%'
				}, {
					title: '分中心名称',
					data: 'centerName',
					width: '10%'
				}, {
					title: '校长',
					data: 'headMasters',
					width: '10%'
				}, {
					title: '手机号',
					data: 'phone',
					width: '10%'
				}, {
					title: '最近一次合同有效期',
					data:'lastContractDate',
					width: '15%'

				}, {
					title: '运行状态',
					data: 'openStatus',
					width: '10%',
					render: function(data) {
						return enableStatusConfig[data];
					}
				}, {
					title: '审核状态',
					data: 'auditStatus',
					width: '10%',
					render: function(data) {
						return auditStatusConfig[data];
					}

				}, {
					title: '操作',
					width: '25%',
					render: function(data, type, row) {

						var isCheck ,  //启用停用初始状态
							rowIconBtns = controller.rowIconBtns,
							switchBtns = controller.rowSwitchBtns,
							resultBtns = '';

						if(switchBtns) {
							$.each(switchBtns, function(index, item) {
								var disabledStatus  ;
								switch(item.btnKey){
									case 'row-switch-report': isCheck = row.btnCloseRptEnable;break;
									case 'row-switch': isCheck = row.btnBranchCenterEnable;break;
								}
								resultBtns += btns.renderSwitch(item.prop, item.name, isCheck);
							});
						}

						if(rowIconBtns) {
							$.each(rowIconBtns, function(index, item) {
								var disabledStatus  ;

								switch(item.btnKey){
									case 'row-edit': disabledStatus = !row.btnEditEnable;break;
									case 'row-view': disabledStatus = !row.btnViewEnables;break;
									case 'row-delete': disabledStatus = !row.btnDeleteEnable;break;
									case 'row-add-contract': disabledStatus = !row.btnAddContractEnable;break;
									case 'row-switch-report': disabledStatus = !row.btnCloseRptEnable;break;
									case 'row-switch': disabledStatus = !row.btnBranchCenterEnable;break;
									case 'row-reset-pwd': disabledStatus = !row.btnResetPwdEnable;break;
								}
								resultBtns += btns.renderBtn(item.className, item.name, item.icon,disabledStatus);
							});
						}
						return resultBtns;
					}
				}]
			});

		},

		//生效状态
		renderEffStatus: function() {
			ajax.request(branchCenterApi.getUrl('getKeyValue'), {
				type: 'branch_center_declaration_status'
			}, function(result) {
				formUtil.renderSelects('#eff-status', result.data);
				count++;
			});
		},

		//审核状态
		renderAuditStatus: function() {
			ajax.request(branchCenterApi.getUrl('getKeyValue'), {
				type: 'branch_center_audit_status'
			}, function(result) {
				formUtil.renderSelects('#audit-status', result.data);
				count++;
			});
		},

		//启用状态
		renderEnableStatus: function() {
			ajax.request(branchCenterApi.getUrl('getKeyValue'), {
				type: 'branch_center_open_status'
			}, function(result) {
				formUtil.renderSelects('#enable-status', result.data);
				count++;
			});
		},

		//大区经理
		renderSignRep: function() {
			ajax.request(roleApi.getUrl('getSignRepList'), null, function(result) {
				formUtil.renderSelects('#sign-rep', result.data);
				count++;
			});
		},

		chooseArea: function() {
			var $input = $('.choose-area-input');
			var url = ajax.composeUrl(webName + '/views/branch-center/branch-center-area-tree.html', {
				ids: $input.data('ids'),
				check:true
			});
			var index = layer.open({
				type: 2,
				title: "选择地区",
				area: ['30%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url,
				btn: ['确定了', '取消了'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					var datas = iframeWin.tree.getCheckedData();

					var areaNames = [];
					var ids = [];
					$.each(datas, function(index, item) {
						areaNames.push(item.name);
						ids.push(item.code);
					});

					$input.val(areaNames.join(','));
					$input.data('ids', ids.join(','));
					layer.close(index);
				}
			});
		},

		add: function() {
			var index = layer.open({
				type: 2,
				// maxmin: true,
				closeBtn:0,
				title: "添加分中心",
				area: ['80%', '90%'],
				scrollbar: false,
				content: webName + '/views/branch-center/branch-center-update.html'
			});

			layer.full(index);
		},

		rowEdit: function() {
			$this = $(this);
			var data = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/branch-center/branch-center-update.html', data);

			var index = layer.open({
				type: 2,
				title: "修改分中心",
				area: ['80%', '90%'],
				scrollbar: false,
				content: url
			});

			layer.full(index);

		},

		rowView: function() {
			var data = tableUtil.getRowData($table, $(this));
				data.branchCenterId = data.id;
			var url = ajax.composeUrl(webName + '/views/branch-center/branch-center-view.html', data);

			var index = layer.open({
				type: 2,
				title: "查看分中心",
				area: ['80%', '90%'],
				scrollbar: false,
				content: url
			});

			layer.full(index);

		},

		rowDelete: function() {
			var data = tableUtil.getRowData($table, $(this));
			layer.confirm('确定删除这个分中心吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				layer.load(0, {
					shade: 0.5
				});
				layer.close(index);

				ajax.request(branchCenterApi.getUrl('deleteBranchCenter'), {
					id: data.id
				}, function() {
					layer.closeAll('loading');
					toast.success('成功删除！');
					tableUtil.reloadData($table);
				},true,function(){
					layer.closeAll('loading');
				});
			});
		},

		audit: function() {
			var ids = tableUtil.getSelectIds($table);
			if (ids.length === 0) {
				toast.warn('请选择分中心再提交审核');
				return;
			}

			var url = ajax.composeUrl(webName + '/views/branch-center/audit-submit.html', {
				ids:ids
			});

			var index = layer.open({
				type: 2,
				title: "提示",
				area: '30%',
				scrollbar: false,
				resize: false,
				content: url,
				success: function() {
					layer.iframeAuto(index);
				}
			});

		},

		exportFile: function() {
			var condition = controller.getQueryCondition();
			var url = ajax.composeUrl(branchCenterApi.getUrl('export').url, condition, true, true);
			$('<a>', {
				href: url
			}).appendTo($('body'))[0].click();

			var _this = $(this);
			_this.attr('disabled', 'disabled');
			_this.html('<i class="layui-icon layui-anim layui-anim-rotate layui-anim-loop">&#xe63d;</i> 正在导出...');
			setTimeout(function() {
				_this.removeAttr('disabled');
				_this.html('<i class="layui-icon">&#xe61e;</i> 导出');
			}, 1500);

		},

		switchOn: function(switchData) {
			var _this = this;
			var old = !_this.checked;
			var confirmText = _this.checked ? '启用' : '禁用';
			layer.confirm('确定' + confirmText + '分中心吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				var data = tableUtil.getRowData($table, $(_this));
				var willCheck = _this.checked;

				ajax.request(branchCenterApi.getUrl('enableBranchCenter'), {
					id: data.id,
					openStatus: (willCheck ? '1' : '0') //1启用，2禁用
				}, function() {
					layer.close(index);
					toast.success(confirmText + '成功！');
					tableUtil.reloadData($table);
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

		reportOn: function(switchData) {
			var _this = this;
			var old = !_this.checked;
			var confirmText = _this.checked ? '启用' : '停用';
			layer.confirm('确定' + confirmText + '报单吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				var data = tableUtil.getRowData($table, $(_this));
				var willCheck = _this.checked;

				ajax.request(branchCenterApi.getUrl('enableReport'), {
					id: data.id,
					declarationStatus: (willCheck ? '1' : '0') //1启用，2禁用
				}, function() {
					layer.close(index);
					toast.success(confirmText + '成功！');
					tableUtil.reloadData($table);
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

		resetPwd: function() {
			var data = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/branch-center/branch-center-pwd-update.html', data);

			var index = layer.open({
				type: 2,
				title: "重置密码",
				area: '32%',
				scrollbar: false,
				content: url,
				success: function() {
					layer.iframeAuto(index);
				}
			});
		},

		addContract: function() {
			var data = tableUtil.getRowData($table, $(this));
			data.operate == 'add';
			var url = ajax.composeUrl(webName + '/views/contract/contract-update.html', {
				branchCenterId:data.id
			});

			var index = layer.open({
				type: 2,
				title: "添加合同",
				area: '70%',
				scrollbar: false,
				content: url
			});
			layer.full(index);
		},

		bindEvent: function() {

			//渲染切换按钮
			$table.on('draw.dt', function() {
				f.on('switch(enable)', controller.switchOn);
				f.on('switch(enalbleReport)', controller.reportOn);
			});

			//点击查询按钮
			$('#search-btn').on('click', function() {
				tableUtil.reloadData($table);
			});

			$('#reset-btn').click(function() {
				$('#condition')[0].reset();
				$('.choose-area-input').data('ids','');
			});

			//选择适用地区
			$('.choose-area-btn').on('click', controller.chooseArea);
			//行修改
			$('body').on('click', '.row-edit', controller.rowEdit);
			//行添加合同
			$('body').on('click', '.row-add-contract', controller.addContract);
			//行查看
			$('body').on('click', '.row-view', controller.rowView);
			//行删除
			$('body').on('click', '.row-delete', controller.rowDelete);
			//点击添加
			$('body').on('click', '.add', controller.add);
			//提审
			$('body').on('click', '.audit', controller.audit);
			//重置密码
			$('body').on('click','.row-reset-pwd', controller.resetPwd);
			//导出
			$('.export').on('click', controller.exportFile);
			//刷新
			$('.body').on('click', '.refresh', function() {
				tableUtil.reloadData($table);
			});
			//初始化日期选择
			daterangeUtil.init('#beginTime', '#endTime');
		}

	};

	window.list = {
		refresh: function() {
			tableUtil.reloadData($table);
		}
	}

	controller.init();
});
