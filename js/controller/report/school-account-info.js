/**
 * 帐号信息
 * @author nabaonan
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'form',
    'form-util',
    'element',
    'layer',
    'request',
    'school-report-api',
    'school-report-store',
    'toast',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);


var vm = avalon.define({
    $id: 'school-account-info',
    gradeNumber: 0,
    studentNumber: 0,
    schoolName: '',
    searchStudentContent: '',
    searchTeacherContent: '',
    chooseStudent: '',
    chooseTeacher: '',
    primarySchoolGrades: [], //checkbox
    middleSchoolGrades: [], //checkbox
    seniorSchoolGrades: [], //checkbox
    students: [],
    teachers: [],
    choosedStudents: [],
    choosedTeachers: [],

    teacherNumber: 0,
    leaderNumber: 0,
    managerNumber: 0,
    operate: '',

    backRender: function() {

    },
    tableRendered: function() {

    }

});
avalon.scan(document.body);

//参数有顺序
layui.use(requireModules, function(
    form,
    formUtil,
    element,
    layer,
    ajax,
    schoolReportApi,
    schoolReportStore,
    toast,
    keyBind
) {
    var $ = layui.jquery;
    var count = 0;
    var e = element();
    var f = form();
    var $studentTable = $('#student-table');
    var $teacherTable = $('#teacher-table');
    var $studentInfo = $('#student-info');

    var operate = schoolReportStore.getOperate();
    var accountInfo = schoolReportStore.getAccountInfo();
    var orderInfo = schoolReportStore.getCurrentOrderInfo();
    var schoolInfo = schoolReportStore.getSchoolInfo();
    vm.schoolName = schoolInfo.schoolName;

    var controller = {

        init: function() {
            controller.bindEvent();


            controller.renderGradeCondition();
            e.tabChange('account-info', 'student-account');

            vm.operate = operate;

            if (operate == 'appendAccount') {
                controller.composeClassInfo();
                controller.composeTeacherInfo();
            }

            vm.gradeNumber = accountInfo.gradeNumber;
            vm.studentNumber = accountInfo.studentNumber;
        },

        /**
         * 追加帐号时候用，需要事先请求好数据，因为删除帐号需要更改对应的数量
         * @return {[type]}                [description]
         * @author nabaonan
         * @date   2017-09-13T20:12:32+080
         */
        composeClassInfo: function() {


            if ($.isEmptyObject(accountInfo.grades)) {

                var classInfoDefered = controller.getClassInfo();
                var gradeDefered = controller.getTotalGrades();

                $.when(classInfoDefered, gradeDefered).done(function(classInfo, gradeInfo) {
                    var grades = {};
                    grades.newStudentNumber = classInfo[0].data.newStudentNumber;
                    grades.gradeInfo = [];
                    var validGrades = controller.filterGrades(gradeInfo[0].data);
                    $.each(validGrades, function(index, g) {
                        var flag = false;
                        $.each(classInfo[0].data.gradeInfo, function(index, c) {
                            if (c.gradeId == g.key) {
                                grades.gradeInfo.push(c);
                                flag = true;
                            }
                        });
                        if (!flag) { //添加时候没有返回课程信息，需要用年级信息补全
                            grades.gradeInfo.push({
                                gradeId: g.key,
                                gradeNumber: 0,
                                studentNumber: 0,
                                gradeName: g.value
                            });
                        }
                    });
                    accountInfo.grades = grades;
                    controller.calGradeNumber();

                });

            }else{
                controller.calGradeNumber();
            }

        },

        /**
         * 计算课程信息的总班级数
         * @return {[type]}                [description]
         * @author nabaonan
         * @date   2017-09-14T12:03:37+080
         */
        calGradeNumber: function() {
            var totalGradeNumber = 0;
            $.each(accountInfo.grades.gradeInfo, function(index, grade) {
                totalGradeNumber += parseInt(grade.gradeNumber);
            });
            accountInfo.gradeNumber = totalGradeNumber;
            vm.gradeNumber = totalGradeNumber;
        },

        getClassInfo: function() {
            return ajax.request(schoolReportApi.getUrl('getClassInfo'), {
                orderId: orderInfo.id
            }, function(result) {
                accountInfo.grades = result.data;
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

        /**
         * 获取所有年级的关系
         * @return {[type]}                [description]
         * @author nabaonan
         * @date   2017-08-15T12:12:50+080
         */
        getTotalGrades: function() {
            //暂时不许删
            var schoolOrderLevels = [];
            $.each(orderInfo.schoolOrderLevels, function(index, item) {
                schoolOrderLevels.push(item.levelId);
            });
            return ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_grade',
                con: schoolOrderLevels.join(',') //学段
            }, function(result) {

            });

        },

        /**
         * 组织教师信息（追加时候需要）
         * @return {[type]}                [description]
         * @author nabaonan
         * @date   2017-09-14T10:16:59+080
         */
        composeTeacherInfo: function() {
            if ($.isEmptyObject(accountInfo.teachers)) {
                ajax.request(schoolReportApi.getUrl('getTeacherInfo'), {
                    orderId: orderInfo.id
                }, function(result) {
                    accountInfo.teachers = result.data;
                });
            }
        },

        renderGradeCondition: function() {
            var schoolInfo = schoolReportStore.getSchoolInfo();
            var schoolLevels = schoolInfo.schoolLevels; //学段
            var education = schoolInfo.education; //学制
            $.each(schoolLevels, function(index, level) {

                switch (level) {
                    case '01': //小学
                        controller.renderPrimarySchoolGrade(level);
                        break;
                    case '02': //初中
                        controller.renderMiddleSchoolGrade(level);
                        break;
                    case '03': //高中
                        controller.renderSeniorSchoolGrade(level);
                }
            });

        },

        renderPrimarySchoolGrade: function(level) {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_grade',
                con: level
            }, function(result) {
                vm.primarySchoolGrades = result.data;
            });
        },

        renderMiddleSchoolGrade: function(level) {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_grade',
                con: level
            }, function(result) {
                vm.middleSchoolGrades = result.data;
            });
        },

        renderSeniorSchoolGrade: function(level) {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_grade',
                con: level
            }, function(result) {
                vm.seniorSchoolGrades = result.data;
            });
        },

        composeStudentCondition: function() {
            var r = formUtil.composeCheckboxesValue($studentInfo);
            if ($.isEmptyObject(r.grade)) {
                r.grade = [];
            }
            var result = {
                accountOrName: vm.searchStudentContent,
                accountIdentifys: ['1'],
                gradeIds: r.grade,
                isImportSuccess:'1',
                isNormal: operate == 'viewAccount' ? '1' : '0', //是否差正式数据
                orderId: (operate == 'viewAccount' || operate == 'appendAccount') ? orderInfo.id : '',
                markId: accountInfo.markId
            };
            return result;
        },

        composeTeacherCondition: function() {
            var result = {
                accountOrName: vm.searchTeacherContent,
                accountIdentifys: ['2', '3', '4'],
                gradeId: '',
                isImportSuccess:'1',
                orderId: (operate == 'viewAccount' || operate == 'appendAccount') ? orderInfo.id : '',
                isNormal: operate == 'viewAccount' ? '1' : '0', //是否差正式数据
                markId: accountInfo.markId
            };
            return result;
        },

        searchStudent: function() {
            layer.load(0, {
                shade: 0.5
            });
            var param = controller.composeStudentCondition();
            ajax.request(schoolReportApi.getUrl('getAccountList'), null, function(result) {
                layer.closeAll('loading');
                $.each(result.data, function(index, item) {
                    item.checked = false;
                });

                vm.students = result.data;
                vm.studentNumber = result.studentNumber;
                accountInfo.totalStudentNumber = result.studentNumber;
                //年级数是由前台计算
                if(operate == 'viewAccount'){//只有查看帐号的时候是读取后台返回班级数
                    vm.gradeNumber = result.gradeNumber;
                }
            }, true, null, null, {
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(param)
            });
        },

        searchTeacher: function() {
            layer.load(0, {
                shade: 0.5
            });
            var param = controller.composeTeacherCondition();
            ajax.request(schoolReportApi.getUrl('getAccountList'), null, function(result) {
                layer.closeAll('loading');
                $.each(result.data, function(index, item) {
                    item.checked = false;
                });

                vm.teachers = result.data;
                vm.teacherNumber = result.teacherNumber;
                vm.leaderNumber = result.leaderNumber;
                vm.managerNumber = result.managerNumber;
                accountInfo.teacherNumber = result.teacherNumber;
            }, true, null, null, {
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(param)
            });
        },

        exportStudent: function() {
            var param = controller.composeStudentCondition();
            var url = ajax.composeUrl(schoolReportApi.getUrl('exportList').url, param);
            $('<a>', {
                href: url
            }).appendTo($('body'))[0].click();

            var _this = $(this);
            _this.attr('disabled', 'disabled');
            _this.html('<i class="layui-icon layui-anim layui-anim-rotate layui-anim-loop">&#xe63d;</i> 正在导出学生...');
            setTimeout(function() {
                _this.removeAttr('disabled');
                _this.html('<i class="layui-icon">&#xe61e;</i> 导出');
            }, 1500);
        },

        exportTeacher: function() {
            var param = controller.composeTeacherCondition();
            var url = ajax.composeUrl(schoolReportApi.getUrl('exportList').url, param);
            $('<a>', {
                href: url
            }).appendTo($('body'))[0].click();

            var _this = $(this);
            _this.attr('disabled', 'disabled');
            _this.html('<i class="layui-icon layui-anim layui-anim-rotate layui-anim-loop">&#xe63d;</i> 正在导出教师...');
            setTimeout(function() {
                _this.removeAttr('disabled');
                _this.html('<i class="layui-icon">&#xe61e;</i> 导出');
            }, 1500);
        },

        addStudent: function() {
            var $form = $(this).parents('.layui-form');


            var data = {
                orderId: orderInfo.id,
                operate: operate

            };
            var url = ajax.composeUrl(webName + '/views/report/student-import-modal.html', data);

            var index = layer.open({
                type: 2,
                title: "导入学生信息",
                scrollbar: false,
                btn: ['确定'],
                area: ['80%', '80%'],
                content: url,
                btnAlign: 'r',
                yes: function(index, layero) {
                    var iframeWin = window[layero.find('iframe')[0].name];
                    iframeWin.accountImport.confirmImport();
                    controller.calGradeNumber();
                },
                cancel: function(index, layero) {
                    // var iframeWin = window[layero.find('iframe')[0].name];
                    // iframeWin.accountImport.cancelImport();
                }

            });

        },

        stopStudent: function() {
            var ids = formUtil.composeCheckboxesValue($studentTable);
            if ($.isEmptyObject(ids)) {
                toast.warn('请选择要停用的帐号');
                return;
            }

            layer.confirm('确定停用这些帐号吗?', {
                icon: 3,
                title: '提示'
            }, function(index) {
                ajax.request(schoolReportApi.getUrl('enableAccount'), {
                    ids: ids,
                    isEnable: '-1'
                }, function(result) {
                    controller.searchStudent();
                    toast.success('停用成功');
                });
                layer.close(index);
            });
        },

        startStudent: function() {

            var ids = formUtil.composeCheckboxesValue($studentTable);
            if ($.isEmptyObject(ids)) {
                toast.warn('请选择要启用的帐号');
                return;
            }

            layer.confirm('确定启用这些帐号吗?', {
                icon: 3,
                title: '提示'
            }, function(index) {
                ajax.request(schoolReportApi.getUrl('enableAccount'), {
                    ids: ids,
                    isEnable: '1'
                }, function(result) {
                    controller.searchStudent();
                    toast.success('启用成功');
                });
                layer.close(index);
            });
        },

        addTeacher: function() {
            var $form = $(this).parents('.layui-form');
            var data = {
                orderId: orderInfo.id
            };
            var url = ajax.composeUrl(webName + '/views/report/teacher-import-modal.html', data);

            var index = layer.open({
                type: 2,
                title: "导入教师信息",
                scrollbar: false,
                btn: ['确定'],
                area: ['80%', '80%'],
                content: url,
                btnAlign: 'r',
                yes: function(index, layero) {
                    var iframeWin = window[layero.find('iframe')[0].name];
                    iframeWin.accountImport.confirmImport();
                },
                cancel: function(index, layero) {
                    // var iframeWin = window[layero.find('iframe')[0].name];
                    // iframeWin.accountImport.cancelImport();
                }
            });
        },

        stopTeacher: function() {
            var ids = formUtil.composeCheckboxesValue($teacherTable);
            if ($.isEmptyObject(ids)) {
                toast.warn('请选择要停用的帐号');
                return;
            }

            layer.confirm('确定停用这些帐号吗?', {
                icon: 3,
                title: '提示'
            }, function(index) {
                ajax.request(schoolReportApi.getUrl('enableAccount'), {
                    ids: ids,
                    isEnable: '-1'
                }, function(result) {
                    controller.searchTeacher();
                    toast.success('停用成功');
                });
                layer.close(index);
            });
        },

        startTeacher: function() {
            var ids = formUtil.composeCheckboxesValue($teacherTable);
            if ($.isEmptyObject(ids)) {
                toast.warn('请选择要启用的帐号');
                return;
            }

            layer.confirm('确定启用这些帐号吗?', {
                icon: 3,
                title: '提示'
            }, function(index) {
                ajax.request(schoolReportApi.getUrl('enableAccount'), {
                    ids: ids,
                    isEnable: '1'
                }, function(result) {
                    controller.searchTeacher();
                    toast.success('启用成功');
                });
                layer.close(index);
            });
        },

        downloadTemplate: function() {

            $('<a>', {
                href: schoolReportApi.getUrl('downloadStudentTemplate').url
            })[0].click();

            var _this = $(this);
            _this.attr('disabled', 'disabled');
            _this.html('<i class="layui-icon layui-anim layui-anim-rotate layui-anim-loop">&#xe63d;</i> 正在导出...');
            setTimeout(function() {
                _this.removeAttr('disabled');
                _this.html('<i class="layui-icon">&#xe61e;</i> 下载导入模版');
            }, 1500);
        },

        /**
         * 同步上一步的新开个数，需要在这里减去已删除的个数
         * @param  {[type]}                minusNumber [description]
         * @return {[type]}                            [description]
         * @author nabaonan
         * @date   2017-09-09T15:52:28+080
         */
        minusNewNumber: function(minusArr) {
            $.each(minusArr, function(index, item) {
                switch (item.accountIdentify) {
                    case '1': //学生
                        if (item.isNewOpen == '2') { //不是新开
                            $.each(accountInfo.grades.gradeInfo, function(index, grade) {
                                if (grade == item.orderGrade) {
                                    grade.studentNumber = parseInt(grade.studentNumber) - parseInt(item.deleteNumber);
                                }
                            });
                        } else if (item.isNewOpen == '1') { //新开
                            accountInfo.grades.newStudentNumber = parseInt(accountInfo.grades.newStudentNumber) - parseInt(item.deleteNumber);
                        }
                        break;
                    case '2':
                    case '3':
                    case '4': //教师//领导/管理员
                        $.each(accountInfo.teachers, function(index, teacher) {
                            if (teacher.accountIdentify == item.accountIdentify) {
                                teacher.newTeacherNumber = parseInt(teacher.newTeacherNumber) - parseInt(item.deleteNumber);
                            }
                        });
                        break;
                }
            });
        },

        bindEvent: function() {



            $('.search-student').unbind().click(function() {
                controller.searchStudent();
            });

            $('.search-teacher').unbind().click(function() {
                controller.searchTeacher();
            });

            $('.export-student').unbind().click(controller.exportStudent);

            $('.export-teacher').unbind().click(controller.exportTeacher);

            //导入学生
            $('.operate').off('click', '.add-student').on('click', '.add-student', controller.addStudent);
            //启用学生
            $('.operate').off('click', '.start-student').on('click', '.start-student', controller.startStudent);
            //停用学生
            $('.operate').off('click', '.stop-student').on('click', '.stop-student', controller.stopStudent);
            //导入老师
            $('.operate').off('click', '.add-teacher').on('click', '.add-teacher', controller.addTeacher);
            //启用老师
            $('.operate').off('click', '.start-teacher').on('click', '.start-teacher', controller.startTeacher);
            //停用老师
            $('.operate').off('click', '.stop-teacher').on('click', '.stop-teacher', controller.stopTeacher);
            //下载导入模版
            $('.download-template').unbind().click(controller.downloadTemplate);

            vm.tableRendered = function() {
                f.render('checkbox');
                $studentTable.find(':checkbox:checked').attr('checked', false);
                $teacherTable.find(':checkbox:checked').attr('checked', false);
                vm.choosedStudents.clear();
                vm.choosedTeachers.clear();
                console.log(vm.choosedTeachers, vm.searchStudents);
            };

            f.on('checkbox(all)', function(data) {
                $(data.elem).parents('table').find('tbody :checkbox[lay-skin="primary"]').each(function() {
                    $(this).prop('checked', data.elem.checked);
                    f.render('checkbox');
                });
            });

            f.on('checkbox', function(data) {

                var $all = $(this).parents('table').find(':checkbox[value="all"]');
                if (data.value != "all") {
                    var checked = data.elem.checked;
                    if (checked == false) {
                        $all.prop('checked', checked);
                        f.render('checkbox');
                    }
                }
            });

            $studentTable.off('click', '.showClass').on('click', '.showClass', function() {
                var data = $(this).data();

                var url = ajax.composeUrl(webName + '/views/report/show-class-modal.html', data);

                var index = layer.open({
                    type: 2,
                    title: "查看班级",
                    area: ['50%', '50%'],
                    scrollbar: false,
                    content: url
                });
            });

            vm.backRender = function() {
                f.render();
            };

            $('table').on('blur', 'input', function() {
                var $this = $(this);

                var id = $this.data('id');
                var remark = $this.val();
                ajax.request(schoolReportApi.getUrl('updateAccountTemp'), {
                    id: id,
                    remark: remark
                });

            });

            e.on('tab(account-info)', function(data) {
                var $content = $(data.elem).find('.layui-show');
                switch (data.index) {
                    case 0:
                        controller.searchStudent();
                        break;
                    case 1:
                        controller.searchTeacher();
                        break;
                }
            });

            $('.delete-account').unbind().click(function() {
                var $form = $(this).parents('.layui-form');

                var ids = formUtil.composeCheckboxesValue($form);
                if ($.isEmptyObject(ids)) {
                    toast.warn('请选择要删除的帐号');
                    return;
                }


                layer.confirm('确定删除这些帐号吗?', {
                    icon: 3,
                    title: '提示'
                }, function(index) {
                    ajax.request(schoolReportApi.getUrl('deleteAccount'), {
                        ids: ids,
                        accountIdentify: $form.find('#student-table')[0] ? '1' : '0'
                    }, function(result) {
                        toast.success('删除成功');
                        controller.minusNewNumber(result.data);
                        controller.searchStudent();
                        controller.searchTeacher();
                    });
                    layer.close(index);
                });

            });

            $('#operate').off('click', '.next').on('click', '.next', function() {
                $('body').load('./school-order.html');
            });

            $('.prev').unbind().on('click', function() {
                if (operate == 'appendAccount' || operate == 'viewAccount') { //追加帐号 查看帐号
                    $('body').load('./school-choose-order2.html');
                } else {
                    $('body').load('./school-account-import.html');
                }

            });
        }
    };

    window.accountInfo = {
        reloadStudent: function() {
            controller.searchStudent();
        },
        reloadTeacher: function() {
            controller.searchTeacher();
        },
        getAccountInfo: function() { //这个是追加帐号的时候需要用
            return schoolReportStore.getAccountInfo();
        },
        setImportCount: function(grade, count) {
            var accountInfo = schoolReportStore.getAccountInfo();
            $.each(accountInfo.grades.gradeInfo, function(index, item) {
                if (item.gradeId == grade) {
                    item.studentNumber = parseInt(item.studentNumber) + parseInt(count);
                }
            });
        },
    };

    controller.init();

});
