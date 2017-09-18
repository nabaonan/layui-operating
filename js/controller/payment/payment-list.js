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
	'payment-api',
	'date-util',
	'toast',
	'key-bind',
	'daterange-util',
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
	paymentApi,
	dateUtil,
	toast,
	keyBind,
	daterangeUtil

) {
	var $ = layui.jquery;
	var $table = $('#payment-list');

	var $form = $("#condition");

	var f = form();
	var count = 0;
	var controller = {
		init: function() {
			//获取url参数navId
			var navId = ajax.getFixUrlParams("navId");
			if(navId) {
				//根据navId获取button集合json
				var totalBtns = authority.getNavBtns(navId);
				//扩展button集合的属性
				var btnObjs = btns.getBtns(totalBtns);
				controller.pageBtns = btns.getPageBtns(btnObjs);
				controller.rowBtns = btns.getRowBtns(btnObjs);
				controller.rowSwitchBtns = btns.getSwitchBtns(controller.rowBtns);
				controller.rowIconBtns = btns.getIconBtns(controller.rowBtns);
				$('#page-btns').html(btns.renderBtns(controller.pageBtns));
			}

			controller.renderFrom();
			controller.renderAuditStatus();

			var interval = setInterval(function() {
				if(count == 2) {
					clearInterval(interval);
					controller.renderTable();
					f.render();
				}
			}, 0);

			controller.bindEvent();

		},

		//类别
		renderFrom: function() {
			//渲染from下拉框
			ajax.request(paymentApi.getUrl('paymentTypeDown'), {
				contractType:""
			}, function(result) {

				sessionStorage.setItem("formSelect",JSON.stringify(result.data));

				$("#from").html("");
				var options = "<option value='-1'>全部</option>";
				$.each(result.data, function(index, item) {
					options += "<option value='" + item.key + "'>" + item.value + "</option>";
				});
				$("#from").append(options);
				count++;
			});
			//from下拉框选择事件触发to下拉框内容变化
			f.on('select(from)', function(data){
				var sStr = sessionStorage.getItem("formSelect");
				var sObj = JSON.parse(sStr);

				var key = data.value;
				if(key==-1){
					$("#to").html("<option value=''>--</option>");
					f.render();
				}
				$.each(sObj, function(index, item) {
					if(item.key == key){
						if(item.to){
							$("#to").html("");
							var options = "";
							$.each(item.to, function(index, item) {
								options += "<option value='" + item.key + "'>" + item.value + "</option>";
							});
							$("#to").append(options);
						}else{
							$("#to").html("<option value=''>--</option>");
						}
						f.render();
					}
				});
			});
		},
		//审核状态
		renderAuditStatus: function() {
			ajax.request(paymentApi.getUrl('getKeyValue'), {
				type: 'payment_audit_status'
			}, function(result) {
				formUtil.renderSelects('#audit-status', result.data);
				count++;
			});
		},

		refresh: function() {
			tableUtil.reloadData($table);
		},

		renderTable: function() {

			var enableStatusConfig = {
					'1': '启用',
					'2': '停用'
				},
				auditStatusConfig = {
					'1': '未提交',
					'2': '审核中',
					'3': '审核通过',
					'4': '审核驳回'
				};

			tableUtil.renderTable($table, {
				url: paymentApi.getUrl('findPaymentInfoList').url,
				composeCondition: this.getQueryCondition,
				processing: true,
				columns: [{
					title: '<input type="checkbox" lay-filter="all" lay-skin="primary">',
					data: function() {
						return '<input type="checkbox" lay-skin="primary">';
					},
					sortable: false
				}, {
					width:'8%',
					title: '分中心代码',
					data: 'branchCenterCode'
				}, {
					title: '分中心名称',
					data: 'branchCenterName'
				}, {
					title: '合同编号',
					data: 'contractCode'
				}, {
					title: '类别',
					render: function(data, type, row) {
						var keyFrom = controller.getValueByKey(row.from);
						var keyTo = row.to ?  "为"+controller.getValueByKey(row.to) : "";
						return keyFrom+keyTo;
					}
				}, {
					title: '进(出)账',
					data: 'incomeNum'
				}, {
					title: '额度',
					data: 'quota'
				}, {
					title: '入(出)账日期',
					data: "incomeDate",
					render:function(data,type,row){
						return dateUtil.formatStr(new Date(data),'yyyy-MM-dd');
					}
				}, {
					title: '备注说明',
					data: 'remarker'
				}, {
					title: '发起人',
					data: 'creater'
				}, {
					title: '审核状态',
					data: 'auditStatus'

				}, {
					title: '操作',
					render: function(data, type, row) {
						var auditStatus = row.auditStatus;
						var disableRowIconBtns = false;

						var rowIconBtns = controller.rowIconBtns,
							resultBtns = '';

						if(rowIconBtns) {
							$.each(rowIconBtns, function(index, item) {
								if(item.btnKey == 'row-edit'){
									if(auditStatus == "审核中" || auditStatus == "审核通过"){
										disableRowIconBtns = true;
									}else{
										disableRowIconBtns = false;
									}
									resultBtns += btns.renderBtn(item.className, item.name, item.icon,disableRowIconBtns);
								}
								else if(item.btnKey == 'row-delete'){
									if(auditStatus == "未提审" || auditStatus == "驳回"){
										disableRowIconBtns = false;
									}else{
										disableRowIconBtns = true;
									}
									resultBtns += btns.renderBtn(item.className, item.name, item.icon,disableRowIconBtns);
								}
								else if(item.btnKey == 'row-view'){
									resultBtns += btns.renderBtn(item.className, item.name, item.icon);
								}
								else if(item.btnKey == 'row-submitAudit'){
									if(auditStatus == "未提审" || auditStatus == "驳回"){
										disableRowIconBtns = false;
									}else{
										disableRowIconBtns = true;
									}
									resultBtns += btns.renderBtn(item.className, item.name, item.icon,disableRowIconBtns);
								}
							});
						}
						return resultBtns;
					}
				}]
			});

		},

		chooseArea: function() {
			var $input = $('.choose-area-input');
			var url = ajax.composeUrl(webName + '/views/branch-center/branch-center-area-tree.html', {
				ids: $input.data('ids'),
				check: true
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
		//根据key取下拉框缓存数据的value
		getValueByKey:function(key){
			var sStr = sessionStorage.getItem("formSelect");
			var sObj = JSON.parse(sStr);

			var value = "";
			$.each(sObj, function(index, item) {
				if(item.key == key){
					value = item.value;
					return false;
				}
			});
			return value;
		},

		add: function() {
			var data = {};
			data.handleType = "add";//操作类型
			data.branchCenterId = "分中心ID";//分中心ID
			data.contractId = "合同ID";//合同ID
			data.contractType = "合同类型";//合同类型
			data.contractCode = "合同编号";//合同编号
			var url = ajax.composeUrl(webName + '/views/payment/payment-view.html', data);

			var index = layer.open({
				type: 2,
				title: "添加款项",
				maxmin: true,
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url,
				btn: ['提交', '取消'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					var data = iframeWin.payment.submitData();
					if(data){
						ajax.request(paymentApi.getUrl('addPaymentInfo'), data, function() {
							toast.success('款项添加成功！');
							controller.refresh();
						});
						layer.close(index);
					}
				}
			});
			/*layer.full(index);*/
		},

		rowEdit: function() {
			var rowData = tableUtil.getRowData($table, $(this));
			var data = {};
			data.handleType = "edit";//操作类型
			data.branchCenterId = rowData.branchCenterId;//分中心ID
			data.contractId = rowData.contractId;//合同ID
			data.contractType = rowData.contractType;//合同类型
			data.contractCode = rowData.contractCode;//合同编号
			data.paymentId = rowData.id;//款项id
			var url = ajax.composeUrl(webName + '/views/payment/payment-view.html', data);

			var index = layer.open({
				type: 2,
				title: "编辑款项",
				maxmin: true,
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url,
				btn: ['提交', '取消'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					var data = iframeWin.payment.submitData();
					if(data){
						ajax.request(paymentApi.getUrl('updatePaymentInfoById'), data, function() {
							toast.success('款项修改成功！');
							controller.refresh();
						},true, null, null, {
							contentType: "application/json; charset=utf-8",
							data: JSON.stringify(data)
						});
						layer.close(index);
						tableUtil.reloadData($table);
					}
				}
			});
			layer.full(index);
		},

		rowView: function() {
			var rowData = tableUtil.getRowData($table, $(this));
			var data = {};
			data.handleType = "view";//操作类型
			data.branchCenterId = rowData.branchCenterId;//分中心ID
			data.contractId = rowData.contractId;//合同ID
			data.contractType = rowData.contractType;//合同类型
			data.contractCode = rowData.contractCode;//合同编号
			data.paymentId = rowData.id;//款项id
			var url = ajax.composeUrl(webName + '/views/payment/payment-view.html', data);

			var index = layer.open({
				type: 2,
				title: "查看款项",
				maxmin: true,
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url
			});
			layer.full(index);
		},


		rowDelete: function() {
			var data = tableUtil.getRowData($table, $(this));

			layer.confirm('确定删除这个款项吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				layer.load(0, {
					shade: 0.5
				});
				layer.close(index);

				ajax.request(paymentApi.getUrl('deleteById'), {
					id: data.id
				}, function() {
					layer.closeAll('loading');
					toast.success('成功删除！');
					tableUtil.reloadData($table);
				});
			});
		},

		audit: function() {
			var ids = tableUtil.getSelectIds($table);
			if(ids.length == 0) {
				toast.warn('请选择款项再审核');
				return;
			}

			layer.confirm('确定提交审核吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				layer.load(0, {
					shade: 0.5
				});
				layer.close(index);

				ajax.request(paymentApi.getUrl('commitAudit'), {
					paymentIds: ids
				}, function() {
					layer.closeAll('loading');
					toast.success('成功提交审核！');
					tableUtil.reloadData($table);
				}, true, function() {
					layer.closeAll('loading');
				});

			});
		},
		
		rowSubmitAudit: function() {
			var data = tableUtil.getRowData($table, $(this));
			var ids = [];
			ids.push(data.id);

			layer.confirm('确定提交审核吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				layer.load(0, {
					shade: 0.5
				});
				layer.close(index);

				ajax.request(paymentApi.getUrl('commitAudit'), {
					paymentIds: ids
				}, function() {
					layer.closeAll('loading');
					toast.success('成功提交审核！');
					tableUtil.reloadData($table);
				}, true, function() {
					layer.closeAll('loading');
				});

			});
		},

		getQueryCondition: function() {
			var condition = formUtil.composeData($form);
			var areaIds = $('.choose-area-input').data('ids');
			if(areaIds) {
				condition.area = areaIds.split(',');
			}
			condition.sortKey = "f_create_date";
			return condition;
		},
		exportCsv: function() {
			var condition = controller.getQueryCondition();
			var url = ajax.composeUrl(paymentApi.getUrl('export').url, condition, true,true);

			$('<a>', {
				href: url
			}).appendTo($('body'))[0].click();//兼容各个浏览器的写法

			var _this = $(this);
			_this.attr('disabled','disabled');
			_this.html('<i class="layui-icon layui-anim layui-anim-rotate layui-anim-loop">&#xe63d;</i> 正在导出...');
			setTimeout(function() {
				_this.removeAttr('disabled');
				_this.html('<i class="layui-icon">&#xe61e;</i> 导出');
			},1000);

		},

		bindEvent: function() {
			//点击查询按钮
			$('#search-btn').on('click', function() {
				tableUtil.reloadData($table);
			});

			//选择适用地区
			$('.choose-area-btn').on('click', controller.chooseArea);

			//点击行编辑按钮
			$table.on('click', '.row-edit', controller.rowEdit);
			//点击行查看按钮
			$table.on('click', '.row-view', controller.rowView);
			//点击行删除按钮
			$table.on('click', '.row-delete', controller.rowDelete);
			//点击行提审按钮
			$table.on('click', '.row-submitAudit', controller.rowSubmitAudit);

			//添加
			$('body').on('click', '.add', controller.add);
			//提审
			$('body').on('click', '.audit', controller.audit);
			//导出
			$('.export').on('click', controller.exportCsv);

			daterangeUtil.init('.startDate', '.endDate');

		}
	};

	//	对外开方接口
	window.list = {
		refresh: controller.refresh
	};

	controller.init();
});