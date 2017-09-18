/**
 * 学校报单管理
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
    var $form = $('#school-info');
    var id = ajax.getFixUrlParams('id');
	var operate = ajax.getFixUrlParams('operate');//标识是否是添加还是编辑该单
    var schoolInfo = {};
    var controller = {
        init: function() {
            schoolReportStore.setOperate(operate);

            controller.bindEvent();

            controller.renderSchoolSystem();
            controller.renderSource();
            controller.renderTeachModel();
//            controller.renderWay();
            controller.renderSchoolLevel();

            var interval = setInterval(function() {
                if (count == 4) {
                    clearInterval(interval);
                    f.render();
                    if(!$.isEmptyObject(id)){
                        controller.renderData();
                    }else{//如果添加需要回显之前的
                        var schoolInfo = schoolReportStore.getSchoolInfo();
                        formUtil.renderData($form,schoolInfo);
                    }
                }
            }, 0);

        },

        renderData: function() {
            var schoolInfo = schoolReportStore.getSchoolInfo(id);
            if(operate == 'appendOrder'){
                $('input[name="schoolCode"]').attr('readonly',true).addClass('layui-disabled');
            }
            
            formUtil.renderData($form,schoolInfo);
        },

        //学制
        renderSchoolSystem: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_system'
            }, function(result) {
                formUtil.renderSelects('#school-system', result.data);
                $('#school-system option[value="-1"]').val('').html('请选择');//不显示全部
                count++;
            });
        },

        //学段
        renderSchoolLevel: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_level'
            }, function(result) {
                formUtil.renderCheckboxes('#school-level', result.data, 'schoolLevels', 'schoolLevels',false,'required');
                count++;
            });
        },

        //销售途径
        renderWay: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: ''
            }, function(result) {
                formUtil.renderSelects('#search-type', result.data);
                $('#search-type option[value="-1"]').val('').html('请选择');//不显示全部
                count++;
            });
        },

        //教学模式
        renderTeachModel: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'teach_model'
            }, function(result) {
                formUtil.renderSelects('#teach-model', result.data);
                $('#teach-model option[value="-1"]').val('').html('请选择');//不显示全部
                count++;
            });
        },

        //信息来源
        renderSource: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: 'school_message_source'
            }, function(result) {
                formUtil.renderSelects('#source', result.data);
                $('#source option[value="-1"]').val('').html('请选择');//不显示全部
                count++;
            });
        },

        chooseZone: function() {
            var $this = $(this);
			var area = $('input:hidden[name="area"]').val();
            var province = $('input:hidden[name="province"]').val();
            var city = $('input:hidden[name="city"]').val();

            var url = ajax.composeUrl(webName + '/views/report/area-tree.html',{
                ids: area?area:city?city:province
			});
            var index = layer.open({
                type: 2,
                title: "选择区域",
                scrollbar: false,
                area: ['50%','70%'],
                content: url,
                btn: ['确定', '取消'],
                yes: function(index, layero) {
                    var iframeWin = window[layero.find('iframe')[0].name];
                    var zone = iframeWin.tree.getZone();
                    console.log('点击确定', zone);
					var zoneName ='';
                    if (zone.province) {
                        zoneName += zone.province.name;
						$('input:hidden[name="province"]').val(zone.province.code);
                    }
                    if (zone.city) {
                        zoneName += zone.city.name;
						$('input:hidden[name="city"]').val(zone.city.code);
                    }
                    if (zone.area) {
                        zoneName += zone.area.name;
						$('input:hidden[name="area"]').val(zone.area.code);
                    }
                    $this.val(zoneName);

                    layer.close(index);
                    return false;
                }
            });
        },

        bindEvent: function() {
			var pass = false;

			if(operate == 'add' || operate == 'appendOrder'|| operate == 'modify'){
				$('.save').hide();
			}else{
				$('.next').hide();
			}
            // if(operate == 'add'){
            //     $('input[name="schoolCode"]').blur(function() {
            //         ajax.request(schoolReportApi.getUrl(''))
            //
            //     });
            // }

            $('.cancel').click(function() {
                console.log('4444');
                parent.layer.closeAll();
            });

            //监听提交
            f.on('submit(school-report-form)', function(data) {
                var checkboxes = formUtil.composeCheckboxesValue($form);
                var param = $.extend(true, data.field, checkboxes);
                if(id){
                    param.id = id;
                }

                if(!checkboxes.schoolLevels){
                    toast.warn('请选择学段');
                    return;
                }

                var levels = [];
                $(':checkbox:checked').each(function(){
                    levels.push($(this).attr('title'));
                });
                param.schoolLevelsName = levels.join(',');

                $('select').each(function(){
                    var text = $(this).find('option:selected').html();
                    if($(this).attr('name') == 'teachModel'){
                        param.teachModelName = text;
                    }else if($(this).attr('name') == 'education'){
                        param.educationName = text;
                    }else if($(this).attr('name') == 'messagePath'){
                        param.messagePathName = text;
                    }
                });
                schoolReportStore.setSchoolInfo(param);
                console.log(param);
				pass = true;
                if($(data.elem).hasClass('next')){
                    $('body').load('./school-baseinfo-view.html');
                }else if($(data.elem).hasClass('save')){

                    param.schoolLevels = $.map(param.schoolLevels,function(value) {
                        return {
                            levelId:value
                        };
                    });
                    param.id = id;


                    ajax.request(schoolReportApi.getUrl('updateSchoolInfo'),null,function(result){
                        toast.success('保存成功');
                        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
            			parent.layer.close(index); //再执行关闭
                    },true,null, null, {
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify({
                            schoolInfo:param
                        })
                    });
                }
                return false;
            });
            $('#zone').on('click', controller.chooseZone);
        }

    };

    controller.init();
});
