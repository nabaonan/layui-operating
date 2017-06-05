var webName = getWebName();

var requireModules = [
	'request',
	'role&authority-api',
	'toast',
	'tree-util',
	'valid-login'
];
//这里注册没有初始化注册过的 模块路径，如果是modules下有子集 的模块需要在这里注册

registeModule(window, requireModules, {
	'role&authority-api': 'api/role&authority-api'
});

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
}).use(requireModules, function(ajax, authorityApi, toast, treeUtil) {

	var check = ajax.getFixUrlParams('check') ? true : false;
	var recheckData = ajax.getFixUrlParams('recheckData');
	var groupId = ajax.getFixUrlParams('groupId');
	var treeId = 'authority-tree';

	ajax.request(authorityApi.getUrl('getAuthorityTree'), {
		groupId: groupId
	}, function(result) {
		var treeId = 'authority-tree';
		if(!$.isEmptyObject(recheckData)) {
			recheckData = recheckData.split(",");
			$.each(result.data, function(index, item) {
				delete item.checked;
				if($.inArray('' + item.id, recheckData) != -1) {
					item.checked = true;
				}
			});
		}
		
		

		treeUtil.renderTree($('#' + treeId), {
			data:{
				key: {
					name: 'menuName'
				},
				simpleData: {
					pIdKey: 'parentId'
				}
			}

		}, result.data, check);
	});

	//对外开方api，供父iframe访问
	window.tree = {
		getCheckedData: function() {
			var data = treeUtil.getCheckedData(treeId);
			return data;
		},
		getAuthorityData: function() {
			var datas = this.getCheckedData();
			var calculateResult = 0;
			var ids = [];
			$.each(datas, function(index, item) {
				ids.push(item.id);
				calculateResult += parseInt(item.authValue);
			});

			return {
				ids: ids,
				authValue: calculateResult
			};
		}
	}

});