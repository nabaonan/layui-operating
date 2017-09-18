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
    dateUtil
) {
    var $ = layui.jquery;
    var f = form();
    var $table = $('#contract-list');
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
            data.cooperationType = data.cooperationType ==''?[]:data.cooperationType.split(',');
            data.businessScope = data.businessScope == ''? []:data.businessScope.split(',');
            data.excludeAuditStatus = 1;
            return data;
        },

        renderTable: function() {

            var auditStatusConfig = {
                    '1': '未审核',
                    '2': '审核中',
                    '3': '审核通过',
                    '4': '审核驳回'
                },
                btnEnableConfig = {
                    'row-audit': 'canAudit'
                };

            tableUtil.renderTable($table, {
                url: contractApi.getUrl('queryList').url,
                composeCondition: this.getQueryCondition,
                processing: true,
                columns: [{
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
                    data: 'auditStatus',
                    render: function(data, type, row) {
                    	if(data=="审核中"){
                    		return "未审核";
                    	}
                    	return data;
	                }
                }, {
                    title: '操作',
                    width: '20%',
                    render: function(data, type, row) {

                        var disableSwitch = false, //是否禁用启用停用
                            isCheck = true, //启用停用初始状态
                            rowIconBtns = controller.rowIconBtns,
                            switchBtns = controller.rowSwitchBtns,
                            resultBtns = '';

                        if(rowIconBtns) {
							$.each(rowIconBtns, function(index, item) {
								var btnDisable = row[btnEnableConfig[item.btnKey]] == 2;
								if(item.btnKey == 'row-audit'){
									resultBtns += btns.renderBtn(item.className, item.name, item.icon, btnDisable);
								}
								else if(item.btnKey == 'row-view'){
									resultBtns += btns.renderBtn(item.className, item.name, item.icon,btnDisable);
								}
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
            	$.each(result.data, function(index,item) {
					if(item.key==2){
						item.value = "未审核";
					}
				});
				var auditData = $.grep(result.data, function(item,index) {
					return item.key!="1";
				});
                formUtil.renderSelects('#contract-audit-status', auditData);
                if(window.localStorage){
					var status = localStorage.getItem("auditstatus");
					if(status){
						$("#contract-audit-status").val(status);
						localStorage.removeItem("auditstatus");
					}
				}
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

        rowView: function() {
            var rowData = tableUtil.getRowData($table, $(this));
            var data = {};
            data.id = rowData.branchCenterId;//分中心ID
			data.branchCenterId = rowData.branchCenterId;//分中心ID
			data.contractId = rowData.contractId;//合同ID
			data.contractType = rowData.type;//合同类型
			data.contractCode = rowData.contractCode;
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

        rowAudit: function() {
        	var rowData = tableUtil.getRowData($table, $(this));
			var data = {};
			data.handleType = "audit";//操作类型
			data.id = rowData.branchCenterId;//分中心ID
			data.branchCenterId = rowData.branchCenterId;//分中心ID
			data.contractId = rowData.contractId;//合同ID
			data.contractType = rowData.type;//合同类型
			data.contractCode = rowData.contractCode;//合同编号
			var url = ajax.composeUrl(webName + '/views/finance/contract-audit-view.html', data);

			var index = layer.open({
				type: 2,
				title: "合同审核",
				maxmin: true,
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url,
				btn: ['审核通过', '驳回',' 返回'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.contractAudit.auditOk();
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的auditOk中
				},
				btn2: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.contractAudit.reject();
					return false;
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的reject中
				}
			});
			layer.full(index);
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

		bindEvent: function() {
            //点击查询按钮
            $('#search-btn').on('click', function() {
                tableUtil.reloadData($table);
            });

            //选择适用地区
            $('.choose-area-btn').on('click', controller.chooseArea);
            //行查看
            $table.on('click', '.row-view', controller.rowView);
            //审核
            $('body').on('click', '.row-audit', controller.rowAudit);
            //导出
            $('.export').on('click', controller.exportFile);
            //初始化日期选择
            daterangeUtil.init('#beginTime', '#endTime',{format:'YYYY-MM-DD',istime:false},{format:'YYYY-MM-DD',istime:false});
            daterangeUtil.init('#auditDateStart', '#auditDateEnd',{format:'YYYY-MM-DD',istime:false},{format:'YYYY-MM-DD',istime:false});
            daterangeUtil.init('#startDateStart', '#startDateEnd',{format:'YYYY-MM-DD',istime:false},{format:'YYYY-MM-DD',istime:false});
        }

    };

    window.list = {
        refresh: function() {
            tableUtil.reloadData($table);
        }
    }

    controller.init();
});
