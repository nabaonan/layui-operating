/**
 * 添加和追加页面
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
    'contract-api',
    'toast',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules, {
    'contract-api': 'api/contract-api'
});

//参数有顺序
layui.use(requireModules, function(
    element,
    form,
    layer,
    ajax,
    formUtil,
    contractApi,
    toast,
    keyBind

) {
    var $ = layui.jquery,
        f = form(),
        e = element(),
        data = ajax.getAllUrlParam(),
        type = data.type || '1';// 1新增 2追加  3续签

    var controller = {
        init: function() {
            controller.bindEvent();

            if( type == '1' || (type != '1' && data.operate == 'edit')){//如果是新签或者（追加或续签，并且是编辑的时候）
                controller.loadPage(true);
            }else if(data.operate == 'add'){//这里是追加 并且是添加的时候
                //获取分中心最新合同信息
                ajax.request(contractApi.getUrl('getLastContractInfo'),{
                    branchCenterId:data.id
                },function(result) {
                    controller.loadPage(false);
                });
            }
        },

        //分中心信息
        loadBranchCenterInfo: function() {
            var url = ajax.composeUrl(webName + '/views/branch-center/branch-baseinfo-view.html', data);
            $('#base-info').load(url);
        },

        //合同信息
        loadContractBaseUpdate: function(callback) {
            var contractUrl = ajax.composeUrl(webName + '/views/contract/contract-baseinfo-update.html', data);
            $('#contract-info').load(contractUrl,callback);
        },

        loadPage: function(isNewContract) {
            this.loadBranchCenterInfo();
            this.loadContractBaseUpdate(function() {
                if(!isNewContract){
                    $('#dept').attr('disabled',true).addClass('layui-disabled');
                }
            });

            var $container = $('#contract-records-container');
            if(!isNewContract){
                e.tabChange('contractList', 'contract-records-1');
                $container.show();
            }else{
                $container.hide();
            }

            //如果是编辑合同
            if(data.contractId){
            	controller.loadContractSummary();
            	controller.loadPaymentAuditList();
            }

        },

        //费用总结
        loadContractSummary: function() {
            window.contractId = data.contractId;
            var contractUrl = ajax.composeUrl(webName + '/views/contract/contract-summary.html', data);
            $('#summary').load(contractUrl);
            $('#summary-container').show();
        },

        //本期合同费用清单
        loadPaymentAuditList: function() {
        	window.contractId = data.contractId;
            var url = ajax.composeUrl(webName + '/views/payment/payment-table.html', data);
            $('#payments').load(url);
            $('#payments-container').show();
        },


        loadContractRecords: function($container, loadHistory) {
            //这种传值不太好，这是临时解决方案
            window.branchCenterId = data.id;
            window.isHistory = loadHistory;
            window.layFilter = 'contractList';

            var url = ajax.composeUrl(webName + '/views/contract/contract-records-list.html');
            $container.load(url);
        },

        bindEvent: function() {
            e.on('tab(contractList)', function(data) {
                var $content = $(data.elem).find('.layui-show');
                switch (data.index) {
                    case 0:
                        controller.loadContractRecords($content, false);
                        break;
                    case 1:
                        controller.loadContractRecords($content, true);
                        break;
                }
            });
        }
    };

    controller.init();
});
