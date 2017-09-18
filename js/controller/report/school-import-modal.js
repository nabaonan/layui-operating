/**
 * 导入学生
 * @type {[type]}
 * @author nabaonan
 */


var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'form',
    'layer',
    'request',
    'school-report-api',
    'toast',
    'key-bind',
    'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
    form,
    layer,
    ajax,
    schoolReportApi,
    toast,
    keyBind
) {
    var $ = layui.jquery;
    var count = 0;
    var f = form();

    var param = ajax.getAllUrlParam();
    var $form = $('#import-form');

    var accountInfo;
    if(param.operate == 'appendAccount'){
        accountInfo = parent.accountInfo.getAccountInfo();
    }else{
        accountInfo = parent.accountImport.getAccountInfo();
    }


    var controller = {

        init: function() {
            controller.bindEvent();
            $('#mark-id').val(accountInfo.markId);
            $('#grade-id').val(param.gradeId);
        },

        bindEvent: function() {

            $('#file').change(function() {
                var val = $(this).val();
                if (val.split('.')[1] == 'xls' || val.split('.')[1] == 'xlsx') {
                    $('#fileName').val($(this).val());
                } else {
                    toast.error('上传文件只能是excel,请重新选择上传文件');
                }

            });

            //选择
            $('.choose').click(function() {
                $('#file').trigger('click');
            });

            f.on('submit', function() {
                $('#import-form').ajaxSubmit({
                    url: schoolReportApi.getUrl('uploadStudents').url,
                    type: 'post',
                    dataType: 'json',
                    clearForm: true,
                    resetForm: true,
                    success: function(result) {
                        console.log(result.data);
                        if(!result.status){
                            toast.error('上传失败');
                        }else{
                            toast.success('上传成功');
                            var markId = result.data.markId;
                            var createDate = result.data.createDate;
                            accountInfo.markId = markId;
                            accountInfo.createDate = createDate;

                            parent.layer.open({
                                type: 1,
                                title:'校验反馈',
                                content: '<div style="padding: 20px 40px;">本次校验的'+result.data.checkTotalNumber+'条记录中，验证通过记录'+result.data.checkThroughNumber+'条，验证未通过'+result.data.checkNoThroughNumber+'条！</div>',
                                btn: ['查看'],
                                btnAlign: 'c',
                                shade: 0,
                                yes: function(index) {

                                    var url = ajax.composeUrl(webName + '/views/report/import-confirm-modal.html', {
                                        markId:markId,
                                        createDate:createDate,
                                        operate:param.operate
                                    });
                                    parent.layer.open({
                                        type: 2,
                                        title: "确定导入",
                                        area: ['80%', '80%'],
                                        scrollbar: false,
                                        btn: ['确定导入', '取消'],
                                        yes: function(index, layero) {
                                            parent.layer.closeAll();
                                            ajax.request(schoolReportApi.getUrl('confirmImport'), {
                                                isConfirmImport:'1',
                                                markId:markId,
                                                createDate:createDate
                                            }, function(result) {

                                                parent.layer.open({
                                                    type: 1,
                                                    content: '<div style="padding: 20px 40px;">本次导入的' + result.data.totalNumber + '记录中，成功导入' + result.data.throughNumber + '条记录，失败' + result.data.noThroughNumber + '条记录！</div>',
                                                    btn: ['关闭', '下载验证未通过的记录'],
                                                    shade: 0,
                                                    btn2: function(index) {
                                                        var body = layer.getChildFrame('body', index);
                                                        
                                                        var url = ajax.composeUrl(schoolReportApi.getUrl('downloadFailRecord').url,{
                                                            markId:markId,
                                                            createDate:createDate,
                                                            accountIdentifys:'1',
                                                            isImportSuccess:'2'
                                                        });
                                                        $('<a>', {
                                                            href: url
                                                        }).appendTo($(body))[0].click().remove();
                                                    }

                                                });

                                                //给父页面传值
                                                if(param.operate == 'appendAccount'){//追加帐号和其他不一样
                                                    parent.accountInfo.setImportCount(param.gradeId, result.data.throughNumber);
                                                    parent.accountInfo.reloadStudent();
                                                }else{
                                                    parent.accountImport.setImportCount(param.gradeId, result.data.throughNumber);
                                                }
                                            });

                                            return false;
                                        },
                                        btn2: function(index, layero) {
                                            ajax.request(schoolReportApi.getUrl('confirmImport'), {
                                                isConfirmImport:'-1',
                                                markId:markId,
                                                createDate:createDate
                                            }, function() {
                                                parent.layer.close(index);
                                            });
                                        },
                                        content: url
                                    });
                                }

                            });
                        }

                    },
                    error: function() {
                        toast.error('上传失败');
                    }
                });
            });
        }
    };

    controller.init();
});
