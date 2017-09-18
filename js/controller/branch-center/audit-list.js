/**
 *审核列表页面
 */

var webName = getWebName();
layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'request',
    'branch-center-api',
    'table-util',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
    ajax,
    branchCenterApi,
    tableUtil,
    keyBind
) {
    var $ = layui.jquery,
        $table = $('#audit-list'),
        id = ajax.getFixUrlParams('id');

    var controller = {

        init: function() {
            controller.renderTable();
        },

        renderTable: function() {

            var auditStatusConfig = {
                '1': '未审核',
                '2': '审核通过',
                '3': '驳回'
            };

            tableUtil.renderTable($table, {
                dom:'t',
                url: branchCenterApi.getUrl('auditList').url,
                composeCondition: function() {
                    return {
                        id: id
                    };
                },
                columns: [{
                    title: '发起人',
                    data: 'sponsor',
                    width: '10%'
                }, {
                    title: '说明',
                    data: 'comment',
                    width: '30%'
                }, {
                    title: '审核状态',
                    data: 'auditStatus',
                    width: '10%'
                }, {
                    title: '审批意见',
                    data: 'opinion',
                    width: '10%'
                }, {
                    title: '审批日期',
                    data: 'submitAuditDate',
                    width: '20%'
                }, {
                    title: '审核人',
                    data: 'auditor',
                    width: '20%'
                }]
            });
        }
    };

    controller.init();
});
