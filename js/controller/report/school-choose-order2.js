/**
 * 选择学校订单
 * @type {[type]}
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'request',
    'toast',
    'school-report-api',
    'contract-api',
    'school-report-store',
    'key-bind',
    'valid-login'
];

var vm = avalon.define({
    $id: 'choose-order',
    schoolInfo: {},
    orders: [],
    managers:[],
    detail: '',
    operate: '',
    currentOrderId:'',
    choose: function(order) {
        // this.orders.forEach(function(item) {
        //     if (item.orderNumber != order.orderNumber) {
        //         item.checked = false;
        //     }
        // });

    }

});

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
    ajax,
    toast,
    schoolReportApi,
    contractApi,
    schoolReportStore,
    keyBind
) {
    var $ = layui.jquery;
    var count = 0;
    var actionType = ajax.getFixUrlParams('actionType');
    var schoolId = ajax.getFixUrlParams('id');
    var operate = ajax.getFixUrlParams('operate');
    vm.operate = operate;
    var controller = {
        init: function() {
            schoolReportStore.setActionType(actionType);
            vm.managers = schoolReportStore.getManagers(schoolId);
            this.bindEvent();
            this.getData();
        },

        getData: function() {
            schoolReportStore.setOperate(operate);
            var schoolInfo = schoolReportStore.getSchoolInfo(schoolId);

            var orders = schoolReportStore.getOrders(schoolId);
            $.each(orders, function(index, item) {
                if(item.id == vm.currentOrderId){
                    item.checked = true;
                }else{
                    item.checked = false;
                }
            });
            vm.orders = orders;
            vm.schoolInfo = schoolInfo;
        },

        getSelectOrder: function() {
            return $.grep(vm.orders, function(item) {
                return item.checked == true;
            });
        },

        detail: function(order) {
            var url = ajax.composeUrl(webName + '/views/report/school-order-preview.html', {
                orderId: order.id,
                id:schoolId,
                operate:operate
            });
            var btn = ['打印','关闭'];
            if(order.orderAuditStatus == '1' || order.orderAuditStatus == '4'){
                //已提审  审核通过
                btn = btn.push('提审');
            }
            var index = parent.layer.open({
                type: 2,
                title: "查看订单",
                area: ['80%', '90%'],
                scrollbar: false,
                content: url,
                btn: btn,
                btn3: function(index, layero) {
                    if(order.orderAuditStatus == '2' || order.orderAuditStatus == '3'){
                        toast.warn('不能提审');
                        return;
                    }else{
                        ajax.request(schoolReportApi.getUrl('submitAudit'), {
                            orderId: order.id
                        }, function() {
                            toast.success('订单已提审');
                            parent.layer.closeAll();
                            parent.list.refresh();
                            // parent.layer.close(index);
                        });
                    }


                    return false;
                },
                yes: function() {
                    console.log('打印');
                    return false;
                },
                btn2: function(index) {
                    parent.layer.close(index);
                    return false;
                },
                close: function() {
                    parent.layer.closeAll();
                    parent.list.refresh();
                }
            });
            parent.layer.full(index);
        },

        deleteOrder: function() {
            var orders = controller.getSelectOrder();
            if (orders.length == 0) {
                toast.warn('请选择订单后再删除！');
                return;
            }


            layer.confirm('确定删除这个订单吗？', {
                icon: 3,
                title: '提示'
            }, function(index) {
                var ids = $.map(orders, function(item) {
                    return item.id;
                });
                ajax.request(schoolReportApi.getUrl('deleteOrders'), {
                    orderIds: ids
                }, function() {
					vm.orders.remove(orders[0]);
                    toast.success('删除成功!');
                });

                layer.close(index);
            });
        },

        modifyOrder: function() {
            var orders = controller.getSelectOrder();
            if (orders.length == 0) {
                toast.warn('请选择订单后再修改！');
                return;
            }
            var url = ajax.composeUrl(webName + '/views/report/school-choose-order2.html', {
                orderId: orders[0].id
            });
            var index = parent.layer.open({
                type: 2,
                title: "修改订单",
                area: ['80%', '90%'],
                scrollbar: false,
                content: url
            });
            parent.layer.full(index);
        },

        /**
         * 将订单数据分割出分中心数据和产品信息
         * @return {[type]}                [description]
         * @author nabaonan
         * @date   2017-09-14T13:45:47+080
         */
        splitData: function(orderInfo) {
            var productKeys = ['commodityId', 'schoolOrderLevels', 'accountType', 'schoolYear', 'effDate'];
            var branchCenterKeys = ['centerId', 'centerCode', 'salesman', 'contractId', 'amounts'];


            var product = {};
            var branchCenterInfo = {};
            $.each(orderInfo, function(prop, value) {
                if ($.inArray(prop, productKeys) !== -1) {
                    product[prop] = value;
                }
                if ($.inArray(prop, branchCenterKeys) !== -1) {
                    branchCenterInfo[prop] = value;
                }
            });

            //获取合同类型
            ajax.request(contractApi.getUrl('getContractInfo'), {
                contractId: branchCenterInfo.contractId
            }, function(result) {
                branchCenterInfo.contractType = result.data.contractInfo.cooperationType;
            });

            //获取分中心额度
            ajax.request(schoolReportApi.getUrl('getBranchCenterQuota'),{
                branchCenterId:branchCenterInfo.centerId
            },function(result) {
                branchCenterInfo.amounts = result.data.amounts;
            },false);

            return {
                productInfo:product,
                branchCenterInfo:branchCenterInfo
            };
        },

        bindEvent: function() {

            var orderInfo = schoolReportStore.getCurrentOrderInfo();
            vm.currentOrderId = orderInfo.id;
            vm.choose = function(order) {
                this.orders.forEach(function(item) {
                    if (item.orderNumber != order.orderNumber) {
                        item.checked = false;
                    }
                });

                if(orderInfo.id != order.id){
                    var accountInfo = schoolReportStore.getAccountInfo();
                    accountInfo = {};//如果切换订单，则清空缓存的帐号数据
                }

            };

            vm.detail = controller.detail;
            $('body').off('click','.next').on('click', '.next', function() {
                var orders = controller.getSelectOrder();
                if (orders.length == 0) {
                    toast.warn('请选择订单后再点击下一步');
                    return;
                }
                schoolReportStore.setCurrentOrderInfo(orders[0]);

                if(operate == 'appendAccount' ){
                    var result = controller.splitData(orders[0]);

                    schoolReportStore.setBranchCenterInfo(result.branchCenterInfo);
                    schoolReportStore.setProductInfo(result.productInfo);
                    var accountInfo = schoolReportStore.getAccountInfo();
                    //侯艳松说这里需要调用新开帐号接口，传markId  isExport  orderId
                    ajax.request(schoolReportApi.getUrl('newOpenAccount'),null,function(result) {
                        accountInfo.markId = result.data.markId;
                        accountInfo.isExportData = result.data.isExportData;
                        $('body').load('./school-account-info.html');
                    },true,null,null,{
                        contentType:'application/json;charset=utf-8;',
                        data:JSON.stringify({
                            isExportData: accountInfo.isExportData,
                            markId: accountInfo.markId,
                            orderId:orders[0].id
                        })
                    });
                }else if(operate == 'viewAccount'){
                    $('body').load('./school-account-info.html');
                }else if(operate == 'modify'){
                    $('body').load('./school-baseinfo-update.html');
                }else if(operate == 'viewClass'){
                    ajax.request(schoolReportApi.getUrl('getViewClassUrl'), {
                        orderId: orders[0].id
                    }, function(result) {
                        var url = result.data.url;
                        var index = layer.open({
                            type: 2,
                            title: "查看班级",
                            area: ['80%', '90%'],
                            scrollbar: false,
                            content: url
                        });
                        layer.full(index);
                    });
                }else if(operate == 'configClass'){
                    ajax.request(schoolReportApi.getUrl('getConfigClassUrl'), {
                        orderId: orders[0].id
                    }, function(result) {
                        var url = result.data.url;

                        var index = layer.open({
                            type: 2,
                            title: "配置班级",
                            area: ['80%', '90%'],
                            scrollbar: false,
                            content: url
                        });
                        layer.full(index);
                    });
                }else{
                    $('body').load('./school-product-update.html');
                }

            });

            $('body').off('click','.delete').on('click', '.delete', controller.deleteOrder);
            $('body').off('click','.modify').on('click', '.modify', controller.modifyOrder);
            $('body').off('click','.cancel').on('click', '.cancel', function() {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
    			parent.layer.close(index); //再执行关闭
            });

        }

    };

    controller.init();
});
