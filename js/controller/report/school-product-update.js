/**
 * 学校产品
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
    'school-report-api',
    'branch-center-api',
    'contract-api',
    'school-report-store',
    'key-bind',
    'toast',
    'valid-login'
];

registeModule(window, requireModules);

var vm = avalon.define({
    $id: 'product',
    operate: '',
    branchCenterInfo: {
        id: '',
        centerCode: '',
        contractId: '',
        amounts: 0 //分中心剩余额度
    },
    schoolInfo: {

    },
    productInfo: {
        startDate: '',
        stopDate: '',
        effDate: '',
        limitStartDate: '', //商品的有效时间
        limitStopDate: '', //商品有效时间 （截至）
        years: '',
        accountType: '',
        schoolLevel: [],
        version: '',
        actionType: ''
    },
    versions: [],
    schoolLevels: [],
    accountTypes: [],
    branchCenters: [],
    years: [],
    contracts: []

});

//参数有顺序
layui.use(requireModules, function(
    element,
    form,
    layer,
    ajax,
    formUtil,
    tableUtil,
    schoolReportApi,
    branchCenterApi,
    contractApi,
    schoolReportStore,
    keyBind,
    toast
) {
    var $ = layui.jquery;
    var f = form();
    var count = 0;
    var $form = $('#product-info');
    var orderId = ajax.getFixUrlParams('orderId');
    var operate;
    var levelrendered = false;
    var accoutTypeRendered = false;
    var contractRendered = false;
    var productInfo;

    var controller = {

        init: function() {
            // vm.actionType = schoolReportStore.getActionType();
            vm.schoolInfo = schoolReportStore.getSchoolInfo();
            operate = schoolReportStore.getOperate();
            vm.operate = operate;
            if (operate == 'appendOrder') {
                orderId = '';
            }
            productInfo = schoolReportStore.getProductInfo(orderId);
            var currentOrder = schoolReportStore.getCurrentOrderInfo();

            controller.bindEvent();

            // controller.renderSchoolLevel();
            controller.renderVersion();
            controller.renderAccountType();
            //            controller.renderYears();//暂时不能删
            controller.renderBranchCenter();

            var interval = setInterval(function() {
                if (count == 3) {
                    clearInterval(interval);
                    if (operate == 'change' || operate == 'modify') { //改单 修改
                        controller.renderData(orderId);
                    } else {
                        controller.renderData();
                    }
                    f.render();
                }
            }, 0);

        },

        renderData: function(orderId) {

            var branchCenterInfo = schoolReportStore.getBranchCenterInfo(orderId);

            var schoolLevels = [];
            // var keys = ['commodityId', 'accountType', 'schoolYear'];//先不删除
            var keys = ['commodityId', 'accountType','actionType']; //学年暂时不用
            if (productInfo) {
                $.each(productInfo, function(prop, value) {
                    if ($.inArray(prop, keys) != -1) {
                        if (!(value instanceof Array)) {
                            productInfo[prop] = value.split(',');
                        }
                    }
                });
                if (!productInfo.startDate) {
                    productInfo.effDate = '';
                } else {
                    productInfo.effDate = productInfo.startDate + ' ~ ' + productInfo.stopDate;
                }
            }

            var data = $.extend(true, {}, productInfo, branchCenterInfo);
            formUtil.renderData($form, data);
            $('#branch-center').next('.layui-form-select').find('.layui-this').trigger('click');
            if (orderId) {

                setTimeout(function() {

                    $(':radio[name="commodityId"]:checked').next('.layui-form-radio').trigger('click');

                    // setTimeout(function(){
                    //     if(contractRendered){
                    //         formUtil.renderData($form, {
                    //             contractId:productInfo.contractId
                    //         });
                    //         $(':radio[name="contractId"]:checked').next('.layui-form-radio').trigger('click');
                    //
                    //     }
                    // },0);

                    var interval = setInterval(function() {
                        if (levelrendered) {
                            formUtil.renderData($form, {
                                schoolOrderLevels: data.schoolOrderLevels
                            });
                            if (operate == 'change') { //如果是改单 分中心信息禁用 改单的时候学段都不可以选了
                                $(':checkbox[name="schoolOrderLevels"]').attr('disabled', true);
                                $('#branch-center').attr('disabled', true);

                                $('#contract').next('.layui-form-select').find('.layui-this').trigger('click');//为了触发请求合同的有效期范围
                                $('#contract').attr('disabled', true);


                                $('input[name="centerCode"]').attr('readonly', true);
                                if (productInfo && (productInfo.accountType == '2' || productInfo.accountType == '1')) { //帐号类型为正式买断或正式零售，不能更换其他帐号类型
                                    $(':radio[name="accountType"][value!="' + productInfo.accountType + '"]').attr('disabled', true);
                                }
                                setTimeout(function() {
                                    $(':radio[name="actionType"]:checked').next('.layui-form-radio').trigger('click');

                                },100);

                                f.render();
                            }
                            clearInterval(interval);
                        }
                    }, 0);
                }, 0);
            } else {

                var $commodity = $(':radio[name="commodityId"]:checked');
                if ($commodity.length > 0) {
                    $commodity.next('.layui-form-radio').trigger('click');
                    var interval = setInterval(function() {
                        if (levelrendered) {
                            formUtil.renderData($form, {
                                schoolOrderLevels: data.schoolOrderLevels
                            });
                            clearInterval(interval);
                        }
                    }, 0);
                }
            }

            formUtil.renderData($form, branchCenterInfo);

            f.render();

        },

        //产品版本
        renderVersion: function() {
            ajax.request(schoolReportApi.getUrl('queryProductVersions'), {

            }, function(result) {
                // vm.versions = result.data;
                formUtil.renderRadios('#version', result.data, 'commodityId', 'commodity');
                $('#version option[value="-1"]').val('').html('请选择'); //不显示全部

                count++;
            });
        },

        //学段
        renderSchoolLevel: function(commodityId) {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_level',
                commodityId: commodityId
            }, function(result) {

                // vm.schoolLevels = result.data;
                formUtil.renderCheckboxes('#level', result.data, 'schoolOrderLevels', 'schoolOrderLevels', false, 'required');

                if(operate == 'change'){//如果是改单
                    //回显之前的所选学段，并且不能变更
                    console.log(productInfo.schoolOrderLevels);
                    formUtil.renderData($form,{
                        schoolOrderLevels:productInfo.schoolOrderLevels
                    });
                    $(':checkbox[name="schoolOrderLevels"]').attr('disabled', true);
                }

                f.render('checkbox');
                levelrendered = true;
            });
        },

        //帐号类型
        renderAccountType: function(contractType) {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'account_type',
                contractType: contractType
            }, function(result) {
                // vm.accountTypes = result.data;
                if (contractType && contractType == 4) { //如果合同类型是买断
                    //买断的合同不能选择正式零售，非买断的合同不能选择正式买断
                    //1正式零售，2正式买断，3赠送，4试用，5演示，6体验
                    result.data = $.grep(result.data, function(item) {
                        return item.key != 1;
                    });
                } else if (contractType && contractType != 4) {
                    result.data = $.grep(result.data, function(item) {
                        return item.key != 2;
                    });
                }
                formUtil.renderRadios('#account-type', result.data, 'accountType', 'accountType');
                accoutTypeRendered = true;

                //回显accountType

                if (productInfo && productInfo.accountType) {
                    formUtil.renderData($form, {
                        accountType: productInfo.accountType
                    });
                }
                f.render('radio');
                count++;
            });
        },

        //学年
        renderYears: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: ''
            }, function(result) {
                // vm.years = result.data;
                formUtil.renderRadios('#years', result.data, 'schoolYear');
                count++;
            });
        },

        //分中心
        renderBranchCenter: function() {
            ajax.request(schoolReportApi.getUrl('queryBranchCenters'), {

            }, function(result) {

                formUtil.renderSelects('#branch-center', result.data);
                $('#branch-center option[value="-1"]').val('').html('请选择'); //不显示全部
                // f.render('select');
                count++;
            });
        },

        composeData: function(data) {
            var productKeys = ['commodityId', 'schoolOrderLevels', 'accountType', 'schoolYear', 'effDate','actionType'];
            var branchCenterKeys = ['centerId', 'centerCode', 'salesman', 'contractId', 'amounts'];

            var result = {};
            var product = {};
            var branchCenterInfo = {};
            $.each(data, function(prop, value) {
                if ($.inArray(prop, productKeys) !== -1) {
                    product[prop] = value;
                }
                if ($.inArray(prop, branchCenterKeys) !== -1) {
                    branchCenterInfo[prop] = value;
                }
            });

            var splitDate = product.effDate.split('~');
            if (splitDate.length == 2) {
                product.startDate = splitDate[0].trim();
                product.stopDate = splitDate[1].trim();
            } else {
                product.startDate = splitDate[0].trim();
                product.stopDate = splitDate[0].trim();
            }
            branchCenterInfo.amounts = vm.branchCenterInfo.amounts;

            var yearName = $(':radio[name="schoolYear"]:checked').attr('title');
            var accountTypeName = $(':radio[name="accountType"]:checked').attr('title');
            result.productInfo = product;
            result.productInfo.yearName = yearName;
            result.productInfo.accountTypeName = accountTypeName;
            result.branchCenterInfo = branchCenterInfo;
            result.branchCenterInfo.contractType = vm.branchCenterInfo.contractType;
            return result;
        },

        //提交验证
        validData: function(data) {

            var start = new Date(vm.productInfo.startDate);
            var end = new Date(vm.productInfo.stopDate);
            var limitStart = new Date(vm.productInfo.limitStartDate);
            var limitEnd = new Date(vm.productInfo.limitStopDate);

            if (start.getTime() < limitStart.getTime() || end.getTime() > limitEnd.getTime()) {
                layer.alert('有效期超出版本在商品里设置的有效期时间，请重新设置！', {
                    icon: 2
                });
                return false;
            }
            var checks = formUtil.composeCheckboxesValue($form);

            if (!data.commodityId) {
                toast.warn('请选择产品版本');
                return false;
            }
            if (!checks.schoolOrderLevels) {
                toast.warn('请选择学段');
                return false;
            }
            if (!data.accountType) {
                toast.warn('请选择帐号类型');
                return false;
            }

            if(operate == 'change' && !data.actionType){
                toast.warn('请选择改单类型');
                return false;
            }
            //            if (!data.schoolYear) {
            //                toast.warn('请选择学年');
            //                return false;
            //            }

            return true;
        },

        bindEvent: function() {

            $('body').on('change', ':radio[name="actionType"]', function() {
                console.log('change');
                $(this).click();
            });

            f.on('radio(actionType)', function(data) {
                $(data.elem).trigger('change');
            });

            //监听提交
            f.on('submit(school-product-form)', function(data) {

                var checkboxes = formUtil.composeCheckboxesValue($form);

                var param = $.extend(true, data.field, checkboxes);
                var result = controller.composeData(param);
                schoolReportStore.setProductInfo(result.productInfo);
                schoolReportStore.setBranchCenterInfo(result.branchCenterInfo);
                if ($(data.elem).hasClass('prev')) {
                    if (operate == 'change') {
                        $('body').load('./school-choose-order.html');
                    } else {
                        $('body').load('./school-baseinfo-view.html');
                    }
                } else if (controller.validData(data.field)) {

                    if ($(data.elem).hasClass('confirm') && operate == 'change') { //如果改单并点击确定


                        var schoolOrderLevels = [];
                        var schoolLevels = [];
                        $.each(result.productInfo.schoolOrderLevels,function(index, value) {
                            schoolOrderLevels.push({
                                levelId:value
                            });
                        });

                        var schoolInfo = schoolReportStore.getSchoolInfo();
                        $.each(schoolInfo.schoolLevels,function(index, value) {
                            schoolLevels.push({
                                levelId:value
                            });
                        });

                        result.productInfo.schoolOrderLevels = schoolOrderLevels;
                        schoolInfo.schoolLevels = schoolLevels;

                        var orderInfo = $.extend(true, schoolReportStore.getCurrentOrderInfo(), result.branchCenterInfo, result.productInfo);

                        var submitData = {
                            markId: '',
                            actionType: '4',//替换
                            schoolInfo: schoolInfo,
                            schoolOrder: orderInfo
                        };

                        ajax.request(schoolReportApi.getUrl('updateSchoolOrder'), null, function(result) {
                            toast.success('订单已提审！');
                            parent.layer.closeAll();
                        }, true, null, null, {
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(submitData)
                        });
                    } else if ($(data.elem).hasClass('next') && (operate == 'add' || operate == 'change' || operate == 'modify' || operate == 'appendOrder')) { //添加，改单，修改,追加订单
                        $('body').load('./school-account-import.html');
                    }

                }
                return false;
            });

            f.on('select(center)', function(data) {
                ajax.request(schoolReportApi.getUrl('queryContracts'), {
                    branchCenterId: data.value
                }, function(result) {
                    // vm.contracts = result.data;
                    formUtil.renderSelects('#contract', result.data);
                    $('#contract option[value="-1"]').val('').html('请选择'); //不显示全部
                    var branchCenterInfo = schoolReportStore.getBranchCenterInfo();
                    if (branchCenterInfo.contractId) {
                        formUtil.renderData($form, {
                            contractId: branchCenterInfo.contractId
                        });
                    }
                    contractRendered = true;
                    f.render('select');
                    $('#contract').next('.layui-form-select').find('.layui-this').trigger('click');
                });

                ajax.request(schoolReportApi.getUrl('getBranchCenterQuota'), {
                    branchCenterId: data.value
                }, function(result) {
                    vm.branchCenterInfo.centerCode = result.data.centerCode;
                    vm.branchCenterInfo.amounts = result.data.amounts;
                });
            });

            f.on('select(contract)', function(data) {
                //获取合同类型
                ajax.request(contractApi.getUrl('getContractInfo'), {
                    contractId: data.value
                }, function(result) {
                    vm.branchCenterInfo.contractType = result.data.contractInfo.cooperationType;
                    controller.renderAccountType(vm.branchCenterInfo.contractType);
                });

            });

            f.on('radio(commodity)', function(data) {
                //获取商品的有效期
                ajax.request(schoolReportApi.getUrl('queryCommodityDateRange'), {
                    commodityId: data.value
                }, function(result) {
                    vm.productInfo.limitStartDate = result.data.startDate;
                    vm.productInfo.limitStopDate = result.data.stopDate;
                });

                controller.renderSchoolLevel(data.value);
            });

            f.on('radio(actionType)',function(data) {
                console.log(data);
                    vm.productInfo.actionType = data.value;
                    if(data.value == 4){//如果是替换订单
                        //除了学段不能更改，其他都能改
                        //可以更改产品版本，但是必须包含原学段
                        $(':radio[name="commodityId"]').attr('disabled',false);
                        $(':radio[name="accountType"]').attr('disabled',false);

                    }else if(data.value == 5){
                        //如果是续费，只能更改有效期，其他都不能更改
                        // 学段和产品版本要重置成原来的
                        formUtil.renderData($form,{
                            schoolOrderLevels:productInfo.schoolOrderLevels,
                            commodityId:[productInfo.commodityId],
                            accountType:[productInfo.accountType]
                        });
                        $(':radio[name="commodityId"]').attr('disabled',true);
                        $(':radio[name="accountType"]').attr('disabled',true);
                    }
                    f.render('radio');
            });

            //            $('.prev').unbind().click(function() {
            //            	var result = controller.composeData(param);
            //            	schoolReportStore.setBranchCenterInfo(result.branchCenterInfo);
            //                if (operate == 'change') {
            //                    $('body').load('./school-choose-order.html');
            //                } else {
            //                    $('body').load('./school-baseinfo-view.html');
            //                }
            //            });

            laydate.render({
                elem: '#effDate', //指定元素
                range: '~',
                calendar: true
            });
        }

    };

    controller.init();
});
