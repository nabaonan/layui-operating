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
    'school-report-store',
    'key-bind',
    'valid-login'
];

var vm = avalon.define({
    $id: 'choose-order',
    schoolInfo: {},
    orders: [],
    managers: [],
    detail: '',
    operate: '',
    audit: '',
    choose: function(order) {
        this.orders.forEach(function(item) {
            if (item.orderNumber != order.orderNumber) {
                item.checked = false;
            }
        });
    }

});

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
    ajax,
    toast,
    schoolReportApi,
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
                item.checked = false;
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
                operate:operate,
                id:schoolId
            });
            var index = parent.layer.open({
                type: 2,
                title: "查看订单",
                scrollbar: false,
                content: url
            });
            parent.layer.full(index);
        },

        audit: function(order) {
            var url = ajax.composeUrl(webName + '/views/report/school-order-preview.html', {
                orderId: order.id,
                id:schoolId,
                operate: operate
            });

            var index = parent.layer.open({
                type: 2,
                title: "审核",
                scrollbar: false,
                content: url,
                btn: ['审核通过', '驳回'],
                yes: function(index) {

                    parent.layer.confirm('你确认要通过该报单审核吗?', {
                        icon: 3,
                        title: '提示'
                    }, function(index) {
                        ajax.request(schoolReportApi.getUrl('auditOrder'), {
                            auditOpinion: '',
                            orderId: order.id,
                            isPass: '1'
                        },function() {
                            toast.success('审核通过');
                            parent.list.refresh();
                            layer.close(index);
                            parent.layer.closeAll();
                        },true,function() {
                            layer.close(index);
                            parent.layer.closeAll();
                        });
                    });

                },
                btn2: function(index) {
                    layer.prompt({
                        formType: 2,
                        value: '',
                        title: '请填写驳回的原因',
                        area: ['500px', '100px'] //自定义文本域宽高
                    }, function(value, index, elem) {
                        ajax.request(schoolReportApi.getUrl('auditOrder'), {
                            auditOpinion: value,
                            orderId: order.id,
                            isPass: '-1'
                        },function() {
                            toast.success('驳回成功');
                            parent.list.refresh();
                            layer.close(index);
                            parent.layer.closeAll();
                        },true,function() {
                            layer.close(index);
                            parent.layer.closeAll();
                        });
                    });

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
                    if(vm.orders.length == 0){
                        parent.layer.close(index);
                    }
                    toast.success('删除成功!');
                });

                layer.close(index);
            });
        },



        bindEvent: function() {

            vm.detail = controller.detail;
            vm.audit = controller.audit;

            $('body').off('click', '.next').on('click', '.next', function() {
                var orders = controller.getSelectOrder();
                if (orders.length == 0) {
                    toast.warn('请选择订单后再点击下一步');
                    return;
                }
                schoolReportStore.setCurrentOrderInfo(orders[0]);

                $('body').load('./school-product-update.html',{
                    orderId:orders[0].id
                });
            });

            $('body').off('click', '.cancel').on('click', '.cancel', function() {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });

            $('body').off('click', '.delete').on('click', '.delete', controller.deleteOrder);

        }

    };

    controller.init();
});
