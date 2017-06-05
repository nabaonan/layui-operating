/*
 
 * 树形组件，依赖ztree 
 * @author nabaonan
 * 
 * 
 * */

layui.define(function(exports) {

	var result = {
		renderTree: function($tree, option, data, isCheckbox) {
			var setting = {
				view: {
					selectedMulti: false
				},
				check: {
					chkStyle: (isCheckbox ? 'checkbox' : 'radio'),
					enable: true,
					radioType: "all"
				},
				data: {
					key: {
						name: 'title',
						url: 'xurl'
					},
					simpleData: {
						enable: true,
						idKey: 'id',
						pIdKey: 'fid',
						rootPId: 0
					}
				}

			};

			var totalSetting = $.extend(true, setting, option);

			$.fn.zTree.init($tree, totalSetting, data);
		},
		
		dataFilter: function(treeId, parentNode, result) {
			if(result.status == true) {
				return result.data;
			} else {
				toast.error(result.msg)
				return '';
			}
		},
		
		selectNode: function(treeId,id) {
			var treeObj = $.fn.zTree.getZTreeObj(treeId);
			var node = zTree.getNodeByParam('id', id);
			zTree.selectNode(node); //选择点  

		},
		getCheckedData: function(treeId) {
			var treeObj = $.fn.zTree.getZTreeObj(treeId);
			return treeObj.getCheckedNodes(true);
		},
		
		getSelectData: function(treeId) {
			var treeObj = $.fn.zTree.getZTreeObj(treeId);
			return treeObj.getSelectedNodes();
		}
	}

	exports("tree-util", result);
});