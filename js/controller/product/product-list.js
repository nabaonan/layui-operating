var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'element',
	'form',
	'layer',
	'request',
	'table-util',
	'authority',
	'btns',
	'form-util',
	'product-api',
	'daterange-util',
	'date-util',
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
	tableUtil,
	authority,
	btns,
	formUtil,
	productApi,
	daterangeUtil,
	dateUtil,
	toast

) {
	var $ = layui.jquery;
	var $table = $('#product-list');
	var f = new form();
	var count = 0;
	var subCount = 0; //用来限制年级学科计数
	var controller = {
		init: function() {
			var navId = ajax.getFixUrlParams("navId");

			var totalBtns = authority.getNavBtns(navId);
			var btnObjs = btns.getBtns(totalBtns);
			controller.pageBtns = btns.getPageBtns(btnObjs);
			controller.rowBtns = btns.getRowBtns(btnObjs);
			controller.rowIconBtns = btns.getIconBtns(controller.rowBtns);

			$('#page-btns').html(btns.renderBtns(controller.pageBtns));

			controller.renderProductline();
			controller.renderElementType();
			controller.renderSchoolSystem();
			controller.renderPeriod();
			controller.renderBillType();
			controller.renderBusinessType();
			controller.renderReviewStatus();

			var interval = setInterval(function() {
				if(count == 7) {
					clearInterval(interval);
					f.render();
					controller.bindEvent();
				}
			}, 0);
			controller.renderTable();
		},
		//产品线
		renderProductline: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'product_line'
			}, function(result) {
				formUtil.renderSelects('#product-line', result.data);
				count++;
			});
		},

		//产品类型
		renderElementType: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'product_type'
			}, function(result) {
				formUtil.renderSelects('#element-type', result.data);
				count++;
			});
		},

		//学制
		renderSchoolSystem: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'school_system'
			}, function(result) {
				formUtil.renderSelects('#school-system', result.data);
				count++;
			});
		},

		//学段
		renderPeriod: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'school_level'
			}, function(result) {
				formUtil.renderSelects('#period', result.data);
				count++;
			});
		},

		//年级
		renderGrade: function(periodId) {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'school_grade',
				con: periodId
			}, function(result) {
				formUtil.renderSelects('#grade', result.data);
				subCount++;
			});
		},

		//学科
		renderSpecialty: function(periodId) {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'school_specialty',
				con: periodId
			}, function(result) {
				formUtil.renderSelects('#specialty', result.data);
				subCount++;
			});
		},

		//计费方式
		renderBillType: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'bill_type'
			}, function(result) {
				formUtil.renderSelects('#bill-type', result.data);
				count++;
			});
		},

		//业务类型
		renderBusinessType: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'business_type'
			}, function(result) {
				formUtil.renderSelects('#business-type', result.data);
				count++;
			});
		},

		//审核状态
		renderReviewStatus: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type:'product_review_status'
			}, function(result) {
				formUtil.renderSelects('#review-status', result.data);
				count++;
			});
		},

		composeCondition: function() {
			var condition = formUtil.composeData($('#condition'));
			var areaIds = $('.choose-area-input').data('ids');
			if(areaIds) {
				condition.area = areaIds.split(',');
			}
			return condition;
		},

		renderTable: function() {
			tableUtil.renderTable($table, {
				url: productApi.getUrl('getProductList').url,
				type: productApi.getUrl('getProductList').type,
				ordering: true,
				order: [
					[0, "desc"]
				],
				composeCondition: controller.composeCondition,
				columns: [
					/*{
											title: function() {
												return '<input type="checkbox" class="all" lay-skin="primary">';
											},
											data: function() {
												return '<input type="checkbox" lay-skin="primary">';
											}
										},*/
					{
						data: 'code',
						title: '编码',
						width: '5%'
					},
					{
						data: 'name',
						title: '产品名称',
						width: '8%',
						sortable: false
					},
					{
						data: 'productLine',
						title: '产品线',
						width: '6%',
						sortable: false
					},
					{
						data: 'productType',
						title: '产品类型',
						width: '8%',
						sortable: false
					},
					{
						data: 'schoolSystem',
						title: '学制',
						width: '5%',
						sortable: false
					},
					{
						data: 'grade',
						title: '年级',
						width: '4%',
						sortable: false
					},
					{
						data: 'specialty',
						title: '学科',
						width: '4%',
						sortable: false
					},
					{
						data: 'area',
						title: '适用地区',
						width: '8%',
						sortable: false
					},
					{
						data: 'expiryLength',
						title: '有效期',
						width: '7%',
						sortable: false,
						render: function(data){
							return data + '天';
						}
					},
					{
						data: 'billType',
						title: '计费方式',
						width: '7%',
						sortable: false
					},
					{
						data: 'businessType',
						title: '业务类型',
						width: '8%',
						sortable: false
					},
					{
						data: 'uploadDate',
						title: '同步时间',
						width: '8%',
						render: function(data) {
							if($.trim(data) !== '') {
								return dateUtil.formatStr(new Date(parseInt(data)), "yyyy-MM-dd");
							}
							return "";
						}
					},
					{
						data: 'reviewStatus',
						title: '审核状态',
						width: '7%',
						sortable: false,
						render: function(data) {
							//1已审核,2未审核，
							return data == 2 ? '未审核' : '已审核';
						}
					},
					{
						title: '操作',
						sortable: false,
						width:'200px',
						render: function(data, type, row) {
							var disableAudit = row.reviewStatus == 1; //已审核的禁用审核按钮
							var rowIconBtns = controller.rowIconBtns;
							var resultBtns = '';
							if(rowIconBtns) {
								$.each(rowIconBtns, function(index, item) {
									if(item.btnKey == 'row-audit' && disableAudit) {
										resultBtns += btns.renderBtn(item.className, item.name, item.icon, disableAudit);
									} else {
										resultBtns += btns.renderBtn(item.className, item.name, item.icon);
									}
								});
							}

							return resultBtns;
						}
					}
				]
			});
		},

		chooseArea: function() {
			var $input = $('.choose-area-input');
			var url = ajax.composeUrl(webName + '/views/product/area-tree.html', {
				ids: $input.data('ids'),
				check: true
			});
			var index = layer.open({
				type: 2,
				title: "选择使用地区",
				area: ['30%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url,
				btn: ['确定了', '取消了'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					var datas = iframeWin.tree.getCheckedData();

					var areaNames = [];
					var ids = [];
					$.each(datas, function(index, item) {
						areaNames.push(item.name);
						ids.push(item.code);
					});

					$input.val(areaNames.join(','));
					$input.data('ids', ids.join(','));
					layer.close(index);
				}
			});
		},

		exportCsv: function() {
			var condition = controller.composeCondition();
			var url = ajax.composeUrl(productApi.getUrl('exportProduct').url, condition, true,true);

			$('<a>', {
				href: url
			}).appendTo($('body'))[0].click();//兼容各个浏览器的写法
			
			var _this = $(this);
			_this.attr('disabled','disabled');
			_this.html('<i class="layui-icon layui-anim layui-anim-rotate layui-anim-loop">&#xe63d;</i> 正在导出...');
			setTimeout(function() {
				_this.removeAttr('disabled');
				_this.html('<i class="layui-icon">&#xe61e;</i> 导出');
			},1000);
			
		},

		rowView: function() {
			var rowData = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/product/product-view.html', rowData);
			var index = layer.open({
				type: 2,
				title: "查看产品",
				area: '80%',
				offset: '25%',
				scrollbar: false,
				content: url,
				success: function(layero) {
					layer.iframeAuto(index);	
				}
			});
		},

		rowAudit: function() {
			var _this = this;

			layer.confirm('确定审核产品吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {
				var data = tableUtil.getRowData($table, $(_this));
				ajax.request(productApi.getUrl('auditProduct'), {
					id: data.id
				}, function() {
					toast.success('操作成功');
					tableUtil.reloadData($table);
					layer.close(index);
				});
			});
		},

		bindEvent: function() {

			f.on('select(period)', function(data) {
				var val = data.value;
				controller.renderGrade(val);
				controller.renderSpecialty(val);
				var interval2 = setInterval(function() {
					if(subCount == 2) {
						clearInterval(interval2);
						f.render('select');
						subCount = 0;
					}
				},0);
			});

			$('#search-btn').on('click', function() {
				tableUtil.reloadData($table);
			});

			//点击行查看按钮
			$table.on('click', '.row-view', controller.rowView);
			//点击行审核
			$table.on('click', '.row-audit', controller.rowAudit);
			//导出列表为csv文件
			$('.export').on('click', controller.exportCsv);
			//选择适用地区
			$('.choose-area-btn').on('click', controller.chooseArea);

			//初始化日期选择
			daterangeUtil.init('.synDateStart', '.synDateEnd');
			daterangeUtil.init('.effDateStart', '.effDateEnd');
		}
	};

	controller.init();
	
});