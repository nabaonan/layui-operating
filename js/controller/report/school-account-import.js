/**
 * 学校产品
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
    $id: 'account-import',
    grades: {},
    schoolInfo: {},
    productInfo: {},
    teachers: [],
    import: function(grade) {

    },
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
    var count = 0;
    var $form = $('#product-info'),
        $table = $('#account-table'),
        accountInfo = schoolReportStore.getAccountInfo(),
        orderInfo = schoolReportStore.getCurrentOrderInfo();


    var controller = {

        init: function() {
            controller.bindEvent();
            vm.schoolInfo = schoolReportStore.getSchoolInfo();
            vm.productInfo = schoolReportStore.getProductInfo();
            var classInfoDefered = controller.getClassInfo();
            var gradeDefered = controller.getTotalGrades();


            if (!$.isEmptyObject(accountInfo)) {
                vm.grades = accountInfo.grades;
                vm.teachers = accountInfo.teachers;
            } else {
                $.when(classInfoDefered, gradeDefered).done(function(classInfo, gradeInfo) {
                    vm.grades = classInfo[0].data;
                    vm.grades.gradeInfo = [];
                    var validGrades = controller.filterGrades(gradeInfo[0].data);
                    $.each(validGrades, function(index, g) {
                        var flag = false;
                        $.each(classInfo[0].data.gradeInfo, function(index, c) {
                            if (c.gradeId == g.key) {
                                vm.grades.gradeInfo.push(c);
                                flag = true;
                            }
                        });
                        if (!flag) { //添加时候没有返回课程信息，需要用年级信息补全
                            vm.grades.gradeInfo.push({
                                gradeId: g.key,
                                gradeNumber: 0,
                                studentNumber: 0,
                                gradeName: g.value
                            });
                        }
                    });

                });

                controller.getTeacherInfo();
            }
        },

        getClassInfo: function() {
            return ajax.request(schoolReportApi.getUrl('getClassInfo'), {
                orderId: orderInfo.id
            }, function(result) {

            });
        },

        getTeacherInfo: function() {
            return ajax.request(schoolReportApi.getUrl('getTeacherInfo'), {
                orderId: orderInfo.id
            }, function(result) {
                vm.teachers = result.data;
            });
        },

        downloadTemplate: function() {

            $('<a>', {
                href: webName + '/../web/school-report/downloadStudentTemplate'
            }).appendTo($('body'))[0].click().remove();
        },

        /**
         * 获取所有年级的关系
         * @return {[type]}                [description]
         * @author nabaonan
         * @date   2017-08-15T12:12:50+080
         */
        getTotalGrades: function() {
            //暂时不许删
            var schoolLevels = vm.productInfo.schoolOrderLevels.join(',');
            return ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_grade',
                con: schoolLevels //学段
            }, function(result) {

            });

        },

        /**
         * 排出多余的年级
         * @return {[type]}                [description]
         * @author nabaonan
         * @date   2017-08-15T12:14:47+080
         */
        filterGrades: function(grades) {
            return $.grep(grades, function(item, index) {
                return item.code != '1';
            });
        },

        bindEvent: function() {

            //下一步
            $('.next').unbind().click(function() {
                var totalGradeNumber = 0;
                var totalStudentNumber = 0;
                var totalTeacherNumber = 0;
                var teacherNumber = 0;
                $.each(vm.grades.gradeInfo, function(index, item) {
                    totalGradeNumber += parseInt(item.gradeNumber);
                    totalStudentNumber += parseInt(item.studentNumber);
                });
                totalStudentNumber += vm.grades.newStudentNumber;
                accountInfo.gradeNumber = totalGradeNumber;
                accountInfo.studentNumber = totalStudentNumber;

                $.each(vm.teachers, function(index, item) {
                    if (!item.number) {
                        item.number = 0;
                    }
                    if (item.accountIdentify == '2') { //教师
                        teacherNumber = parseInt(item.newTeacherNumber) + parseInt(item.oldTeacherNumber) + parseInt(item.number);
                    }
                    totalTeacherNumber += parseInt(item.newTeacherNumber) + parseInt(item.oldTeacherNumber) + parseInt(item.number);
                });

                accountInfo.teachers = vm.teachers;
                accountInfo.grades = vm.grades;
                accountInfo.totalTeacherNumber = totalTeacherNumber; //教师总数量，包括领导和管理元
                accountInfo.totalStudentNumber = totalStudentNumber;
                accountInfo.teacherNumber = teacherNumber;
                var accountInputs = [].concat(vm.teachers).concat([{
                    //学生新开
                    accountIdentify: "1",
                    number: vm.grades.number
                }]);

                var orderId;
                if (orderInfo) {
                    orderId = orderInfo.id;
                }

                ajax.request(schoolReportApi.getUrl('newOpenAccount'), null, function(result) {
                    accountInfo.markId = result.data.markId;
                    accountInfo.isExportData = result.data.isExportData;
                    //新建帐号后，输入框清零，

                    $.each(accountInfo.teachers, function(index, teacher) {
                        if (teacher.number != 0) {
                            teacher.newTeacherNumber = parseInt(teacher.newTeacherNumber) + parseInt(teacher.number);
                            teacher.number = 0;
                        }

                    });
                    if (accountInfo.grades.number != 0) {
                        accountInfo.grades.newStudentNumber = parseInt(accountInfo.grades.newStudentNumber) + parseInt(accountInfo.grades.number);
                        accountInfo.grades.number = 0;
                    }

                    schoolReportStore.setAccountInfo(accountInfo);
                    $('body').load('./school-account-info.html');
                }, true, null, null, {
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify({
                        newOpenAccountInputs: accountInputs,
                        markId: accountInfo.markId,
                        orderId: orderId,
                        isExportData: accountInfo.isExportData
                    })
                });

            });
            //返回
            $('.prev').unbind().click(function() {
                $('body').load('./school-product-update.html');
            });

            //下载模版
            $('.download-template').click(controller.downloadTemplate);


            //导入学生
            $('#class-table').on('click', '.import', function() {
                var gradeId = $(this).data('gradeId');
                var accountInfo = schoolReportStore.getAccountInfo();
                var url = ajax.composeUrl(webName + '/views/report/school-import-modal.html', {
                    gradeId: gradeId,
                    markId: accountInfo.markId,
                    createDate: accountInfo.createDate
                });
                var index = layer.open({
                    type: 2,
                    title: "导入",
                    scrollbar: false,
                    area: '30%',
                    content: url,
                    success: function() {
                        layer.iframeAuto(index);
                    }
                });
            });

            //选择老师
            $('#account-table').on('click', '.choose', function() {
                var accountIdentify = $(this).data('accountIdentify');
                var accountInfo = schoolReportStore.getAccountInfo();
                var url = ajax.composeUrl(webName + '/views/report/choose-teacher-modal.html', {
                    orderId: orderInfo.id,
                    schoolId: vm.schoolInfo.schoolId,
                    accountIdentify: accountIdentify
                });
                var index = layer.open({
                    type: 2,
                    title: "选择老师",
                    btn: '提交',
                    scrollbar: false,
                    area: ['80%', '80%'],
                    content: url,
                    yes: function(index, layero) {
                        var iframeWin = window[layero.find('iframe')[0].name];
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
                    }
                });
            });

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
            $.each(vm.grades.gradeInfo, function(index, item) {
                if (item.gradeId == grade) {
                    item.studentNumber = parseInt(item.studentNumber) + parseInt(count);
                }
            });
        },

        /**
         * 设置markId
         * @param  {[type]}                markId [description]
         * @return {[type]}                       [description]
         * @author nabaonan
         * @date   2017-09-06T11:35:46+080
         */
        setMarkId: function(markId) {
            var accountInfo = schoolReportStore.getAccountInfo();
            accountInfo.markId = markId;
        },

        /**
         * 设置创建时间，这个是后台需要的，前台没有用
         * @param  {[type]}                createDate [description]
         * @return {[type]}                           [description]
         * @author nabaonan
         * @date   2017-09-06T11:35:59+080
         */
        setCreateDate: function(createDate) {
            var accountInfo = schoolReportStore.getAccountInfo();
            accountInfo.createDate = createDate;
        },

        getAccountInfo: function() {
            return schoolReportStore.getAccountInfo();
        }
    };
});
