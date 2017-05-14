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
		console.log(result.data);
		formUtil.renderSelects('#roles', result.data);
		if(data){
			formUtil.renderData($('#sys-user-form'),data);
		}
		f.render('select');
	});
	
	

	$('.cancel').click(function() {
		var index = window.parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
		parent.layer.close(index); //再执行关闭  
	});

	f.on('submit(sys-user-form)', function(data) {
		console.log('444444444444444', data.field); //当前容器的全部表单字段，名值对形式：{name: value}
		ajax.request(roleApi.getUrl('addSysUser'), data.field, function() {
			toast.success('添加用户成功');
			var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
			parent.layer.close(index); //再执行关闭  
		});
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	});

});