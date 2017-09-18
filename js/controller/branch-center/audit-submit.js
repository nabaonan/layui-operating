/**
 *分中心提审
 */

var webName = getWebName();
layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'request',
    'form',
    'toast',
    'branch-center-api',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
    ajax,
    form,
    toast,
    branchCenterApi,
    keyBind
) {
    var $ = layui.jquery;
    var f = form();
    var ids = ajax.getFixUrlParams('ids');
    var controller = {
        init: function() {
            controller.bindEvent();
        },
        getSubmitData: function(){
            $('#submit').trigger('click');

        },
        bindEvent: function() {
            $('#cancel').click(function(){
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });

            //监听提交
            f.on('submit(audit-submit)', function(data) {
                var param = {
                    ids:ids.split(','),
                    description:data.field.description
                };

                ajax.request(branchCenterApi.getUrl('submitAudit'),null, function(result) {
                    toast.success('成功提交审核！');
                    parent.list.refresh();
				}, true, function(result) {

					if(result.errorCode == 10000){
						parent.layer.alert(result.msg, {icon: 2,title:'错误提示'});
					}
				    parent.list.refresh();
				},null, {
                    closeToast:true,
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(param)
				});
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭

                return false;
            });
        }
    };

    controller.init();


});
