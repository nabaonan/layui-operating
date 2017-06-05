var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'form',
	'form-util',
	'request',
	'role&authority-api',
	'toast',
	'valid-login'

];

registeModule(window, requireModules, {
	'role&authority-api': 'api/role&authority-api'
});

layui.use(requireModules, function(
	form,
	formUtil,
	ajax,
	roleApi,
	toast
	) {
	var $ = layui.jquery;
	var f = new form();
	
	var data = ajax.getAllUrlParam();
	
	ajax.request(roleApi.getUrl('getRolesSelect'), null, function(result) {
		formUtil.renderSelects('#roles', result.data);
		if(!$.isEmptyObject(data)){
			$('#username').attr('disabled',true);
			formUtil.renderData($('#sys-user-form'),data);
		}
		f.render();
	});
	

	f.on('submit(sys-user-form)', function(data) {
		ajax.request(roleApi.getUrl('updateSysUser'), data.field, function() {
			toast.success('添加用户成功');
			var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
			parent.layer.close(index); //再执行关闭  
			parent.list.refresh();//刷新列表
			
		});
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	});

});