
//这里配置自定义依赖模块
//layui.extend({
//	baseUrl:'api/baseUrl',//这里配置命名最好按照驼峰命名规范,
//});

var requireModules = ['base-url','form-util'];

window.top.registeModule(window,requireModules);

//这里引用依赖模块
layui.define(requireModules, function(exports) {

//	console.log("1222222",layui.baseUrl);
	var baseUrl = layui.baseUrl;
	var $ = layui.jquery;

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
					url: '/operating-authority/frame/datatables/language/chs.json'
				}
			};

			var totalConfig = $.extend(true, config, option);
			return $table.dataTable(totalConfig).api();
		},

		reloadData: function($table) {
			this.getTable($table).ajax.reload();
		},
		
		getTable: function($table) {
			return $table.dataTable().api();
		},
		
		getRowData: function($table,$elem) {
			return this.getTable($table).row($elem.parents('tr')).data();
		},

		getSelectData: function($table) {
			var results = [];
			var _this = this;
			$table.find("tbody input[type='checkbox']:checked").each(function() {
				var data = _this.getRowData($table);
				results.push(data);
			});
			return results;
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
		
		// 转换时间戳为日期时间(时间戳,显示年月日时分,加8小时显示正常时间区)
		UnixToDate: function(unixTime, isFull, timeZone) {
			if(unixTime == '' || unixTime == null) {
				return '';
			}
			if(typeof(timeZone) == 'number') {
				unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
			}
			var time = new Date(unixTime * 1000);
			var ymdhis = "";
			var year, month, date, hours, minutes, seconds;
			if(time.getUTCFullYear() < 10) {
				year = '0' + time.getUTCFullYear();
			} else {
				year = time.getUTCFullYear();
			}
			if((time.getUTCMonth() + 1) < 10) {
				month = '0' + (time.getUTCMonth() + 1);
			} else {
				month = (time.getUTCMonth() + 1);
			}
			if(time.getUTCDate() < 10) {
				date = '0' + time.getUTCDate();
			} else {
				date = time.getUTCDate();
			}
			ymdhis += year + "-";
			ymdhis += month + "-";
			ymdhis += date;
			if(isFull === true) {
				if(time.getUTCHours() < 10) {
					hours = '0' + time.getUTCHours();
				} else {
					hours = time.getUTCHours();
				}
				if(time.getUTCMinutes() < 10) {
					minutes = '0' + time.getUTCMinutes();
				} else {
					minutes = time.getUTCMinutes();
				}
				if(time.getUTCSeconds() < 10) {
					seconds = '0' + time.getUTCSeconds();
				} else {
					seconds = time.getUTCSeconds();
				}
				ymdhis += " " + hours + ":";
				ymdhis += minutes;
				// ymdhis += seconds;
			}
			return ymdhis;
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
			console.log('绑定tableutil时间');
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
			$('.layui-table').on('click', 'thead tr input[type="checkbox"]', function() {
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
		}

	};
	util.bindEvent();
	exports('table-util', util);

});