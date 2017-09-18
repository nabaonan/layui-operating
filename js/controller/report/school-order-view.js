/**
 * 学校开通单
 * @type {[type]}
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'element',
    'layer',
    'form',
    'request',
    'school-report-api',
    'file-api',
    'school-report-store',
    'key-bind',
    'toast',
    'order-util',
    'valid-login'
];

var vm = avalon.define({
    $id: 'school-order-view',
    schoolInfo: {},
    orderInfo: {},
    operate:'',
    audits: [], //审核列表
    managers: [], //管理员信息
    showQuota: false, //显示额度
    showPrice: false, //显示金额
    showPayMethod:false,//显示付款方式
    renderPic: function() {

    }
});

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
    element,
    layer,
    form,
    ajax,
    schoolReportApi,
    fileApi,
    schoolReportStore,
    keyBind,
    toast,
    orderUtil
) {
    var $ = layui.jquery,
        count = 0,
        param = ajax.getAllUrlParam(),
        schoolId = param.id,
        orderId = param.orderId,
        operate = param.operate,
        f = form(),
        $table = $('#product-table');

    var controller = {
        init: function() {
            f.render('radio');
            this.bindEvent();
            this.getData();
            vm.managers = schoolReportStore.getManagers();
            vm.schoolInfo = schoolReportStore.getSchoolInfo(schoolId);
            vm.operate = operate;
            if (operate == 'audit' || operate == 'auditView') {

                this.getAudits();
            }
        },

        getAudits: function() {
            ajax.request(schoolReportApi.getUrl('getAuditList'), {
                orderId: orderId
            }, function(result) {
                vm.audits = result.data;
            });
        },

        getData: function() {
            ajax.request(schoolReportApi.getUrl('getOrderInfo'), {
                orderId:orderId
            }, function(result) {
                var showPrice = false;
                var showQuota = false;
                var showPayMethod = false;
                $.each(result.data.schoolOrderCommodities, function(index, order) {
                    //1 新缴费 2不收费 3扣额度
                    if(order.chargeback == '1'){//只有新缴费才显示付款方式
                        showPayMethod = true;
                    }
                    if (order.chargeback == '1' || order.chargeback == '2') {
                        showPrice = true;

                    } else if (order.chargeback == '3') {
                        showQuota = true;
                    }
                    //只有有效商品才除100
                    if(order.isEffective == '1'){
                        order.isValid = orderUtil.getValidStatus(order.startDate,order.stopDate);
                        order.leftDays = orderUtil.getLeftDays(order.startDate,order.stopDate);
                        order.currentPrice = (order.currentPrice/100).toFixed(2);
                        order.fixedPrice = (order.fixedPrice/100).toFixed(2);
                        order.originalPrice = (order.originalPrice/100).toFixed(2);
                    }


                });

                vm.showQuota = showQuota;
                vm.showPrice = showPrice;
                vm.showPayMethod = showPayMethod;
                vm.orderInfo = result.data;

                if (typeof result.data.contractPath == 'string') {
                    var arr = [];
                    var splits = result.data.contractPath.split(',');
                    var saleContractNames = result.data.saleContractName.split(',');
                    $.each(splits, function(index, value) {
                        if(!value){
                            value = '';
                        }
                        arr.push({
                            path: value,
                            fileName: '',
                            saleContractName:saleContractNames[index]
                        });

                    });
                    vm.orderInfo.contractPath = arr;

                }

            });
        },

        bindEvent: function() {

            $('.prev').off('click').on('click', function() {
                $('body').load('./school-account-info.html');
            });
            vm.renderPic = function() {
                $('#pic-container').find('img').each(function() {
                    $(this)[0].onerror = function() {
                        errorFlag = true;
                        this.src = (webName + '/image/error-pic.png');
                    };
                });
                // debugger;
                layer.photos({
                    photos: '#pic-container',
                    closeBtn: true
                });


            };
        }

    };

    controller.init();
});
