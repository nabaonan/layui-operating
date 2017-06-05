var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'element',
	'form',
	'layer',
	'request',
	'authority',
	'btns',
	'form-util',
	'commodity-api',
	'toast',
	'table-util',
	'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
	element,
	form,
	layer,
	ajax,
	authority,
	btns,
	formUtil,
	commodityApi,
	toast,
	tableUtil

) {
	var $ = layui.jquery;
	var action = ajax.getFixUrlParams("action"); //判断是添加还是修改
	var f = new form();
	var $table = $('#selected-commodity-list');
	var $form = $('#commodity-form');

	if(action == 'pricing') {
		$('#choose-commodity').attr('disabled', 'disabled').addClass('layui-btn-disabled');
		f.render();
	}else{
		$('input[name="isGive"]').attr('disabled',true);//只有定价才能选择是否赠送，其余不能选择是否赠送，禁用并将值设置为否
	}

	var count = 0; //记录动态框的个数
	var subCount = 0; //记录联动个数

	var gradeFlag = false;
	var specialFlag = false;

	var controller = {

		init: function() {

			var id = ajax.getFixUrlParams('commodityId');
			controller.renderCommoditySort();
			controller.renderBusinessType();
			controller.renderSaleDepartmentId();
			controller.renderSystemName();
			controller.renderSchoolLevelId();
			controller.renderUserTypeId();

			controller.bindEvent();

			var interval = setInterval(function() {
				if(count == 6) {
					if(id) {
						controller.renderData(id);
					} else {
						controller.renderTable([]);
					}
					clearInterval(interval);
					f.render();
				}
			}, 0);
		},

		initPrice: function(commodityProducts) {
			//所有返回的价格都除以100，因为返回的都是分
			$.each(commodityProducts, function(index, item) {

				var unitPrice = item.unitPrice,
					productOriginalPrice = item.productOriginalPrice,
					productCurrentPrice = item.productCurrentPrice;

				if(unitPrice == null || unitPrice == '') {
					unitPrice = 0;
				}

				if(productOriginalPrice == null || productOriginalPrice == '') {
					productOriginalPrice = 0;
				}

				if(productCurrentPrice == null || productCurrentPrice == '') {
					productCurrentPrice = 0;
				}

				item.unitPrice = parseFloat(unitPrice) / 100;
				item.productOriginalPrice = parseFloat(productOriginalPrice) / 100;
				item.productCurrentPrice = parseFloat(productCurrentPrice) / 100;
			});
		},

		renderData: function(id) {
			ajax.request(commodityApi.getUrl('getCommodityData'), {
				commodityId: id
			}, function(result) {
				result.data.isGive = (result.data.isGive + '').split(',');

				formUtil.renderData($form, result.data);
				$('.choose-area-input').data('ids', result.data.areaIds);

				$('#schoolLevelId').find(':checkbox:checked').each(function() {
					$(this).next('.layui-form-checkbox').trigger('click');
					$(this).next('.layui-form-checkbox').trigger('click');
				});

				setTimeout(function() {
					formUtil.renderData($form, {
						commodityGrade: result.data.commodityGrade,
						commoditySpecialty: result.data.commoditySpecialty
					});
				}, 0);

				controller.initPrice(result.data.commodityProducts);

				controller.renderTable(result.data.commodityProducts);
				setTimeout(function() {
					controller.calTotalDiscount();
				}, 0)

			});
		},

		//商品分类
		renderCommoditySort: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'commodity_sort'
			}, function(result) {
				formUtil.renderSelects('#commoditySort', result.data);
				$('#commoditySort option[value="-1"]').val('').html('请选择');//不显示全部
				count++;
			});
		},

		//业务类型
		renderBusinessType: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'business_type'
			}, function(result) {
				formUtil.renderSelects('#businessType', result.data);
				$('#businessType option[value="-1"]').val('').html('请选择');//不显示全部
				count++;
			});
		},

		//销售部门
		renderSaleDepartmentId: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'department'
			}, function(result) {
				formUtil.renderCheckboxes('#saleDepartmentId', result.data, 'commoditySaledepartments');
				count++;
			});
		},

		//学制
		renderSystemName: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'school_system'
			}, function(result) {
				formUtil.renderCheckboxes('#systemName', result.data, 'commodityEducational');
				count++;
			});
		},

		//学段
		renderSchoolLevelId: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'school_level'
			}, function(result) {
				formUtil.renderCheckboxes('#schoolLevelId', result.data, 'commodityLevels', 'schoolLevel');
				count++;
			});
		},

		//年级
		renderGrade: function(val) {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'school_grade',
				con: val
			}, function(result) {
				formUtil.renderCheckboxes('#grade', result.data, 'commodityGrade');
				gradeFlag = true;
				subCount++;
			}, false);
		},

		//学科
		renderCommoditySpecialty: function(val) {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'school_specialty',
				con: val
			}, function(result) {
				formUtil.renderCheckboxes('#commoditySpecialty', result.data, 'commoditySpecialty');
				subCount++;
				specialFlag = true;
			}, false);
		},

		//用户类型
		renderUserTypeId: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type: 'user_type'
			}, function(result) {
				formUtil.renderCheckboxes('#userTypeId', result.data, "commodityUserType");
				count++;
			});
		},

		//选择地区
		chooseArea: function() {
			var $input = $('.choose-area-input');

			var url = ajax.composeUrl(webName + '/views/product/area-tree.html', {
				ids: $input.data('ids'),
				check: true
			});
			var index = layer.open({
				type: 2,
				title: "选择使用地区",
				area: ['50%', '80%'],
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

		renderTable: function(data) {
			tableUtil.renderStaticTable($table, {
				data: data,
				columns: [{
					title: '商品名称',
					data: 'commodityName',
					width: '100px'
				}, {
					title: '产品线',
					data: 'productLineName'
				}, {
					title: '产品类型',
					data: 'productType'
				}, {
					title: '计费方式',
					data: 'billType'
				}, {
					title: '时长',
					data: 'timeLength'
				}, {
					title: '有效期',
					data: 'expiryLength'
				}, {
					title: '单价',
					data: 'unitPrice',
					width: '80px',
					render: function(data) {
						if(data == '' || data == null) {
							data = 0;
						}

						return '<input type="number" step="1" lay-verify="required" placeholder="￥" name="unitPrice" min="0" class="layui-input" value="' + data + '" />';
					}
				}, {
					title: '数量',
					data: 'number',
					width: '50px',
					render: function(data) {
						if(data == null || data == '') {
							data = 0;
						}
						return '<input type="number" step="1" lay-verify="required"  name="number" min="0" class="layui-input" value="' + data + '"/>';
					}
				}, {
					title: '原价',
					data: 'productOriginalPrice',
					width: '80px',
					render: function(data) {
						return '<input type="number" readonly lay-verify="required" placeholder="￥" name="productOriginalPrice" min="0" class="layui-input" value="' + data + '"/>';
					}
				}, {
					title: '现价',
					data: 'productCurrentPrice',
					width: '80px',
					render: function(data) {
						return '<input type="number" step="1"  lay-verify="required" placeholder="￥" name="productCurrentPrice" min="0" class="layui-input" value="' + data + '" />'
					}
				}, {
					title: '适用地区',
					data: 'areaName'
				}, {
					title: '操作',
					width: '50px',
					render: function(data, type, row) {
						return '<button class="layui-btn layui-btn-danger row-delete">删除</button>'
					}
				}]
			});

		},

		chooseCommodity: function() {
			var url = ajax.composeUrl(webName + '/views/commodity/commodity-list.html', {
				type: 'single',
				isPrice: '2'
			});
			var index = layer.open({
				type: 2,
				title: "选择商品",
				area: ['100%', '80%'],
				scrollbar: false,
				content: url,
				btn: ['确定了', '取消了'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					var ids = iframeWin.list.getSelectIds();
					ajax.request(commodityApi.getUrl('submitSelectCommodityIds'), {
						ids: ids
					}, function(result) {
						//调用渲染table
						controller.initPrice(result.data);
						tableUtil.addRow($table, result.data);
						controller.calTotalDiscount();
					});

					layer.close(index);
				}
			});
		},

		mergeArray: function(ori, other) {
			ori.push.apply(ori, other);
		},

		deleteRow: function() {
			tableUtil.deleteRow($table, $(this));
			controller.calTotalDiscount();
		},

		calRowOriginal: function($tr) {

			var unitPrice = $tr.find('input[name="unitPrice"]').val();
			var num = $tr.find('input[name="number"]').val();
			var total = unitPrice * num;
			var $rowOriginal = $tr.find('input[name="productOriginalPrice"]');
			$rowOriginal.val(total);
			$table.DataTable().cell($rowOriginal.parents('td')).data(total); //同步数据
			return total;
		},

		/**
		 * 总原价
		 */
		calTotalOriginal: function() {

			var total = 0;
			$table.find('input[name="unitPrice"]').each(function() {
				var $tr = $(this).parents('tr');
				var t = controller.calRowOriginal($tr);
				total += t;
			});
			$('#totalOrigen').val(total);

			return total;
		},

		/**
		 * 总现价
		 */
		calTotalCurrent: function() {
			var total = 0;
			$table.find('input[name="productCurrentPrice"]').each(function() {
				total += parseInt($(this).val());
			});

			$('#totalCurrent').val(total);
			return total;
		},

		/**
		 * 总折扣    
		 * 公式   折扣=（1-（原价-现价）/原价）*100%
		 */
		calTotalDiscount: function() {
			var current = controller.calTotalCurrent();
			var origen = controller.calTotalOriginal();
			var discount = (1 - parseFloat(origen - current) / origen) * 1;
			if(isNaN(discount) || !isFinite(discount)) {
				discount = 0;
			}
			$('#totalDiscountPercent').val(parseInt(discount.toFixed(2) * 100) + '%');
			$('#totalDiscount').val(discount.toFixed(2));
		},

		composeSubmitdata: function(data) {

			var checkboxes = formUtil.composeCheckboxesValue($(data.form));
			data.field.commodityProducts = tableUtil.getTableDatas($table);

			//提交的时候价格统一转成分
			data.field.originalPrice = parseInt(data.field.originalPrice * 100);
			data.field.currentPrice = parseInt(data.field.currentPrice * 100);
			$.each(data.field.commodityProducts, function(index, item) {
				item.unitPrice = parseInt(item.unitPrice * 100);
				item.productOriginalPrice = parseInt(item.productOriginalPrice * 100);
				item.productCurrentPrice = parseInt(item.productCurrentPrice * 100);
			});

			$.each(checkboxes, function(prop, values) {
				switch(prop) {
					case "commodityEducational":
						checkboxes[prop] = controller.transStrToObj(values, 'educationalId');
						break;
					case "commoditySpecialty":
						checkboxes[prop] = controller.transStrToObj(values, 'specialtyId');
						break;
					case "commoditySaledepartments":
						checkboxes[prop] = controller.transStrToObj(values, 'saleDepartmentId');
						break;
					case "commodityLevels":
						checkboxes[prop] = controller.transStrToObj(values, 'levelId');
						break;
					case "commodityAreas":
						checkboxes[prop] = controller.transStrToObj(values, 'areaId');
						break;
					case "commodityUserType":
						checkboxes[prop] = controller.transStrToObj(values, 'userTypeId');
						break;
					case "commodityGrade":
						checkboxes[prop] = controller.transStrToObj(values, 'gradeId');
						break;
					default:
						;
				}
			});

			if($('.choose-area-input').data('ids')){
				data.field.commodityAreas = controller.transStrToObj($('.choose-area-input').data('ids').split(','), 'areaId');
			}else{
				data.field.commodityAreas = [];
			}
			
			return $.extend(true, data.field, checkboxes);
		},

		/**
		 * 转换id数组为对象数组
		 * @param {Object} strArr  string数组
		 * @param {Object} fixColumn 指定id属性名
		 */
		transStrToObj: function(strArr, fixColumn) {
			var results = []
			$.each(strArr, function(index, value) {
				var obj = {};
				obj[fixColumn] = value;
				results.push(obj);
			});
			return results;
		},

		bindEvent: function() {

			$table.on('draw.dt', function() {
				if(action == 'pricing') {//定价    如果是定价则不能删除单品
					$(this).find('.row-delete').attr('disabled',true).addClass('layui-btn-disabled');
				}else{//添加和编辑  如果是打包和编辑则不能更改单价和数量
					$(this).find('input[name="unitPrice"],input[name="number"]').attr('disabled','disabled');
				}
			});

			//点击单价和数量
			$table.on('change', 'input[name="unitPrice"],input[name="number"]', function() {
				var $tr = $(this).parents('tr');
				var total = controller.calRowOriginal($tr);
				//				$tr.find('input[name="productOriginalPrice"]').val(total);
				$tr.find('input[name="productCurrentPrice"]').val(total);
				controller.calTotalDiscount();
				$table.DataTable().cell($(this).parents('td')).data($(this).val()); //同步数据

			});

			//变化现价
			$table.on('change', 'input[name="productCurrentPrice"]', function() {
				controller.calTotalDiscount();
				$table.DataTable().cell($(this).parents('td')).data($(this).val()); //同步数据
			});

			f.on('checkbox(schoolLevel)', function(data) {
				var ids = [];
				$(':checkbox[lay-filter="schoolLevel"]:checked').each(function() {
					ids.push($(this).val());
				});
				var val = ids.join(',');
				controller.renderGrade(val);
				controller.renderCommoditySpecialty(val);
				f.render('checkbox');
			});

			//监听提交
			f.on('submit(commodity-form)', function(data) {

				var data = controller.composeSubmitdata(data);

				if(data.commodityProducts.length == 0) {
					toast.warn('单品不能为空,请重新填写好再提交！');
					return;
				}

				if(action == 'pricing') { //如果是定价
					data.type = '1';
				} else {
					data.type = '2';
				}

				ajax.request(commodityApi.getUrl('updateCommodity'), data, function() {
					toast.success('添加商品成功！');
					var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.list.refresh();
					parent.layer.close(index); //再执行关闭
				}, true, null, null, {
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(data)
				});

				return false;
			});

			//选择适用地区
			$('.choose-area-btn').on('click', controller.chooseArea);

			$('#choose-commodity').on('click', controller.chooseCommodity);

			$table.on('click', '.row-delete', controller.deleteRow);

		}
	};

	controller.init();
});