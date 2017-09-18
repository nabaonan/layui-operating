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
            if (result.status == true) {
                return result.data;
            } else {
                toast.error(result.msg)
                return '';
            }
        },

        selectNode: function(treeId, id) {
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
        },
		getUncheckedData: function(treeId){
			var treeObj = $.fn.zTree.getZTreeObj(treeId);
            return treeObj.getCheckedNodes(false);
		},

		/**
		 * [获取勾选地区]
		 * @param  {[type]}                dataList [位选中的list]
		 * @param  {[type]}                data     [选中的对象]
		 * @return {[type]}                         [包含省市区的对象]
		 */
        getZone: function(dataList, data) {
            var zone = {},
                callData = {},
                myZone = {};
            var parentArray = $.grep(dataList, function(item, index) {
                return item.code == data.parentCode;
            });
            if (parentArray.length > 0) {
                var parent = parentArray[0];
                switch (parent.level) {
                    case 1:
                        zone.area = data;
                        zone.city = parent;
                        callData = result.getZone.call(this, dataList, parent);
                        break;
                    case 0:
                        zone.city = data;
                        zone.province = parent;
                        break;
                }
                myZone = $.extend({}, callData, zone);
            } else {
                myZone.province = data;
            }
            return myZone;
        }

    };

    exports("tree-util", result);
});
