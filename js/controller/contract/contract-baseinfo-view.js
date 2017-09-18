/**
 * 用来显示合同信息
 * @author nabaonan
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'element',
    'request',
    'key-bind',
    'contract-api',
    'role&authority-api',
    'form-util',
    'contract-render',
    'date-util',
    'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
    element,
    ajax,
    keyBind,
    contractApi,
    roleApi,
    formUtil,
    contractRender,
    dateUtil
) {

    var $ = layui.jquery,
        e = element(),
        data = ajax.getAllUrlParam(),
        contractId = window.contractId?window.contractId:data.contractId,
        $form = $('#contract-view');
    var controller = {
        init: function() {
            this.bindEvent();
            ajax.request(contractApi.getUrl('getContractInfo'), {
                contractId: contractId,
                isQueryNewData: '1'
            }, function(result) {
                controller.renderTpl(result.data.contractInfo.cooperationType,result.data.paymentAgree);

                var newData = controller.composeNewData(result.data);
                controller.getValueNames(newData);
                window.contractInfo = newData.contractInfo;
                $('#contract-code-title').html(newData.contractInfo.code);
                $('.contract-code-title').html(newData.contractInfo.code);
                if(result.data.contractInfoTemp){
                    var diff = controller.getDiffProps(result.data);
                    controller.markLabelRed(diff);
                }

            });
        },

        renderTpl: function(cooperationType,paymentAgree) {
            var setReadonly = function() {
                $('#stopDate').attr('disabled',true);
                $('#contract-view input').prop('readonly', true).addClass('layui-disabled');
                formUtil.renderData($form,paymentAgree);
            };

            switch (cooperationType + '') {
                case '1': //首批进货款
                    contractRender.initPaymentContract.renderTpl(setReadonly);
                    break;
                case '2': //加盟
                    contractRender.joininContract.renderTpl(setReadonly);
                    break;
                case '3': //保证金
                    contractRender.depositContract.renderTpl(setReadonly);
                    break;
                case '4': //买断
                    contractRender.buyoutContract.renderTpl(setReadonly);
                    break;
                case '5': //直营
                	contractRender.directContract.renderTpl(setReadonly);
                    break;
                case '6': //合营
                    contractRender.coopContract.renderTpl(setReadonly);
                    break;
            }


        },

        getValueNames: function(data) {
            var contractInfo = data.contractInfo,
                listBusinessScope = data.listBusinessScope,
                listArea = data.listArea,
                provinceId = data.provinceId,
                formData;
            $.when(ajax.request(contractApi.getUrl('getKeyValue'),{
                    type: 'department' //所属部门
                }),
                ajax.request(contractApi.getUrl('getKeyValue'), {
                        type: 'cooperation_rel' //合作关系
                }),
                ajax.request(contractApi.getUrl('getKeyValue'),  {
                        type: 'cooperation_type' //合作模式
                }),
                ajax.request(contractApi.getUrl('getKeyValue'), {
                        type: 'second_party_type' //乙方类型
                }),
                ajax.request(contractApi.getUrl('getKeyValue'), {
                        type: 'contract_business_scope' //业务范围
                }),
                ajax.request(roleApi.getUrl('getSignRepList'), {
                         //合同签订代表
                }),
                ajax.request(contractApi.getUrl('authArea'), {
                        provinceId:provinceId,
                        //授权区域
                })).done(function(
                dept,
                coopRel,
                coopType,
                secondType,
                businessRange,
                signRep,
                authArea) {
                formData = $.extend(true,{},contractInfo);


                formData.department = controller.getValueName(dept[0].data,contractInfo.department);
                formData.cooperationRel = controller.getValueName(coopRel[0].data, contractInfo.cooperationRel);
                formData.cooperationType = controller.getValueName(coopType[0].data, contractInfo.cooperationType);
                formData.secondPartyType = controller.getValueName(secondType[0].data, contractInfo.secondPartyType);
                formData.signRep = controller.getValueName(signRep[0].data, contractInfo.signRep);
                formData.listBusinessScope = controller.getValueName(businessRange[0].data, listBusinessScope);
                formData.listArea = controller.getAreaNames(authArea[0].data, listArea);
                formData.customArea = data.customArea;
                formData.secondPartyPic = contractInfo.secondPartyPic;
                controller.renderData(formData);
            });

        },

        renderData: function(formData) {
            var $img = $form.find('.second-party-container img');
            if(!$.isEmptyObject(formData.secondPartyPic)){
                var url = webName + '/..' + formData.secondPartyPic;
                $img.attr('layer-src',url);
                $img.attr('src',url);
                //查看缩略图特效
                layer.photos({
                    photos: '.second-party-container',
                    closeBtn:true
                });
            }
            formUtil.renderData($form, formData);
        },

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

        /**
         * 比对最新数据和老数据
         * @param  {[type]} contractTemp [description]
         * @param  {[type]} contractInfo [description]
         * @return {[array]}              有差异的name属性值
         */
        getDiffProps: function(data) {
            var contractInfoTemp = data.contractInfoTemp,
                contractInfo = data.contractInfo,
                listAreaTemp = data.listAreaTemp,
                listArea = data.listArea;
            var result = [];

            $.each(contractInfoTemp, function(prop1, value1) {
                $.each(contractInfo, function(prop2, value2) {
                    if (prop1 == prop2 && value1 !== value2) {
                        result.push(prop1);
                    }
                });
            });

            $.each(listArea, function(index, item1) {
                var flag = true;
                $.each(listAreaTemp, function(index, item2) {
                    if (item1.area !== item2.area) {
                        flag = false;
                    }
                });
                if (!flag) {
                    result.push('listArea');
                    return false;
                }
            });

            return result;
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
            	contractTemp.startDate = dateUtil.formatStr(new Date(contractTemp.startDate),'yyyy-MM-dd');
            	contractTemp.endDate = dateUtil.formatStr(new Date(contractTemp.endDate),'yyyy-MM-dd');
            	contractTemp.stopDate = dateUtil.formatStr(new Date(contractTemp.stopDate),'yyyy-MM-dd');
            	contractTemp.signDate = dateUtil.formatStr(new Date(contractTemp.signDate),'yyyy-MM-dd');

                contractTemp.department = contractInfo.department;
                contractTemp.cooperationRel = contractInfo.cooperationRel;
                contractTemp.cooperationType = contractInfo.cooperationType;
                if ($.isEmptyObject(contractTemp.quotaEffProportation)) {
                    contractTemp.quotaEffProportation = paymentAgree && paymentAgree.quotaEffProportation;
                }
                result.contractInfo = contractTemp;
            } else {
            	 contractInfo.startDate = dateUtil.formatStr(new Date(contractInfo.startDate),'yyyy-MM-dd');
                 contractInfo.endDate = dateUtil.formatStr(new Date(contractInfo.endDate),'yyyy-MM-dd');
                 contractInfo.stopDate = dateUtil.formatStr(new Date(contractInfo.stopDate),'yyyy-MM-dd');
                 contractInfo.signDate = dateUtil.formatStr(new Date(contractInfo.signDate),'yyyy-MM-dd');

                result.contractInfo = contractInfo;
            }
            if (!$.isEmptyObject(listAreaTemp)) {
                result.listArea = listAreaTemp;
            } else {
                result.listArea = listArea;
            }

            $.each(data.listArea,function(index, item) {
                if(item.type == 3){//省份
                    result.provinceId = item.area;
                    delete item.area;
                }else if(item.type == 1){//自定义输入
                    result.customArea = item.area;
                    delete item.area;
                }
            });
            result.listBusinessScope = listBusinessScope;
            return result;
        },


        /**
         * 给标签标红（如果修改了则标红）
         * @return {[type]} [description]
         */
        markLabelRed: function(diffProps) {
            $.each(diffProps, function(index, value) {
                $form.find('input[name="' + value + '"]').parents('.layui-input-inline').prev('.layui-form-label').css('color', '#FF5722');
            });
        },

        /**
         * [description]
         * @param  {[array]} values [下拉框值域]
         * @param  {[array]} ids    [后台穿过来的id数组]
         * @return {[array]}        [转换后的中文数组]
         */
        getValueName: function(values, ids) {
        	var result = [];
        	ids = [].concat(ids);
             $.each(values, function(index, item) {
                 if ($.inArray(item.key+'', ids) !== -1) {
                     result.push(item.value);
                 }
             });
            return result;
        },

        bindEvent: function() {

        }
    };

    controller.init();
});
