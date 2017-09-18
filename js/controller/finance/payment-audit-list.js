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
				$.each(result.data, function(index,item) {
					if(item.key==2){
						item.value = "未审核";
					}
				});
				//在财务审核列表内不能有 未提审 状态用来索引
				var auditData = $.grep(result.data, function(item,index) {
					return item.key!="1";
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
					'2': '未审核',
					'3': '审核通过',
					'4': '审核驳回'
				};

			tableUtil.renderTable($table, {
				url: paymentApi.getUrl('findPaymentInfoList').url,
				composeCondition: this.getQueryCondition,
				processing: true,
				columns: [{
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
					data: 'auditStatus',
                    render: function(data, type, row) {
                    	if(data=="审核中"){
                    		return "未审核";
                    	}
                    	return data;
	                }
				}, {
					title: '操作',
					render: function(data, type, row) {
						var auditStatus = row.auditStatus;
						var disableRowIconBtns = false;

						var rowIconBtns = controller.rowIconBtns,
							resultBtns = '';

						if(rowIconBtns) {
							$.each(rowIconBtns, function(index, item) {
								if(item.btnKey == 'row-audit'){
									if(auditStatus == "未提审" || auditStatus == "审核通过" || auditStatus == "驳回"){
										disableRowIconBtns = true;
									}else{
										disableRowIconBtns = false;
									}
									resultBtns += btns.renderBtn(item.className, item.name, item.icon,disableRowIconBtns);
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

		rowView: function() {
			var rowData = tableUtil.getRowData($table, $(this));
			var data = {};
			//查看也可不传handle参数
			//data.handleType = "view";//操作类型
			data.branchCenterId = rowData.branchCenterId;//分中心ID
			data.contractId = rowData.contractId;//合同ID
			data.contractType = rowData.contractType;//合同类型
			data.contractCode = rowData.contractCode;//合同编号
			data.paymentId = rowData.id;//款项ID
			var url = ajax.composeUrl(webName + '/views/finance/payment-finance-view.html', data);

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

		rowAudit: function() {
			var rowData = tableUtil.getRowData($table, $(this));
			var data = {};
			data.handleType = "audit";//操作类型
			data.branchCenterId = rowData.branchCenterId;//分中心ID
			data.contractId = rowData.contractId;//合同ID
			data.contractType = rowData.contractType;//合同类型
			data.contractCode = rowData.contractCode;//合同编号
			data.paymentId = rowData.id;//款项ID
			var url = ajax.composeUrl(webName + '/views/finance/payment-finance-view.html', data);

			var index = layer.open({
				type: 2,
				title: "款项审核",
				maxmin: true,
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url,
				btn: ['审核通过', '驳回',' 返回'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.paymentAudit.auditOk();
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的auditOk中
				},
				btn2: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.paymentAudit.reject();
					return false;
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的reject中
				}
			});
			layer.full(index);
		},

		getQueryCondition: function() {
			var condition = formUtil.composeData($form);
			var areaIds = $('.choose-area-input').data('ids');
			if(areaIds) {
				condition.area = areaIds.split(',');
			}
			condition.excludeAuditStatus = 1;
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

			//点击行查看按钮
			$table.on('click', '.row-view', controller.rowView);
			//点击行审核按钮
			$table.on('click', '.row-audit', controller.rowAudit);


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