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
	'student-report-api',
	'toast',
	'key-bind',
	'date-single-util',
    'date-util',
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
	studentReportApi,
	toast,
	keyBind,
	dateSingleUtil,
    dateUtil

) {

    var $ = layui.jquery,
        e = element(),
        data = ajax.getAllUrlParam();

    var controller = {
    	index:0,
		preOrderId:"",
        init: function() {
        	controller.renderAuditHistoryList();
			
			$(document).on('click', '.view-product', controller.set);
			$(document).on('click', '.view-log', controller.seeLog);
		
			controller.bindEvent();
		
        	//获取详情
        	var searchData = {
				studentOrderId:data.studentOrderId,
				flag:1
			};
			if(data.isNeedHisData){
				searchData.isNeedHisData = 1;
			}
			ajax.request(studentReportApi.getUrl('studentOrder/queryDetail'), searchData, function(result) {
				$.each(result.data.studentInfo, function(key,value) {
					if(value){
						$('span[name="'+key+'"]').text(value);
					}
				});
				$.each(result.data.orderInfoNow, function(key,value) {
					if(key=="shouldNum"||key=="preferentialNum"||key=="actualNum"){
						value = '¥'+value;
					}
					if(value){
						$('span[name="'+key+'"]').text(value);
					}
				});
				$.each(result.data.listCommodity, function(index,item) {
					//商品定价原价需要转成double
					item.originalPrice = item.originalPrice ? (item.originalPrice / 100).toFixed(2) : "";
					item.currentPrice = (item.currentPrice / 100).toFixed(2);
					var productList = $.grep(result.data.listProductDate, function(product,i) {
						return item.commodityId == product.commodityId;
					});
					$.each(productList, function(index,product) {
						var lastDays = "";
						if(product.dateBegin && product.dateEnd){
							if(new Date().getTime() > new Date(product.dateBegin).getTime() && new Date().getTime() < new Date(product.dateEnd).getTime()){
								lastDays = dateUtile.getDays(new Date(product.dateEnd).getTime() - new Date().getTime());
							}else if(new Date().getTime() < new Date(product.dateBegin).getTime()){
								lastDays = dateUtile.getDays(new Date(product.dateEnd).getTime() - new Date(product.dateBegin).getTime());
							}else{
								lastDays = "0天";
							}
						}
						product.lastDays = lastDays;
					});
					item.productList = productList;
				});
				if(result.data.orderInfoNow.type=="新报"||result.data.orderInfoNow.type=="续费"){
					$("#addFormShow").show();
				}
				else if(result.data.orderInfoNow.type=="部分退单"||result.data.orderInfoNow.type=="全部退单"){
					$("#returnFormShow").show();
				}
				else if(result.data.orderInfoNow.type=="改单"){
					$("#changeFormShow").show();
				}
				controller.renderShowAndPrintListTable($("#viewAndPrint-list"),result.data.listCommodity);
				//开始渲染历史数据
				if(data.isNeedHisData && result.data.orderInfoNow.preOrderId && result.data.orderInfoHis.length > 0){
					controller.preOrderId = result.data.orderInfoNow.preOrderId;
					while (controller.preOrderId){
						var $html = $("#orderClone").clone();
						if(result.data.orderInfoHis.length>0){
							var orderInfoHis = $.grep(result.data.orderInfoHis,function(orderInfoHis,i){
								return orderInfoHis.id == controller.preOrderId;
							});
							if(orderInfoHis.length>0){
								orderInfoHis = orderInfoHis[0];
								var listCommodityHis = $.grep(result.data.listCommodityHis,function(commodityHis,i){
									return commodityHis.studentOrderId == controller.preOrderId;
								});
								$.each(listCommodityHis, function(i,commodityHis) {
									commodityHis.originalPrice = commodityHis.originalPrice ? (commodityHis.originalPrice / 100).toFixed(2) : "";
									commodityHis.currentPrice = (commodityHis.currentPrice / 100).toFixed(2);
									var productList = $.grep(result.data.listProductDateHis,function(productDateHis,j){
										return productDateHis.studentOrderId == commodityHis.studentOrderId && productDateHis.commodityId == commodityHis.commodityId;
									});
									$.each(productList, function(index,product) {
										var lastDays = "";
										if(product.dateBegin && product.dateEnd){
											if(new Date().getTime() > new Date(product.dateBegin).getTime() && new Date().getTime() < new Date(product.dateEnd).getTime()){
												lastDays = dateUtile.getDays(new Date(product.dateEnd).getTime() - new Date().getTime());
											}else if(new Date().getTime() < new Date(product.dateBegin).getTime()){
												lastDays = dateUtile.getDays(new Date(product.dateEnd).getTime() - new Date(product.dateBegin).getTime());
											}else{
												lastDays = "0天";
											}
										}
										product.lastDays = lastDays;
									});
									commodityHis.productList = productList;
								});
								
								controller.index ++;
								
								$html.attr("id","orderClone"+controller.index).find("#viewAndPrint-list").attr("id","viewAndPrint-list"+controller.index);
								$("#orderList").prepend($html);
								$.each(orderInfoHis, function(key,value) {
									$("#orderClone"+controller.index).find('span[name="'+key+'"]').text(value);
								});
								controller.renderShowAndPrintListTable($("#viewAndPrint-list"+controller.index),listCommodityHis);
								
								controller.preOrderId = orderInfoHis.preOrderId;
							}else{
								break;
							}
						}else{
							break;
						}
					}
				}
			});
			
			ajax.request(studentReportApi.getUrl('studentOrder/queryAuditHis'), {studentOrderId:data.studentOrderId}, function(result) {
				if(result.data.length>0){
					$("#audit-history-list").dataTable().fnClearTable();   //将数据清除
	        		$("#audit-history-list").dataTable().fnAddData(result.data);
				}
			});
        },
        renderShowAndPrintListTable:function($table,data){
			tableUtil.renderStaticTable($table, {
				bPaginate: false,
				destroy: true,
				autoWidth: false,
				data: data,
				columns: [{
					title: '名称',
					width:"160px",
					className: "commodityChoose first",
					render:function(data,type,row, meta){
						var grade = row.grade.length == 1 ? row.grade[0] : row.grade[0]+"...";
						var specialty = row.specialty.length == 1 ? row.specialty[0] : row.specialty[0]+"...";
						var html = '<div>'+
										'<a class="grade" title="'+row.grade.join(",")+'">'+grade+'</a>'+
										'<a class="system" title="'+row.system.join(",")+'">'+row.system+'</a>'+
										'<a class="specialty" title="'+row.specialty.join(",")+'">'+specialty+'</a>'+
									'</div>'+
									'<div style="margin-top:10px;">'+
										'<a class="commodityName">'+row.commodityName+'</a>'+
									'</div>';
						return html;
					}
				},{
					title: '产品类型',
					className: "commodityChoose",
					width:"100px",
					render:function(data,type,row, meta){
						var productType = row.productType.length == 1 ? row.productType[0] : row.productType[0]+"...";
						var html = '<a title="'+row.productType.join(",")+'">'+productType+'</a>';
						return html;
					}
				},{
					title: '定价',
					className: "commodityChoose",
					render:function(data,type,row, meta){
						var addHtml = "";
						if(row.originalPrice){
							addHtml = '<div class="original">¥'+row.originalPrice+'</div>';
						}
						var html = '<div class="present">¥'+row.currentPrice+'</div>'+
									addHtml;
						return html;
					}
				},{
					title: '数量',
					className: "commodityChoose",
					width:"100px",
					render:function(data,type,row, meta){
						var html = row.num;
						return html;
					}
				},{
					title: '应收',
					className: "commodityChoose",
					render:function(data,type,row, meta){
						data = (row.currentPrice * row.num).toFixed(2);
						var html = '<div class="present receivableAmount">¥'+data+'</div>';
						return html;
					}
				},{
					title: '实收',
					className: "commodityChoose",
					width:"100px",
					render:function(data,type,row, meta){
						var html = '¥'+row.accountActual;
						return html;
					}
				},{
					title: '有效期',
					className: "commodityChoose center",
					width:"110px",
					render:function(data,type,row, meta){
						var validityStatus = "";
						var validity = "";
						var lastDays = "";
						$.each(row.productList, function(index,product) {
							if(product.dateBegin && product.dateEnd){
								validity = '<div class="validity">'+product.dateBegin+'至'+product.dateEnd+'</div>';
								lastDays = product.lastDays;
									
								if(row.isStop==1){
									validityStatus = '<div><div class="validityStatus">无 效</div></div>';
								}else{
									lastDays = '<div class="lastDays">（剩余'+lastDays+'）</div>';
									if(new Date().getTime() < new Date(product.dateBegin).getTime()){
										validityStatus = '<div><div class="validityStatus">未生效</div></div>';
									}else if(new Date().getTime() > new Date(product.dateEnd).getTime()){
										validityStatus = '<div><div class="validityStatus">无 效</div></div>';
									}else{
										validityStatus = '<div><div class="validityStatus good">有 效</div></div>';
									}
								}
								return false;
							}
						});
						html = validityStatus + validity + lastDays;
						return html;
					}
				},{
					title: '说明',
					width:"110px",
					className: "commodityChoose",
					render:function(data,type,row, meta){
						return "";
					}
				},{
					title: '操作',
					className: "commodityChoose printHide",
					width:"150px",
					render:function(data,type,row, meta){
						var buttons = btns.renderBtn("layui-btn layui-btn-small layui-btn-normal row-view view-product", "查看产品", "")+
							btns.renderBtn("layui-btn layui-btn-small layui-btn-normal row-view view-log", "查看启/停日志", "");
						return buttons;
					}
				}]
			});
		},
		renderAuditHistoryList:function(){
			tableUtil.renderStaticTable($("#audit-history-list"), {
				bPaginate: false,
				destroy: true,
				autoWidth: false,
				data: [],
				columns: [{
					title: '时间',
					className: "commodityChoose",
					width:"100px",
					data:"auditDate"
				},{
					title: '审核状态',
					className: "commodityChoose",
					width:"100px",
					data:"auditStatus"
				},{
					title: '审核意见',
					className: "commodityChoose",
					width:"100px",
					data:"auditMsg"
				},{
					title: '节点',
					className: "commodityChoose",
					width:"100px",
					data:"auditRole"
				},{
					title: '审核人',
					className: "commodityChoose",
					width:"100px",
					data:"auditPeople"
				}]
			});
		},
		set:function(){
			var rowData = $(this).parents('table').DataTable().row( $(this).parents('tr') ).data();
			var productList = rowData.productList;
			productList = JSON.stringify(productList);
			
			var url = ajax.composeUrl(webName + '/views/report-branch-center/product-or-log-table.html', {
				productList: productList,
				type: "product"
			});
			var index = layer.open({
				type: 2,
				title: "查看产品",
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url
			});
		},
		seeLog:function(){
			var data = $(this).parents('table').DataTable().row( $(this).parents('tr') ).data();
			
			var url = ajax.composeUrl(webName + '/views/report-branch-center/product-or-log-table.html', {
				studentOrderCommodityId: data.id,
				type: "log"
			});
			var index = layer.open({
				type: 2,
				title: "查看启/停日志",
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url
			});
		},
		
		bindEvent: function() {
			window.reportAudit = {
				//监听审核通过
				auditOk: function() {
					layer.confirm('确定要通过审核吗?', {
						icon: 3,
						title: '提示',
						closeBtn: 0
					}, function(index) {
						layer.load(0, {
							shade: 0.5
						});
						layer.close(index);

						var dataMsg = {
							studentOrderId:data.studentOrderId,
							auditStatus:4
						}
						ajax.request(studentReportApi.getUrl('studentOrder/audit'), dataMsg, function() {
							toast.success('学生订单审核成功！');
							var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
							parent.list.refresh();
							parent.layer.close(index); //再执行关闭
							layer.closeAll("loading");
						},null,function(results){
							toast.error(results.msg);
							var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
							parent.layer.close(index); //再执行关闭
							layer.closeAll("loading");
						});
					});
				},
				//审核驳回
				reject:function(){
					layer.prompt({
						formType: 2,
						title: '请输入驳回理由',
						area: ['500px', '100px'] //自定义文本域宽高
					}, function(value, index, elem) {
						var dataMsg = {
							studentOrderId:data.studentOrderId,
							auditStatus:3,
							auditMsg:value
						}
						ajax.request(studentReportApi.getUrl('studentOrder/audit'), dataMsg, function() {
							toast.success('学生订单驳回成功！');
							var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
							parent.list.refresh();
							parent.layer.close(index); //再执行关闭
						},null,function(results){
							var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
							parent.layer.close(index); //再执行关闭
						});
					});
					return false;
				}
			};
		}
		
        
        
    };

    controller.init();
    
    
    var dateUtile = {
		getDate: function (timeStamp) {
			var newDate = new Date(timeStamp);
		 	var year = newDate.getFullYear();
			var month = newDate.getMonth() + 1;
			var day = newDate.getDate();
			var hours = newDate.getHours();
		  	var minutes = newDate.getMinutes();
		  	var second = newDate.getSeconds();
		  	month = month*1;
		  	day = day*1;
		  	if(month<10){
		  		month = "0"+month;
		  	}
		  	if(day<10){
		  		day = "0"+day;
		  	}
			return year + "-" + month + "-" + day;
		},
		getDays:function(timeStamp){
			return Math.ceil(timeStamp/(24*60*60*1000))+"天";
		},
		getToday:function(){
			var newDate = new Date();
			var year = newDate.getFullYear();
			var month = newDate.getMonth() + 1;
			var day = newDate.getDate();
			var hours = newDate.getHours();
		  	var minutes = newDate.getMinutes();
		  	var second = newDate.getSeconds();
		  	month = month*1;
		  	day = day*1;
		  	if(month<10){
		  		month = "0"+month;
		  	}
		  	if(day<10){
		  		day = "0"+day;
		  	}
			return year + "-" + month + "-" + day;
		}
	}

    
    
    
    
});
