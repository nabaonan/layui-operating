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
    'date-util',
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
	dateSingleUtil,
    dateUtil

) {
	var $ = layui.jquery;
	var $table = $('#payment-audit-table');

	var f = form();

	var count = 0; //记录动态框的个数
	var controller = {
		init: function() {
			var data = ajax.getAllUrlParam();
			controller.param = data;
			//判断window中是否存在传来的参数，优先级为高
			controller.param.paymentId = window.paymentId?window.paymentId:data.paymentId;
			controller.param.contractId = window.contractId?window.contractId:data.contractId;

			controller.renderData();

			controller.bindEvent();
		},
		//获取款项的审核历史
		renderData: function() {
			if(controller.param.paymentId){
				ajax.request(paymentApi	.getUrl('paymentAuditHisList'), {
					paymentId: controller.param.paymentId
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
				bPaginate: false,
				data: data,
				columns: [{
					width:'8%',
					title: '发起人',
					data: 'fromPeople',
					render: function(data, type, row) {
						return data;
					}
				}, {
					title: '审核状态',
					data: 'auditStatus'
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
						if(data){
							if(row.auditStatus=="审核通过"||row.auditStatus=="驳回"){
								data = dateUtil.formatStr(new Date(data), 'yyyy-MM-dd HH:mm:ss');
							}else{
								data = "";
							}
						}
						return data;
					}
				}, {
					title: '审核人',
					data: 'reviewPeople',
					render: function(data, type, row) {
						return data;
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
								auditStatus:1
							}
							ajax.request(paymentApi.getUrl('audit'), data, function() {
								toast.success('款项审核成功！');
								var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
								parent.list.refresh();
								parent.layer.close(index); //再执行关闭
								layer.closeAll("loading");
							},null,function(results){
								toast.error(results.msg);
								var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
								parent.layer.close(index); //再执行关闭
								layer.closeAll("loading");
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
								auditStatus:2,
								reviewMsg:value
							}
							ajax.request(paymentApi.getUrl('audit'), data, function() {
								toast.success('款项驳回成功！');
								var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
								parent.list.refresh();
								parent.layer.close(index); //再执行关闭
							},null,function(results){
								var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
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