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
	'branch-center-api',
	'contract-api',
	'payment-api',
	'menu',
	'date-util',
	'toast',
	'key-bind',
	'daterange-util',
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
	branchCenterApi,
	contractApi,
	paymentApi,
	menu,
	dateUtil,
	toast,
	keyBind,
	daterangeUtil

) {
	var $ = layui.jquery;
	var $table1 = $('#branch-center-list');
	var $table2 = $('#contract-list');
	var $table3 = $('#payment-list');

	var $form = $("#condition");
	
	var element = layui.element();

	var f = form();
	var count = 0;
	var controller = {
		init: function() {
			controller.renderTable();
			controller.bindEvent();
		},

		refresh: function() {
			$table1.DataTable().destroy();
			$table2.DataTable().destroy();
			$table3.DataTable().destroy();
			controller.renderTable();
		},

		renderTable: function() {
			ajax.request(branchCenterApi.getUrl('notAuditList'), {}, function(result) {
				var dataList = $.grep(result.data, function(item,index) {
					return index<5;
				});
				$("#b-msg").html('未审核:<span onclick="goB(2)">'+result.notAuditNum+'</span>编辑未审核:<span onclick="goB(6)">'+result.editNotAuditNum+'</span>审核驳回:<span onclick="goB(4)">'+result.auditRefuseNum+'</span>编辑审核驳回:<span onclick="goB(7)">'+result.editAuditRefuseNum+'</span>审核通过:<span onclick="goB(3)">'+result.auditPassNum+'</span>')
				tableUtil.renderStaticTable($table1, {
					data: dataList,
					columns: [{
						title: '分中心（未审核）',
						render: function(data, type, row) {
							return row.centerName+"未审核"+"<font style='float:right;color:#999999;'>"+dateUtil.formatStr(new Date(row.submitAuditTime),'yyyy-MM-dd')+"</font>";
						}
					}]
				});
			});
			ajax.request(contractApi.getUrl('queryFinanceWelcomePage'), {}, function(result) {
				var dataList = $.grep(result.data, function(item,index) {
					return index<5;
				});
				$("#c-msg").html('未审核:<span onclick="goC(2)">'+result.notAuditNum+'</span>审核驳回:<span onclick="goC(3)">'+result.auditRefuseNum+'</span>审核通过:<span onclick="goC(4)">'+result.auditPassNum+'</span>')
				tableUtil.renderStaticTable($table2, {
					data: dataList,
					columns: [{
						title: '合同（未审核）',
						render: function(data, type, row) {
							return row.branchCenterName+row.type+"了一份合同"+"<font style='float:right;color:#999999;'>"+dateUtil.formatStr(new Date(row.submitAuditDate),'yyyy-MM-dd')+"</font>";
						}
					}]
				});
			});
			ajax.request(paymentApi.getUrl('queryFinanceWelcomePage'), {}, function(result) {
				var dataList = $.grep(result.data, function(item,index) {
					return index<5;
				});
				$("#p-msg").html('未审核:<span onclick="goP(2)">'+result.notAuditNum+'</span>审核驳回:<span onclick="goP(4)">'+result.auditRefuseNum+'</span>审核通过:<span onclick="goP(3)">'+result.auditPassNum+'</span>')
				tableUtil.renderStaticTable($table3, {
					data: dataList,
					columns: [{
						title: '款项（未审核）',
						render: function(data, type, row) {
							return "合同"+row.contractCode+"进行了款项变更"+"<font style='float:right;color:#999999;'>"+dateUtil.formatStr(new Date(row.submitAuditDate),'yyyy-MM-dd')+"</font>";
						}
					}]
				});
			});
		},

		branchCenterAudit: function() {
			var rowData = tableUtil.getRowData($table1, $(this));
			var data = {};
			data.branchCenterId = rowData.id;//分中心ID
			data.handleType = "audit";//操作类型

			var url = ajax.composeUrl(webName + '/views/finance/branch-center-audit-view.html', data);

			var index = layer.open({
				type: 2,
				maxmin: true,
				title: "分中心审核",
				area: ['80%', '90%'],
				scrollbar: false,
				content: url,
				btn: ['审核通过', '驳回',' 返回'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.branchCenterAudit.auditOk();
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的auditOk中
				},
				btn2: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.branchCenterAudit.reject();
					return false;
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的reject中
				}
			});
			layer.full(index);
		},
		contractAudit: function() {
        	var rowData = tableUtil.getRowData($table2, $(this));
			var data = {};
			data.handleType = "audit";//操作类型
			data.branchCenterId = rowData.branchCenterId;//分中心ID
			data.contractId = rowData.contractId;//合同ID
			data.contractType = "";//合同类型
			var url = ajax.composeUrl(webName + '/views/finance/contract-audit-view.html', data);

			var index = layer.open({
				type: 2,
				title: "款项审核",
				maxmin: true,
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url,
				btn: ['审核通过', '驳回',' 返回'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.contractAudit.auditOk();
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的auditOk中
				},
				btn2: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.contractAudit.reject();
					return false;
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的reject中
				}
			});
        },
		paymentAudit: function() {
			var rowData = tableUtil.getRowData($table3, $(this));
			var data = {};
			data.handleType = "audit";//操作类型
			data.branchCenterId = rowData.branchCenterId;//分中心ID
			data.contractId = rowData.contractId;//合同ID
			data.contractType = rowData.contractType;//合同类型
			data.paymentId = rowData.paymentId;//款项ID
			var url = ajax.composeUrl(webName + '/views/finance/payment-finance-view.html', data);

			var index = layer.open({
				type: 2,
				title: "款项审核",
				maxmin: true,
				area: ['80%', '80%'],
				offset: '10%',
				scrollbar: false,
				content: url,
				btn: ['审核通过', '驳回',' 返回'],
				yes: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.paymentAudit.auditOk();
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的auditOk中
				},
				btn2: function(index, layero) {
					var iframeWin = window[layero.find('iframe')[0]['name']];
					iframeWin.paymentAudit.reject();
					return false;
					//由于有弹窗逻辑，所以没法立即回调，提交操作写在子js pament-audit-table.js的reject中
				}
			});
		},

		bindEvent: function() {
			$table1.on('click', 'td', controller.branchCenterAudit);
			$table2.on('click', 'td', controller.contractAudit);
			$table3.on('click', 'td', controller.paymentAudit);

			$("#b-btn").click(function(){
				window.goB(2);
			});
			$("#c-btn").click(function(){
				window.goC(2);
			})
			$("#p-btn").click(function(){
				window.goP(2);
			})
		}
	};

	//	对外开方接口
	window.list = {
		refresh: controller.refresh
	};
	window.goB = function(s){
		var card = 'card'; // 选项卡对象
		var title = "";// 导航栏text
		var id = "";
		authority.getNavs().success(function(result){
			$.each(result.data, function(index,item) {
				$.each(item.children, function(i,child) {
					if(child.menuName == "分中心审核"){
						id = child.id;
					}
				});
			});
			if(id){
				title = $("a[data-id='"+id+"']",window.top.document).html();		
				var flag = window.getTitleId(card, title); // 是否有该选项卡存在
				// 大于0就是有该选项卡了
				if(flag > 0) {
					window.top.elementParent.tabDelete(card, flag);
				}
				menu.activeMenu("分中心审核");
				if(window.localStorage){ 
					localStorage.setItem("auditstatus", s);
				}
			}else{
				toast.warn('没有找到所查找的栏目！');
			}
		});
	}
	window.goC = function(s){
		var card = 'card'; // 选项卡对象
		var title = "";// 导航栏text
		var id = "";
		authority.getNavs().success(function(result){
			$.each(result.data, function(index,item) {
				$.each(item.children, function(i,child) {
					if(child.menuName == "合同审核"){
						id = child.id;
					}
				});
			});
			if(id){
				title = $("a[data-id='"+id+"']",window.top.document).html();		
				var flag = window.getTitleId(card, title); // 是否有该选项卡存在
				// 大于0就是有该选项卡了
				if(flag > 0) {
					window.top.elementParent.tabDelete(card, flag);
				}
				menu.activeMenu("合同审核");
				if(window.localStorage){ 
					localStorage.setItem("auditstatus", s);
				}
			}else{
				toast.warn('没有找到所查找的栏目！');
			}
		});
	}
	window.goP = function(s){
		var card = 'card'; // 选项卡对象
		var title = "";// 导航栏text
		var id = "";
		authority.getNavs().success(function(result){
			$.each(result.data, function(index,item) {
				$.each(item.children, function(i,child) {
					if(child.menuName == "款项审核"){
						id = child.id;
					}
				});
			});
			if(id){
				title = $("a[data-id='"+id+"']",window.top.document).html();		
				var flag = window.getTitleId(card, title); // 是否有该选项卡存在
				// 大于0就是有该选项卡了
				if(flag > 0) {
					window.top.elementParent.tabDelete(card, flag);
				}
				menu.activeMenu("款项审核");
				if(window.localStorage){ 
					localStorage.setItem("auditstatus", s);
				}
			}else{
				toast.warn('没有找到所查找的栏目！');
			}
		});
	}
	window.getTitleId = function(card, title) {
		var id = -1;
		$(window.top.document).find(".layui-tab[lay-filter=" + card + "] ul li").each(function() {
			if(title === $(this).find('span').html()) {
				id = $(this).attr('lay-id');
			}
		});
		return id;
	}
	controller.init();
});