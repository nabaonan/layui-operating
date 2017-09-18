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
	'payment-api',
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
	paymentApi,
	toast,
	keyBind,
	dateSingleUtil,
    dateUtil

) {
	var $ = layui.jquery;
	var $table = $('#payment-table');

	var f = form();

	var count = 0; //记录动态框的个数
	var controller = {
		init: function() {
			var data = ajax.getAllUrlParam();
			controller.param = data;
			//判断window中是否存在传来的参数，优先级为高
			controller.param.contractId = window.contractId?window.contractId:data.contractId;
			
			//获取合同款项信息
			controller.getPaymentMsg(data.contractId);
			//根据合同类型获取下拉框选项
			controller.saveFromAndTo(data.contractType);

			controller.bindEvent();
		},
		//获取合同款项信息
		getPaymentMsg:function(contractId){
			ajax.request(paymentApi.getUrl('paymentMsg'), {
				contractId:contractId
			}, function(result) {
				if(!result.data.leftSPJHK){
					result.data.leftSPJHK = 0;
				}
				if(!result.data.leftED){
					result.data.leftED = 0;
				}
				if(!result.data.leftYJK){
					result.data.leftYJK = 0;
				}
				if(!result.data.addBZJ){
					result.data.addBZJ = 0;
				}
				if(!result.data.backBZJ){
					result.data.backBZJ = 0;
				}
				if(!result.data.quotaProp){
					result.data.quotaProp = 0;
				}
				if(!result.data.leftJMF){
					result.data.leftJMF = 0;
				}
				if(!result.data.leftMDFY){
					result.data.leftMDFY = 0;
				}
				//预交款转移到下期预交款
				if(!result.data.zydxqyjk){
					result.data.zydxqyjk = 0;
				}
				//保证金转移为下期预交款
				if(!result.data.bzjzywxqyjk){
					result.data.bzjzywxqyjk = 0;
				}
				if(result.data.splitPropogation){
					result.data.splitPropogation = result.data.splitPropogation.split(":")[0]*1 / (result.data.splitPropogation.split(":")[0]*1+result.data.splitPropogation.split(":")[1]*1)
				}
				controller.paymentMsg = result.data;
			});
		},
		//根据合同类型获取下拉框选项
		saveFromAndTo:function(contractType){
			contractType = contractType ? contractType : "";
			ajax.request(paymentApi.getUrl('paymentTypeDown'), {
				contractType:""
			}, function(datas) {
				controller.AllSelectOptions = datas.data;
				ajax.request(paymentApi.getUrl('paymentTypeDown'), {
					contractType:contractType
				}, function(result) {
					controller.selectOptions = result.data;
					//获取款项渲染数据
					controller.renderData(controller.param.contractId);
				});
			});
		},
		//获取合同下的所有款项数据
		renderData: function(contractId) {
			ajax.request(paymentApi.getUrl('findPaymentInfoById'), {
				contractId: contractId
			}, function(result) {
				controller.renderTable(result.data);
			});
		},
		renderTable: function(data) {
			var handleType = controller.param.handleType;
			var paymentId = controller.param.paymentId ? controller.param.paymentId : "";
			var enableStatusConfig = {
					'1': '启用',
					'2': '停用'
				},
				auditStatusConfig = {
					'1': '未提交',
					'2': '审核中',
					'3': '审核通过',
					'4': '审核驳回'
				};

			tableUtil.renderStaticTable($table, {
				bPaginate: false,
				data: data,
				columns: [{
					width:'10%',
					title: '类别',
					data: 'from',
					render: function(data, type, row) {
						var edit = false;
						if(handleType == "edit" && row.id == paymentId){
							edit = true;
						}
						if(row.addRow || edit){
							if(data=="zydxqed" || data=="zydxqyjk" || data=="bzjzywxqyjk"){
								return controller.getValueByKey(data);
							}
							else{
								var optionsFrom = "";
								var optionsTo = "";
								$.each(controller.selectOptions, function(index, item) {
									if(item.key == data){
										optionsFrom += "<option value='" + item.key + "' selected='selected'>" + item.value + "</option>";
										if(item.to){
											$.each(item.to, function(index, itemTo) {
												if(itemTo.key == row.to){
													optionsTo += "<option value='" + itemTo.key + "' selected='selected'>" + itemTo.value + "</option>";
												}else{
													optionsTo += "<option value='" + itemTo.key + "'>" + itemTo.value + "</option>";
												}
											});
										}else{
											optionsTo += '<option value="">--</option>';
										}
									}else{
										optionsFrom += "<option value='" + item.key + "'>" + item.value + "</option>";
									}
								});
								var html = '<div class="layui-input-inline">'
										+'<select id="from" name="from" lay-filter="from">'
											+ optionsFrom
										+'</select>'
										+'</div>'
										+'<div class="layui-input-inline">'
										+'<select id="to" name="to" lay-filter="to">'
											+ optionsTo
										+'</select>'
										+'</div>';
								return html;
							}
						}
						else if(data){
							var keyFrom = controller.getValueByKey(row.from);
							var keyTo = row.to ?  "为"+controller.getValueByKey(row.to) : "";
							if(row.id == paymentId){
								return "<span style='color:red;'>"+keyFrom+keyTo+"</span>"
							}
							return keyFrom+keyTo;
						}else{
							return ""
						}
					}
				},{
					title: '数额',
					data: 'amount',
					render: function(data, type, row) {
						if(row.addRow){
							return '<input type="text" class="layui-input amount '+row.amountClass+'" value="" style="width:100px" />';
						}
						else if(handleType == "edit" && row.id == paymentId){
							var amountClass = "";
							var hasPercent = "";
							var firstFrom = row.from;
							if(firstFrom=="jled"||firstFrom=="kced"){
								amountClass = "quota";
							}else if(firstFrom=="zydxqed"){
								amountClass = "percent";
								hasPercent = "%";
								data = data.replace("%","");
							}else{
								amountClass = "money";
							}
							var firstTo = row.to;
							if(firstTo){
								amountClass = "money";
							}
							return '<input type="text" class="layui-input amount '+amountClass+'" value="'+data+'" style="width:100px" />'+hasPercent;
						}
						else if(data){
							if(row.id == paymentId){
								return "<span style='color:red;'>"+data+"</span>";
							}
							return data;
						}else{
							return ""
						}
					}
				}, {
					title: '入(出)账时间',
					data: 'incomeDate',
					render: function(data, type, row, meta ) {
						data = dateUtil.formatStr(new Date(data),'yyyy-MM-dd');
						if(row.addRow){
							return '<input type="text" class="layui-input incomeDate" lay-filter="incomeDate" readonly="readonly"/>';
						}
						else if(handleType == "edit" && row.id == paymentId){
							return '<input type="text" class="layui-input incomeDate" lay-filter="incomeDate" readonly="readonly" value="'+data+'"/>';
						}
						else if(data){
							if(row.id == paymentId){
								return "<span style='color:red;'>"+data+"</span>"
							}
							return data;
						}else{
							return ""
						}
					}
				}, {
					title: '进(出)账',
					data: 'incomeNum',
					render: function(data, type, row) {
						data = data?data:"";
						if(row.addRow){
							return '<input type="text" class="layui-input layui-disabled incomeNum" readonly="readonly" value=""/>';
						}
						else if(handleType == "edit" && row.id == paymentId){
							return '<input type="text" class="layui-input layui-disabled incomeNum" readonly="readonly" value="'+data+'"/>';
						}
						else if(data){
							if(row.id == paymentId){
								return "<span style='color:red;'>"+data+"</span>"
							}
							return data;
						}else{
							return ""
						}
					}
				}, {
					title: '额度',
					data: 'quota',
					render: function(data, type, row) {
						data = data?data:"";
						if(row.addRow){
							return '<input type="text" class="layui-input layui-disabled quota" readonly="readonly" value="" />';
						}
						else if(handleType == "edit" && row.id == paymentId){
							return '<input type="text" class="layui-input layui-disabled quota" readonly="readonly" value="'+data+'" />';
						}
						else if(data){
							if(row.id == paymentId){
								return "<span style='color:red;'>"+data+"</span>"
							}
							return data;
						}else{
							return ""
						}
					}
				}, {
					title: '备注说明',
					data: 'remarker',
					render: function(data, type, row) {
						data = data?data:"";
						if(row.addRow){
							return '<input type="text" class="layui-input remarker" value="" />';
						}
						else if(handleType == "edit" && row.id == paymentId){
							return '<input type="text" class="layui-input remarker" value="'+data+'" />';
						}
						else if(data){
							if(row.id == paymentId){
								return "<span style='color:red;'>"+data+"</span>"
							}
							return data;
						}else{
							return ""
						}
					}
				}, {
					title: '发起人',
					data: 'creater',
					render: function(data, type, row) {
						if(row.addRow){
							return '';
						}
						else if(data){
							if(row.id == paymentId){
								return "<span style='color:red;'>"+data+"</span>"
							}
							return data;
						}else{
							return ""
						}
					}
				}, {
					title: '审核状态',
					data: 'auditStatus',
					render: function(data, type, row) {
						if(row.addRow){
							return '';
						}
						else if(data){
							if(row.id == paymentId){
								return "<span style='color:red;'>"+data+"</span>"
							}
							return data;
						}else{
							return ""
						}
					}

				}, {
					title: '操作',
					data: 'auditStatus',
					render: function(data, type, row) {
						if(row.addRow){
							resultBtns = btns.renderBtn("layui-btn layui-btn-small layui-btn-danger row-delete", "删除", '&#xe640;',false);
						}
						else if(data){
							resultBtns = btns.renderBtn("layui-btn layui-btn-small layui-btn-danger row-delete", "删除", '&#xe640;',true);
						}else{
							resultBtns = "";
						}
						return resultBtns;
					}
				}]
			});

			if(handleType == "add"){
				$("#page-btns,#isCommitAudit-btn").show();
				controller.addRow();
			}
			else if(handleType == "edit"){
				$("#isCommitAudit-btn").show();
			}
		},
		//根据key取下拉框缓存数据的value
		getValueByKey:function(key){
			var value = "";
			$.each(controller.AllSelectOptions, function(index, item) {
				if(item.key == key){
					value = item.value;
					return false;
				}
			});
			return value;
		},
		//添加款项行
		addRow:function(){
			var amountClass = "";
			var firstFrom = controller.selectOptions[0].key;
			if(firstFrom=="jled"||firstFrom=="kced"){
				amountClass = "quota";
			}else{
				amountClass = "money";
			}
			var firstTo = "";
			if(controller.selectOptions[0].to){
				firstTo = controller.selectOptions[0].to[0].key;
				amountClass = "money";
			}
			$table.DataTable().row.add({
				"id": "",
				"amount": "",
				"from": firstFrom,
				"to":firstTo,
				"incomeNum": "",
				"quota": "",
				"incomeDate": "",
				"auditStatus": "",
				"creater": "",
				"remarker": "",
				"addRow":true,//是否添加行
				"amountClass":amountClass//新添加行的数额class
			}).draw();
		},
		//删除款项行
		deleteRow:function(){
			$table.DataTable().row($(this).parents('tr')).remove().draw( false );
		},
		//根据数据渲染添加或编辑行的进账和额度
		writingByData:function($tr,data){
			if(data){
				$tr.find(".incomeNum").val(data.incomeNum);
				$tr.find(".quota").val(data.quota);
			}else{
				$tr.find(".amount").val("");
				$tr.find(".incomeNum").val("");
				$tr.find(".quota").val("");
			}
		},
		bindEvent: function() {
			$table.on('draw.dt', function() {
				f.render();
				if(controller.param.handleType == "add"){
					if($(".incomeDate").length>0){
						dateSingleUtil.init($table.find("tr:last").find(".incomeDate"));
					}
				}
				else if(controller.param.handleType == "edit"){
					if($(".incomeDate").length>0){
						dateSingleUtil.init($table.find(".incomeDate"));
					}
				}
			});

			if(controller.param.handleType == "add"){
				//添加款项行
				$('.addPayment').on('click', controller.addRow);
				//删除行
				$table.on('click', '.row-delete', controller.deleteRow);
			}

			if(controller.param.handleType == "add" || controller.param.handleType == "edit"){
				//监听提交
				window.payment = {
					submitData: function() {
						var tableData = $table.DataTable().data();
						var formData = [];

						var ifSubmit = true;
						if(controller.param.handleType == "add"){
							$.each(tableData, function(index,item) {
								if(item.addRow){
									if(item.amount == ""){
										toast.warn("第"+(index+1)+"行的数额没有添加！");
										ifSubmit = false;
										return false;
									}else{
										var dateFomrat = $table.find("tr").eq(index+1).find(".incomeDate").val();
										if(dateFomrat==""){
											toast.warn("第"+(index+1)+"行的入账时间没有添加！");
											ifSubmit = false;
											return false;
										}else{
											item.incomeDate = dateFomrat;
											if(item.incomeNum == 0){
												item.incomeNum = "";
											}
											if(item.quota==0){
												item.quota = "";
											}
										}
									}
									var nData = {};
									nData.amount = item.amount;
									nData.from = item.from;
									nData.to = item.to;
									nData.incomeDate = item.incomeDate;
									nData.incomeNum = item.incomeNum;
									nData.quota = item.quota;
									nData.remarker = item.remarker;
									formData.push(nData);
								}
							});
							if(ifSubmit){
								if(formData.length==0){
									toast.warn("请添加数据！");
									return false;
								}
								var isCommitAudit = $("#isCommitAudit").is(':checked');
								isCommitAudit = isCommitAudit ? 1 : -1;
								var data = {
									paymentInfoList:formData,
									isCommitAudit:isCommitAudit,
									contractId:controller.param.contractId,
									branchCenterId:controller.param.branchCenterId
								};
								return data;
							}else{
								return false;
							}
						}else if(controller.param.handleType == "edit"){
							var paymentId = controller.param.paymentId;
							$.each(tableData, function(index,item) {
								if(item.id == paymentId){
									if(item.amount == ""){
										toast.warn("第"+(index+1)+"行的数额没有添加！");
										ifSubmit = false;
										return false;
									}else{
										var dateFomrat = $table.find("tr").eq(index+1).find(".incomeDate").val();
										if(dateFomrat==""){
											toast.warn("第"+(index+1)+"行的入账时间没有添加！");
											ifSubmit = false;
											return false;
										}else{
											item.incomeDate = dateFomrat;
											if(item.incomeNum == 0){
												item.incomeNum = "";
											}
											if(item.quota==0){
												item.quota = "";
											}
										}
									}
									var nData = {};
									nData.id = item.id;
									nData.amount = item.amount;
									if(item.from=="zydxqed"){
										nData.amount = item.amount+"%";
									}
									nData.from = item.from;
									nData.to = item.to;
									nData.incomeDate = item.incomeDate;
									nData.incomeNum = item.incomeNum;
									nData.quota = item.quota;
									nData.remarker = item.remarker;
									formData.push(nData);
								}
							});
							if(ifSubmit){
								var isCommitAudit = $("#isCommitAudit").is(':checked');
								isCommitAudit = isCommitAudit ? 1 : -1;
								var data = {
									paymentInfoList:formData,
									isCommitAudit:isCommitAudit,
									contractId:controller.param.contractId,
									branchCenterId:controller.param.branchCenterId
								};
								return data;
							}else{
								return false;
							}
						}
					}
				}
			}

			//加载input规则
			controller.paymentRules();
		},
		//controller.param			//缓存的 上级菜单传递的参数
		//controller.selectOptions	//缓存的 from to 下拉框选项
		//controller.paymentMsg		//缓存的 合同款项信息
		//款项的一些变化规则
		paymentRules:function(){
			f.on('select(from)', function(data){
				var key = data.value;
				var _this = this;

				//改变table的值
				var $tr = $(_this).parents('tr');
				//缓存行from数据
				$table.DataTable().row( $tr ).data().from = data.value;

				//点击下拉框选项后改变数额的class并且清空行数额、额度、进账
				if(key=="jled"||key=="kced"){
					$tr.find(".amount").removeClass("money").addClass("quota");
				}else{
					$tr.find(".amount").removeClass("quota").addClass("money");
				}
//				controller.writingByData($tr);
				$tr.find(".amount").blur();

				$.each(controller.selectOptions, function(index, item) {
					if(item.key == key){
						if(item.to){
							$(_this).parents("td").find("#to").html("");
							var options = "";
							$.each(item.to, function(index, item) {
								options += "<option value='" + item.key + "'>" + item.value + "</option>";
							});
							$(_this).parents("td").find("#to").append(options);
							//缓存行to数据
							$table.DataTable().row( $tr ).data().to = item.to[0].key;
						}else{
							$(_this).parents("td").find("#to").html("<option value=''>--</option>");
							//缓存行to数据
							$table.DataTable().row( $tr ).data().to = "";
						}
						f.render();
					}
				});
			});
			f.on('select(to)', function(data){
				var $tr = $(this).parents('tr');
				//缓存行to数据
				$table.DataTable().row( $tr ).data().to = data.value;

				//点击下拉框选项后清空行数额、额度、进账
				controller.writingByData($tr);
			});
			//日期选择 变化事件
			$(document).on("change",".incomeDate",function(){
				var value = $(this).val();
				var $tr = $(this).parents('tr');
				//缓存行to数据
				$table.DataTable().row( $tr ).data().incomeDate = value;
			});
			//备注离焦保存事件
			$(document).on("blur",".remarker",function(){
				var value = $(this).val();
				var $tr = $(this).parents('tr');
				//缓存行to数据
				$table.DataTable().row( $tr ).data().remarker = value;
			});
			//钱款输入规则
			$(document).on("keyup",".money",function(){
				var value = $(this).val();
				value = value.replace(regSpecial,'');
				value = value.replace(regMinus,'');
				value = value.replace(regSpace,'');
				value = value.replace(regEnglish,'');
				value = value.replace(regChinese,'');
				if(value.split('.').length>2||value.substring(0,1)=='.'){
					value = value.split('.')[0];
				}
				if(!reqNumWidthPiontAndTwoNum.test(value)){
					if(value.charAt(value.length - 1)=="."){
					}
					else{
						value = "";
					}
				}
				$(this).val(value);
			});
			//额度输入规则
			$(document).on("keyup",".quota,percent",function(){
				var value = $(this).val();
				value = value.replace(regSpecial,'');
				value = value.replace(regMinus,'');
				value = value.replace(regSpace,'');
				value = value.replace(regEnglish,'');
				value = value.replace(regChinese,'');
				value = value.replace(regPoint,'');
				if(!reqNum.test(value)){
					value = "";
				}
				$(this).val(value);
			});
			//钱款离焦规则
			$(document).on("blur",".money",function(){
				var value = $(this).val();
				value = value.replace(regSpecial,'');
				value = value.replace(regMinus,'');
				value = value.replace(regSpace,'');
				value = value.replace(regEnglish,'');
				value = value.replace(regChinese,'');
				if(value.split('.').length>2||value.substring(0,1)=='.'){
					value = value.split('.')[0];
				}
				if(!reqNumWidthPiontAndTwoNum.test(value)){
					if(value.charAt(value.length - 1)=="."){
					}
					else{
						value = "";
					}
				}
				$(this).val(value);
			});
			//额度离焦规则
			$(document).on("blur",".quota,percent",function(){
				var value = $(this).val();
				value = value.replace(regSpecial,'');
				value = value.replace(regMinus,'');
				value = value.replace(regSpace,'');
				value = value.replace(regEnglish,'');
				value = value.replace(regChinese,'');
				if(regPoint.test(value)){
					value = "";
				}
				/*value = value.replace(regPoint,'');*/
				else if(!reqNum.test(value)){
					value = "";
				}
				$(this).val(value);
			});
			//数额离焦事件
			$(document).on("blur",".amount",function(){
				var value = $(this).val();
				if( (value.length-1) == value.indexOf(".")){
					value = value.replace(".","");
					$(this).val(value);
				}
				value = value * 1;

				var $tr = $(this).parents('tr');
				var from = $table.DataTable().row( $tr ).data().from;

				var rowData = $table.DataTable().row( $tr ).data();

				if(value==""||value==0){
					rowData.amount = "";
					rowData.incomeNum = "";
					rowData.quota = "";
					controller.writingByData($tr);
					return false;
				}
				//如果首批进货款 判断 不能大于合同剩余
				if(from=="spjhk"){
					/*if(controller.paymentMsg.quotaProp == 100 && value != controller.paymentMsg.leftSPJHK){
						toast.warn("额度有效比例为100%的情况必须全款缴纳首批进货款："+controller.paymentMsg.leftSPJHK);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}*/
					if(value>controller.paymentMsg.leftSPJHK){
						toast.warn("所填数值不能大于剩余首批进货款："+controller.paymentMsg.leftSPJHK);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						rowData.amount = value;
						rowData.incomeNum = value;
						rowData.quota = parseInt(value / controller.paymentMsg.splitPropogation);
						controller.writingByData($tr,rowData);
					}
				}
				//如果扣除额度 判断 值是否大于剩余额度
				else if(from=="kced"){
					if(value>controller.paymentMsg.leftED){
						toast.warn("所填数值不能大于剩余额度："+controller.paymentMsg.leftED);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						rowData.amount = value;
						rowData.incomeNum = 0;
						rowData.quota = value;
						controller.writingByData($tr,rowData);
					}
				}
				//如果奖励额度
				else if(from=="jled"){
					rowData.amount = value;
					rowData.incomeNum = 0;
					rowData.quota = value;
					controller.writingByData($tr,rowData);
				}
				//如果扣除预交款 或者 退预交款
				else if(from=="kcyjk"||from=="tyjk"){
					if(value>controller.paymentMsg.leftYJK){
						toast.warn("所填数值不能大于剩余预交款："+controller.paymentMsg.leftYJK);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						rowData.amount = value;
						rowData.incomeNum = value;
						rowData.quota = 0;
						controller.writingByData($tr,rowData);
					}
				}
				//如果预缴款转移
				else if(from=="yjkzy"){
					if(value>controller.paymentMsg.leftYJK){
						toast.warn("所填数值不能大于剩余预交款："+controller.paymentMsg.leftYJK);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						var to = $table.DataTable().row( $tr ).data().to;
						if(to=="spjhk"){
							/*if(controller.paymentMsg.quotaProp == 100 && value != controller.paymentMsg.leftSPJHK){
								toast.warn("额度有效比例为100%的情况必须全款缴纳首批进货款："+controller.paymentMsg.leftSPJHK);
								rowData.amount = "";
								rowData.incomeNum = "";
								rowData.quota = "";
								controller.writingByData($tr);
								$(this).focus();
							}*/
							if(value>controller.paymentMsg.leftSPJHK){
								toast.warn("所填数值不能大于剩余首批进货款："+controller.paymentMsg.leftSPJHK);
								rowData.amount = "";
								rowData.incomeNum = "";
								rowData.quota = "";
								controller.writingByData($tr);
								$(this).focus();
							}else{
								rowData.amount = value;
								rowData.incomeNum = value;
								rowData.quota = parseInt(value / controller.paymentMsg.splitPropogation);
								controller.writingByData($tr,rowData);
							}
						}
						else if(to=="bzj"){
							if(value>controller.paymentMsg.addBZJ){
								toast.warn("所填数值不能大于可交保证金："+controller.paymentMsg.addBZJ);
								rowData.amount = "";
								rowData.incomeNum = "";
								rowData.quota = "";
								controller.writingByData($tr);
								$(this).focus();
							}else{
								rowData.amount = value;
								rowData.incomeNum = value;
								rowData.quota = 0;
								controller.writingByData($tr,rowData);
							}
						}
						else if(to=="jmf"){
							if(value>controller.paymentMsg.leftJMF){
								toast.warn("所填数值不能大于可交加盟费："+controller.paymentMsg.leftJMF);
								rowData.amount = "";
								rowData.incomeNum = "";
								rowData.quota = "";
								controller.writingByData($tr);
								$(this).focus();
							}else{
								rowData.amount = value;
								rowData.incomeNum = value;
								rowData.quota = 0;
								controller.writingByData($tr,rowData);
							}
						}
						else if(to=="mdfy"){
							if(value>controller.paymentMsg.leftMDFY){
								toast.warn("所填数值不能大于可交买断费用："+controller.paymentMsg.leftMDFY);
								rowData.amount = "";
								rowData.incomeNum = "";
								rowData.quota = "";
								controller.writingByData($tr);
								$(this).focus();
							}else{
								rowData.amount = value;
								rowData.incomeNum = value;
								rowData.quota = 0;
								controller.writingByData($tr,rowData);
							}
						}
						else{
							rowData.amount = value;
							rowData.incomeNum = value;
							rowData.quota = 0;
							controller.writingByData($tr,rowData);
						}
					}
				}
				//如果 保证金
				else if(from=="bzj"){
					if(value>controller.paymentMsg.addBZJ){
						toast.warn("所填数值不能大于可交保证金："+controller.paymentMsg.addBZJ);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						rowData.amount = value;
						rowData.incomeNum = value;
						rowData.quota = 0;
						controller.writingByData($tr,rowData);
					}
				}
				//如果 退保证金
				else if(from=="tbzj"){
					if(value>controller.paymentMsg.backBZJ){
						toast.warn("所填数值不能大于可退保证金："+controller.paymentMsg.backBZJ);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						rowData.amount = value;
						rowData.incomeNum = value;
						rowData.quota = 0;
						controller.writingByData($tr,rowData);
					}
				}
				//剩余额度转移到下期额度
				else if(from=="zydxqed"){
					if(value>100){
						toast.warn("上期转移额度不能大于100%");
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						rowData.amount = value;
						rowData.incomeNum = 0;
						rowData.quota = value+"%";
						controller.writingByData($tr,rowData);
					}
				}
				//预交款转移到下期预交款
				else if(from=="zydxqyjk"){
					if(value>controller.paymentMsg.previousYJK){
						toast.warn("上期转移预交款不能大于上期预交款："+controller.paymentMsg.previousYJK);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						rowData.amount = value;
						rowData.incomeNum = value;
						rowData.quota = 0;
						controller.writingByData($tr,rowData);
					}
				}
				//保证金转移为下期预交款
				else if(from=="bzjzywxqyjk"){
					if(value>controller.paymentMsg.previousBZJ){
						toast.warn("上期转移预交款不能大于上期保证金："+controller.paymentMsg.previousBZJ);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						rowData.amount = value;
						rowData.incomeNum = value;
						rowData.quota = 0;
						controller.writingByData($tr,rowData);
					}
				}
				//加盟费不能超过可用数值
				else if(from=="jmf"){
					if(value>controller.paymentMsg.leftJMF){
						toast.warn("所填数值不能大于可交加盟费："+controller.paymentMsg.leftJMF);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						rowData.amount = value;
						rowData.incomeNum = value;
						rowData.quota = 0;
						controller.writingByData($tr,rowData);
					}
				}
				//买断费用不能超过可用数值
				else if(from=="mdfy"){
					if(value>controller.paymentMsg.leftMDFY){
						toast.warn("所填数值不能大于可交买断费用："+controller.paymentMsg.leftMDFY);
						rowData.amount = "";
						rowData.incomeNum = "";
						rowData.quota = "";
						controller.writingByData($tr);
						$(this).focus();
					}else{
						rowData.amount = value;
						rowData.incomeNum = value;
						rowData.quota = 0;
						controller.writingByData($tr,rowData);
					}
				}
				else{
					rowData.amount = value;
					rowData.incomeNum = value;
					rowData.quota = 0;
					controller.writingByData($tr,rowData);
				}
			});
		}
	};

	//wy用正则表达式匹配
	var regSpecial = new RegExp("[`+~!@#$^&*()=|{}':;',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");//匹配特殊字符不包括"."
	var regPoint = new RegExp("[.]");//匹配特殊字符"."
	var regMinus = new RegExp("[-]");//匹配特殊字符"-"
	var regSpace = /[\s]+/;//匹配空格
	var regEnglish = /[A-Za-z]/;//匹配英文
	var regChinese = /[^\u0000-\u00FF]$/;//匹配中文
	var regAge = /^[0-9]{1,3}\.{0,1}\d{0,1}$/;//匹配年龄格式
	var regPhone = /^\d{3,4}-?\d{7,9}$/;//匹配座机号格式
	var regMobile =/^((((13[0-9]{1})|(14[7-7]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[6-8]{1})))+[0-9]{8})$/;//匹配手机号格式

	var reqNumWidthPiont =/^\d+(\.\d+)?$/;
	var reqNumWidthPiontAndTwoNum =/^\d+(\.\d{0,2})?$/;
	var reqNum = /^[0-9]*$/;

	controller.init();
});