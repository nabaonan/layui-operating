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
    'contract-api',
    'toast',
    'key-bind',
    'date-single-util',
    'daterange-util',
    'upload',
    'file-api',
    'contract-render',
    'trans-contract-render',
    'role&authority-api',
    'payment-api',
    'commodity-api',
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
    contractApi,
    toast,
    keyBind,
    dateSingleUtil,
    daterangeUtil,
    upload,
    fileApi,
    contractRender,
    transContractRender,
    roleApi,
    paymentApi,
    commodityApi

) {
    var $ = layui.jquery,
        f = form(),
        e = element(),
        contractId = ajax.getFixUrlParams('contractId'),
        branchCenterId = ajax.getFixUrlParams('branchCenterId'),
        type = window.type ? window.type : ajax.getFixUrlParams('type'), //window.type是续签的时候传的,后者是添加和追加时候用的
        isPass = ajax.getFixUrlParams('isPass'),
        data = ajax.getAllUrlParam(),
        cooperationType = data.contractType, //合同合作模式，就叫contractType，没有为什么
        $form = $('#contract-form'),
        provinceId,
        businessScopeRendered = false, //标识业务范围是否渲染完毕
        coopTypeRendered = false, //合作模式是否渲染完毕
        count = 0;
    var splitRegex = /\d+(\.\d+)?:\d+(\.\d+)?/; //只能是   数字比数字
    var controller = {
        init: function() {
            controller.bindEvent();
            controller.renderDept();
            controller.renderSecondParty();
            controller.renderSignRep();
            if ($.isEmptyObject(type)) {
                // 如果是从分中心页面点过来的，没有合同类型，因为不知是添加还是追加 先查看是否是添加，还是追加，调接口判断
                ajax.request(contractApi.getUrl('queryFirst'), {
                    branchCenterId: branchCenterId
                }, function(result) {
                    type = result.type;
                    controller.renderRelAndType(branchCenterId, type);
                    if (type == '2') { //如果是追加
                        controller.getProvinceId(result.areaList);
                        var $dept = $('#dept');
                        $dept.val(result.department);
                        $('<input>', {
                            type: 'hidden',
                            name: 'department',
                            value: $dept.val()
                        }).appendTo($dept.parent());
                        f.render('select');
                        $dept.attr('disabled', true);
                    }

                });
            } else {
                controller.renderRelAndType(branchCenterId, type);
            }

            var interval = setInterval(function() {

                if (count == 4) {
                    if (!$.isEmptyObject(data.contractId)) {
                        controller.renderData();
                    } else {
                        f.render('select');
                        $('#coop').next('.layui-form-select').find('.layui-this').trigger('click');
                    }
                    clearInterval(interval);

                }
            }, 0);
        },

        getProvinceId: function(areaList) {
            var province = $.grep(areaList, function(item, index) {
                return item.type == '3';
            });
            provinceId = province[0].area;
        },

        renderRelAndType: function(branchCenterId, type) {

            var param = {};
            if(isPass == '1') {//如果点击编辑合同，如果是审核通过的，为了使合作关系和合作模式不缺少项目，则当作新签请求下拉框对应关系
                param.contractType = 1;
            }else{
                param.contractType = type;
                param.branchCenterId = branchCenterId;
                param.preType = cooperationType;
            }

            //获取合同关系和模式的对应关系
            ajax.request(contractApi.getUrl('coopRelAndType'), param, function(result) {
                var last = result.data.cooperationRel.pop();
                result.data.cooperationRel.unshift(last);
                controller.renderCoopRel(result.data.cooperationRel);
                var coopTypeConfig = result.data.cooperationType;
                //合作关系联动合作模式
                f.on('select(coopRel)', function(data) {
                    controller.renderCoopType(coopTypeConfig[data.value]);
                    f.render('select');
                    $('#coop-type').next('.layui-form-select').find('.layui-this').trigger('click');
                });
            });
        },

        /**
         * 组织最新数据，
         * @param  {[type]} contractTemp [description]
         * @param  {[type]} contractInfo [description]
         * @return {[type]}              [description]
         */
        composeNewData: function(data) {

            var contractTemp = data.contractInfoTemp,
                contractInfo = data.contractInfo,
                paymentAgree = data.paymentAgree,
                listAreaTemp = data.listAreaTemp,
                listBusinessScope = data.listBusinessScope,
                listArea = data.listArea;

            var result = {};

            if (contractTemp) {
                contractTemp.department = contractInfo.department;
                contractTemp.cooperationRel = contractInfo.cooperationRel;
                contractTemp.cooperationType = contractInfo.cooperationType;
                if ($.isEmptyObject(contractTemp.quotaEffProportation)) {
                    contractTemp.quotaEffProportation = paymentAgree.quotaEffProportation;
                }
                result.contractInfo = contractTemp;
            } else {
                result.contractInfo = contractInfo;
            }
            if (!$.isEmptyObject(listAreaTemp)) {
                result.listArea = listAreaTemp;
            } else {
                result.listArea = listArea;
            }

            $.each(data.listArea, function(index, item) {
                if (item.type == 3) { //省份
                    result.provinceId = item.area;
                    $('.choose-area-input').data('provinceId', item.area);
                } else if (item.type == 1) { //自定义输入
                    result.customArea = item.area;
                }
            });
            //把省份的刨除
            data.listArea = $.grep(data.listArea, function(item, index) {
                return item.type != '3';
            });
            result.contractInfo.comment = result.comment;
            result.listBusinessScope = listBusinessScope;
            return result;
        },

        /**
         * 获取区域的中文名
         * @param  {[type]} values   [description]
         * @param  {[type]} listArea [description]
         * @return {[type]}          [description]
         */
        getAreaNames: function(values, listArea) {
            var result = [];

            $.each(values, function(index, item1) {
                $.each(listArea, function(index, item2) {
                    if (item2.area == item1.code) {
                        result.push(item1.name);
                        return false;
                    }
                });
            });
            return result;
        },

        renderData: function() {
            ajax.request(contractApi.getUrl('getContractInfo'), {
                contractId: contractId,
                isQueryNewData: 1
            }, function(result) {
                var newData = controller.composeNewData(result.data);
                ajax.request(contractApi.getUrl('authArea'), {
                    provinceId: newData.provinceId,
                    isPass: isPass,
                    type: type //授权区域
                }, function(result) {

                    var grepArea = $.grep(newData.listArea, function(item, index) {
                        return !$.isEmptyObject(item.area)　 && (item.type == '2');
                    });
                    var ids = $.map(grepArea, function(item, index) {
                        return item.area;
                    });

                    $('.choose-area-input').data('ids', ids.join(','));
                    provinceId = newData.provinceId;
                    newData.listAreaNames = controller.getAreaNames(result.data, newData.listArea);
                    formUtil.renderData($form, newData.contractInfo);
                    $('#coop').next('.layui-form-select').find('.layui-this').trigger('click');
                    $('#coop-type').val(newData.contractInfo.cooperationType);

                    if(!$.isEmptyObject(newData.contractInfo.secondPartyPic)){
                        var url = webName + '/..' + newData.contractInfo.secondPartyPic;
                        var $container = $('.second-party-container');
                        $('<img>', {
                            id:'secondPartyPic',
                            src: url,
                            title: '点击图片放大',
                            'layer-src': url
                        }).prependTo($container);
                        $container.find('img').each(function() {
                            $(this)[0].onerror = function() {
                                errorFlag = true;
                                this.src = (webName + '/image/error-pic.png');
                            };
                        });
                    }

                    //查看缩略图特效
                    layer.photos({
                        photos: '.second-party-container'
                    });

                    $('.contract-code-title').html(newData.contractInfo.code);

                    setTimeout(function() {
                        var $coop = $('#coop');
                        var $coopType = $('#coop-type');
                        if(isPass == '1'){//如果审核通过

                            $('<input>', {
                                type: 'hidden',
                                name: 'cooperationRel',
                                value: $coop.val()
                            }).appendTo($coop);



                            $('<input>', {
                                type: 'hidden',
                                name: 'cooperationType',
                                value: $coopType.val()
                            }).appendTo($coopType);

                            $('#business-range :checkbox').attr('disabled',true);
                            f.render('checkbox');

                        }


                        if (isPass == '1' || type == '3') {
                            var $dept = $('#dept');
                            $dept.attr('disabled', true);

                            f.render('select');
                            $('<input>', {
                                type: 'hidden',
                                name: 'department',
                                value: $dept.val()
                            }).appendTo($dept);
                        }

                        f.render('select');
                        $('#coop-type').next('.layui-form-select').find('.layui-this').trigger('click');
                        $('#contractCode').trigger('change');
                        $('#splitPropogation').next('.layui-form-select').find('.layui-this').trigger('click');
                        $('#stopDate').val(newData.contractInfo.stopDate);
                        if(isPass == '1'){
                            $coop.attr('disabled', true);
                            $coopType.attr('disabled', true);

                        }


                    }, 200);


                });

                var renderInterval = setInterval(function() {
                    if (businessScopeRendered) {
                        clearInterval(renderInterval);
                        formUtil.renderData($form, newData);
                        formUtil.renderData($form, newData.contractInfo);
                        f.render('select');
                        $('#coop-type').next('.layui-form-select').find('.layui-this').trigger('click');
                        formUtil.renderData($form, result.data.paymentAgree);
                        setTimeout(function() {
                            formUtil.renderData($form, {listBusinessScope:newData.listBusinessScope});
                        },10);
                    }
                }, 0);
            });

        },

        //所属部门
        renderDept: function() {
            ajax.request(contractApi.getUrl('getKeyValue'), {
                type: 'department'
            }, function(result) {

                formUtil.renderSelects('#dept', result.data);
                $('#dept option[value="-1"]').val('').html('请选择'); //不显示全部
                count++;
            });
        },

        //合作关系
        renderCoopRel: function(data) {
            formUtil.renderSelects('#coop', data);
            $('#coop option[value="-1"]').val('').html('请选择'); //不显示全部
            count++;
        },

        //乙方类型
        renderSecondParty: function() {
            ajax.request(contractApi.getUrl('getKeyValue'), {
                type: 'second_party_type'
            }, function(result) {
                formUtil.renderSelects('#second-party', result.data);
                $('#second-party option[value="-1"]').val('').html('请选择'); //不显示全部
                count++;
            });
        },

        //合作模式
        renderCoopType: function(data) {
            var sort = data.sort(function(a,b){
                return a.key - b.key;
            });
            console.log('排序后aaaa',sort);
            formUtil.renderSelects('#coop-type', data);
            $('#coop-type option[value="-1"]').val('').html('请选择');
            f.render('select');
            coopTypeRendered = true;
        },

        //业务范围
        renderBusinessRange: function(isBuyout) {
            if(isBuyout){

                ajax.request(commodityApi.getUrl('getBuyoutCommoditys'), null, function(result) {
                    formUtil.renderCheckboxes('#business-range', result.data, 'listBusinessScope');
                    f.render('checkbox');
                    businessScopeRendered = true;
                });
            }else{
                ajax.request(contractApi.getUrl('getKeyValue'), {
                    type: 'product_line'
                }, function(result) {
                    formUtil.renderCheckboxes('#business-range', result.data, 'listBusinessScope');
                    f.render('checkbox');
                    businessScopeRendered = true;
                });
            }
        },

        //大区经理
        renderSignRep: function() {
            ajax.request(roleApi.getUrl('getSignRepList'), {

            }, function(result) {
                formUtil.renderSelects('#sign-rep', result.data);
                $('#sign-rep option[value="-1"]').val('').html('请选择'); //不显示全部
                count++;
            });
        },

        bindImage: function() {
            var $container = $('.second-party-container');
            layui.upload({
                elem: '.upload-pic',
                url: fileApi.getUrl('uploadFile').url,
                success: function(result, input) { //上传成功后的回调

                    if (result.status) {
                        toast.success('上传图片成功');
                        $('#secondPartyPic-input').val(result.data.url);
                        $container.find('img').remove();

                        var url = webName + '/..' + result.data.url;
                        if (!$container.find('img')[0]) {
                            $('<img>', {
                                id:'secondPartyPic',
                                src: url,
                                title: '点击图片放大',
                                'layer-src': url
                            }).prependTo($container);
                            controller.bindImage();
                        } else {
                            $container.find('img').attr('src', url);
                            $container.find('img').attr('title', '点击图片放大');
                            $container.find('img').attr('layer-src', url);

                            controller.bindImage();
                        }
                    } else {
                        toast.error('上传图片失败');
                    }
                }
            });


            //图片加载失败，缺省图片设置
            $container.find('img').each(function() {
                $(this)[0].onerror = function() {
                    this.src = (webName + '/image/error-pic.png');
                };
            });

            //查看缩略图特效
            layer.photos({
                photos: '.second-party-container',
                closeBtn: true
            });
        },

        chooseArea: function() {
            var $input = $('.choose-area-input');
            var prId; //省id
            if ($input.data('provinceId')) {
                prId = $input.data('provinceId');
            } else {
                prId = provinceId;
            }


            var url = ajax.composeUrl(webName + '/views/contract/auth-area.html', {
                ids: $input.data('ids'),
                provinceId: prId,
                isPass: data.isPass,
                type: type,
                operate: contractId ? 'edit' : 'add',
                check: true
            });

            var index = layer.open({
                type: 2,
                title: "选择授权区域",
                area: ['30%', '80%'],
                offset: '10%',
                scrollbar: false,
                content: url,
                btn: ['确定了', '取消了'],
                yes: function(index, layero) {
                    var iframeWin = window[layero.find('iframe')[0]['name']];
                    var data = iframeWin.tree.getData();
                    $input.val(data.names.join(','));
                    $input.data('ids', data.ids.join(','));

                    $input.data('provinceId', data.provinceId);
                    layer.close(index);
                }
            });
        },

        composeData: function() {

            var data = formUtil.composeData($form);


            // listArea
            var paymentKeys = [
                "initPayment",
                "joininPayment",
                "splitType",
                "schoolNum",
                "splitPayment",
                "prePayment",
                "buyoutPayment",
                "splitPropogation",
                "deposit",
                "standQuota",
                "addedQuota",
                "authQuota",
                "quotaEffProportation",
                "otherSplit"
            ];


            var contractKeys = ["id",
                "department",
                "cooperationRel",
                "secondPartyType",
                "cooperationType",
                "code",
                "secondPartyName",
                "startDate",
                "endDate",
                "signRep",
                "secondPartyPic",
                "comments",
                "stopDate",
                "signDate"
            ];


            var paymentAgree = {},
                contractInfo = {};

            $.each(data, function(prop, value) {

                if ($.inArray(prop, paymentKeys) !== -1) {
                    paymentAgree[prop] = value;
                } else if ($.inArray(prop, contractKeys) !== -1) {
                    contractInfo[prop] = value;
                }
            });

            var listArea = [];
            var $input = $('.choose-area-input');
            var ids = $input.data('ids').split(',');

            $.each(ids, function(index, value) { //区id
                if (!$.isEmptyObject(value)) {
                    listArea.push({
                        area: value,
                        type: '2'
                    });
                }

            });

            listArea.push({ //省id
                area: $input.data('provinceId'),
                type: '3'
            });
            listArea.push({ //自定义授权区域
                area: $('#customArea').val(),
                type: '1'
            });
            contractInfo.branchCenterId = branchCenterId;
            contractInfo.type = type;
            data.contractInfo = contractInfo;
            data.paymentAgree = paymentAgree;
            data.listArea = listArea;
            var checks = formUtil.composeCheckboxesValue($form);
            data.listBusinessScope = checks.listBusinessScope;
            var operate = ajax.getFixUrlParams('operate');
            //如果是新加续签
            if (operate == 'add-contract-continue') {
                data.contractInfo.preContract = data.contractInfo.id;
                delete data.contractInfo.id;
            }
            if (type == '3') {
                var transPayment = [];

                var $amounts = $('input[name="amount"]');

                $.each([].concat(data.from), function(index, f) {
                    if (f == 'zydxqed') { //转移到下期额度
                        data.amount[index] = $amounts.eq(index).val() + '%';
                    }
                    var obj = {};
                    if (data.paymentId) {
                        obj.id = data.paymentId[index];
                    }
                    obj.from = f;
                    obj.amount = $amounts.eq(index).val();
                    transPayment.push(obj);
                });
                data.transPayment = transPayment;
            }

            return data;
        },

        /**
         * 如果提交数据有重叠部分，提示
         * @return {[type]} [description]
         */
        ensureErrorSubmit: function(result, data) {

            var resubmit = function(param, index) {
                ajax.request(contractApi.getUrl('updateContract'), null, function() {
                    layer.close(index);
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.layer.close(index);
                }, true, function(result) {
                    switch(result.errorCode){
                        case 1:
                            toast.error(result.msg+'<br/>以下地区重复<br/>'+result.repeatArea.join(','));
                            break;
                        case 3:
                            toast.error(result.msg+'<br/>以下业务类型重复<br/>'+result.repeatBusinessScope.join(','));
                            break;
                        case 5:
                            toast.error(result.msg);
                            break;
                        case 2:case 4:case 6:
                            controller.ensureErrorSubmit(result, param);
                            break;
                        default:
                            toast.error(result.msg);
                    }
                }, null, {
                    closeToast: true,
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(param)
                });
            };

            var confirm = function(msg, extraParam) {
                layer.open({
                    content: msg,
                    btn: ['确定', '取消'],
                    yes: function(index, layero) {
                        var param = $.extend(true, {}, data, extraParam);
                        resubmit(param, index);
                        layer.close(index);
                    }

                });
            };

            switch (result.errorCode + '') {
                case '2': //地区重复
                    var areaStr = result.repeatArea.join(',');
                    confirm('该授权区域已经存在分中心，是否继续创建合同', {
                        isConfirmArea: '1'
                    });
                    break;
                case '4': //业务范围重复
                    var scopeStr = result.repeatBusinessScope.join(',');
                    confirm('以下业务范围重复请确认<br/>' + scopeStr, {
                        isConfirmBusinessScope: '1'
                    });
                    break;
                case '6': //合作模式重复
                    confirm(result.msg, {
                        isConfirmCooperationType: '1'
                    });
                    break;
            }
        },

        bindEvent: function() {

            controller.bindImage();

            f.verify({
                explain: function(value) {
                    $audit = $('#isAudit');
                    if ($audit.prop('checked') && value.length === 0) {
                        return '请填写说明';
                    }
                },
                quotaEffProportation: function(value) {
                    if (value > 100) {
                        return '额度有效比例不能超过100%';
                    }
                }
            });

            //合同切换
            //转移的其实放在这里渲染不太合理，但是现在下拉框只能绑定一次事件，在外边绑定不上事件，如果绑定上了则需要移到续签页面中
            f.on('select(coopType)', function(data) {
                var summary = window.summary;
                $('#businessScopeName').html('业务范围');
                switch (data.value) {

                    case '1': //首批进货款
                        contractRender.initPaymentContract.renderTpl();
                        businessScopeRendered = false;
                        controller.renderBusinessRange(false);
                        if (type == '3') {
                            transContractRender.initPaymentContract.renderTpl(summary);
                        }
                        break;
                    case '2': //加盟
                        contractRender.joininContract.renderTpl();
                        businessScopeRendered = false;
                        controller.renderBusinessRange(false);
                        if (type == '3') {
                            console.log('加盟');
                            transContractRender.joininContract.renderTpl(summary);
                        }
                        break;
                    case '3': //保证金
                        contractRender.depositContract.renderTpl();
                        businessScopeRendered = false;
                        controller.renderBusinessRange(false);
                        if (type == '3') {
                            console.log('进入保证金');
                            transContractRender.depositContract.renderTpl(summary);
                        }
                        break;
                    case '4': //买断
                        contractRender.buyoutContract.renderTpl();
                        $('#businessScopeName').html('买断产品');
                        businessScopeRendered = false;
                        controller.renderBusinessRange(true);
                        if (type == '3') {
                            transContractRender.buyoutContract.renderTpl(summary);
                        }
                        break;
                    case '5': //直营
                        contractRender.directContract.renderTpl();
                        businessScopeRendered = false;
                        controller.renderBusinessRange(false);
                        if (type == '3') {
                            transContractRender.directContract.renderTpl(summary);
                        }
                        break;
                    case '6': //合营
                        contractRender.coopContract.renderTpl();
                        businessScopeRendered = false;
                        controller.renderBusinessRange(false);
                        if (type == '3') {
                            transContractRender.coopContract.renderTpl(summary);
                        }
                        break;

                }
            });


            $('.choose-area-btn').click(controller.chooseArea);

            $('body').on('change', '#contractCode', function() {
                $('#contract-code-title').html($(this).val());
            });

            //合同提审
            f.on('checkbox(isAudit)', function(data) {
                if (data.elem.checked) {
                    $('#audit-container').show();
                } else {
                    $('#audit-container').hide();
                }
            });

            //监听提交
            f.on('submit(contractUpdateForm)', function(data) {
                var param = controller.composeData(data.field);
                ajax.request(contractApi.getUrl('updateContract'), null, function() {
                    toast.success('合同保存成功');
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.list.refresh();
                    parent.layer.close(index); //再执行关闭
                }, true, function(result) {
                    switch(result.errorCode){
                        case 1:
                            toast.error(result.msg+'<br/>以下地区重复'+result.repeatArea.join(','));
                            break;
                        case 3:
                            toast.error(result.msg+'<br/>以下业务类型重复'+result.repeatBusinessScope.join(','));
                            break;
                        case 5:
                            toast.error(result.msg);
                            break;
                        case 2:case 4:case 6:
                            controller.ensureErrorSubmit(result, param);
                            break;
                        default:
                            toast.error(result.msg);
                    }
                }, null, {
                    closeToast:true,
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(param)
                });

                return false;
            });

            dateSingleUtil.init($('#signDate'));
            daterangeUtil.init('#startDate', '#endDate', {
                format: 'YYYY-MM-DD',
                istime: false,
            }, {
                format: 'YYYY-MM-DD',
                istime: false,
            });

        }
    };

    controller.init();
});
