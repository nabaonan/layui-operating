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
	'contract-api',
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
	contractApi,
	toast,
	keyBind,
	dateSingleUtil,
	dateUtil

) {
	var $ = layui.jquery;
	var $table = $('#contract-audit-message-list');

	var f = form();

	var count = 0; //记录动态框的个数
	var controller = {
		init: function() {
			var data = ajax.getAllUrlParam();
			controller.param = data;
			//判断window中是否存在传来的参数，优先级为高
			controller.param.contractId = window.contractId?window.contractId:data.contractId;

			controller.renderData();
			controller.bindEvent();
		},
		//获取款项的审核历史
		renderData: function() {
			ajax.request(contractApi.getUrl('queryAuditList'), {
				contractId: controller.param.contractId
			}, function(result) {
				controller.renderTable(result.data);
			});
		},
		renderTable: function(data) {
			tableUtil.renderStaticTable($table, {
				data: data,
				columns: [{
					width:'100px',
					title: '发起人',
					data: 'fromPeople'
				}, {
					title: '说明',
					data: 'comment'
				},{
					title: '审核状态',
					data: 'auditResult'
				}, {
					title: '审批意见',
					data: 'auditMsg'
				}, {
					title: '审批日期',
					data: 'auditDate',
					render: function(data){
						if(data){
							return dateUtil.formatStr(new Date(data),'yyyy-MM-dd HH:mm:ss');
						}
						return "";
					}
				}, {
					title: '审核人',
					data: 'auditPeople'
				}]
			});
		},

		bindEvent: function() {
		}
	};

	controller.init();
});
