/**
 * 选择老师
 * @author nabaonan
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'layer',
    'request',
    'school-report-api',
    'toast',
    'key-bind',
    'table-util',
    'valid-login'
];

registeModule(window, requireModules);


//参数有顺序
layui.use(requireModules, function(
    layer,
    ajax,
    schoolReportApi,
    toast,
    keyBind,
    tableUtil
) {
    var $ = layui.jquery;
    var count = 0;
    var $table = $('#teacher-table');
    var param = ajax.getAllUrlParam();

    var controller = {

        init: function() {
            controller.bindEvent();
            controller.renderTable();
        },

        renderTable: function(){
            var statusConfig = {
                1:'启用',
                2:'停用'
            };
            tableUtil.renderTable($table, {
				url: schoolReportApi.getUrl('getTeachers').url,
				composeCondition: function() {
                    return {
                        orderId: param.orderId,
                        schoolId: param.schoolId,
                        accountIdentify:param.accountIdentify,
                        name:$('#nameOrAccount').val()
                    };
                },
				processing: true,
				columns: [{
					title: '<input type="checkbox" lay-filter="all" lay-skin="primary">',
					data: function() {
						return '<input type="checkbox" lay-skin="primary">';
					}
				}, {
					title: '姓名',
					data: 'name'
				}, {
					title: '帐号',
					data: 'account'
				}, {
					title: '密码',
					data: 'pwd'
				}, {
					title: '生成时间',
					data: 'effectiveDate'
				}, {
					title: '状态',
					data:'status',
                    render: function(data) {
                        return statusConfig[data];
                    }
				}, {
					title: '备注',
					data: 'remark'
				}]
			});
        },

        bindEvent: function() {
            $('.search').click(function() {
                tableUtil.reloadData($table);
            });
        }
    };

    controller.init();
    window.list = {
        getSelects: function() {
            return tableUtil.getSelectData($table);
        }
    };
});
