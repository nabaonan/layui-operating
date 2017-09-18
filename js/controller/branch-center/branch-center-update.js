var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'key-bind',
    'element',
    'form',
    'layer',
    'request',
    'btns',
    'table-util',
    'form-util',
    'branch-center-api',
    'role&authority-api',
    'toast',
    'upload',
    'file-api',
    'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
    keyBind,
    element,
    form,
    layer,
    ajax,
    btns,
    tableUtil,
    formUtil,
    branchCenterApi,
    roleApi,
    toast,
    upload,
    fileApi
) {
    var $ = layui.jquery,
        f = new form(),
        $form = $('#branch-center-form'),
        $table = $('#school-master-list'),
        count = 0, //记录动态框的个数;
        id = ajax.getFixUrlParams('id'),
        auditStatus = ajax.getFixUrlParams('auditStatus'),
		rowCount = 0;//标识校长每行的index
    var controller = {
        init: function() {

            controller.bindEvent();
            controller.renderSignRep();
            if(!$.isEmptyObject(id)){
                $('#code').attr('readonly',true).addClass('layui-disabled');
            }

            var interval = setInterval(function() {
                if (count == 1) {
                    if (!$.isEmptyObject(id)) {
                        controller.renderData(id);
                    } else {
                        controller.renderEditSchoolMasterTable([]);
                    }
                    clearInterval(interval);
                    f.render();
                }
            },0);
        },

        renderData: function(id) {
            ajax.request(branchCenterApi.getUrl('getBranchCenterInfo'), {
                id: id
            }, function(result) {
                result.data.isHQ = result.data.isHQ.split(',');
                formUtil.renderData($form, result.data);
                $('#code').trigger('change');
                controller.renderEditSchoolMasterTable(result.data.headMasters);
            });
        },

        //大区经理
        renderSignRep: function() {
            ajax.request(roleApi.getUrl('getSignRepList'), null, function(result) {
                formUtil.renderSelects('#sign-rep', result.data);
                $('#sign-rep option[value="-1"]').val('').html('请选择');//不显示全部
                count++;
            });
        },

        /**
         * 可编辑列表
         * @param {Object} data
         */
        renderEditSchoolMasterTable: function(data) {
            tableUtil.renderStaticTable($table, {
                data: data,
                columns: [{
                    title: '<i class="icon iconfont">&#xe635;</i> 校长',
                    data: 'name',
                    width: '100px',
                    render: function(data) {
                        return '<input type="text" lay-verify="required" class="layui-input" value="' + data + '" />';
                    }
                }, {
                    title: '身份证',
                    data: 'IDNumber',
                    render: function(data) {
                        return '<input type="text" lay-verify="idcard" class="layui-input" value="' + data + '" />';
                    }
                }, {
                    title: '身份证复印件',
                    width: '20%',
                    data: 'IDPhotoUrl',
                    render: function(data, type, row) {

                        var result = '<div class="pic-container">';
                        if (data) {
                            result += '<img layer-src="' + webName +'/..'+ data + '" src="' + webName + '/..'+ data + '"/>';
                        }
                        result += '</div><input type="file" name="file" lay-type="images" class="layui-upload-file upload-pic"/>';
                        setTimeout(function(){//解决重新渲染不会绑定图片上传事件的问题，不知为何上传失败总会重新渲染这列
                            controller.bindImage();
                        },100)
                        return result;
                    }
                }, {
                    title: '<i class="icon iconfont">&#xe635;</i> 手机号',
                    data: 'phone',
                    render: function(data) {
                        return '<input type="text" lay-verify="required|telphone"  class="layui-input" value="' + data + '" />';
                    }
                }, {
                    title: '<i class="icon iconfont">&#xe635;</i> 邮箱',
                    data: 'email',
                    render: function(data) {
                        return '<input type="text" lay-verify="required|email" class="layui-input" value="' + data + '" />';
                    }
                }, {
                    title: '<i class="icon iconfont">&#xe635;</i> 地址',
                    data: 'address',
                    render: function(data) {
                        return '<input type="text" lay-verify="required" class="layui-input" value="' + data + '" />';
                    }
                }, {
                    title: '操作',
                    width: '50px',
                    render: function(data, type, row) {
                        return '<button class="layui-btn layui-btn-danger row-delete"><i class="layui-icon">&#x1006;</i> 删除</button>';
                    }
                }]
            });
        },

        getPwd: function() {
            ajax.request(branchCenterApi.getUrl('getPwd'), {
                id: id
            }, function(result) {
                $('#pwd').val(result.data.password);
            });
        },

        bindImage: function() {
            var $td;
            layui.upload({
                elem: '.upload-pic',
                type:'images',
                url: fileApi.getUrl('uploadFile').url,
                before: function(input) {
                    $td = $(input).parents('td');
                },
                success: function(result, input) { //上传成功后的回调
                    if (result.status) {
                        toast.success('上传图片成功');
						$container = $td.find('.pic-container');
                        $img = $container.find('img');
                        var url = webName + '/..' + result.data.url;
                        if (!$img[0]) {

                            $container.append($('<img>', {
                                src: url,
                                'layer-src': url
                            }));
                        } else {
                            $img.attr({
                                'src': url,
                                'layer-src': url
                            });
                        }
						$table.DataTable().cell($td[0]).data(result.data.url);
                        controller.bindImage();
                    } else {
                        toast.error('上传图片失败');
                    }
                }
            });

            //图片加载失败，缺省图片设置
            $('img').each(function() {
                $(this)[0].onerror = function() {
                    this.src = (webName + '/image/error-pic.png');
                };
            });

            // 查看缩略图特效
            layer.photos({
                photos: '.pic-container',
                closeBtn: true
            });

        },

        deleteRow: function() {
            tableUtil.deleteRow($table, $(this));
        },

        composeData: function(data) {
            var datas = tableUtil.getTableDatas($table);
            data.auditStatus = auditStatus;
            data.headMasters = datas;
            return data;
        },

        validCenterCode: function(value) {
            return ajax.request(branchCenterApi.getUrl('isExistCode'), {
                centerCode: value
            }, function(result) {
                if (!$.isEmptyObject(result.data)) {

                    return '该分中心已经存在';
                }
            }, false);
        },

        bindEvent: function() {

            if($.isEmptyObject(id)){//如果是修改分中心则不验证是否存在
                $('#code').blur(function() {
                    controller.validCenterCode($(this).val())
                        .success(function(result) {
                            if (result.data) {
                            	$('#code').val('');
                                toast.warn(result.data);
                            }
                        });
                });

            }else{//如果是编辑分中心则不能显示提审信息
                $('#expalin-check').remove();
                $('#explain-container').remove();

            }

            f.verify({

                name: function() {
                    if (value !== '' && value.length > 50) {
                        return '最多只能输入50个字！';
                    }
                },
                //分中心代码   规则：学校/学生事业部首写字母+任意两个字母组合+一个数字，学生事业部的首字母为s，学校事业部的首字母为x
                branchCode: function(value) {
                    if (!/^[x|s+][a-zA-Z]{2}\d$/.test(value)) {
                        return '分中心代码格式不正确';
                    }
                    var result = controller.validCenterCode(value)
                        .success(function(result) {
                            if (result.data) {
                                return result.data;
                            }
                        });

                },
                idcard: function(value) {
                    if (value != '' && !(/(^\d{15}$)|(^\d{17}(x|X|\d)$)/.test(value))) {
                        return '请输入正确的身份证号';
                    }
                },
                telphone: function(value) {
                    if (value !== '') {
                        if (!(/^1[34578]\d{9}$/.test(value))) {
                            return '请输入正确手机号!';
                        }
                    }
                },

                comment: function(value) {
                    if (value !== '' && value.length > 140) {
                        return '备注最多只能输入140个字！';
                    }
                },
                explain: function(value) {
                    $audit = $('#isAudit');
                    if ($audit.prop('checked') && value.length == 0) {
                        return '请填写说明';
                    }
                },
                pwd: function(value) {
                    if (!$('#id').val() && value.length == 0) {
                        return '请生成密码';
                    }
                }

            });

            //渲染切换按钮
            $table.on('draw.dt', function() {
                controller.bindImage();
            });

            f.on('checkbox(isAudit)', function(data) {
                if (data.elem.checked) {
                    $('#explain-container').show();
                } else {
                    $('#explain-container').hide();
                }
            });

            //动态改行数据
            $table.on('change', 'input', function() {
                var $tr = $(this).parents('tr');
                $table.DataTable().cell($(this).parents('td')).data($(this).val()); //同步数据
            });

            //属性绑定
            $('#code').on('change', function() {
                $('#login-name').val($(this).val());
            });

            //生成密码
            $('#genpwd-btn').on('click', this.getPwd);

            //删除行
            $table.on('click', '.row-delete', controller.deleteRow);

            $('.add-row').click(function() {

                tableUtil.addRow($table, {
                    'name': '',
                    'IDNumber': '',
                    'IDPhotoUrl': '',
                    'phone': '',
                    'email': '',
                    'address': ''
                });
            });

            //监听提交
            f.on('submit(branch-center-form)', function(data) {

                var param = controller.composeData(data.field);
                if (param.headMasters.length == 0) {
                    toast.warn('请添加校长后在提交');
                    return;
                }
                ajax.request(branchCenterApi.getUrl('updateBranchCenter'), param, function() {
                    toast.success('提交成功！');
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.list.refresh();
                    parent.layer.close(index); //再执行关闭
                }, true, null, null, {
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(param)
                });
                return false;
            });

        }
    };

    controller.init();
});
