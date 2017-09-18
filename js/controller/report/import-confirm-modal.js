/**
 * 确定导入
 * @author nabaonan
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'layer',
    'request',
    'school-report-api',
    'toast',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);


var vm = avalon.define({
    $id: 'import-confirm',
    datas:[]
});

//参数有顺序
layui.use(requireModules, function(
    layer,
    ajax,
    schoolReportApi,
    toast,
    keyBind
) {
    var $ = layui.jquery;
    var count = 0;
    var $form = $('#import-form');
    var param = ajax.getAllUrlParam();
    var controller = {

        init: function() {
            controller.bindEvent();
            controller.getData();
        },

        getData: function() {
            ajax.request(schoolReportApi.getUrl('getConfirmData'),{
                markId: param.markId,
                createDate:param.createDate
            },function(result) {
                if(param.operate == 'appendAccount'){//追加帐号的时候是在查看帐号页面做的操作，所以和添加时候的逻辑不一样
                    var accountInfo = parent.accountInfo.getAccountInfo();
                    accountInfo.markId = result.data.markId;
                    accountInfo.createDate = result.data.createDate;
                }else{
                    parent.accountImport.setMarkId(result.data.markId);
                    parent.accountImport.setCreateDate(result.data.createDate);
                }
                vm.datas = result.data.schoolAccountTemps;
            });
        },

        bindEvent: function() {
            $('.confirm-import').click(function() {
                console.log('上传');
            });
        }
    };

    controller.init();
});
