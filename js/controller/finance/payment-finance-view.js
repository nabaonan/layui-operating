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
        	window.branchCenterId = data.branchCenterId;//分中心ID
        	window.contractId = data.contractId;//合同ID
        	
        	$(".contractCode").text(data.contractCode);
            this.bindEvent();
        },

		//分中心基本信息
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

        //本期合同费用清单
        loadContractPaymentList: function() {
			var url = ajax.composeUrl(webName + '/views/payment/payment-table.html', data);
            $("#payment-table-html").load(url, function() {
            });
        },

        //本期合同费用总结
        loadContractSummary: function(){
            var url = ajax.composeUrl(webName + '/views/contract/contract-summary.html', data);
            $('#summary').load(url, function() {
            });
        },

        //款项审核信息
        loadPaymentAuditList: function() {
			var url = ajax.composeUrl(webName + '/views/finance/payment-audit-table.html', data);
            $("#payment-audit-html").load(url, function() {
            });
        },

        bindEvent: function() {
            this.loadBranchCenterInfo();
            this.loadContractBaseInfo();
            this.loadContractPaymentList();
            this.loadContractSummary();
            this.loadPaymentAuditList();
        }
    };

    controller.init();
});
