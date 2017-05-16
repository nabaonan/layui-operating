var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'form-util',
	'request'

];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(

	formUtil,
	ajax
) {
	var $ = layui.jquery;
	var data = ajax.getAllUrlParam();
	if(!$.isEmptyObject(data)){
		console.log('查看数据',data);
		formUtil.renderData($('#productline-form'),data);
	}
});