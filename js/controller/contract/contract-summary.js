/**
 * 合同费用总结
 * @author nabaonan
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'request',
    'form-util',
    'contract-api',
    'summary-render',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
    ajax,
    formUtil,
    contractApi,
    summaryRender,
    keyBind
) {
    var $ = layui.jquery,
        branchCenterId = ajax.getFixUrlParams("branchCenterId"),
        contractId = ajax.getFixUrlParams("contractId");
    var controller = {
        init: function() {
        	var param;
        	if(!$.isEmptyObject(branchCenterId) && !$.isEmptyObject(contractId)){
        		param = {
        			contractId:contractId
        		}
        	}else{
        		param = {
        			branchCenterId:branchCenterId
            	}
        	}
            param.isNow = window.isNow || '1';//1查现在合同总结，2查看历史总结

            ajax.request(contractApi.getUrl('summary'),param,function(result) {
                window.summary = result.data;
                summaryRender.init(result.data);
            });
        },
        setSummary: {}
    };

    controller.init();
});
