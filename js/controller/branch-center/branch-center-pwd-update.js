var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'request',
	'branch-center-api',
	'form',
	'form-util',
	'toast',
	'key-bind',
	'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
	ajax,
	branchCenterApi,
	form,
	formUtil,
	toast,
	keyBind
) {
	var $ = layui.jquery;
	var f = form();
	var $form = $('#branch-center-pwd-form');

	var data = ajax.getAllUrlParam();//
	var controller = {

		init: function() {
			this.bindEvent();
			if(data){
				formUtil.renderData($form,data);
			}
		},

		getPwd: function() {
			ajax.request(branchCenterApi.getUrl('getPwd'), {
				id: data.id
			}, function(result) {
				$('#pwd').val(result.data.password);
			});
		},

		bindEvent: function() {

			//监听提交
			f.on('submit(branch-center-pwd-form)', function(data) {
				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				ajax.request(branchCenterApi.getUrl('updateBranchPwd'), {
					branchcenterId:data.field.id,
					password: data.field.password
				}, function() {
					toast.success('密码更新成功！');
					parent.layer.close(index); //再执行关闭
					parent.list.refresh();
				});
				return false;
			});
			//生成密钥
			$('#genpwd-btn').click(this.getPwd);
		}
	}
	controller.init();

});
