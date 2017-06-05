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
	'commodity-api',
	'file-api',
	'toast',
	'layedit',
	'upload'
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
	formUtil,
	daterangeUtil,
	commodityApi,
	fileApi,
	toast,
	layedit,
	upload
) {
	var $ = layui.jquery;
	var f = new form();
	var $form = $('.desc-form');

	var $saledateContainerTemplate = $('.saledate-container').remove();
	var $picTemplate = $saledateContainerTemplate.find('.pic-container').remove();
	var $videoTemplate = $saledateContainerTemplate.find('.video-container').remove();
	var $descTemplate = $saledateContainerTemplate.find('.desc-container').remove();

	var $submitContainer = $('.submit-container');

	var commodityId = ajax.getFixUrlParams('id');
	var descIdCounter = 0;//动态给编辑器赋值id
	
	var manageEditor = {
		//id:index
	};

	var controller = {

		init: function() {
			controller.bindEvent();
			controller.renderSaledate();
		},

		renderData: function(saledateId) {
			ajax.request(commodityApi.getUrl('getCommodityDesc'), {
				saledateId: saledateId
			}, function(result) {
				controller.renderSaleContainer(result.data);
			});
		},
		
		//销售期
		renderSaledate: function() {
			ajax.request(commodityApi.getUrl('getKeyValue'), {
				type:'saledate',
				con:commodityId
			}, function(result) {
				formUtil.renderSelects('#saledate', result.data);
				f.render('select');
			});
		},

		renderSaleContainer: function(item) {
			var $saledateContainer = $saledateContainerTemplate.clone();
			$.each(item.pictureList, function(index, i) {
				controller.renderPicPath($saledateContainer, i);
			});
			$.each(item.videosList, function(index, i) {
				controller.renderVideoPath($saledateContainer, i);
			});
			$.each(item.descList, function(index, i) {
				descIdCounter++;
				controller.renderDesc($saledateContainer,i);
			});
			$saledateContainer.attr('id',item.saledateId);
			$saledateContainer.insertBefore($submitContainer).show();
		},

		renderPicPath: function($context, item) {
			var $t = $picTemplate.clone();
			
			$t.find('input').val(item.thumbnail);
			$t.find('input[type="hidden"]').val(item.id);
			$t.insertBefore($context.find('.add-pic'));
		},

		renderVideoPath: function($context, item) {
			var $t = $videoTemplate.clone();
			$t.find('input').val(item.video);
			$t.find('input[type="hidden"]').val(item.id);
			$t.insertBefore($context.find('.add-video'));
		},

		renderDesc: function($context, item) {
			var $t = $descTemplate.clone();
			var txtAreaId = 'desc' + descIdCounter;
			
			$t.find('textarea').val(item.descript).attr('id', txtAreaId);
			$t.find('input[type="hidden"]').val(item.id);
			$t.insertBefore($context.find('.add-desc'));
			
			setTimeout(function() {
				var index = layedit.build(txtAreaId,{
					tool: [
						  'strong' //加粗
						  ,'italic' //斜体
						  ,'underline' //下划线
						  ,'del' //删除线
						  ,'|' //分割线
						  ,'left' //左对齐
						  ,'center' //居中对齐
						  ,'right' //右对齐
						  ,'link' //超链接
						  ,'unlink' //清除链接
						]
				});
				manageEditor[txtAreaId] = index;
				layedit.sync(index);
			}, 0);

		},
		
		bindImage: function() {
			layui.upload({
				elem:'.upload-pic',
					url: fileApi.getUrl('uploadFile').url,
					success: function(result,input) { //上传成功后的回调
						if(result.code == 0) {
							toast.success('上传图片成功');
							controller.renderPicPath($(input).parents('.saledate-container'),{thumbnail:result.url});
						} else {
							toast.error('上传图片失败');
						}
					}
				});
		},
		
		bindVideo: function() {
			layui.upload({
					elem:'.upload-video',
					url: fileApi.getUrl('uploadFile').url,
					success: function(result,input) { //上传成功后的回调
						if(result.code == 0) {
							toast.success('上传视频成功');
							controller.renderVideoPath($(input).parents('.saledate-container'),{video:result.url});
						} else {
							toast.error('上传视频失败');
						}
					}
				});
		},
		
		composeData: function() {
			$saleContainer = $('#'+controller.currentSaledateId);
			var descList = [],
				videosList = [],
				pictureList = [];
			
			$saleContainer.find('.pic-container').each(function(index,item) {
				var o = {};
				o.thumbnail = $(this).find('*[name]:not(input[type="hidden"])').val();
				o.id =  $(this).find('input[type="hidden"]').val();
				pictureList.push(o);
			});
			
			$saleContainer.find('.video-container').each(function(index,item) {
				var o = {};
				o.video = $(this).find('*[name]:not(input[type="hidden"])').val();
				o.id =  $(this).find('input[type="hidden"]').val();
				videosList.push(o);
			});
			
			$saleContainer.find('.desc-container').each(function(index,item) {
				var o = {};
				var $text = $(this).find('textarea')[0];
				o.descript = layedit.getContent(manageEditor[$text.id]);
				o.id =  $(this).find('input[type="hidden"]').val();
				descList.push(o);
			});
			
			return {
				id: controller.currentSaledateId,
				descList: descList,
				videosList: videosList,
				pictureList: pictureList
			};
		},
		
		currentSaledateId:'',//选择的销售期
		
		bindEvent: function() {

			//添加描述
			$('body').on('click','.add-desc',function() {
				descIdCounter++;
				controller.renderDesc($(this).parents('.saledate-container'),{});
			});
			
			//删除元素
			$('body').on('click','.delete',function() {
				var $container = $(this).parent();
				if($container.hasClass('desc-container') && $container.siblings('div[class$="-container"]').length==0){
					toast.warn('请不要全删除，至少保留一个描述');
				}else{
					var id = $(this).prevAll('textarea').attr('id');
					delete manageEditor[id];
					$container.remove();
				}
				
			});
			
			
			
			f.on('select(saledate)', function(data){
				var $saledateContainer = $('#'+data.value);
				if(!$saledateContainer[0]){
					controller.renderData(data.value);
					setTimeout(function() {
						controller.bindImage();
						controller.bindVideo();
					}, 100);
				}
				controller.currentSaledateId = data.value;
				$('.saledate-container').hide();
				$saledateContainer.show().siblings('.saledate-container').hide();
				
			});      

			//监听提交
			f.on('submit(commodity-desc-form)', function(data) {
				
				var data = controller.composeData();
				
				ajax.request(commodityApi.getUrl('updateCommodityDesc'), null, function(result) {
					toast.success('更新商品描述成功！');
					var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.layer.close(index); //再执行关闭
				},true,null,null,{
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(data)
				});
				return false;
			});

		}
	};

	controller.init();
});