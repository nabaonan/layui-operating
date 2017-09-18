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
    'form',
    'request',
    'school-report-api',
    'file-api',
    'school-report-store',
    'key-bind',
    'toast',
    'form-util',
    'order-util',
    'valid-login'
];

var vm = avalon.define({
    $id: 'school-order-info',
    operate: '',
    schoolInfo: {},
    productInfo: {},
    branchCenterInfo: {},
    commoditys: [],
    chargebacks: [],
    choosed: 2,
    discountPrice: 0,//本次优惠金额
    discountQuota: 0,//本次优惠额度
    realTotal:0,//实收总计
    orderTotal:0,//订单总额（包括历史  额度和金额）

    currentRealPrice:0,//本次实收金额
    currentRealQuota:0,//本次实收额度
    shouldTotalPrice:0,//本次应收金额
    shouldTotalQuota:0,//本次应扣额度
    totalPrice: 0,//总金额（实收）
    totalQuota: 0,//总额度（实收）
    showQuota: false,
    showPrice: false,
    showTotalPrice: false,
    showTotalQuota: false,
    showPayType: false,
    leftQuota: 0,
    change: '',
    changeReal:'',//改变实收价格
    defaultChargeType:'',//默认的扣款方式
    schoolNumber: 0,
    managers: [], //管理员信息
    $computed: {
        leftSchoolNumber: {
            get: function() {
                return this.schoolNumber - 1;
            }
        }
    },

    renderRadio: function() {

    }
});

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
    element,
    form,
    ajax,
    schoolReportApi,
    fileApi,
    schoolReportStore,
    keyBind,
    toast,
    formUtil,
    orderUtil
) {
    var $ = layui.jquery;
    var count = 0;
    var schoolId = ajax.getFixUrlParams('id');
    var f = form();
    var $table = $('#product-table');


    var controller = {
        init: function() {
            f.render('radio');
            this.bindEvent();
            vm.schoolInfo = schoolReportStore.getSchoolInfo();
            vm.managers = schoolReportStore.getManagers();

            schoolId = vm.schoolInfo.id;
            controller.renderPayType();
            controller.renderData();
        },

        renderData: function() {
            var orderInfo = schoolReportStore.getCurrentOrderInfo();

            formUtil.renderData($('#payment-form'),orderInfo);
            if(orderInfo.contractPath){
                controller.renderPic(orderInfo.saleContractName,orderInfo.contractPath);
            }

            vm.operate = schoolReportStore.getOperate();
            var productInfo = schoolReportStore.getProductInfo();
            vm.productInfo = productInfo;
            vm.branchCenterInfo = schoolReportStore.getBranchCenterInfo();

            var tempOrderInfo = schoolReportStore.getTempOrderInfo();

            //读取缓存数据
            if(tempOrderInfo && tempOrderInfo.schoolOrderCommodities){
                //读缓存逻辑
                $.each(tempOrderInfo.schoolOrderCommodities,function(index, commodity) {
                    if(commodity.isEffective == '1'){//如果是商品
                        // 设置缓存数据的教师数和学生数
                        var accountInfo = schoolReportStore.getAccountInfo();
                        commodity.studentNumber = accountInfo.totalStudentNumber;
                        commodity.teacherNumber = accountInfo.teacherNumber;
                    }
                    vm.commoditys.push(commodity);
                });
            }else{
                //新初始化逻辑

                //以下三种情况需要显示历史学生和老师数量
                if(
                    vm.operate == 'appendAccount' ||//追加帐号
                    vm.operate == 'change' || //改单
                    vm.operate == 'modify'//修改订单
                ){//如果是追加则回显之前添加的商品
                    $.each(orderInfo.schoolOrderCommodities,function(index, commodity) {
                        if(commodity.isEffective == '1'){//如果是商品
                            var accountInfo = schoolReportStore.getAccountInfo();
                            commodity.oldStudentNumber = commodity.studentNumber;
                            commodity.oldTeacherNumber = commodity.teacherNumber;
                            commodity.studentNumber = accountInfo.totalStudentNumber;
                            commodity.teacherNumber = accountInfo.teacherNumber;
                            commodity.originalPrice = (commodity.originalPrice/100).toFixed(2);
                            commodity.currentPrice = (commodity.currentPrice/100).toFixed(2);
                            commodity.fixedPrice = commodity.currentPrice;//商品的定价等于商品的现价
                            commodity.isValid = orderUtil.getValidStatus(commodity.startDate,commodity.stopDate);
                            commodity.leftDays = orderUtil.getLeftDays(commodity.startDate,commodity.stopDate);
                        }
                        vm.commoditys.push(commodity);
                    });
                }else{
                    var accountInfo = schoolReportStore.getAccountInfo();

                    //请求最新数据
                    ajax.request(schoolReportApi.getUrl('productDetail'), {
                        commodityId: productInfo.commodityId
                    }, function(result) {
                        var totalResult = {};
                        totalResult.schoolLevelName = result.data.schoolLevelName;
                        totalResult.commodityName = result.data.commodityName;
                        totalResult.fixedPrice = (result.data.fixedPrice/100).toFixed(2);//商品的定价等于商品的现价
                        totalResult.originalPrice = (result.data.originalPrice/100).toFixed(2);

                        totalResult.commodityId = productInfo.commodityId;
                        totalResult.studentNumber = accountInfo.totalStudentNumber;
                        totalResult.teacherNumber = accountInfo.teacherNumber;
                        totalResult.gradeNumber = accountInfo.gradeNumber;
                        totalResult.newStudentNumber = accountInfo.grades.newStudentNumber;
                        totalResult.startDate = productInfo.startDate;
                        totalResult.stopDate = productInfo.stopDate;
                        totalResult.accountTypeName = productInfo.accountTypeName;
                        totalResult.accountType = productInfo.accountType;
                        totalResult.isEffective = '1';

                        totalResult.number = 1;
                        totalResult.netReceipts = totalResult.fixedPrice;
                        totalResult.chargeback = vm.defaultChargeType;//设置商品默认的扣款方式

                        totalResult.isValid = orderUtil.getValidStatus(productInfo.startDate,productInfo.stopDate);
                        totalResult.leftDays = orderUtil.getLeftDays(productInfo.startDate,productInfo.stopDate);
                        vm.commoditys.push(totalResult);
                    });
                }
            }
        },

        renderPayType: function() {
            var contractType = schoolReportStore.getBranchCenterInfo().contractType;
            vm.contractType = contractType;
            var productInfo = schoolReportStore.getProductInfo();
            //帐号类型1正式零售
            //帐号类型3试用
            if (contractType == '5' || contractType == '6') { //直营或合营
                vm.chargebacks = [{
                    value: '1',
                    name: '新缴费'
                }, {
                    value: '3',
                    name: '不收费'
                }];

                if (productInfo.accountType == '1') { //正式零售
                    vm.chargebacks = [{
                        value: '1',
                        name: '新缴费'
                    }, {
                        value: '3',
                        name: '不收费'
                    }];
                    vm.defaultChargeType = '1';
                } else { //试用  其他
                    vm.chargebacks = [{
                        value: '3',
                        name: '不收费'
                    }, {
                        value: '1',
                        name: '新缴费'
                    }];
                    vm.defaultChargeType = '3';
                }

            } else if (contractType == '4') { //如果为买断
                vm.chargebacks = [{
                    value: '1',
                    name: '新缴费'
                }, {
                    value: '3',
                    name: '不收费'
                }];
                vm.defaultChargeType = '1';
            } else {
                if (productInfo.accountType == '1') { //正式零售
                    vm.chargebacks = [{
                            value: '1',
                            name: '新缴费'
                        }, {
                            value: '3',
                            name: '不收费'
                        },
                        {
                            value: '2',
                            name: '扣额度'
                        }
                    ];
                    vm.defaultChargeType = '1';
                } else { //试用  其他
                    vm.chargebacks = [{
                        value: '3',
                        name: '不收费'
                    }, {
                        value: '1',
                        name: '新缴费'
                    }, {
                        value: '2',
                        name: '扣额度'
                    }];
                    vm.defaultChargeType = '3';
                }
            }
        },

        composeData: function(data) {
            var branchCenterInfo = schoolReportStore.getBranchCenterInfo();
            var schoolInfo = schoolReportStore.getSchoolInfo();
            var schoolOrderLevels = [];
            var schoolLevels = [];
            $.each(vm.productInfo.schoolOrderLevels,function(index, value) {
                schoolOrderLevels.push({
                    levelId:value
                });
            });
            vm.productInfo.schoolOrderLevels = schoolOrderLevels;

            $.each(vm.schoolInfo.schoolLevels,function(index, value) {
                schoolLevels.push({
                    levelId:value
                });
            });
            schoolInfo.schoolLevels = schoolLevels;

            var order = schoolReportStore.getCurrentOrderInfo();
            var commodities = vm.commoditys;
            var accountInfo = schoolReportStore.getAccountInfo();

            var schoolOrder = {};

            schoolOrder = $.extend(true, vm.productInfo,branchCenterInfo,order,schoolOrder, data);

            schoolOrder.contractPath = $('#pic-container img').map(function() {
                return $(this).data('url');
            }).get().join(',');
            schoolOrder.schoolOrderTeachers = accountInfo.teachers;
            schoolOrder.schoolOrderGradeRess = accountInfo.grades.gradeInfo;
            // schoolOrder.schoolOrderLevels = schoolOrderLevels;

            schoolOrder.schoolOrderCommodities = commodities;

            schoolOrder.receivableAmount = vm.shouldTotalPrice;
            schoolOrder.deductibleDue = vm.shouldTotalQuota;
            schoolOrder.preferentialLimit = vm.discountQuota;
            schoolOrder.preferentialAmount = vm.discountPrice;
            schoolOrder.buttonAmount = vm.currentRealPrice;//本次实收金额
            schoolOrder.paidInTotal = vm.currentRealQuota;//本次实扣额度

            if(vm.operate == 'appendAccount'){
                schoolOrder.historyOrderTotalAmount = vm.totalPrice;//订单总金额
                schoolOrder.historyOrderTotalQuota = vm.totalQuota;//订单总额度
            }

            var actionType = '';
            switch (vm.operate) {
                case 'add':
                    actionType = 1;
                    break;
                case 'modify':
                    actionType = 2;
                    break;
                case 'appendOrder':
                    actionType = 3;
                    break;
                case 'change':
                    actionType = vm.productInfo.actionType;
                    break;
                case 'appendAccount':
                    actionType = 6;
                    break;
            }

            return {
                markId: accountInfo.markId,
                actionType: actionType,
                schoolInfo: schoolInfo,
                schoolOrder: schoolOrder
            };

        },

        reSubmit: function(submitData) {
            layer.confirm('额度已超，是否继续生成订单？', {
                icon: 3,
                title: '错误提示',
                btn: ['退出报单', '生成订单']
            }, function(index) {
                console.log('取消报单');
                layer.close(index);
            }, function(index) {
                console.log('生成订单');
                controller.submitOrder(submitData);
            });
        },

        submitOrder: function(submitData) {
            ajax.request(schoolReportApi.getUrl('updateSchoolOrder'), null, function(result) {

                var orderId = result.data.id;
                var schoolId = result.data.schoolId;
                var url = ajax.composeUrl(webName + '/views/report/school-order-preview.html', {
                    id: schoolId,
                    orderId: orderId
                });

                var index = parent.layer.open({
                    type: 2,
                    title: "预览",
                    area: ['80%', '90%'],
                    scrollbar: false,
                    content: url,
                    btn: ['提审', '打印', '关闭'],
                    yes: function(index, layero) {

                        ajax.request(schoolReportApi.getUrl('submitAudit'), {
                            orderId: orderId
                        }, function() {
                            toast.success('订单已提审');
                            parent.layer.closeAll();
                            parent.list.refresh();
                            // parent.layer.close(index);
                        });
                        return false;
                    },
                    btn2: function() {
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
                        return false;
                    },
                    btn3: function() {
                        parent.layer.closeAll();
                        parent.list.refresh();
                    },
                    close: function() {
                        parent.layer.closeAll();
                        parent.list.refresh();
                    }
                });
                parent.layer.full(index);
                // var pindex = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                // parent.layer.close(pindex); //再执行关闭
            }, true, function(result) {
                switch (result.errorCode) {
                    case 10001:
                        controller.reSubmit(submitData);
                        break;
                    case 10002:
                        layer.open({
                            type: 1,
                            content: '额度已超，请缴纳剩余首批进货款后在再报单！',
                            btn: '确定',
                            btnAlign: 'c',
                            yes: function(index) {
                                layer.close(index);
                            }
                        });
                }
            }, null, {
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(submitData)
            });
        },

        renderPic: function(fileName,url) {
            var $container = $('<div>', {
                class: 'pic'
            });

            var $closeBtn = $('<div>', {
                class: 'closeBtn',
                html: '✖'
            });

            var $img = $('<img>', {
                src: url,
                alt: fileName,
                'layer-src': url,
                'data-url': url
            });
            $('#filePath').val(url);

            $container.append([$img, $closeBtn]).appendTo($('#pic-container'));
            layer.photos({
                photos: '#pic-container',
                closeBtn: true
            });
        },

        bindEvent: function() {

            $('.prev').off('click').on('click', function() {
                var tempOrderInfo = schoolReportStore.getTempOrderInfo();

                tempOrderInfo.schoolOrderCommodities = vm.commoditys;
                $('body').load('./school-account-info.html');
            });

            //删除
            $('body').on('click', '.delete-commodity', function() {
                var $tr = $(this).parents('tr');
                var index = $('table tbody tr').index($tr) - 1; //因为这个index从1开始
                vm.commoditys.removeAt(index); //数组下标从零开始
            });

            $('.add-payment').click(function() {

                vm.commoditys.push({
                    "commodityId": '',
                    "schoolLevel": "",
                    "studentNumber": "",
                    "teacherNumber": "",
                    "accountType": "",
                    "studentsNumber": "",
                    "oldStudentNumber": "",
                    "oldTeacherNumber": "",
                    "commodityName": "",
                    "fixedPrice": 0,
                    "number": 0,
                    "netReceipts": 0,
                    "chargeback": vm.defaultChargeType,
                    "remark": "",
                    "validPeriod": "",
                    "isEffective":"2",
                    "hasPayed":"2"//1已付费，2未付费
                });
            });

            vm.schoolNumber = 10;
            vm.leftQuota = 100;

            //选择
            $('.choose').unbind().click(function() {
                $('#file').trigger('click');
            });

            //文件名
            $('#file').change(function() {
                var fileName = $(this).val();
                var pos = fileName.lastIndexOf("\\");
                $('#fileName').val(fileName.substring(pos + 1));
            });

            // //改变实收价格
            // vm.changeReal = function(index){
            //         console.log(index,this.commoditys);
            //         this.commoditys[index].netReceipts = parseFloat(this.commoditys[index].fixedPrice) * this.commoditys[index].number;
            //         this.commoditys.set(index,this.commoditys[index]);
            //         // item.netReceipts = item.fixedPrice * item.number;
            //         // debugger;
            //
            // };

            var changePrice = function() {

                var showQuota = false,
                    showPrice = false,
                    showPayType = false;
                    showTotalQuota = false;
                    showTotalPrice = false;
                var orderTotal = 0,//订单总额

                    totalQuota = 0,//订单总额度
                    totalPrice = 0,//订单总金额
                    shouldTotal = 0,//应收总计（（金额+额度））
                    shouldTotalQuota = 0,//应收额度（本次的）
                    shouldTotalPrice = 0,//应收金额（本次的）
                    currentRealPrice = 0,//本次实收金额
                    currentRealQuota = 0,//本次实收额度
                    realTotal = 0;//本次实收总计（实际金额+实际额度）
                var discountQuota = 0,
                    discountPrice = 0;

                for (var i = 0; i < vm.commoditys.length; i++) {

                    if (vm.commoditys[i].hasPayed == '1' && vm.operate == 'appendAccount') { //只有在追加帐号时候 已缴费 的 结算时候不能算上
                        if (vm.commoditys[i].chargeback == '2') { //扣额度
                            showQuota = true;
                            totalQuota += parseFloat(vm.commoditys[i].netReceipts);
                        }else if (vm.commoditys[i].chargeback == '3') { //不收费
                            showPrice = true;
                            totalPrice += parseFloat(vm.commoditys[i].netReceipts);
                        }
                        else if (vm.commoditys[i].chargeback == '1') { //新缴费
                            showPrice = true;
                            totalPrice += parseFloat(vm.commoditys[i].netReceipts);
                        }
                    }else{

                        if (vm.commoditys[i].chargeback == '2') { //扣额度
                            showQuota = true;
                            totalQuota += parseFloat(vm.commoditys[i].netReceipts);
                            currentRealQuota += parseFloat(vm.commoditys[i].netReceipts);
                            shouldTotalQuota += parseFloat(vm.commoditys[i].fixedPrice * vm.commoditys[i].number);
                            discountQuota += parseFloat(vm.commoditys[i].fixedPrice * vm.commoditys[i].number - vm.commoditys[i].netReceipts);
                            // discountQuota = parseFloat(discountQuota).toFixed(2);
                            // shouldTotalQuota = parseFloat(shouldTotalQuota).toFixed(2);
                            // debugger;
                        } else if (vm.commoditys[i].chargeback == '1') { //新缴费
                            showPrice = true;
                            showPayType = true;
                            totalPrice += parseFloat(vm.commoditys[i].netReceipts);
                            currentRealPrice += parseFloat(vm.commoditys[i].netReceipts);
                            shouldTotalPrice += parseFloat(vm.commoditys[i].fixedPrice) * vm.commoditys[i].number;
                            discountPrice += parseFloat(vm.commoditys[i].fixedPrice) * vm.commoditys[i].number - parseFloat(vm.commoditys[i].netReceipts);
                            // discountPrice = parseFloat(discountPrice).toFixed(2);
                        } else if (vm.commoditys[i].chargeback == '3') { //不收费
                            showPrice = true;
                            vm.commoditys[i].netReceipts = 0;

                            shouldTotalPrice += parseFloat(vm.commoditys[i].fixedPrice) * vm.commoditys[i].number;
                            discountPrice += parseFloat(vm.commoditys[i].fixedPrice) * vm.commoditys[i].number;
                            // discountPrice = parseFloat(discountPrice).toFixed(2);
                        }


                    }
                }
                realTotal = currentRealPrice + currentRealQuota;
                orderTotal = totalPrice + totalQuota;
                vm.realTotal = realTotal.toFixed(2);
                vm.showTotalQuota = showTotalQuota;
                vm.showTotalPrice = showTotalPrice;
                vm.showPayType = showPayType;
                vm.showQuota = showQuota;
                vm.showPrice = showPrice;
                vm.currentRealPrice = currentRealPrice.toFixed(2);
                vm.currentRealQuota = currentRealQuota.toFixed(2);
                vm.discountQuota = discountQuota.toFixed(2);
                vm.discountPrice = discountPrice.toFixed(2);
                vm.orderTotal = orderTotal.toFixed(2);

                vm.totalQuota = totalQuota.toFixed(2);
                vm.totalPrice = totalPrice.toFixed(2);
                vm.shouldTotalPrice = shouldTotalPrice.toFixed(2);
                vm.shouldTotalQuota = shouldTotalQuota.toFixed(2);
            };

            vm.$watch('commoditys', changePrice);
            vm.change = changePrice;
            vm.renderRadio = function() {
                setTimeout(function(){
                    f.render('radio');
                },0);
            };

            $('.upload').click(function() {
                var fileName = $('#fileName').val();
                var suffix = fileName.split('.')[1];
                if (suffix == 'jpg' || suffix == 'png' || suffix == 'jpeg') {
                    $('#payment-form').ajaxSubmit({
                        url: fileApi.getUrl('uploadFile').url,
                        type: 'post',
                        dataType: 'json',
                        // clearForm: true,
                        // resetForm: true,
                        success: function(result) {
                            toast.success('上传成功');
                            // var url = webName + '../' + result.data.url;
                            var url = result.data.url;

                            controller.renderPic(fileName,url);
                        },
                        error: function() {
                            toast.error('上传失败');
                        }
                    });
                } else {
                    toast.warn('上传的合同只能为图片');
                }

            });

            $('body').on('click', '.closeBtn', function() {
                $(this).parent().remove();
            });

            f.on('submit(school-order-form)', function(data) {

                var submitData = controller.composeData(data.field);
                controller.submitOrder(submitData);
                return false;
            });
        }

    };

    controller.init();
});
