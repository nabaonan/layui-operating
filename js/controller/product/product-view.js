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

		if(data.expiryDate && data.expiryDate!=='') {
			data.expiryDate = dateUtil.formatStr(new Date(parseInt(data.expiryDate)), "yyyy-MM-dd");
		}
		if(data.uploadDate && data.uploadDate!=='') {
			data.uploadDate = dateUtil.formatStr(new Date(parseInt(data.uploadDate)), "yyyy-MM-dd");
		}
		if(data.reviewDate && data.reviewDate!=='') {
			data.reviewDate = dateUtil.formatStr(new Date(parseInt(data.reviewDate)), "yyyy-MM-dd");
		}
		auditConfig = {
			'1':'已审核',
			'2': '未审核'
		}
		
		data.reviewStatus = auditConfig[data.reviewStatus];
		
		formUtil.renderData($('#product-form'),data);
	}
});