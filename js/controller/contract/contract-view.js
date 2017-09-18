var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'element',
    'request',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
    element,
    ajax,
    keyBind
) {

    var $ = layui.jquery,
        e = element(),
        data = ajax.getAllUrlParam();

    var controller = {
        init: function() {
            this.bindEvent();
            this.renderPage();
        },
        //分中心信息
        loadBranchCenterInfo: function() {
            var url = ajax.composeUrl(webName + '/views/branch-center/branch-baseinfo-view.html', data);
            $('#base-info').load(url, function() {
            });
        },

        //合同信息
        loadContractBaseInfo: function() {
        	
            var url = ajax.composeUrl(webName + '/views/contract/contract-baseinfo-view.html', data);
            $('#contract-info').load(url, function() {

            });
        },

        //当前合同审核记录
        loadContractAuditList: function() {
            var url = ajax.composeUrl(webName + '/views/contract/contract-audit-message-list.html', data);
            $('#audits').load(url, function() {

            });

        },

        //本期合同费用清单
        loadPaymentAuditList: function() {
            var url = ajax.composeUrl(webName + '/views/payment/payment-table.html', data);
            $('#payments').load(url, function() {

            });
        },

        //合同费用总结
        loadContractSummary: function(){
        	window.contractId = data.contractId;
            var url = ajax.composeUrl(webName + '/views/contract/contract-summary.html', data);
            $('#summary').load(url, function() {

            });
        },

        renderPage: function() {
             this.loadBranchCenterInfo();
             this.loadContractBaseInfo();
             this.loadContractAuditList();
             this.loadContractSummary();
             this.loadPaymentAuditList();
        },

        bindEvent: function() {

        }
    };

    controller.init();
});
