/**
 * 这个页面是公用的页面，添加商品选择商品的时候需要用，商品定价，审核商品也用
 */

var webName = getWebName();
//window.top.registeModule(layui,['userApi','formUtil','tableUtil','request']);

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
	'commodity-api',
	'authority',
	'btns',
	'date-util',
	'daterange-util',
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
	commodityApi,
	authority,
	btns,
	dateUtil,
	daterangeUtil,
	toast
) {
	var $ = layui.jquery;
	var f = form();
	var count = 0;
	var subCount = 0;
	var $table = $('#commodity-list');
	var isPrice = ajax.getFixUrlParams("isPrice"); //用于编辑添加单品，只有已经定价的单品才能添加

	var auditFlag = false,
		auditFlag2 = false,
		auditAll = false;

	var type = ajax.getFixUrlParams("type"); //获取要请求的类型，single是选择单品，没有就是商品定价，notAudit就是未审核商品

	var controller = {
		init: function() {

			var navId = ajax.getFixUrlParams("navId");
			if(navId) {
				var totalBtns = authority.getNavBtns(navId);
				var btnObjs = btns.getBtns(totalBtns);
				controller.pageBtns = btns.getPageBtns(btnObjs);
				controller.rowBtns = btns.getRowBtns(btnObjs);
				controller.rowSwitchBtns = btns.getSwitchBtns(controller.rowBtns);
				controller.rowIconBtns = btns.getIconBtns(controller.rowBtns);

				//根据审核按钮判断在未审核列表的时候是否需要传审核状态，如果只有一审传1，如果只有二审传2，如果都有传3
				$.each(controller.rowBtns, function(index, item) {
					if(item.btnKey == 'row-audit1') {
						auditFlag = true;
					} else if(item.btnKey == 'row-audit2') {
						auditFlag2 = true;
					}
				});

				auditAll = auditFlag && auditFlag2;

				$('#page-btns').html(btns.renderBtns(controller.pageBtns));
			}

			controller.renderProductDescId();
			controller.renderBusinessTypeId();
			controller.renderSchoolSystem();
			controller.renderPeriod();
			controller.renderProductLineId();
			controller.renderSaleDepartmentId();
			controller.renderReviewStatus();
			controller.renderSaleStatus();
			controller.renderIsHasSaledate();
			controller.renderGroundStatusId();

			var interval = setInterval(function() {
				if(count == 10) {
					clearInterval(interval);

					if(type == 'single') {
						//禁用商品组成，只能是单品
						$('#productDescId').val('1').attr('disabled', 'disabled');
					} else if(type == 'notAudit') {
						//隐藏审核状态
						$('#auditStatusId').parents('.layui-inline').hide();
					}
					controller.renderTable();
					f.render();
				}
			}, 0);

			controller.bindEvent();
		},

		getQueryCondition: function() {
			var data = formUtil.composeData($('#condition'));
			data.isPrice = isPrice;
			
			if(data.minPrice){
				data.minPrice =parseInt(data.minPrice) * 100;
			}
			if(data.maxPrice){
				data.maxPrice = parseInt(data.maxPrice) * 100;
			}
		
			//如果价格输入反了，则交换彼此价格位置
			if((data.minPrice !== '' && data.maxPrice !== '') && data.minPrice > data.maxPrice ){
				var temp ;
				temp = data.minPrice;
				data.minPrice = data.maxPrice;
				data.maxPrice = temp;
			}
			
			data.productDescId = $('#productDescId option:selected').val();
			data.auditStatusId = $('#auditStatusId option:selected').val();

			if(type == 'notAudit') {
				data.auditStatusIdsStr = auditAll ? '1,2' : auditFlag ? '1' : '2'; //1:一审，2:二审,都有的话是[1,2]
				delete data.auditStatusId;
			}

			return data;
		},

		renderTable: function() {

			var auditStatusMap = {
				'1': '已提交审核',
				'2': '一审通过',
				'3': '已审核',
				'4': '一审驳回',
				'5': '二审驳回',
				'6': '未提交审核'
			};
			var commodityTypeMap = {
				'1': '单品',
				'2': '组合品'
			};

			tableUtil.renderTable($table, {
				url: commodityApi.getUrl('getCommodityList').url,
				composeCondition: this.getQueryCondition,
				ordering: true,
				processing: true,
				order: [
					[10, "desc"]
				],
				columns: [{
					title: '<input type="checkbox" lay-filter="all" lay-skin="primary">',
					data: function() {
						return '<input type="checkbox" lay-skin="primary">';
					},
					sortable: false
				}, {
					title: '商品编码',
					data: 'commodityCode'
				}, {
					title: '商品名称',
					data: 'commodityName',
					sortable: false
				}, {
					title: '组成',
					data: 'isSingleProduct',
					sortable: false,
					render: function(data) {
						return commodityTypeMap[data];
					}
				}, {
					title: '年级',
					data: 'gradeName',
					sortable: false
				}, {
					title: '学科',
					data: 'specialtyName',
					sortable: false

				}, {
					title: '现价',
					data: 'currentPrice',
					render: function(data) {
						if(data == null || data == '') {
							data = 0;
						}
						return parseFloat(data) / 100;
					}
				}, {
					title: '产品线',
					data: 'productLineName',
					sortable: false

				}, {
					title: '审核状态',
					data: 'auditStatus',
					render: function(data) {
						return auditStatusMap[data];
					},
					sortable: false

				}, {
					title: '销售状态',
					data: 'saleStatus',
					sortable: false

				}, {
					title: '创建时间',
					data: 'createDate',
					render: function(data) {
						if($.trim(data) !== '') {
							return dateUtil.formatStr(new Date(parseInt(data)), "yyyy-MM-dd");
						}
						return "";
					}
				}, {
					title: '操作',
					sortable: false,
					render: function(data, type, row) {
						var isPricing = (row.isSingleProduct == '1');

						var btnName = isPricing ? '定价' : '编辑'; //1单品2组合商品
						var isDisable = row.isEdited == '2'; //是否可编辑	1是可编辑，2不可编辑

						var disableSwitch = row.isGrounding == '1'; //1:未上架     2： 可上架     3：可下架
						var isCheck = row.isGrounding == '3'; //
						var rowIconBtns = controller.rowIconBtns;
						var switchBtns = controller.rowSwitchBtns;
						var resultBtns = '';
						var auditStatus = row.auditStatus;

						if(switchBtns) {
							$.each(switchBtns, function(index, item) {
								resultBtns += btns.renderSwitch(item.prop, item.name, isCheck, disableSwitch);
							});
						}

						if(rowIconBtns) {
							$.each(rowIconBtns, function(index, item) {

								if(item.btnKey == 'row-edit') {
									var className = item.className;
									if(isPricing) {
										className = className + ' row-pricing';
									}
									resultBtns += btns.renderBtn(item.className, item.name, item.icon, isDisable, {
										btnName: btnName,
										className: className
									});
								} else if(item.btnKey == 'row-audit1') {
									if(auditStatus == '1') { //只有审核状态为已提交才显示一审按钮，审核状态1代表已提交审核
										resultBtns += btns.renderBtn(item.className, item.name, item.icon);
									}
								} else if(item.btnKey == 'row-audit2') {
									if(auditStatus == '2') { //只有审核状态为一审通过才显示二审按钮，审核状态2代表一审通过
										resultBtns += btns.renderBtn(item.className, item.name, item.icon);
									}
								} else {
									resultBtns += btns.renderBtn(item.className, item.name, item.icon);
								}

							});
						}
						return resultBtns;
					}
				}]
			});

		},

		//商品组成
		renderProductDescId: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'commodity_type'
			}, function(result) {
				formUtil.renderSelects('#productDescId', result.data);
				count++;
			});
		},

		//业务类型
		renderBusinessTypeId: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'business_type'
			}, function(result) {
				formUtil.renderSelects('#businessTypeId', result.data);
				count++;
			});
		},

		//学制
		renderSchoolSystem: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'school_system'
			}, function(result) {
				formUtil.renderSelects('#school-system', result.data);
				count++;
			});
		},

		//学段
		renderPeriod: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'school_level'
			}, function(result) {
				formUtil.renderSelects('#period', result.data);
				count++;
			});
		},

		//年级
		renderGrade: function(periodId) {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'school_grade',
				con: periodId
			}, function(result) {
				formUtil.renderSelects('#grade', result.data);
				subCount++;
			});
		},

		//学科
		renderSpecialty: function(periodId) {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'school_specialty',
				con: periodId
			}, function(result) {
				formUtil.renderSelects('#specialty', result.data);
				subCount++;
			});
		},

		//产品线
		renderProductLineId: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'product_line'
			}, function(result) {
				formUtil.renderSelects('#productLineId', result.data);
				count++;
			});
		},

		//销售部门
		renderSaleDepartmentId: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'department'
			}, function(result) {
				formUtil.renderSelects('#saleDepartmentId', result.data);
				count++;
			});
		},

		//有无销售期
		renderIsHasSaledate: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'is_sale_date'
			}, function(result) {
				formUtil.renderSelects('#isHasSaledate', result.data);
				count++;
			});
		},

		//审核状态
		renderReviewStatus: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'review_status'
			}, function(result) {
				formUtil.renderSelects('#auditStatusId', result.data);
				count++;
			});
		},

		//销售状态
		renderSaleStatus: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'sale_status'
			}, function(result) {
				formUtil.renderSelects('#saleStatusId', result.data);
				count++;
			});
		},

		//上架状态
		renderGroundStatusId: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'sale_ground_status'
			}, function(result) {
				formUtil.renderSelects('#groundStatusId', result.data);
				count++;
			});
		},

		add: function() {
			var index = layer.open({
				type: 2,
				maxmin:true,
				title: "添加商品",
				area: ['80%', '100%'],
				scrollbar: false,
				content: webName + '/views/commodity/commodity-update.html'
			});

		},

		rowEdit: function() {
			$this = $(this);
			var data = tableUtil.getRowData($table, $(this));
			var action = $this.hasClass('row-pricing') ? 'pricing' : 'edit';
			var url = ajax.composeUrl(webName + '/views/commodity/commodity-update.html', {
				action: action,
				commodityId: data.id
			});

			var index = layer.open({
				type: 2,
				title: "修改商品",
				maxmin:true,
				area: ['80%', '90%'],
				scrollbar: false,
				content: url
			});

		},

		rowSaledate: function() {
			var data = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/commodity/saledate-update.html', {
				id: data.id
			});

			var index = layer.open({
				type: 2,
				title: "编辑销售期",
				maxmin:true,
				area: ['70%', '80%'],
				scrollbar: false,
				content: url
			});
		},

		rowView: function() {
			var data = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/commodity/commodity-view.html', {
				id: data.id
			});

			var index = layer.open({
				type: 2,
				maxmin:true,
				title: "查看商品",
				area: ['80%', '90%'],
				scrollbar: false,
				content: url
			});
		},

		rowDesc: function() {
			var data = tableUtil.getRowData($table, $(this));

			var url = ajax.composeUrl(webName + '/views/commodity/commodity-desc-update.html', {
				id: data.id
			});

			var index = layer.open({
				type: 2,
				title: "商品描述",
				maxmin:true,
				area: ['70%', '90%'],
				scrollbar: false,
				content: url
			});
		},

		deleteRows: function() {
			var ids = tableUtil.getSelectIds($table);

			if(ids.length == 0) {
				toast.warn('请选择商品再删除');
				return;
			}
			layer.confirm('确定删除这些数据吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				layer.load(0, {
					shade: 0.5
				});
				layer.close(index);

				ajax.request(commodityApi.getUrl('deleteCommoditys'), {
					ids: ids
				}, function() {
					layer.closeAll('loading');
					toast.success('成功删除！');
					tableUtil.reloadData($table);
				});
			});
		},

		audit: function() {
			var ids = tableUtil.getSelectIds($table);
			if(ids.length == 0) {
				toast.warn('请选择商品再审核');
				return;
			}

			layer.confirm('确定提交审核吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				layer.load(0, {
					shade: 0.5
				});
				layer.close(index);

				ajax.request(commodityApi.getUrl('auditCommoditys'), {
					ids: ids
				}, function() {
					layer.closeAll('loading');
					toast.success('成功提交审核！');
					tableUtil.reloadData($table);
				}, true, function() {
					layer.closeAll('loading');
				});

			});
		},

		copy: function() {
			var ids = tableUtil.getSelectIds($table);
			if(ids.length == 0) {
				toast.warn('请选择商品再复制');
				return;
			}

			layer.confirm('确定复制吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				layer.load(0, {
					shade: 0.5
				});
				layer.close(index);

				ajax.request(commodityApi.getUrl('copyCommoditys'), {
					ids: ids
				}, function() {
					layer.closeAll('loading');
					toast.success('成功提交复制！');
					tableUtil.reloadData($table);
				});

			});
		},

		exportExcel: function() {
			var condition = controller.getQueryCondition();
			var url = ajax.composeUrl(commodityApi.getUrl('export').url, condition, true, true);
			$('<a>', {
				href: url
			})[0].click();

			var _this = $(this);
			_this.attr('disabled', 'disabled');
			_this.html('<i class="layui-icon layui-anim layui-anim-rotate layui-anim-loop">&#xe63d;</i> 正在导出...');
			setTimeout(function() {
				_this.removeAttr('disabled');
				_this.html('<i class="layui-icon">&#xe61e;</i> 导出');
			}, 1500);

		},

		sale: function(switchData) {
			var _this = this;
			var old = !_this.checked;
			var confirmText = _this.checked ? '上架' : '下架';
			layer.confirm('确定' + confirmText + '商品吗?', {
				icon: 3,
				title: '提示',
				closeBtn: 0
			}, function(index) {

				var data = tableUtil.getRowData($table, $(_this));
				var willCheck = _this.checked;

				ajax.request(commodityApi.getUrl('saleCommodity'), {
					commodityId: data.id,
					group: (willCheck ? 3 : 2) //1:未上架     2： 可上架     3：可下架
				}, function() {
					layer.close(index);
					toast.success(confirmText + '成功！');
				}, true, function() {
					switchData.elem.checked = old;
					f.render();
					layer.close(index);
				});
			}, function() {
				switchData.elem.checked = old;
				f.render();
			});
		},

		rowAudit: function() {
			var data = tableUtil.getRowData($table, $(this));
			var url = ajax.composeUrl(webName + '/views/commodity/commodity-view.html', {
				id: data.id
			});

			//1代表一审，2代表二审
			var auditStatus = $(this).hasClass('row-audit2') ? '2' : '1'; //是否是一审，还是二审

			var index = layer.open({
				type: 2,
				title: "审核商品",
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url,
				btn: ['审核通过', '驳回'],
				yes: function() {
					ajax.request(commodityApi.getUrl('updateRowAudit'), {
						commodityId: data.id,
						code: auditStatus,
						isPass: 1 //1是通过,-1是驳回
					}, function() {
						tableUtil.reloadData($table);
						layer.close(index);
					});
					return false;
				},

				btn2: function() {

					layer.prompt({
						formType: 2,
						title: '请输入驳回理由',
						area: ['500px', '300px'] //自定义文本域宽高
					}, function(value, index, elem) {
						layer.closeAll();
						ajax.request(commodityApi.getUrl('updateRowAudit'), {
							commodityId: data.id,
							rejectOpinion: value,
							code: auditStatus,
							isPass: -1 //1是通过,-1是驳回
						}, function() {
							layer.closeAll();
							tableUtil.reloadData($table);
						});
						return false;
					});
					return false;
				}
			});
		},

		bindEvent: function() {

			//渲染切换按钮
			$table.on('draw.dt', function() {
				f.on('switch(sale)', controller.sale);
			});

			$table.on('processing.dt', function(e, settings, processing) {
				$('#loading').css('display', processing ? 'block' : 'none');
			});

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
			//点击查询按钮
			$('#search-btn').on('click', function() {
				tableUtil.reloadData($table);
			});

			//点击修改
			$('body').on('click', '.row-edit', controller.rowEdit);
			//点击销售期
			$('body').on('click', '.row-saledate', controller.rowSaledate);
			//点击查看
			$('body').on('click', '.row-view', controller.rowView);
			//点击描述
			$('body').on('click', '.row-desc', controller.rowDesc);
			//点击添加
			$('body').on('click', '.add', controller.add);
			//批量删除
			$('body').on('click', '.delete', controller.deleteRows);
			//提审
			$('body').on('click', '.audit', controller.audit);
			//复制
			$('body').on('click', '.copy', controller.copy);
			//导出
			$('.export').on('click', controller.exportExcel);
			//审核
			$('.body').on('click', '.row-audit1,.row-audit2', controller.rowAudit);
			//刷新
			$('.body').on('click', '.refresh', function() {
				tableUtil.reloadData($table);
			});
			//			//重置
			//			$('.body').on('click','#reset-btn', function(){
			//				formUtil.
			//			});
			//初始化日期选择
			daterangeUtil.init('#beginTime', '#endTime');
		}

	};

	controller.init();

	window.list = {
		getSelectIds: function() {
			return tableUtil.getSelectIds($table);
		},
		refresh: function() {
			tableUtil.reloadData($table);
		}
	}
});