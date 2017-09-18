/**
 * 教师导入
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
    'school-report-store',
    'key-bind',
    'toast',
    'valid-login'
];

registeModule(window, requireModules);


var vm = avalon.define({
    $id: 'teacher-import',
    teachers: [],
    choose: function(teacher) {

    }

});
avalon.scan(document.body);

//参数有顺序
layui.use(requireModules, function(
    element,
    form,
    layer,
    ajax,
    formUtil,
    tableUtil,
    schoolReportApi,
    schoolReportStore,
    keyBind,
    toast
) {
    var $ = layui.jquery;
    var f = form();

    var accountInfo = parent.accountInfo.getAccountInfo();
    var orderId = ajax.getFixUrlParams('orderId');


    var controller = {

        init: function() {
            this.bindEvent();
            console.log(accountInfo.teachers);
            $.each(accountInfo.teachers,function(index, teacher) {
                teacher.number = 0;
            });
            vm.teachers = accountInfo.teachers;
            // this.getTeacherInfo();
        },

        getTeacherInfo: function() {
            return ajax.request(schoolReportApi.getUrl('getTeacherInfo'), {

            }, function(result) {
                vm.teachers = result.data;
            });
        },

        bindEvent: function() {
            //选择
            vm.choose = function(teacher) {
                var url = ajax.composeUrl(webName + '/views/report/choose-teacher-modal.html');
                var index = parent.layer.open({
                    type: 2,
                    title: "选择老师",
                    btn: ['确定'],
                    scrollbar: false,
                    area: ['90%', '70%'],
                    content: url,
                    yes: function(index, layero) {
                        var iframeWin = parent[layero.find('iframe')[0].name];
                        var teachers = iframeWin.list.getSelects();
                        if(teachers.length == 0){
                            toast.error('请选择教师之后再提交');
                        }else{
                            ajax.request(schoolReportApi.getUrl('commitTeacherAccount'), null,
                            function(result) {
                                accountInfo.markId = result.data.markId;
                            }, true, null, null, {
                                contentType: "application/json; charset=utf-8",
                                data: JSON.stringify({
                                    markId: accountInfo.markId,
                                    schoolAccountTemps: teachers
                                })
                            });
                            teacher.oldTeacherNumber = teachers.length;
                            layer.close(index);
                        }
                        return false;
                    }
                });
            };
        }
    };

    controller.init();

    window.accountImport = {
        /**
         *
         * @param  {[type]}                grade [学生年级]
         * @param  {[type]}                count [成功导入的个数]
         * @return {[type]}                      [description]
         * @author nabaonan
         * @date   2017-08-15T11:16:58+080
         */
        setImportCount: function(grade, count) {
            console.log('年级个数都是啥');
        },

        //
        setMarkId: function(markId) {
            accountInfo.markId = markId;
        },

        setCreateDate: function(createDate) {
            accountInfo.createDate = createDate;
        },

        confirmImport: function() {

            ajax.request(schoolReportApi.getUrl('newOpenAccount'), null, function(result) {
                //设置父页面学生数
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                $.each(vm.teachers,function(index, teacher) {
                    teacher.newTeacherNumber = parseInt(teacher.newTeacherNumber) + parseInt(teacher.number);
                    teacher.number = 0;
                });
                accountInfo.teachers = vm.teachers;
                parent.accountInfo.reloadTeacher();
                parent.layer.close(index); //再执行关闭
            },true, null, null, {
                contentType: 'application/json;charset=utf-8;',
                data: JSON.stringify({
                    newOpenAccountInputs: [].concat(vm.teachers),
                    markId: accountInfo.markId,
                    isExportData: accountInfo.isExportData,
                    orderId:orderId
                })
            });

        },

        cancelImport: function() {
            ajax.request(schoolReportApi.getUrl('confirmImport'),{
                isConfirmImport:"-1",
                markId:accountInfo.markId,
                createDate:accountInfo.createDate
            },function(result) {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
    			parent.layer.close(index); //再执行关闭
            });
        }

    };
});
