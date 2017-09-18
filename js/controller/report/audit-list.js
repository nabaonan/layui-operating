/**
 * 审核列表
 * @type {[type]}
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'element',
    'form',
    'layer',
    'request',
    'form-util',
    'table-util',
    'role&authority-api',
    'school-report-api',
    'authority',
    'btns',
    'date-util',
    'toast',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
    element,
    form,
    layer,
    ajax,
    formUtil,
    tableUtil,
    roleApi,
    schoolReportApi,
    authority,
    btns,
    dateUtil,
    toast,
    keyBind
) {
    var $ = layui.jquery;
    var f = form();
    var $table = $('#audit-list');
    var count = 0;

    var controller = {
        init: function() {

            var navId = ajax.getFixUrlParams("navId");
            if (navId) {
                var totalBtns = authority.getNavBtns(navId);
                var btnObjs = btns.getBtns(totalBtns);
                controller.pageBtns = btns.getPageBtns(btnObjs);
                controller.rowBtns = btns.getRowBtns(btnObjs);
                controller.rowSwitchBtns = btns.getSwitchBtns(controller.rowBtns);
                controller.rowIconBtns = btns.getIconBtns(controller.rowBtns);
                $('#page-btns').append(btns.renderBtns(controller.pageBtns));
            }

            controller.renderAccountType();
            // controller.renderEffState();
            controller.renderOrderState();
            controller.renderPeriod();
            controller.renderSchoolSystem();
            controller.renderTeachModel();
            controller.renderVersion();
            controller.renderOpenState();

            var interval = setInterval(function() {
                if (count == 7) {
                    clearInterval(interval);
                    controller.renderTable();
                    f.render();
                }
            }, 0);

            controller.bindEvent();
        },

        getQueryCondition: function() {
            var data = formUtil.composeData($('#condition'));

            return data;
        },

        renderTable: function() {

            var enableStatusConfig = {
                    '1': '启用',
                    '0': '停用'
                },
                auditStatusConfig = {
                    '1': '未提审',
                    '2': '审核中',
                    '3': '审核通过',
                    '4': '审核驳回',
                    '5': '编辑未提审',
                    '6': '编辑审核中',
                    '7': '编辑审核驳回'
                };

            tableUtil.renderTable($table, {
                url: schoolReportApi.getUrl('queryList').url,
                composeCondition: this.getQueryCondition,
                processing: true,
                ordering: true,
                order: [
					[12, "desc"]
				],
                columns: [{
                    sortable: false,
                    title: '<input type="checkbox" lay-filter="all" lay-skin="primary">',
                    data: function() {
                        return '<input type="checkbox" lay-skin="primary">';
                    }
                }, {
                    sortable: false,
                    title: '学校名称',
                    data: 'schoolName',
                    render: function(data) {
                        return '<a href="javascript:;" class="show-orders">' + data + '</a>';
                    }
                }, {
                    sortable: false,
                    title: '版本',
                    data: 'commodityName'
                }, {
                    sortable: false,
                    title: '学段',
                    data: 'levelName'
                }, {
                    sortable: false,
                    title: '班级数',
                    data: 'gradeNumber'
                }, {
                    sortable: false,
                    title: '学生数',
                    data: 'studentNumber'
                }, {
                    sortable: false,
                    title: '教师数',
                    data: 'teacherNumber'
                }, {
                    sortable: false,
                    title: '学生版数',
                    data: 'studentEditionNumber'
                }, {
                    sortable: false,
                    title: '分中心',
                    data: 'centerName'
                }, {
                    sortable: false,
                    title: '订单审核状态',
                    data: 'orderAuditStatus'
                },  {
                    sortable: false,
                    title: '状态',
                    data: 'isEnable'
                }, {
                    sortable: false,
                    title: '到期时间',
                    data: 'stopDate'
                }, {
                    sortable: true,
                    title: '创建时间',
                    data: 'createDate'
                }, {
                    sortable: false,
                    title: '操作',
                    width: '25%',
                    render: function(data, type, row) {

                        var rowIconBtns = controller.rowIconBtns,
                            resultBtns = '';
                        if (rowIconBtns) {
                            $.each(rowIconBtns, function(index, item) {
                                var disabledStatus = false;
                                switch(item.btnKey){
                                	case 'row-view': disabledStatus = !row.btnViewEnable;break;
                                	case 'row-audit': disabledStatus = !row.btnAuditEnable;break;
                                }
                                resultBtns += btns.renderBtn(item.className, item.name, item.icon, disabledStatus);
                            });
                        }
                        return resultBtns;
                    }
                }]
            });

        },

        //学制
        renderSchoolSystem: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_system'
            }, function(result) {
                formUtil.renderSelects('#school-system', result.data);
                count++;
            });
        },

        //学段
        renderPeriod: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_level'
            }, function(result) {
                formUtil.renderSelects('#period', result.data);
                count++;
            });
        },

        //教学模式
        renderTeachModel: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'teach_model'
            }, function(result) {
                formUtil.renderSelects('#teach-model', result.data);
                count++;
            });
        },

        //版本
        renderVersion: function() {
            ajax.request(schoolReportApi.getUrl('queryProductVersions'), null, function(result) {
                formUtil.renderSelects('#version', result.data);
                count++;
            });
        },

        //订单状态
        renderOrderState: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type:'school_order_audit_status'
            }, function(result) {
                var data = $.grep(result.data,function(item){
                    return item.key != '1';
                });
                formUtil.renderSelects('#order-state', data);
                $('#order-state option[value="-1"]').remove();

                count++;
            });
        },

        //帐号类型
        renderAccountType: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type:'account_type'
            }, function(result) {
                formUtil.renderSelects('#accout-type', result.data);
                count++;
            });
        },

        //启用状态
        renderOpenState: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type:'school_order_start_stop_status'
            }, function(result) {
                formUtil.renderSelects('#open-state', result.data);
                count++;
            });
        },

        //生效状态
        renderEffState: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type:''
            }, function(result) {
                formUtil.renderSelects('#eff-state', result.data);
                count++;
            });
        },

        //查看帐号
        rowView: function() {
            var data = tableUtil.getRowData($table, $(this));
            data.operate = 'auditView';
            var url = ajax.composeUrl(webName + '/views/report/school-report-update.html', data);

            var index = layer.open({
                type: 2,
                title: "查看",
                area: ['80%', '90%'],
                scrollbar: false,
                content: url
            });

            layer.full(index);

        },

        rowAudit: function() {
            var data = tableUtil.getRowData($table, $(this));
            data.operate = 'audit';
            var url = ajax.composeUrl(webName + '/views/report/school-report-update.html', data);

            var index = layer.open({
                type: 2,
                title: "选择要审核的订单",
                area: ['80%', '90%'],
                scrollbar: false,
                content: url
            });

            layer.full(index);
        },

        exportFile: function() {
            var condition = controller.getQueryCondition();
            var url = ajax.composeUrl(schoolReportApi.getUrl('exportSchool').url, condition, true, true);
            $('<a>', {
                href: url
            }).appendTo($('body'))[0].click();

            var _this = $(this);
            _this.attr('disabled', 'disabled');
            _this.html('<i class="layui-icon layui-anim layui-anim-rotate layui-anim-loop">&#xe63d;</i> 正在导出...');
            setTimeout(function() {
                _this.removeAttr('disabled');
                _this.html('<i class="layui-icon">&#xe61e;</i> 导出');
            }, 1500);

        },

        showOrders: function() {
            var data = tableUtil.getRowData($table, $(this));
            var url = ajax.composeUrl(webName + '/views/report/school-orders-view.html', data);
            var index = layer.open({
                type: 2,
                title: "查看学校订单",
                scrollbar: false,
                content: url
            });
            layer.full(index);
        },

        bindEvent: function() {

            $table.on('draw.dt', function() {
                layer.closeAll('loading');
                // debugger;
            });

            $table.on('preXhr.dt', function () {
                layer.load(0, {
					shade: 0.5
				});
                // debugger;
            });
            //点击查询按钮
            $('#search-btn').on('click', function() {
                tableUtil.reloadData($table);
            });

            $('#reset-btn').click(function() {
                $('#condition')[0].reset();
            });

            //查看学校下所有订单
            $table.on('click', '.show-orders', controller.showOrders);
            //查看
            $table.on('click', '.row-view', controller.rowView);
            //审核
            $table.on('click', '.row-audit', controller.rowAudit);
            //导出
            $('body').on('click', '.export', controller.exportFile);

            laydate.render({
               elem: '#createDate',
               range:'~'
            });

            laydate.render({
               elem: '#stopDate',
               range:'~'
            });

        }

    };

    window.list = {
        refresh: function() {
            tableUtil.reloadData($table);
        }
    };

    controller.init();
});
