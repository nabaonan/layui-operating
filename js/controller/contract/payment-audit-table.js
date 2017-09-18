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
	'toast',
	'key-bind',
	'date-single-util',
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
	toast,
	keyBind,
	dateSingleUtil

) {
	var $ = layui.jquery;
	var $table = $('#payment-audit-table');

	var f = form();

	var count = 0; //记录动态框的个数
	var controller = {
		init: function() {
			var data = ajax.getAllUrlParam();
			controller.param = data;
			
			controller.renderData();
			
			controller.bindEvent();
		},
		//获取款项的审核历史
		renderData: function() {
			if(controller.param.paymentId){
				ajax.request(paymentApi	.getUrl('paymentAuditHisList'), {
					id: controller.param.paymentId
				}, function(result) {
					controller.renderTable(result.data);
				});
			}else{
				ajax.request(paymentApi	.getUrl('paymentAuditHisList'), {
					contractId: controller.param.contractId
				}, function(result) {
					controller.renderTable(result.data);
				});
			}
		},
		renderTable: function(data) {
			var auditStatusConfig = {
					'1': '未提交',
					'2': '审核中',
					'3': '审核通过',
					'4': '审核驳回'
				};

			tableUtil.renderStaticTable($table, {
				data: data,
				columns: [{
					title: '发起人',
					data: 'fromPeople',
					render: function(data, type, row) {
						return data;
					}
				}, {
					title: '审核状态',
					data: 'auditStatus',
					render: function(data, type, row) {
						return auditStatusConfig[data];
					}

				}, {
					title: '审批意见',
					data: 'reviewMsg',
					render: function(data, type, row) {
						return data;
					}
				}, {
					title: '审批日期',
					data: 'reviewDate',
					render: function(data, type, row, meta ) {
						return data;
					}
				}, {
					title: '审核人',
					data: 'reviewPeople',
					render: function(data, type, row) {
						if(row.addRow){
							return '';
						}
						else if(data){
							return data;
						}else{
							return ""
						}
					}
				}]
			});
		},
		
		bindEvent: function() {
			if(controller.param.handleType == "audit"){
				window.paymentAudit = {
					//监听审核通过
					auditOk: function() {
						layer.confirm('确定要通过审核吗?', {
							icon: 3,
							title: '提示',
							closeBtn: 0
						}, function(index) {
							layer.load(0, {
								shade: 0.5
							});
							layer.close(index);
							
							var data = {
								id:controller.param.paymentId,
								IsPass:1
							}
							ajax.request(paymentApi.getUrl('audit'), data, function() {
								toast.success('款项审核成功！');
								var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
								parent.list.refresh();
								parent.layer.close(index); //再执行关闭
							});
						});
					},
					//审核驳回
					reject:function(){
						layer.prompt({
							formType: 2,
							title: '请输入驳回理由',
							area: ['500px', '100px'] //自定义文本域宽高
						}, function(value, index, elem) {
							var data = {
								id:controller.param.paymentId,
								IsPass:2,
								reviewMsg:value
							}
							ajax.request(paymentApi.getUrl('audit'), data, function() {
								toast.success('款项驳回成功！');
								var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
								parent.list.refresh();
								parent.layer.close(index); //再执行关闭
							});
						});
						return false;
					}
				};
				/*f.on('submit(productline-form)', function(data) {
				});*/
			}
		}
	};
	
	controller.init();
});