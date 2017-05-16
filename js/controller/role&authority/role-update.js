var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'form',
	'form-util',
	'layer',
	'request',
	'role&authority-api',
	'valid-login'
];

registeModule(window, requireModules);

layui.use(requireModules, function(
	form, 
	formUtil,
	layer, 
	ajax,
	roleApi
) {
	var $ = layui.jquery;
	var param = ajax.getAllUrlParam();

	if(!$.isEmptyObject(param)) {
		formUtil.renderData($('#role-form'), param);
	}

	var f = new form();
	var authorityData ;//权限相关的信息
	
	//监听提交
	f.on('submit(role-form)', function(data) {
		var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
		var param = $.extend(true, data.field, authorityData);
		
		ajax.request(roleApi.getUrl('updateRole'),param,function(){
			parent.layer.close(index); //再执行关闭
			console.log('@@@@@@',param);
//			parent.roleList.refreshTable();
		});
	});
	
	$('button[type="reset"]').click(function() {
		authorityData = undefined;
	});
	


	$('#choose-authority').click(function() {
		var ids = authorityData?authorityData.ids:'';
		
		var url = ajax.composeUrl(webName + '/views/role&authority/authority-tree.html', {
			check: true,
			recheckData: ids//前端回显数据
		});
		
		layer.open({
			type: 2,
			title: "选择权限",
			content:url ,
			btn: ['确定了', '取消了'],
			yes: function(index, layero) {
				var iframeWin = window[layero.find('iframe')[0]['name']];
				authorityData = iframeWin.tree.getAuthorityData();
				layer.close(index);
			}

		});
	});

});