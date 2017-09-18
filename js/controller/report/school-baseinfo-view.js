/**
 * 学校报单管理
 * @type {[type]}
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'request',
    'school-report-api',
    'school-report-store',
    'key-bind',
    'valid-login'
];

var vm = avalon.define({
    $id: 'schoolInfo',
    schoolInfo: {}
});

registeModule(window, requireModules);
//参数有顺序
layui.use(requireModules, function(
    ajax,
    schoolReportApi,
    schoolReportStore,
    keyBind
) {
    var $ = layui.jquery;
    var count = 0;
    var schooId = ajax.getFixUrlParams('id');
    var controller = {
        init: function() {
            this.bindEvent();
            this.renderData();
        },

        renderData: function() {
            
            vm.schoolInfo = schoolReportStore.getSchoolInfo();
        },

        bindEvent: function() {

            $('.next').unbind().click(function() {
                $('body').load('./school-product-update.html');
            });
            $('.prev').unbind().click(function() {
                $('body').load('./school-baseinfo-update.html');
            });

        }

    };

    controller.init();
});
