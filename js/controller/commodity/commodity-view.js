var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'layer',
	'form-util',
	'request',
	'commodity-api',
	'table-util',
	'date-util',
	'form',
	'valid-login'
];

registeModule(window, requireModules);

//参数有顺序
layui.use(requireModules, function(
	layer,
	formUtil,
	ajax,
	commodityApi,
	tableUtil,
	dateUtil,
	form
) {
	var $ = layui.jquery;
	var id = ajax.getFixUrlParams('id');

	var $commodityProducts = $('#selected-commodity-list');
	var $promotionList = $('#promotion-list');
	var $saledateList = $('#saledate-list');
	var $auditList = $('#audit-list');
	var $table = $('table');
	var f = form();
	var count = 0; //记录动态框的个数
	var subCount = 0; //记录联动个数
	var controller = {
		
		init: function() {

			controller.renderData(id);
			controller.bindEvent();
			
		},
	

		renderData: function(id) {
			
			
			var auditStatusMap = {
				'1':'已提交审核',
				'2':'一审通过',
				'3':'已审核',
				'4':'一审驳回',
				'5':'二审驳回',
				'6':'未提交审核'
			};
			
			if(!$.isEmptyObject(id)) {
				ajax.request(commodityApi.getUrl('getCommodityViewData'), {
					commodityId: id
				}, function(result) {
					
					
					var originalPrice = result.data.originalPrice,
						currentPrice = result.data.currentPrice,
						discount = result.data.discount;
					if(originalPrice == null || originalPrice == ''){
						originalPrice = 0;
					}
					
					if(currentPrice == null || currentPrice == ''){
						currentPrice = 0;
					}
					
					if(discount == null || discount == ''){
						discount = 0;
					}
					
					result.data.originalPrice = parseFloat(originalPrice) / 100;
					result.data.currentPrice = parseFloat(currentPrice) / 100;
					result.data.discount = parseInt(discount.toFixed(2) * 100) + '%';
					
					formUtil.renderData($('#commodity-form'), result.data);
					
					if(result.data.saledate){
						controller.renderImages(result.data.saledate.pictureList);
						controller.renderVideos(result.data.saledate.videosList);
						controller.renderDescs(result.data.saledate.descList);
						controller.renderSaledateShow(result.data.saledate);
					}

					tableUtil.renderStaticTable($commodityProducts, {
						data: result.data.commodityProducts,
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
							data: 'timeLength',
							render: function(data, type, row) {
								return data +' (单位:' +row.unit+')';
							}
						}, {
							title: '有效期',
							data: 'expiryLength',
							render: function(data) {
								return data + '天';
							}
						}, {
							title: '单价',
							data: 'unitPrice',
							render: function(data) {
								if(data == null || data == ''){
									data = 0;
								}
								return parseFloat(data)/100;
							},
							width: '80px'
						}, {
							title: '数量',
							data: 'number',
							width: '50px',
							render: function(data) {
								if(data == null || data == ''){
									data = 0;
								}
								return data;
							}
						}, {
							title: '原价',
							data: 'productOriginalPrice',
							width: '80px',
							render: function(data) {
								if(data == null || data == ''){
									data = 0;
								}
								return parseFloat(data)/100;
							}
						}, {
							title: '现价',
							data: 'productCurrentPrice',
							width: '80px',
							render: function(data) {
								if(data == null || data == ''){
									data = 0;
								}
								return parseFloat(data)/100;
							}
						}, {
							title: '适用地区',
							data: 'areaName'
						}]
					});

					tableUtil.renderStaticTable($promotionList, {
						data: result.data.promotionList,
						columns: [{
								title: '参与促销政策',
								width: '100px'
							}, {
								title: '优惠内容'
							}, {
								title: '活动生效时间'
							}, {
								title: '活动截止时间'
							},
							{
								title: '审批人'
							}]
					});

					tableUtil.renderStaticTable($saledateList, {
						data: result.data.saleDateList,
						columns: [{
							title: '创建时间',
							data: 'createDate',
							width: '100px',
							render: function(data) {
								if(data == '' || data == null){
									return '';
								}
								return dateUtil.formatStr(new Date(data), 'yyyy-MM-dd HH:mm:ss');
							}
						}, {
							title: '开始时间',
							data: 'startDate',
							render: function(data) {
								if(data == '' || data == null){
									return '';
								}
								return dateUtil.formatStr(new Date(data), 'yyyy-MM-dd HH:mm:ss');
							}
						}, {
							title: '结束时间',
							data: 'endDate',
							render: function(data) {
								if(data == '' || data == null){
									return '';
								}
								return dateUtil.formatStr(new Date(data), 'yyyy-MM-dd HH:mm:ss');
							}
						}, {
							title: '创建人',
							data:'creator'
						}]

					});

					tableUtil.renderStaticTable($auditList, {
						data: result.data.auditList,
						columns: [{
							title: '发起人',
							data: 'sponsor',
							width: '100px'
						}, {
							title: '操作状态',
							data: 'auditStatus',
							render: function(data) {
								return auditStatusMap[data];
							}
						}, {
							title: '审批意见',
							data: 'auditOpinion'

						}, {
							title: '审批日期',
							data: 'auditDate',
							render: function(data) {
								if(data == '' || data == null){
									return '';
								}
								return dateUtil.formatStr(new Date(data), 'yyyy-MM-dd HH:mm:ss');
							}
						}, {
							title: '当前节点',
							data:'currentNode'
						}, {
							title: '审核人',
							data: 'auditor'
						}]

					});

				});
			}
		},

		renderSaledateShow: function(saledate) {
			var startDate = dateUtil.formatStr(new Date(saledate.startDate), 'yyyy-MM-dd HH:mm:ss');
			var endDate = dateUtil.formatStr(new Date(saledate.endDate), 'yyyy-MM-dd HH:mm:ss');
			$('.saledate-show').val(startDate + '~' + endDate);
		},

		renderImages: function(datas) {
			var dom = '';
			$.each(datas, function(index, item) {
				dom += '<img alt="上传的图片" layer-src="' + webName+'/..'+item.thumbnail + '" src="' + webName+'/..'+item.thumbnail + '"/>';
			});
			$('.pic-container').html(dom);
			
			//查看缩略图特效
			layer.photos({
			  	photos: '.pic-container'
			}); 
		},

		renderVideos: function(datas) {
			var dom = '';
			$.each(datas, function(index, item) {
				dom += '<video src="' + webName+'/..'+item.video + '" controls="controls"></video>';
			});
			$('.video-container').html(dom);
		},

		renderDescs: function(datas) {
			var dom = '';
			$.each(datas, function(index, item) {
				dom += '<textarea class="layui-textarea" readonly="readonly">' + item.descript + '</textarea>';
			});
			$('.desc-container').html(dom);
		},
		bindEvent: function(){
			$table.on('draw.dt', function() {
				$('fieldset').show();
			});
			
			
			
		

		}

	};
	controller.init();

});