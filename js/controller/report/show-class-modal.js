/**
 * 显示课程信息
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
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);

var vm = avalon.define({
    $id:'show-class',
    name:'',
    account:'',
    courses:[]
});

//参数有顺序
layui.use(requireModules, function(
    layer,
    ajax,
    schoolReportApi,
    keyBind
) {
    var param = ajax.getAllUrlParam();
    vm.name = param.name;
    vm.account = param.account;
    ajax.request(schoolReportApi.getUrl('getClassList'),{
        orderNumber:param.orderNumber
    },function(result) {
        vm.courses = result.data;
    });
});
