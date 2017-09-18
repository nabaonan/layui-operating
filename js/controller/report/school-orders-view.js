/**
 * 查看学校订单
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
    'order-util',
    'valid-login'
];

var vm = avalon.define({
    $id: 'show-orders',
    schoolInfo: {},
    orders: [],
    detail: '',
    enable: '',
	operate:''
});

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
    ajax,
    toast,
    schoolReportApi,
    schoolReportStore,
    keyBind,
    orderUtil
) {
    var $ = layui.jquery;
    var count = 0;
    var schoolId = ajax.getFixUrlParams('id');
	var operate = ajax.getFixUrlParams('operate');
    var controller = {
        init: function() {
            this.bindEvent();
            this.getData();
			vm.operate = operate;
        },

        getData: function() {
            var schoolInfo = schoolReportStore.getSchoolInfo(schoolId);
            var orders = schoolReportStore.getOrders(schoolId);

            $.each(orders, function(index, order) {
                $.each(order.schoolOrderCommodities,function(index, commodity) {
                    //只有有效商品才除100
                    if(commodity.isEffective == '1'){
                        commodity.isValid = orderUtil.getValidStatus(commodity.startDate,commodity.stopDate);
                        commodity.leftDays = orderUtil.getLeftDays(commodity.startDate,commodity.stopDate);
                    }
                });
            });

            vm.orders = orders;
            vm.schoolInfo = schoolInfo;
        },

        detail: function(order) {

            var url = ajax.composeUrl(webName + '/views/report/school-order-preview.html', {
                orderId: order.id,
                id:schoolId,
                operate: operate
            });

            var btn = ['打印','关闭'];
            if(order.orderAuditStatus == '1' || order.orderAuditStatus == '4'){
                //已提审  审核通过
                btn.push('提审');
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
                yes: function(index,layero) {
                    var body = parent.layer.getChildFrame('body', index);


                    $(body).print({
                        globalStyles: true,
                        mediaPrint: false,
                        stylesheet: true,
                        noPrintSelector: ".no-print",
                        iframe: true,
                        append: null,
                        prepend: null,
                        manuallyCopyFormValues: true,
                        deferred: $.Deferred(),
                        timeout: 750,
                        title: null,
                        doctype: '<!doctype html>'
                    });
                    console.log('打印');
                    return false;
                },
                btn2: function() {
                    parent.layer.closeAll();
                    parent.list.refresh();
                },
                close: function() {
                    parent.layer.closeAll();
                    parent.list.refresh();
                }
            });
            parent.layer.full(index);
        },

        enable: function(order) {

            var enableName = order.isEnable == '1' ? '停用' : '启用';
            var willStatus = order.isEnable == '1' ? '2' : '1';
            layer.confirm('确定 ' + enableName + ' 这个订单吗?', {
                icon: 3,
                title: '提示'
            }, function(index) {
                ajax.request(schoolReportApi.getUrl('enableOrder'), {
					isEnable:willStatus,
					orderId:order.id
                }, function(result) {
					toast.success(enableName+'成功！');
					order.isEnable = willStatus;
                });

                layer.close(index);
            });
        },

        bindEvent: function() {
            vm.detail = controller.detail;
            vm.enable = controller.enable;
			$('.cancel').unbind().click(function() {
				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				parent.layer.close(index); //再执行关闭
			});
        }
    };

    controller.init();
});
