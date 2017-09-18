var webName = getWebName();

var requireModules = [
    'request',
    'product-api',
    'toast',
    'tree-util',
    'key-bind',
    'valid-login'
];


registeModule(window, requireModules);

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
}).use(requireModules, function(ajax, productApi, toast, treeUtil, keyBind) {


    var ids = ajax.getFixUrlParams('ids');
    var treeId = 'area-tree';
    ajax.request(productApi.getUrl('getAreaTree'), null, function(result) {
        var treeId = 'area-tree';

        //勾选数据
        if (!$.isEmptyObject(ids)) {
            ids = ids.split(",");
            $.each(result.data, function(index, item) {
                if ($.inArray('' + item.code, ids) != -1) {
                    item.checked = true;
                }
            });
        }

        treeUtil.renderTree($('#' + treeId), {
            data: {
                key: {
                    name: 'name'
                },
                simpleData: {
                    idKey: 'code',
                    pIdKey: 'parentCode'
                }
            }
        }, result.data);
    });

    //对外开方api，供父iframe访问
    window.tree = {
        getZone: function() {

            var checked = treeUtil.getCheckedData(treeId);
            var unchecked = treeUtil.getUncheckedData(treeId);

            return treeUtil.getZone(unchecked, checked[0]);
        }
    };
});
