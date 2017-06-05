var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'request',
	'product-api',
	'form',
	'form-util',
	'toast',
	'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
	ajax,
	productApi,
	form,
	formUtil,
	toast
) {
	var $ = layui.jquery;
	var f = form();
	var $form = $('#productline-config-form');
	
	var productlineData;//产品线id
	var controller = {
		
		init: function() {
			var $ = layui.jquery;
			productlineData = ajax.getAllUrlParam();
			if(productlineData) {
				ajax.request(productApi.getUrl('getProductlineConfig'), {
					id: productlineData.id
				}, function(result) {
					result.data = $.extend(true, productlineData, result.data);
					result.data.productLine = productlineData.id;
					formUtil.renderData($form,result.data);
				});
			}
			this.bindEvent();
		},
		
		getKey: function() {
			ajax.request(productApi.getUrl('getProductlineKey'), {
				id: productlineData.id
			}, function(result) {
				$('#secretKey').val(result.data);
			});
		},
		
		bindEvent: function() {
			//监听提交
			f.on('submit(productline-config-form)', function(data) {
				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				ajax.request(productApi.getUrl('updateProductLineConfig'), data.field, function() {
					toast.success('产品线配置成功！');
					parent.layer.close(index); //再执行关闭
					parent.list.refresh();
				});
				return false;
			});
			//生成密钥
			$('#genkey-btn').click(this.getKey);
		}
	}
	controller.init();

});