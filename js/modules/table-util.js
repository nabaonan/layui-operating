
//这里配置自定义依赖模块
//layui.extend({
//	baseUrl:'api/baseUrl',//这里配置命名最好按照驼峰命名规范,
//});

var requireModules = [
'base-url',
'form-util',
'form'];

window.top.registeModule(window,requireModules);

//这里引用依赖模块
layui.define(requireModules, function(exports) {

//	console.log("1222222",layui.baseUrl);
	var baseUrl = layui['base-url'];
	var $ = layui.jquery;
	var f = layui.form();

	var util = {
		

		/**
		 * 
		 * @param {Object} $table 指定的table的jquery对象
		 * @param {Object} composeCondition 指定组织查询条件的function
		 * @param {Object} option  其他扩展参数，比如设置列
		 */

		renderTable: function($table, option) {
			var config = {
				dom: "t" + "<'row'<'col-xs-6'><'col-xs-6'p>>",
				ordering: false,
				lengthChange: false,
				retrieve: true,
				autoWidth:true,
				paginationType: "full_numbers",
				ajax: {
					url: option.url,
					type: option.type||'get',
					dataSrc: "data",
					data: function(requestParam) {
						var param;
						if(option.composeCondition) {
							param = option.composeCondition();
						} else {
							param = {};
						}
						var orderInfo;
						var order = requestParam.order;
						 
						var orderName,orderType;
						
						if(order && order.length!=0){//只支持单列排序，如果支持多列排序再改
							orderName = requestParam.columns[order[0].column].data;
							orderType = order[0].dir;
						}
						
						var pageParam = {
							start: requestParam.start,
							length: requestParam.length,
							orderName: orderName,
							orderType: orderType
						}
						return $.extend(true, pageParam, param);
					}

				},
				processing: true,
				serverSide: true,
				language: {
					url: baseUrl.getUrl('datatables/language').url
				}
			};

			var totalConfig = $.extend(true, config, option);
			if(option.isStatic){
				delete totalConfig.ajax;
			}
			
			return $table.dataTable(totalConfig).api();
		},
		
		renderStaticTable: function($table,options) {
			var opt = {
				dom: "t",
				data: [],
				retrieve: true,
				autoWidth:true,
				ordering: false,
				language: {
					url: baseUrl.getUrl('datatables/language').url
				}
			}
			var totalOpt = $.extend(true,opt,options);
			$table.dataTable(totalOpt).api();
		},

		reloadData: function($table) {
			this.getTable($table).ajax.reload();
			$table.find('thead :checkbox').prop('checked',false).trigger('change');//解决全选check不能恢复默认状态
		},
		
		getTable: function($table) {
			return $table.dataTable().api();
		},
		
		getRowData: function($table,$elem) {
			return this.getTable($table).row($elem.parents('tr')).data();
		},
		
		addRow: function($table,data){
			$table.DataTable().rows.add(data).draw();
		},
		
		deleteRow: function($table,$elem) {
			this.getTable($table).row($elem.parents('tr')).remove().draw();
		},

		getSelectData: function($table) {
			var results = [];
			var _this = this;
			$table.find("tbody :checkbox[lay-skin='primary']:checked").each(function() {
				var data = _this.getRowData($table,$(this));
				results.push(data);
			});
			return results;
		},
		
		getTableDatas: function($table) {
			var result = [];
			var datas = $table.DataTable().data()
			$.each(datas,function(index,item){
			 	result.push(item);
			 })
			 return result;
		},
		
		getSelectIds: function($table) {
			var results = this.getSelectData($table);
			var ids = [];
			$.each(results, function(index,item) {
				ids.push(item.id);
			});
			return ids;
		},

		deleteSelectData: function($table,url) {
			// ids不能为空
			if(ids == null || ids == '') {
				layer.msg('请选择要删除的数据', {
					time: 2000
				});
				return false;
			} else {
				layer.confirm('确认删除选中数据?', {
					title: '删除',
					btn: ['确认', '取消'] // 可以无限个按钮
				}, function(index, layero) {
					// 确认
					$.post(url, {
						ids: ids
					}, function(res) {
						// 大于0表示删除成功
						if(res.status > 0) {
							// 提示信息并跳转
							layer.msg(res.msg, {
								time: 2000
							}, function() {
								location.href = sUrl;
							})
						} else {
							// 提示信息并跳转
							layer.msg(res.msg, {
								time: 2000
							}, function() {
								location.href = eUrl;
							})
						}
					});
				}, function(index) {
					// 关闭
					layer.close(index);
				});
			}
		},
		// 批量删除 返回需要的 ids
		getIds: function(o, str) {
			var obj = o.find('tbody tr td:first-child input[type="checkbox"]:checked');
			var list = '';
			obj.each(function(index, elem) {
				list += $(elem).attr(str) + ',';
			});
			// 去除最后一位逗号
			list = list.substr(0, (list.length - 1));
			return list;
		},
		bindEvent: function() {
			// 表格选中
			$('.layui-table').on('click', 'tbody tr input[type="checkbox"]', function() {
				var obj = $(this).parent().parent();
				if(this.checked) {
					obj.addClass('selected');
				} else {
					obj.removeClass('selected');
				}
			});

			// 全选和反选
			$('.layui-table').on('click', '.all', function() {
				var obj = $(".layui-table tbody input[type='checkbox']:checkbox");
				var allTr = $(".layui-table tbody tr");
				if(this.checked) {
					obj.prop("checked", true);
					allTr.addClass('selected');
				} else {
					obj.prop("checked", false);
					allTr.removeClass('selected');
				}
			});
			
			//全选反选
			f.on('checkbox(all)', function(data){
				$('tbody :checkbox[lay-skin="primary"]').each(function(){
					$(this).prop('checked',data.elem.checked);
					f.render('checkbox');
				});
			});   
			
			//表格重绘后渲染checkbox
			$('table').on('draw.dt', function() {
				f.render('checkbox');
				$(this).width('100%');
			});
		}

	};
	util.bindEvent();
	exports('table-util', util);

});