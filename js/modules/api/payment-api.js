/**
 * 产品管理api
 * @author nabaonan
 */
var requireModules = [
	'base-url'
];

window.top.registeModule(window, requireModules);

layui.define('base-url', function(exports) {
	var $ = layui.jquery;
	var baseApi = layui['base-url'];
	var url = {
		namespace: '../../web/payment/',

		"getKeyValue": {
			url: "../../../code/list"
		},
		//款项类别集合
		'paymentTypeDown': {
			url: 'queryPaymentType'
		},
		//获取款项列表
		'findPaymentInfoList': {
			url: 'queryList'
		},
		//删除款项
		"deleteById":{
			url: 'delete'
		},
		//提审
		"commitAudit":{
			url: 'commitAudit'
		},
		//导出
		"export":{
			url: 'export'
		},
		//获取合同款项所需数据，用来计算
		"paymentMsg":{
			url: '../../web/contract/checkPayment'
		},
		//获取合同下的款项列表信息
		"findPaymentInfoById":{
			url: 'queryList'
		},
		//款项添加
		"addPaymentInfo":{
			url: 'insert',
			type:"post"
		},
		//款项修改
		"updatePaymentInfoById":{
			url: 'update',
			type:"post"
		},
		//款项审核历史
		"paymentAuditHisList":{
			url: 'queryAuditHistoryList'
		},
		//款项审核
		"audit":{
			url: 'audit'
		},
		"queryFinanceWelcomePage":{
			url: "queryFinanceWelcomePage"
		},
		//合同款项审核历史
		'queryTransferPayment':{
			url:'queryTransferPayment'
		}


	}

	var result = $.extend({}, baseApi, url);

	exports('payment-api', result);

});
