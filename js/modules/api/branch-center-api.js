/**
 * 分中心api
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
        namespace: 'branchCenter/',
        "getKeyValue": {
			url: "../code/list"
		},
		'getBranchCenterList': {
			url: 'list'
		},
		'auditList':{//分中心审核记录列表
			url:'branchCenterAuditList'
		},
		'deleteBranchCenter': {
			url: 'delete'
		},
		'audit': {
			url: 'audit'
		},
		'enableBranchCenter': {
			url: 'enable'
		},
		'enableReport':{
			url:'closeRpt'
		},
		'getBranchCenterInfo': {
			url: 'detail'
		},
		'getPwd': {
			url:'genPwd'
		},
		'updateBranchCenter':{
			url:'addOrUpdate',
			type:'post'
		},
		'export':{
			url:'export'
		},
		'exportAudit':{
			url:'exportAudit'
		},
		'submitAudit':{
			url:'submitAudit',
			type: 'post'
		},
		'updateBranchPwd':{
			url:'resetPwd'
		},
		'isExistCode':{
			url:'isExistCode'
		},
		'branchCenterAuditlist':{
			url: 'auditList'
		},
		'branchCenterAuditStatusList':{
			url: 'branchCenterAuditStatusList'
		},
		'notAuditList':{
			url:'notAuditList'
		}

    }

    var result = $.extend({}, baseApi, url);

    exports('branch-center-api', result);

});
