/**
 * 学生导入
 * @type {[type]}
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'element',
    'form',
    'layer',
    'request',
    'form-util',
    'table-util',
    'school-report-api',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);

var vm = avalon.define({
    $id: 'student-import',
    grades: {

    },
    import: function(grade) {

    }

});


//参数有顺序
layui.use(requireModules, function(
    element,
    form,
    layer,
    ajax,
    formUtil,
    tableUtil,
    schoolReportApi,
    keyBind
) {
    var $ = layui.jquery;
    var f = form();
    var orderId = ajax.getFixUrlParams('orderId');
    var operate = ajax.getFixUrlParams('operate');

    var accountInfo = parent.accountInfo.getAccountInfo();

    var controller = {

        init: function() {
            controller.bindEvent();

            vm.grades = accountInfo.grades;

            vm.grades.number = 0;
        },

        bindEvent: function() {

            //导入
            vm.import = function(grade) {
                var url = ajax.composeUrl(webName + '/views/report/school-import-modal.html',{
                    operate:operate,
                    gradeId:grade.gradeId
                });
                var index = parent.layer.open({
                    type: 2,
                    title: "导入",
                    scrollbar: false,
                    area: '50%',
                    content: url,
                    success: function() {
                        parent.layer.iframeAuto(index);
                    }
                });
            };

        }

    };

    controller.init();
    window.accountImport = {


        confirmImport: function() {

            ajax.request(schoolReportApi.getUrl('newOpenAccount'), null, function(result) {
                //设置父页面学生数
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                accountInfo.markId = result.data.markId;
                accountInfo.isExportData = result.data.isExportData;
                accountInfo.grades.newStudentNumber = parseInt(accountInfo.grades.newStudentNumber) + parseInt(vm.grades.number);
                parent.accountInfo.reloadStudent();
                parent.layer.close(index); //再执行关闭
            }, true, null, null, {
                contentType: 'application/json;charset=utf-8;',
                data: JSON.stringify({
                    newOpenAccountInputs: [{
                        accountIdentify: '1',
                        number: vm.grades.number
                    }],
                    markId: accountInfo.markId,
                    isExportData: accountInfo.isExportData,
                    orderId: orderId
                })
            });

        },

        cancelImport: function() {
            ajax.request(schoolReportApi.getUrl('confirmImport'), {
                isConfirmImport: "-1",
                markId: accountInfo.markId,
                isExportData: accountInfo.isExportData,
                createDate: accountInfo.createDate,
                orderId: orderId
            }, function(result) {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
        }

    };
});
