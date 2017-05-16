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
	'product-api'
	/*,
		'valid-login'*/
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
	productApi

) {
	var $ = layui.jquery;

	var f = new form();
	var controller = {
		init: function() {
			
			var data = ajax.getAllUrlParam();
			if(!$.isEmptyObject(data)) {
				data.departmentId = data.departmentId.split(',');
				data.businessType = data.businessType.split(',');
				formUtil.renderData($('#productline-form'), data);
				f.render();
			}
			controller.bindEvent();
		
		},

		renderBusinessType: function() {
			ajax.request(productApi.getUrl('getBusinessTypeSelect'), null, function(result) {
				
				result.data.unshift({
					key:'all',
					value:'全部'
				});
				formUtil.renderSelects('#business-type', result.data);
			});
		},

		renderDept: function() {
			ajax.request(productApi.getUrl('getUseStateSelect'), null, function(result) {
				result.data.unshift({
					key:'all',
					value:'全部'
				});
				formUtil.renderSelects('#use-state', result.data);
			});
		},
		

		bindEvent: function() {

			//监听提交
			f.on('submit(productline-form)', function(data) {
				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				console.log('d提交的产品线数据',data.field);
				ajax.request(productApi.getUrl('updateProductline'),data.field,function(){
					parent.layer.close(index); //再执行关闭
				});
			});

		}
	};

	controller.init();
});