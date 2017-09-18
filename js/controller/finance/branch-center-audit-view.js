var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'element',
    'request',
    'key-bind',
	'branch-center-api',
    'toast',
    'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
    element,
    ajax,
    keyBind,
	branchCenterApi,
    toast
) {

    var $ = layui.jquery,
        e = element(),
        data = ajax.getAllUrlParam();

    var controller = {
        init: function() {
        	window.branchCenterId = data.id;
            this.bindEvent();
        },
		
		//基本信息
        loadBranchCenterInfo: function() {
            var url = ajax.composeUrl(webName + '/views/branch-center/branch-baseinfo-view.html', data);
            $('#base-info').load(url, function() {
            });
        },

        //分中心审核记录
        loadBranchCenterAuditList: function() {
            var url = ajax.composeUrl(webName + '/views/branch-center/audit-list.html', data);
            $('#audit-html').load(url, function() {
            });
        },

        bindEvent: function() {
            this.loadBranchCenterInfo();
            this.loadBranchCenterAuditList();
            window.branchCenterAudit = {
				//监听审核通过
				auditOk: function() {
					layer.confirm('确定要通过审核吗?', {
						icon: 3,
						title: '提示',
						closeBtn: 0
					}, function(index) {
						layer.load(0, {
							shade: 0.5
						});
						layer.close(index);
						
						var subdata = {
							id:data.branchCenterId,
							pass:1
						}
						ajax.request(branchCenterApi.getUrl('audit'), subdata, function() {
							toast.success('分中心审核成功！');
							var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
							parent.list.refresh();
							parent.layer.close(index); //再执行关闭
							layer.closeAll("loading");
						},true,function(result){
							layer.closeAll("loading");
							var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
							parent.layer.close(index); //再执行关闭
							toast.error(result.msg);
						});
					});
				},
				//审核驳回
				reject:function(){
					layer.prompt({
						formType: 2,
						title: '请输入驳回理由',
						area: ['500px', '100px'] //自定义文本域宽高
					}, function(value, index, elem) {
						var subdata = {
							id:data.branchCenterId,
							pass:0,
							opinion:value
						}
						ajax.request(branchCenterApi.getUrl('audit'), subdata, function() {
							toast.success('分中心驳回成功！');
							var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
							parent.list.refresh();
							parent.layer.close(index); //再执行关闭
						});
					});
					return false;
				}
			};
        }
    };

    controller.init();
});
