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
	'student-report-api',
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
	studentReportApi,
	dateUtil,
	toast,
	keyBind,
	daterangeUtil

) {
	var $ = layui.jquery;
	var $table = $('#audit-list');

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
			controller.renderSelects();

			var interval = setInterval(function() {
				if(count == 4) {
					clearInterval(interval);
					controller.renderTable();
					f.render();
				}
			}, 0);

			controller.bindEvent();

		},

		//渲染下拉框
		renderSelects: function() {
			//销售类型
			ajax.request(studentReportApi.getUrl('keyValue'), {
				type:"student_order_sale_type"
			}, function(result) {
				$("#sellType").html("");
				var options = "<option value='0'>全部</option>";
				$.each(result.data, function(index, item) {
					options += "<option value='" + item.key + "'>" + item.value + "</option>";
				});
				$("#sellType").append(options);
				count++;
			});
			//订单状态
			ajax.request(studentReportApi.getUrl('keyValue'), {
				type:"student_order_audit_status"
			}, function(result) {
				$("#auditStatus").html("");
				var options = "<option value='0'>全部</option>";
				$.each(result.data, function(index, item) {
					if(item.value == "审核中"){
						options += "<option value='" + item.key + "'>未审核</option>";
					}else{
						options += "<option value='" + item.key + "'>" + item.value + "</option>";
					}
				});
				$("#auditStatus").append(options);
				count++;
			});
			//订单类型
			ajax.request(studentReportApi.getUrl('keyValue'), {
				type:"student_order_type"
			}, function(result) {
				$("#type").html("");
				var options = "<option value='0'>全部</option>";
				$.each(result.data, function(index, item) {
					options += "<option value='" + item.key + "'>" + item.value + "</option>";
				});
				$("#type").append(options);
				count++;
			});
			//启用状态
			ajax.request(studentReportApi.getUrl('keyValue'), {
				type:"start_use"
			}, function(result) {
				$("#openStatus").html("");
				var options = "<option value='0'>全部</option>";
				$.each(result.data, function(index, item) {
					options += "<option value='" + item.key + "'>" + item.value + "</option>";
				});
				$("#openStatus").append(options);
				count++;
			});
		},


		refresh: function() {
			tableUtil.reloadData($table);
		},

		renderTable: function() {
			tableUtil.renderTable($table, {
				url: studentReportApi.getUrl('studentOrder/queryList').url,
				composeCondition: this.getQueryCondition,
				processing: true,
				columns: [{
					title: '<input type="checkbox" lay-filter="all" lay-skin="primary">',
                    data: function() {
                        return '<input type="checkbox" lay-skin="primary">';
                    }
				}, {
					title: '订单号',
					data: 'studentOrderId',
					className: "center",
					render:function(data,type,row){
						return "<a class='studentOrderId'>"+data+"</span>";
					}
				}, {
					title: '分中心名称',
					data: 'branchCenterName',
					className: "center",
					render:function(data,type,row){
						return "<a class='studentOrderId'>"+data+"</span>";
					}
				}, {
					title: '用户姓名',
					data: 'name'
				}, {
					title: '101学号',
					data: 'studentNum'
				}, {
					title: '手机号',
					data: 'phone',
					width: '130px',
					className: "thCenter"
				}, {
					title: '课程',
					data: 'commodityName',
					className: "thCenter",
					width:'120px',
					render:function(data,type,row){
						var names = [];
						var name = "";
						$.each(row.commodity, function(i,item) {
							names.push(item.commodityName);
						});
						var arr = $.grep(row.commodity,function(item,i){
							return item.isStop == 2;
						});
						if(arr.length>0){
							name = arr[0].commodityName;
							if(row.commodity.length>1){
								name += "...";
							}
							return "<div class='cannotOver w110'><img src='img/isStop.png' style='margin-right:5px'><a style='color:#333333' title='"+names.join(',')+"' >"+name+"</span></div>";
						}else{
							name = row.commodity[0].commodityName;
							if(row.commodity.length>1){
								name += "...";
							}
							return "<div class='cannotOver w110'><a style='color:#333333' title='"+names.join(',')+"' >"+name+"</span></div>";
						}
					}
				}, {
					title: '金额',
					data: 'money',
					className: "thCenter",
				}, {
					title: '订单状态',
					data: 'auditStatus',
					className: "center",
					render:function(data,type,row){
						if(data=="审核中"){
							return "未审核";
						}
						return data;
					}
				}, {
					title: '订单类型',
					data: 'type',
					className: "center"
				}, {
					title: '创建时间',
					data: 'createDate',
					className: "center",
					render:function(data,type,row){
						return "<span style='color:#999999;'>"+data+"</span>";
					}
				}, {
					title: '操作',
					data: 'auditStatus',
					width:"150px",
					className: "center",
					render:function(data,type,row){
						var buttons = btns.renderBtn("layui-btn layui-btn-small layui-btn-normal row-view", "查看", "");
						if(data == "审核中"){
							buttons += btns.renderBtn("layui-btn layui-btn-small layui-btn-danger row-audit", "审核", "");
						}
						return buttons;
					}
				}]
			});

		},

		rowView: function() {
			var rowData = tableUtil.getRowData($table, $(this));
			var data = {};
			data.handleType = "view";//操作类型
			data.studentOrderId = rowData.studentOrderId;//订单ID
			if(rowData.type=="部分退单"||rowData.type=="全部退单"||rowData.type=="改单"){
				data.isNeedHisData = "isNeedHisData";
			}
			var url = ajax.composeUrl(webName + '/views/report-branch-center/audit-view.html', data);

			var index = layer.open({
				type: 2,
				title: "查看学生订单",
				maxmin: true,
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url
			});
			layer.full(index);
		},
		rowAudit: function() {
			var rowData = tableUtil.getRowData($table, $(this));
			var data = {};
			data.handleType = "audit";//操作类型
			data.studentOrderId = rowData.studentOrderId;//订单ID
			if(rowData.type=="部分退单"||rowData.type=="全部退单"||rowData.type=="改单"){
				data.isNeedHisData = "isNeedHisData";
			}
			var url = ajax.composeUrl(webName + '/views/report-branch-center/audit-view.html', data);

			var index = layer.open({
				type: 2,
				title: "审核学生订单",
				maxmin: true,
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url,
				btn: ['审核通过', '驳回',' 返回'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.reportAudit.auditOk();
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的auditOk中
				},
				btn2: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.reportAudit.reject();
					return false;
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的reject中
				}
			});
			layer.full(index);
		},

		getQueryCondition: function() {
			var condition = formUtil.composeData($form);
			if(condition.sellType == 0){
				condition.sellType = "";
			}
			if(condition.auditStatus == 0){
				condition.auditStatus = "";
			}
			if(condition.type == 0){
				condition.type = "";
			}
			if(condition.openStatus == 0){
				condition.openStatus = "";
			}
			return condition;
		},
		exportCsv: function() {
			var condition = controller.getQueryCondition();
			var url = ajax.composeUrl(studentReportApi.getUrl('studentOrder/exportStudentOrder').url, condition, true,true);

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
		batchAudit:function(){
			var ids = [];
			$.each($table.find("input[type='checkbox']:checked"),function(i,item){
				var id = $table.DataTable().row( $(item).parents('tr') ).data().studentOrderId;
				ids.push(id);
			});
			if(ids.length == 0) {
				toast.warn('请选择订单再审核');
				return;
			}

			layer.confirm('确定审核通过吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				layer.load(0, {
					shade: 0.5
				});
				layer.close(index);

				ajax.request(studentReportApi.getUrl("studentOrder/batchAudit"), {
					studentOrderIds: ids,
					auditStatus: 4
				}, function() {
					layer.closeAll('loading');
					toast.success('成功提交审核！');
					tableUtil.reloadData($table);
				}, true, function() {
					layer.closeAll('loading');
				});

			});
		},

		bindEvent: function() {
			//点击查询按钮
			$('#search-btn').on('click', function() {
				tableUtil.reloadData($table);
			});

			//点击行查看按钮
			$table.on('click', '.row-view', controller.rowView);
			//点击行审核按钮
			$table.on('click', '.row-audit', controller.rowAudit);

			//导出
			$('.export').on('click', controller.exportCsv);
			//批量审核
			$('.batchAudit').on('click', controller.batchAudit);
			

			daterangeUtil.init('.createDateBegin', '.createDateEnd');
			daterangeUtil.init('.submitAuditDateBegin', '.submitAuditDateEnd');
			daterangeUtil.init('.auditDateStart', '.auditDateEnd');
		}
	};

	//	对外开方接口
	window.list = {
		refresh: controller.refresh
	};
	
	controller.init();
});