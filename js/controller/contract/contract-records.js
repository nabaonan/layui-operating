/**
 *合同历史记录
 */

var webName = getWebName();
layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'request',
    'contract-api',
    'table-util',
    'key-bind',
    'date-util',
    'valid-login'
];

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
    ajax,
    contractApi,
    tableUtil,
    keyBind,
    dateUtil
) {


    var layFilter = window.layFilter; //由于页面是用load加载，url总是调用父级 url不变，只能通过绑定window上传参

    var $ = layui.jquery,

        $table = $('div[lay-filter="' + layFilter + '"] .layui-show table'),
        id = ajax.getFixUrlParams('id'), //分中心id
        contractStatus = window.isHistory ? '3' : '2'; // 1未生效  2正在生效  3已过期

    var controller = {

        init: function() {
            controller.renderTable();
            controller.bindEvent();
        },

        renderTable: function() {

            tableUtil.renderTable($table, {
                dom: 't',
                url: contractApi.getUrl('queryList').url,
                composeCondition: function() {
                    return {
                        branchCenterId: id,
                        contractStatus: contractStatus
                    };
                },
                columns: [{
                    width:'10%',
                    title: '合同编号',
                    data: 'contractCode'
                }, {
                    width:'20%',
                    title: '签署时间',
                    data: 'signDate',
                    render: function(data) {
                        data = data || '';
                        return dateUtil.formatStr(new Date(data), 'yyyy-MM-dd');
                    }
                }, {
                    width:'40%',
                    title: '合同有效期',
                    render: function(data, type, row) {
                        row.startDate = row.startDate || '';
                        row.endDate = row.endDate || '';
                        return dateUtil.formatStr(new Date(row.startDate), 'yyyy-MM-dd') +
                            '~' +
                            dateUtil.formatStr(new Date(row.endDate),'yyyy-MM-dd');
                    }
                }, {
                    width:'15%',
                    title: '合作模式',
                    data: 'cooperationType'
                }, {
                    width:'15%',
                    title: '合同详情',
                    render: function() {
                        return '<button class="layui-btn row-view"> ' +
                            '<i class="layui-icon">&#xe615;</i> 查看' +
                            '</button>';
                    }
                }]
            });
        },

        rowView: function() {
            var data = tableUtil.getRowData($table, $(this));
            var url = ajax.composeUrl(webName + '/views/contract/contract-view.html', data);

            var index = layer.open({
                type: 2,
                maxmin: true,
                title: "查看合同",
                area: ['80%', '90%'],
                scrollbar: false,
                content: url
            });

            layer.full(index);
        },

        bindEvent: function() {
            //查看
            $table.on('click', '.row-view', this.rowView);
        }

    };

    controller.init();
});
