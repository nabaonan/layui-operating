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
	var $ = layui.jquery;
	var $table = $('#payment-audit-table');

	var f = form();

	var count = 0; //记录动态框的个数
	var controller = {
		init: function() {
			var data = ajax.getAllUrlParam();
			
			if(data.type == "product"){
				$("legend").html("查看产品有效期");
				var productList = JSON.parse(data.productList);
				controller.renderProductsListTable(productList);
			}
			else if(data.type == "log"){
				var studentOrderCommodityId = data.studentOrderCommodityId;
				ajax.request(studentReportApi.getUrl('studentOrder/queryStartStopHis'), {
					studentOrderCommodityId:studentOrderCommodityId
				}, function(result) {
					if(result.data.length>0){
						controller.renderLogListTable(result.data);
						$("#log-msg").show();
						$("#log-msg").find("span[name='stopNum']").text(result.stopCount+"天");
						$("#log-msg").find("span[name='stopDays']").text(result.stopDayNum+"天");
						$("#log-msg").find("span[name='useDays']").text(result.useDayNum+"天");
					}else{
						toast.warn('没有停/启日志');
					}
				});
			}

			controller.bindEvent();
		},
		renderProductsListTable:function(data){
			tableUtil.renderStaticTable($("#audit-table"), {
				bPaginate: false,
				destroy: true,
				autoWidth: true,
				data: data,
				columns: [{
					title: '产品名称',
					className:'center',
					data:"productName"
				},{
					title: '时长',
					className:'center',
					render:function(data,type,row, meta){
						if(row.timeLength){
							return row.timeLength;
						}else{
							return row.productTimeLength+row.timeLengthUnit;
						}
					}
				},{
					title: '开始时间',
					className:'center',
					width:"200px",
					render:function(data,type,row, meta){
						var html = row.dateBegin;
						return html;
					}
				},{
					title: '截止时间',
					width:"200px",
					className:'center',
					render:function(data,type,row, meta){
						var html = '<span name="dateEnd">'+row.dateEnd+'</span>';
						if(!row.timeStamp){
							html = row.dateEnd;
						}
						return html;
					}
				},{
					title: '剩余天数',
					width:"100px",
					className:'center',
					render:function(data,type,row, meta){
						return "<span name='lastDays'>"+row.lastDays+"</span>";
					}
				}]
			});
		},
		renderLogListTable:function(data){
			tableUtil.renderStaticTable($("#audit-table"), {
				bPaginate: false,
				destroy: true,
				autoWidth: true,
				data: data,
				columns: [{
					title: '操作类型',
					className:'center',
					data:"operType",
					width:"100px"
				},{
					title: '操作人',
					className:'center',
					data:"operater",
					width:"100px"
				},{
					title: '操作时间',
					className:'center',
					width:"200px",
					data:"operDate",
					width:"100px"
				}]
			});
		},
		
		bindEvent: function() {
		}
	};

	controller.init();
});