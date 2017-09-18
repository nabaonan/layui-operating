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
    'authority',
    'btns',
    'daterange-util',
    'toast',
    'key-bind',
    'contract-api',
    'multiple-select',
    'date-util',
    'payment-api',
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
    authority,
    btns,
    daterangeUtil,
    toast,
    keyBind,
    contractApi,
    multipleSelect,
    dateUtil,
    paymentApi
) {
    var $ = layui.jquery;
    var f = form();
    var $table = $('#contract-list');
    var $form = $('#condition');
    var count = 0;

    var controller = {
        init: function() {

            var navId = ajax.getFixUrlParams("navId");

            if (navId) {
                var totalBtns = authority.getNavBtns(navId);
                var btnObjs = btns.getBtns(totalBtns);
                controller.pageBtns = btns.getPageBtns(btnObjs);
                controller.rowBtns = btns.getRowBtns(btnObjs);
                controller.rowIconBtns = btns.getIconBtns(controller.rowBtns);
                $('#page-btns').html(btns.renderBtns(controller.pageBtns));
            }

            controller.renderBusinessRange();
            controller.renderContractStatus();
            controller.renderContractType();
            controller.renderAuditStatus();

            var interval = setInterval(function() {
                if (count == 4) {
                    clearInterval(interval);
                    controller.renderTable();
                    f.render();
                    multipleSelect.render();
                }
            }, 0);

            controller.bindEvent();
        },

        getQueryCondition: function() {
            var data = formUtil.composeData($('#condition'));
            var ids = $('.choose-area-input').data('ids');
            data.area = ids ? ids.split(',') : [];
            data.cooperationType = (!data.cooperationType?[]:data.cooperationType.split(','));
            data.businessScope = (!data.businessScope? []:data.businessScope.split(','));
            return data;
        },

        renderTable: function() {

            var auditStatusConfig = {
                    '1': '未审核',
                    '2': '审核中',
                    '3': '审核驳回',
                    '4': '审核通过'
                },
                btnEnableConfig = {
                    'row-delete': 'canDelete',
                    'row-edit': 'canEdit',
                    'row-continue': 'canContinue',
                    'row-payment-change': 'canPaymentChange'
                };

            tableUtil.renderTable($table, {
                url: contractApi.getUrl('queryList').url,
                composeCondition: this.getQueryCondition,
                processing: true,
                columns: [{
                    title: '<input type="checkbox" lay-filter="all" lay-skin="primary">',
                    data: function() {
                        return '<input type="checkbox" lay-skin="primary">';
                    }
                }, {
                    title: '合同编号',
                    data: 'contractCode'
                }, {
                    title: '分中心代码',
                    data: 'branchCenterCode'
                }, {
                    title: '分中心名称',
                    data: 'branchCenterName'
                }, {
                    title: '首批进货款',
                    data: 'initPayment'
                }, {
                    title: '分成比例',
                    data: 'splitPropogation'
                }, {
                    title: '授权额度',
                    data: 'authQuota'
                }, {
                    title: '消耗额度',
                    data: 'useQuota'
                }, {
                    title: '合同有效期',
                    render: function(data, type, row) {
                        return dateUtil.formatStr(new Date(row.startDate),'yyyy-MM-dd')+
                        '~' +
                         dateUtil.formatStr(new Date(row.endDate),'yyyy-MM-dd');
                    }
                }, {
                    title: '合作模式',
                    data: 'cooperationType'
                }, {
                    title: '业务范围',
                    data: 'businessScope'
                }, {
                    title: '合同审核状态',
                    data: 'auditStatus'
                }, {
                    title: '操作',
                    width: '20%',
                    render: function(data, type, row) {

                        var disableSwitch = false, //是否禁用启用停用
                            isCheck = true, //启用停用初始状态
                            rowIconBtns = controller.rowIconBtns,
                            switchBtns = controller.rowSwitchBtns,
                            resultBtns = '';

                        if (rowIconBtns) {
                            $.each(rowIconBtns, function(index, item) {
                                var disabledStatus  ;
                                switch(item.btnKey){
                                    //1可用，2不可用
                                    case 'row-edit': disabledStatus = row.canEdit == '2';break;
                                    case 'row-delete': disabledStatus = row.canDelete == '2';break;
                                    case 'row-payment-change': disabledStatus = row.canPaymentChange == '2';break;
                                    case 'row-continue': disabledStatus = row.canContinue == '2';break;
                                }
                                resultBtns += btns.renderBtn(item.className, item.name, item.icon,disabledStatus);
                            });
                        }
                        return resultBtns;
                    }
                }]
            });

        },

        //合作模式
        renderContractType: function() {
            ajax.request(contractApi.getUrl('getKeyValue'), {
                type: 'cooperation_type'
            }, function(result) {
                formUtil.renderSelects('#contract-type', result.data);
                $('#contract-type option[value="-1"]').val('').html('请选择');//不显示全部
                count++;
            });
        },

        //业务范围
        renderBusinessRange: function() {
            ajax.request(contractApi.getUrl('getKeyValue'), {
                type: 'contract_business_scope'
            }, function(result) {
                formUtil.renderSelects('#business-range', result.data);
                $('#business-range option[value="-1"]').val('').html('请选择');//不显示全部
                count++;
            });
        },

        //合同状态
        renderContractStatus: function() {
            ajax.request(contractApi.getUrl('getKeyValue'), {
                type: 'contract_status'
            }, function(result) {
                formUtil.renderSelects('#contract-status', result.data);
                count++;
            });
        },

        //审核状态
        renderAuditStatus: function() {
            ajax.request(contractApi.getUrl('getKeyValue'), {
                type: 'contract_audit_status'
            }, function(result) {
                formUtil.renderSelects('#contract-audit-status', result.data);
                count++;
            });
        },

        chooseArea: function() {
            var $input = $('.choose-area-input');
            var url = ajax.composeUrl(webName + '/views/branch-center/branch-center-area-tree.html', {
                ids: $input.data('ids'),
                check: true
            });
            var index = layer.open({
                type: 2,
                title: "选择地区",
                area: ['30%', '80%'],
                offset: '10%',
                scrollbar: false,
                content: url,
                btn: ['确定了', '取消了'],
                yes: function(index, layero) {
                    var iframeWin = window[layero.find('iframe')[0]['name']];
                    var datas = iframeWin.tree.getCheckedData();

                    var areaNames = [];
                    var ids = [];
                    $.each(datas, function(index, item) {
                        areaNames.push(item.name);
                        ids.push(item.code);
                    });

                    $input.val(areaNames.join(','));
                    $input.data('ids', ids.join(','));
                    layer.close(index);
                }
            });
        },


        rowEdit: function() {
            $this = $(this);
            var data = tableUtil.getRowData($table, $(this));
                data.operate = 'edit';
            var url ;
            url = ajax.composeUrl(webName + '/views/contract/contract-update.html', data);
            var index = layer.open({
                type: 2,
                title: "编辑合同",
                area: ['80%', '90%'],
                scrollbar: false,
                content: url
            });

            layer.full(index);

        },

        rowView: function() {
            var data = tableUtil.getRowData($table, $(this));
            var url = ajax.composeUrl(webName + '/views/contract/contract-view.html',data);

            var index = layer.open({
                type: 2,
                title: "查看合同",
                area: ['80%', '90%'],
                scrollbar: false,
                content: url
            });
            layer.full(index);
        },

        rowDelete: function() {
            var data = tableUtil.getRowData($table, $(this));
            layer.confirm('确定删除这个合同吗?', {
                icon: 3,
                title: '提示',
                closeBtn: 0
            }, function(index) {

                layer.load(0, {
                    shade: 0.5
                });
                layer.close(index);

                ajax.request(contractApi.getUrl('delete'), {
                    contractId: data.contractId
                }, function() {
                    layer.closeAll('loading');
                    toast.success('成功删除！');
                    tableUtil.reloadData($table);
                },true,function(result) {
                    toast.error(result.msg);
                    layer.closeAll('loading');
                });
            });
        },

        audit: function() {
            var datas = tableUtil.getSelectData($table);
            var ids = $.map(datas,function(item,index){
                return item.contractId;
            });
			if (ids.length === 0) {
				toast.warn('请选择合同再提交审核');
				return;
			}

			var url = ajax.composeUrl(webName + '/views/contract/audit-submit.html', {
                ids:ids
            });

			var index = layer.open({
				type: 2,
				title: "提示",
				area: '30%',
				scrollbar: false,
				resize: false,
				content: url,
				success: function() {
					layer.iframeAuto(index);
				}
			});
        },

        exportFile: function() {
            var condition = controller.getQueryCondition();
            var url = ajax.composeUrl(contractApi.getUrl('export').url, condition, true, true);
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

        rowContinue: function() {
            var data = tableUtil.getRowData($table, $(this));
            	data.operate = 'add-contract-continue';
                data.type = '3';
                data.isPass = '';
            var url = ajax.composeUrl(webName + '/views/contract/contract-continue-update.html', data);

            var index = layer.open({
                type: 2,
                maxmin: true,
                title: "续签合同",
                area: ['80%', '90%'],
                scrollbar: false,
                content: url
            });
            layer.full(index);
        },

        rowPaymentChange:function() {
            var data = tableUtil.getRowData($table, $(this));
            data.handleType = "add";//操作类型
            var url = ajax.composeUrl(webName + '/views/payment/payment-view.html',data);

            var index = layer.open({
                type: 2,
                maxmin: true,
                title: "款项变更",
                area: ['80%', '90%'],
                scrollbar: false,
                content: url,
                btn: ['提交', '取消'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					var data = iframeWin.payment.submitData();
					if(data){
						ajax.request(paymentApi.getUrl('addPaymentInfo'), data, function() {
							toast.success('款项添加成功！');
							window.list.refresh();
						},true, null, null, {
							contentType: "application/json; charset=utf-8",
							data: JSON.stringify(data)
						});
						layer.close(index);
					}
				}
            });
            layer.full(index);
        },

        bindEvent: function() {

            //渲染切换按钮
            $table.on('draw.dt', function() {
                f.on('switch(enable)', controller.switchOn);
                f.on('switch(enalbleReport)', controller.reportOn);
            });

            //点击查询按钮
            $('#search-btn').on('click', function() {
                tableUtil.reloadData($table);
            });
//             $('#reset-btn').click(function(){
//                 $form[0].reset();
//             });

            //选择适用地区
            $('.choose-area-btn').on('click', controller.chooseArea);
            //行修改
            $table.on('click', '.row-edit', controller.rowEdit);
            //行查看
            $table.on('click', '.row-view', controller.rowView);
            //行删除
            $table.on('click', '.row-delete', controller.rowDelete);
            //行款项变更
            $table.on('click', '.row-payment-change', controller.rowPaymentChange);
            //续签
            $table.on('click', '.row-continue', controller.rowContinue);
            //提审
            $('body').on('click', '.audit', controller.audit);
            //导出
            $('.export').on('click', controller.exportFile);
            //刷新
            $('.body').on('click', '.refresh', function() {
                tableUtil.reloadData($table);
            });
            //初始化日期选择
            daterangeUtil.init('#beginTime', '#endTime',{
                format:'YYYY-MM-DD',
                istime:false
            },{
                format:'YYYY-MM-DD',
                istime:false
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
