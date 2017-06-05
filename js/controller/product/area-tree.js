var webName = getWebName();

var requireModules = [
	'request',
	'product-api',
	'toast',
	'tree-util',
	'valid-login'
];
//这里注册没有初始化注册过的 模块路径，如果是modules下有子集 的模块需要在这里注册

registeModule(window, requireModules);

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
}).use(requireModules, function(ajax, productApi, toast, treeUtil) {

	var check = ajax.getFixUrlParams('check') ? true : false;
	var ids = ajax.getFixUrlParams('ids');
	var treeId = 'area-tree';
	ajax.request(productApi.getUrl('getAreaTree'),null, function(result) {
		var treeId = 'area-tree';
		
		//勾选数据
		if(!$.isEmptyObject(ids)) {
			ids = ids.split(",");
			$.each(result.data, function(index, item) {
				if($.inArray(''+item.code, ids) != -1) {
					item.checked = true;
				}
			});
		}
		
		treeUtil.renderTree($('#' + treeId), {
			data:{
				key: {
					name: 'name'
				},
				simpleData: {
					idKey:'code',
					pIdKey: 'parentCode'
				}
			},
			check:{
				chkboxType: { "Y": "", "N": "" }//选择的哪个节点就是哪个节点,选择父不关联子节点，选择子节点不关联父节点			
			}
		}, result.data, check);
	});
	
	//对外开方api，供父iframe访问
	window.tree = {
		getCheckedData: function() {
			return treeUtil.getCheckedData(treeId);
		}
	}
});