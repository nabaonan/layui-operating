/**
 * 续签页面
 * @author nabaonan
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
    'trans-contract-render',
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
    transContractRender,
    toast,
    keyBind

) {
    var $ = layui.jquery,
        f = form(),
        e = element(),
        data = ajax.getAllUrlParam(),

        type = '3';// 1新增 2追加  3续签

    var controller = {
        init: function() {
            controller.bindEvent();

          
            controller.loadPage();
          
        },

        loadBranchCenterInfo: function() {
            var url = ajax.composeUrl(webName + '/views/branch-center/branch-baseinfo-view.html', data);
            $('#base-info').load(url);
        },

        loadContractBaseUpdate: function() {
            window.type = type;
            var contractUrl = ajax.composeUrl(webName + '/views/contract/contract-baseinfo-update.html', {type:3});
            $('#contract-info').load(contractUrl,function(response) {

            });
        },

        loadContractSummary: function() {
            window.contractId = data.contractId;
            var contractUrl = ajax.composeUrl(webName + '/views/contract/contract-summary.html', data);
            $('#contract-summary').load(contractUrl);
        },

        loadPage: function() {
            this.loadBranchCenterInfo();
            this.loadContractBaseUpdate();
            this.loadContractSummary();
        },

        bindEvent: function() {

        }
    };

    controller.init();
});
