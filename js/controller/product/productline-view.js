var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'form-util',
	'request',
	'date-util',
	'valid-login'

];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(

	formUtil,
	ajax,
	dateUtil
) {
	var $ = layui.jquery;
	var data = ajax.getAllUrlParam();
	if(!$.isEmptyObject(data)){
		if(data.effDate && data.effDate!=='') {
			data.effDate = dateUtil.formatStr(new Date(parseInt(data.effDate)), "yyyy-MM-dd");
		}
		
		formUtil.renderData($('#productline-form'),data);
	}
});