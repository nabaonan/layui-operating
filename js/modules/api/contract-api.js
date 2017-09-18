/**
 * 合同相关api
 */
var requireModules = [
    'base-url'
];
window.top.registeModule(window, requireModules);

layui.define(requireModules, function(exports) {

    var $ = layui.jquery;
    var baseApi = layui['base-url'];
    var url = {
        baseUrl: 'https://www.easy-mock.com/mock/594ccc9b8ac26d795f44bd04/oc/',
        namespace: 'web/contract/',
        "getKeyValue": {
			url: "../../code/list"
		},
		'queryList':{
			url:'queryList'
		},
		'getContractInfo':{
			url:'queryDetail'
		},
		'updateContract':{
            url:'insertOrUpdate',
            type:'post'
        },
		'coopRelAndType':{
			url:'coopRelAndType'
		},
		'getLastContractInfo':{
			url:'queryRecentContract'
		},
		'summary':{
			url:'summary'
		},
		'authArea':{
			url:'../../code/area'
		},
		'export':{
			url:'export'
		},
		'audit':{
			url:'audit'
		},
		'queryAuditList':{
			url:'queryAuditList'
		},
		'delete':{
			url:'delete'
		},
		'submitAudit':{
			url:'submitAudit',
			type:'post'
		},
		'getContractType':{
			url: 'getContractType'
		},
		'queryFinanceWelcomePage':{
			url:'queryFinanceWelcomePage'
		},
		'queryFirst':{
			url:'queryFirst'
		}
    }

    var result = $.extend({}, baseApi, url);

    exports('contract-api', result);

});
