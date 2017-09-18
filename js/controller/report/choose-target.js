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
	'role&authority-api',
    'school-report-api',
	'key-bind',
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
	roleApi,
    schoolReportApi,
	keyBind
) {
	var $ = layui.jquery;
	var f = form();
	var $table = $('#users-list');
	var count = 0;

	var controller = {
		init: function() {
            controller.renderSearchType();
            controller.bindEvent();

            var interval = setInterval(function() {
                if(count == 1) {
                    clearInterval(interval);
                    controller.renderTable();
                    f.render();
                }
            }, 0);

		},

		getQueryCondition: function() {
			var data = formUtil.composeData($('#condition'));
			return data;
		},

        addReport: function() {
            $this = $(this);
			var data = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/report/school-info-update.html', data);

			var index = layer.open({
				type: 2,
				title: "报单",
				area: ['80%', '90%'],
				scrollbar: false,
				content: url
			});
			layer.full(index);
        },

		renderTable: function() {

			tableUtil.renderTable($table, {
				url: schoolReportApi.getUrl('queryUsers').url,
				composeCondition: this.getQueryCondition,
				processing: true,
				columns: [{
					title: '学校名称',
					data: 'schoolName',
                    width:'25%'
				}, {
					title: '手机号',
					data: 'phone',
                    width:'25%'
				}, {
					title: '其他帐号',
					data: 'otherAccount',
                    width:'25%'
				},{
					title: '操作',
					width: '25%',
					render: function(data, type, row) {
						return '<button type="button" class="layui-btn add-report">报单</button>';
					}
				}]
			});

		},

        //学制
        renderSearchType: function() {
            ajax.request(schoolReportApi.getUrl('getKeyValue'), {
                type: ''
            }, function(result) {
                formUtil.renderSelects('#search-type', result.data);
                count++;
            });
        },

		bindEvent: function() {

			//渲染切换按钮
			$table.on('draw.dt', function() {

			});
            $('body').on('click','.add-report',controller.addReport);

			//点击查询按钮
			$('#search-btn').on('click', function() {
				tableUtil.reloadData($table);
			});

			$('#reset-btn').click(function() {
				$('#condition')[0].reset();
			});


		}

	};

	window.list = {
		refresh: function() {
			tableUtil.reloadData($table);
		}
	}

	controller.init();
});
