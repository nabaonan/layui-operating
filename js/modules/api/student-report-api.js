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
		namespace: '../json/student-report/',

		//下拉配置菜单
		"keyValue":{
			"url":"../../code/list",
			"type":"get"
		},
		//查询学生订单列表
		"studentOrder/queryList":{
			"url":"queryList",
			"type":"get"
		},
		//导出
		"studentOrder/exportStudentOrder":{
			url: 'export'
		},
		//查看学生订单详细
		"studentOrder/queryDetail":{
			"url":"queryDetail",
			"type":"get"
		},
		//查询审核历史列表
		"studentOrder/queryAuditHis":{
			"url":"queryAuditHis",
			"type":"get"
		},
		//查询审核历史列表
		"studentOrder/queryStartStopHis":{
			"url":"queryStartStopHis",
			"type":"get"
		},
		//审核学生订单
		"studentOrder/audit":{
			"url": 'audit',
			"type":"get"
		},
		//批量审核
		"studentOrder/batchAudit":{
			"url": 'batchAudit',
			"type":"get"
		}



	}

	var result = $.extend({}, baseApi, url);

	exports('student-report-api', result);

});
