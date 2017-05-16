var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'request',
	'product-api',
	'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
	ajax,
	productApi
) {
	var $ = layui.jquery;

	//监听提交
	f.on('submit(productline-config-form)', function(data) {
		console.log('@@@@@@@@@@配置产品线数据=%o',data.field);
		var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
		ajax.request(productApi.getUrl('updateProductLineConfig'), data.field, function() {
			parent.layer.close(index); //再执行关闭
		});
	});

});