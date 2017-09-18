var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'element',
    'request',
    'key-bind',
    'contract-api',
    'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
    element,
    ajax,
    keyBind,
    contractApi
) {

    var $ = layui.jquery,
        e = element(),
        data = ajax.getAllUrlParam();

    var controller = {
        init: function() {
            this.bindEvent();
            this.renderPage();
        },

        loadBranchCenterInfo: function() {
            var url = ajax.composeUrl(webName + '/views/branch-center/branch-baseinfo-view.html', data);
            $('#base-info').load(url);
        },

        loadContractInfo: function() {
            ajax.request(contractApi.getUrl('getLastContractInfo'), {
                branchCenterId: data.id
            }, function(result) {
                window.contractId = result.data.id;
                var url = ajax.composeUrl(webName + '/views/contract/contract-baseinfo-view.html', data);
                $('#contract-info').load(url);
                controller.loadContractPayment();

            }, true, function() {
                $('#contract-container').hide();
                $('#payments-container').hide();
                $('#summary-container').hide();
            },null,{
                closeToast:true
            });


        },

        loadContractPayment: function() {
            var url = ajax.composeUrl(webName + '/views/payment/payment-table.html', data);
            $('#payments').load(url);
        },

        //分中心审核记录
        loadBranchCenterAuditList: function($container) {
            var url = ajax.composeUrl(webName + '/views/branch-center/audit-list.html', data);
            $container.load(url);
        },

        //合同审核记录
        loadContractAuditList: function($container) {
            var url = ajax.composeUrl(webName + '/views/contract/contract-audit-message-list.html', data);
            $container.load(url);
        },

        //款项审核记录
        loadPaymentAuditList: function($container) {
            var url = ajax.composeUrl(webName + '/views/finance/payment-audit-table.html', data);
            $container.load(url);
        },

        //本期合同记录
        loadContractRecords: function($container) {
            window.isHistory = false;
            window.layFilter = 'recordsList';
            var url = ajax.composeUrl(webName + '/views/contract/contract-records-list.html', data);
            $container.load(url);
        },

        //历史合同记录
        loadHistoryContractRecords: function($container) {
            window.isHistory = true;
            window.layFilter = 'recordsList';
            var url = ajax.composeUrl(webName + '/views/contract/contract-records-list.html', data);
            $container.load(url);
        },

        //合同费用总结
        loadContractSummary: function(isNow) {
            if (isNow) {
                window.isNow = '1';
                $('#summary-title').html('本期合同总结');
            } else {
                window.isNow = '2';
                $('#summary-title').html('历史合同总结');
            }
            var url = ajax.composeUrl(webName + '/views/contract/contract-summary.html', {
                branCenterId: data.id
            });
            $('#summary').load(url);

        },

        renderPage: function() {
            this.loadBranchCenterInfo();
            this.loadContractInfo();
            e.tabChange('auditList', 'audits-1');
            e.tabChange('recordsList', 'records-1');
        },

        bindEvent: function() {
            e.on('tab(auditList)', function(data) {
                var $content = $(data.elem).find('.layui-show');
                switch (data.index) {
                    case 0:
                        controller.loadBranchCenterAuditList($content);
                        break;
                    // case 1:
                    //     controller.loadContractAuditList($content);
                    //     break;
                    // case 2:
                    //     controller.loadPaymentAuditList($content);
                    //     break;
                }
            });

            e.on('tab(recordsList)', function(data) {
                var $content = $(data.elem).find('.layui-show');
                switch (data.index) {
                    case 0:
                        controller.loadContractRecords($content);
                        controller.loadContractSummary(true);
                        break;
                    case 1:
                        controller.loadHistoryContractRecords($content);
                        controller.loadContractSummary(false);
                        break;
                }
            });
        }
    };

    controller.init();
});
