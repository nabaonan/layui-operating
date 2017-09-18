
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
	'contract-api',
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
	contractApi,
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
					'2': '未审核',
					'3': '审核通过',
					'4': '审核驳回',
					'5': '编辑未提审',
					'6': '编辑未审核',
					'7': '编辑审核驳回'
				};

			tableUtil.renderTable($table, {
				url: branchCenterApi.getUrl('branchCenterAuditlist').url,
				composeCondition: this.getQueryCondition,
				processing: true,
				columns: [{
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
					width: '20%'

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
					width: '20%',
					render: function(data, type, row) {
						var rowIconBtns = controller.rowIconBtns,
							resultBtns = '';

						if(rowIconBtns) {
							$.each(rowIconBtns, function(index, item) {
								if(item.btnKey == 'row-audit'){
									resultBtns += btns.renderBtn(item.className, item.name, item.icon, !row.btnAuditEnable);
								}
								else if(item.btnKey == 'row-view'){
									resultBtns += btns.renderBtn(item.className, item.name, item.icon);
								}
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
				
				$.each(result.data, function(index,item) {
					if(item.key==2){
						item.value = "未审核";
					}
					else if(item.key==6){
						item.value = "编辑未审核";
					}
				});
				
				//在财务审核列表内不能有 未提审  编辑未提审  状态用来索引
				var auditData = $.grep(result.data, function(item,index) {
					return item.key!="1" && item.key!="5" ;
				});
				
				formUtil.renderSelects('#audit-status', auditData);
				if(window.localStorage){ 
					var status = localStorage.getItem("auditstatus");
					if(status){
						$("#audit-status").val(status);
						localStorage.removeItem("auditstatus");
					}
				}
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

		rowView: function() {
			var rowData = tableUtil.getRowData($table, $(this));
			rowData.branchCenterId = rowData.id;
			
			var url = ajax.composeUrl(webName + '/views/branch-center/branch-center-view.html', rowData);

			var index = layer.open({
				type: 2,
				maxmin: true,
				title: "查看分中心",
				area: ['80%', '90%'],
				scrollbar: false,
				content: url
			});
			layer.full(index);
		},
		
		rowAudit: function() {
			var rowData = tableUtil.getRowData($table, $(this));
			var data = {};
			data.id = rowData.id;//分中心ID
			data.branchCenterId = rowData.id;//分中心ID
			data.handleType = "audit";//操作类型
			
			var url = ajax.composeUrl(webName + '/views/finance/branch-center-audit-view.html', data);

			var index = layer.open({
				type: 2,
				maxmin: true,
				title: "分中心审核",
				area: ['80%', '90%'],
				scrollbar: false,
				content: url,
				btn: ['审核通过', '驳回',' 返回'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.branchCenterAudit.auditOk();
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的auditOk中
				},
				btn2: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.branchCenterAudit.reject();
					return false;
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的reject中
				}
			});
			layer.full(index);
		},
		

		exportFile: function() {
			var condition = controller.getQueryCondition();
			var url = ajax.composeUrl(branchCenterApi.getUrl('exportAudit').url, condition, true, true);
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

		bindEvent: function() {
			//点击查询按钮
			$('#search-btn').on('click', function() {
				tableUtil.reloadData($table);
			});

			//选择适用地区
			$('.choose-area-btn').on('click', controller.chooseArea);
			
			//行查看
			$('body').on('click', '.row-view', controller.rowView);
			//行审核
			$('body').on('click', '.row-audit', controller.rowAudit);
			//导出
			$('.export').on('click', controller.exportFile);
			//刷新
			$('.body').on('click', '.refresh', function() {
				tableUtil.reloadData($table);
			});
			//初始化日期选择
			daterangeUtil.init('#beginTime', '#endTime');
			daterangeUtil.init('#auditBeginTime', '#auditEndTime');
		}

	};

	window.list = {
		refresh: function() {
			tableUtil.reloadData($table);
		}
	}

	controller.init();
});
