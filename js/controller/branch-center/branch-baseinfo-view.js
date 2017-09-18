var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'form-util',
    'request',
    'date-util',
    'key-bind',
    'branch-center-api',
    'table-util',
    'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
    formUtil,
    ajax,
    dateUtil,
    keyBind,
    branchCenterApi,
    tableUtil
) {
    var $ = layui.jquery,
        branchCenterId = ajax.getFixUrlParams('branchCenterId'),
        $form = $('#branch-baseinfo-form'),
        $table = $('#school-master-list');


    var controller = {
        init: function() {
            this.bindEvent();
            this.renderData();
        },

        renderData: function() {
            ajax.request(branchCenterApi.getUrl('getBranchCenterInfo'), {
                id:branchCenterId
            }, function(result) {
                result.data.signRep = [result.data.signRep];
                formUtil.renderData($form, result.data);
                if(result.data.centerNameOld){
                    $('#old-name-container').show();
                }
                controller.renderTable(result.data.headMasters);
            },true,null,null,{
                closeToast:true
            });
        },

        renderTable: function(data) {
            tableUtil.renderStaticTable($table, {
                data: data,
                columns: [{
                    title: '<i class="icon iconfont">&#xe635;</i> 校长',
                    data: 'name',
                    width: '100px'
                }, {
                    title: '身份证',
                    data: 'IDNumber'
                }, {
                    title: '身份证复印件',
                    width: '20%',
                    data: 'IDPhotoUrl',
                    render: function(data) {
                        var result = '<div class="pic-container">';
                        if(data) {
                            result += '<img layer-src="' + webName + '/..'+ data + '" src="' + webName +'/..'+ data + '"/>';
                        }
                        return result + '</div>';
                    }
                }, {
                    title: '<i class="icon iconfont">&#xe635;</i> 手机号',
                    data: 'phone'
                }, {
                    title: '<i class="icon iconfont">&#xe635;</i> 邮箱',
                    data: 'email'
                }, {
                    title: '<i class="icon iconfont">&#xe635;</i> 地址',
                    data: 'address'
                }]
            });
        },

        bindEvent: function() {
            //渲染切换按钮
            $table.on('draw.dt', function() {
                //图片加载失败，缺省图片设置
                $('img').each(function() {
                    $(this)[0].onerror = function() {
                        this.src = (webName + '/image/error-pic.png');
                    };
                });

                //查看缩略图特效
                layer.photos({
                    photos: '.pic-container',
                    closeBtn: true
                });
            });
        }
    };
    controller.init();
});
