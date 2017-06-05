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
	'daterange-util',
	'date-util',
	'commodity-api',
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
	daterangeUtil,
	dateUtil,
	commodityApi,
	toast
) {
	var $ = layui.jquery;
	var f = new form();
	var $form = $('#saledate-form');
	
	var $submitContainer = $('#submit-container');
	
	var $template = $('.saledate').remove();
	
	var commodityId = ajax.getFixUrlParams('id');
	var controller = {
		
		init: function() {
			controller.toggleEmptyShow();
			controller.renderData()
			controller.bindEvent();
		},

		renderData: function() {
			ajax.request(commodityApi.getUrl('getCommoditySaledate'), {
				commodityId: commodityId
			}, function(result) {
				$.each(result.data, function(index,item) {
					item.startDate = dateUtil.formatStr(new Date(item.startDate),'yyyy-MM-dd HH:mm:ss');
					item.endDate = dateUtil.formatStr(new Date(item.endDate),'yyyy-MM-dd HH:mm:ss');
					controller.addSaledate(item);
				});
			});
		},
		
		renderRow: function($row,data) {
			$.each(data, function(prop,value) {
				$row.find('*[name='+prop+']').val(value);
			});
		},
		
		addSaledate: function(data) {
			
			var $t = $template.clone();
			if(data){
				controller.renderRow($t,data);
			}else{
				$t.find('input').val('');
			}
			
			$t.insertBefore($submitContainer).show();
			$('#empty').hide();
			
			//初始化日期选择
			daterangeUtil.init($t.find('.beginTime'),$t.find('.endTime'));
			return $t;
		},
		
		toggleEmptyShow: function(){
			if($('.saledate').length == 0){
				$('#empty').show();
			}
		},
		
		composeData: function() {
			var arr = [];
			$('.saledate').each(function(index,item){
				
				var startDate =	$(this).find('.beginTime').val();
				var endDate = $(this).find('.endTime').val();
				
				arr.push({
					id:$(this).find('input[name="id"]').val(),
					startDate:startDate,
					endDate:endDate
				});
				
				
			});
			return arr;
		},
		
		bindEvent: function() {

			//监听提交
			f.on('submit(saledate-form)', function(data) {
				var saledates = controller.composeData();
				ajax.request(commodityApi.getUrl('updateSaledate'), null, function() {
					toast.success('更新销售期成功！');
					var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.layer.close(index); //再执行关闭
				},true,null,null,{
					contentType: "application/json; charset=utf-8",
					data:JSON.stringify({
						saledates:saledates,
						commodityId:commodityId
					})
				});
				return false;
			});
			
			//添加销售期
			$form.on('click','.add',controller.addSaledate);
			//删除销售期
			$form.on('click','.delete', function(){
				$(this).parents('.saledate').remove();
				controller.toggleEmptyShow();
			});
			daterangeUtil.init($form.find('.beginTime'),$form.find('.endTime'));

		}
	};

	controller.init();
});