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
	'product-api',
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
	authority,
	btns,
	formUtil,
	productApi,
	toast

) {
	var $ = layui.jquery;

	var f = new form();

	var count = 0; //记录动态框的个数
	var controller = {
		init: function() {

			var data = ajax.getAllUrlParam();
			controller.renderBusinessType();
			controller.renderDept();
			

			var interval = setInterval(function() {
				if(count == 2) {
					if(!$.isEmptyObject(data)) {
						
						data.departmentId = data.departmentId.split(',');
						data.businessType = data.businessType.split(',');
						
						formUtil.renderData($('#productline-form'), data);
					}
					clearInterval(interval);
					f.render();
				}
			}, 0);

			controller.bindEvent();

		},

		renderBusinessType: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type: 'business_type'
			}, function(result) {
				formUtil.renderRadios('#business-type', result.data, "businessType");
				$('#business-type :radio:eq(0)').attr('checked',true);
				count++;
			});
		},

		renderDept: function() {
			ajax.request(productApi.getUrl('getKeyValue'), {
				type: 'department'
			}, function(result) {
				formUtil.renderCheckboxes('#dept', result.data, "departmentId");
				count++;
			});
		},

		bindEvent: function() {
			
			
			f.verify({
				telphone: function(value, item) {
					if(value!==''){
						if(!(/^1[34578]\d{9}$/.test(value))){
							return '请输入正确手机号!';
						}
					}
				}
			});
			
			
			//监听提交
			f.on('submit(productline-form)', function(data) {
				var checkboxes = formUtil.composeCheckboxesValue($(data.form));
				var data = $.extend(true, data.field, checkboxes);
				ajax.request(productApi.getUrl('updateProductline'), data, function() {
					toast.success('产品线信息提交成功！');
					var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.list.refresh();
					parent.layer.close(index); //再执行关闭
				});
				return false;
			});

		}
	};

	controller.init();
});