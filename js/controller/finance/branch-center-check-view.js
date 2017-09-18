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
        	$(".contractCode").text(data.contractCode);
            this.bindEvent();
            this.renderPage();
        },
		
		//基本信息
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

        //分中心审核记录
        loadBranchCenterAuditList: function($container) {
            var url = ajax.composeUrl(webName + '/views/branch-center/audit-list.html', data);
            $container.load(url, function() {
            });
        },
        //合同审核记录
        //款项审核信息
        loadPaymentAuditList: function($container) {
        	data.single = false;
			var url = ajax.composeUrl(webName + '/views/finance/payment-audit-table.html', data);
            $container.load(url, function() {
            });
        },

        renderPage: function() {
            this.loadBranchCenterInfo();
            this.loadContractPaymentList();
            e.tabChange('auditList','audits-1');
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
            e.on('tab(auditList)', function(data) {
                var $content = $(data.elem).find('.layui-show');
                switch (data.index) {
                    case 0:
                        controller.loadBranchCenterAuditList($content);
                        break;
                    case 1:
                        controller.loadContractAuditList($content);
                        break;
                    case 2:
                        controller.loadPaymentAuditList($content);
                        break;
                }
            });
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
