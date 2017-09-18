var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'layer',
    'request',
    'contract-api',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
    layer,
    ajax,
    contractApi,
    keyBind
) {
    var $ = layui.jquery,
        IDMark_A = "_a",
        treeId = 'authArea',
        ids = ajax.getFixUrlParams('ids'),
        type = ajax.getFixUrlParams('type'),//合同类型
        isPass = ajax.getFixUrlParams('isPass'),//合同是否审核通过
        provinceId = ajax.getFixUrlParams('provinceId'),
        setting = {
            view: {
                addDiyDom: addDiyDom
            },
            data: {
                simpleData: {
                    enable: true,
                    idKey: "code",
                    pIdKey: "parentCode"
                }
            },
            callback: {
                onExpand: onExpand
            }
        };

        if(!$.isEmptyObject(ids)){
            ids = ids.split(',');
        }

    function onExpand(event, treeId, treeNode) {

        $treeNode = $('#' + treeNode.code);
        if (!$treeNode.data('has-expand')) {
            checkChildren(treeNode, $treeNode.prop('checked'));
            $(this).trigger('change');
            $treeNode.data('has-expand', true);
        }
    }

    function addDiyDom(treeId, treeNode) {
        var aObj = $('#' + treeNode.tId + IDMark_A);
        var ztreeObj = $.fn.zTree.getZTreeObj(treeId);

        if (treeNode.level === 0) {
            var radioStr = '<input type="radio" name="radio_parent_' + treeNode.level + '" id="' + treeNode.code + '"  ></input>';
            aObj.before(radioStr);
            var $treeNode = $('#' + treeNode.code);
            var $pNode = $('#' + treeNode.parentCode);
            $treeNode.on('change', function() {

                if (this.checked) {
                    $(':radio:not(#' + treeNode.code + ')').prop('checked', false);
                    if (treeNode.parentCode) {
                        $pNode.prop('checked', true);
                    }
                    $(':checkbox').prop('checked', false);
                    if (!$treeNode.data('has-expand')) {
                        ztreeObj.expandNode(treeNode, false, true, true);
                    }
                    checkChildren(treeNode, true);
                } else {
                    checkChildren(treeNode, false);
                }

            });
        } else {
            var editStr = "<input type='checkbox' value='" + treeNode.code + "' data-isparent='" + treeNode.isParent + "' name='checkbox_" + treeNode.parentCode + "' id='" + treeNode.code + "' onfocus='this.blur();'></input>";
            aObj.before(editStr);
            var $treeNode = $('#' + treeNode.code);
            $treeNode.on('change', function() {
                if (treeNode.level == 1) {
                    if (!$treeNode.data('has-expand')) {
                        ztreeObj.expandNode(treeNode, false, true, true);
                    }
                    checkChildren(treeNode, $(this).prop('checked'));
                    recheckFather(treeNode, $(this).prop('checked'));
                } else {
                    recheckFather(treeNode, $(this).prop('checked'));
                }
            });
        }
    }

    function recheckFather(treeNode, check) {

        if (treeNode) {
            var pNode = treeNode.getParentNode();
            var $treeNode = $('#' + treeNode.code);
            var $pNode = pNode ? $('#' + pNode.code) : undefined;
            if ($treeNode.is(':checkbox')) {
                var length = $(':checkbox[name="checkbox_' + pNode.code + '"]:checked').length;

                if (length > 0) {

                    $pNode.prop('checked', true);
                    recheckFather(pNode, true);
                } else {
                    $pNode.prop('checked', false);
                    recheckFather(pNode, false);
                }
            } else {
                $(':radio[name="radio_parent_' + treeNode.level + '"]:not("#' + treeNode.code + '")').prop('checked', false).trigger('change');
                $treeNode.prop('checked', check);
                recheckFather(pNode, check);
            }
        }

    }

    function checkChildren(treeNode, check) {
        if (treeNode.children) {
            $.each(treeNode.children, function(index, item) {
                var $child = $('#' + item.code);
                $child.prop('checked', check);
                checkChildren(item, check);
            });
        }

    }

    function getData() {
        var ztreeObj = $.fn.zTree.getZTreeObj(treeId);
        var ids = [];
        var names = [];
        var provinceId ;
        $(':checkbox:checked').each(function(index, item) {
            // if (!$(this).data('isparent')) {
                var id = $(this).val();
                ids.push(id);
                var treeNode = ztreeObj.getNodeByParam("code", id);
                names.push(treeNode.name);
            // }
        });

        $(':radio:checked').each(function(index, item) {
            var id = $(this).attr('id');
            var fatherNode = ztreeObj.getNodeByParam("code", id);
            if(fatherNode.level === 0){
                provinceId = id ;
            }
        });
        return {
            ids: ids,
            names: names,
            provinceId:provinceId
        };
    }

    function renderData(ids,provinceId) {
        var ztreeObj = $.fn.zTree.getZTreeObj(treeId);
        if(!$.isEmptyObject(provinceId)){
            var treeNode = ztreeObj.getNodeByParam("code", provinceId);
            ztreeObj.expandNode(treeNode,true,true);
        }else{
            ztreeObj.expandAll(true);
        }

        $.each(ids, function(index, id) {
            $('#' + id).prop('checked', true);
            var treeNode = ztreeObj.getNodeByParam("code", id);
            recheckFather(treeNode, true);
        });

    }

    $(document).ready(function() {
        layer.load(0, {
            shade: 0.5
        });

        var param = {};
        //如果合同为新签并且未审核通过，可以更改省份
        if(type == '1' && isPass && isPass != '1'){
            //全国随便选
        }else if(type == '1' && !isPass ){//从分中心点击添加合同
        	//全国随便选
        }else{
            param.code = provinceId;//省内随便选
        }

        ajax.request(contractApi.getUrl('authArea'), param, function(result) {
            $.fn.zTree.init($('#' + treeId), setting, result.data);
            if(!$.isEmptyObject(ids)){
                renderData(ids,provinceId);
            }
            layer.closeAll('loading');

        });

        window.tree = {
            getData: getData
        };
    });
});
