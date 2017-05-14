/**
 * 树形表格组件，依赖于treetable插件
 * @author nabaonan
 */
layui.define(function(exports) {

	var treeTableUtil = {
		init: function($table,options) {
			var opt = {
				/*ajax: {
					url: '',
					data: function() {
						//获取参数	
					}
				},*/
				expandable: true,
				column: 0,
				events:{
					click:function(data){
						console.log('这里重写方法');
					}
				}
			};
			
			var totalOption = $.extend(true,opt,options);
			
			var _this = this;
			
			totalOption.data = _this.sortData(totalOption.data,totalOption.alias);
			_this.renderTable($table,totalOption);
			
			//绑定事件
			$(function() {
				_this.bindEvent($table,totalOption.events);
			});
		},
		
		sortData: function(data,alias) {
			var array = data.concat();
		
			var Length = data.length;
			
			function findChild(pointer){
			    var tempArr = array.concat();
			    var id = array[pointer].id;
			    var index = pointer + 1;
			    for(var i = pointer + 1; i < Length; i++){
			    	var pid = (tempArr[i].pid == undefined?tempArr[i][alias.pid]:tempArr[i].pid);
//			    	console.log(alias,pid,tempArr[i][alias.pid]);
			        if(pid == id){
			            array.splice(i,1);
			            array.splice(index,0,tempArr[i]);
			            index ++;
			            tempArr = array.concat();
			        }
			    }
			
			    pointer++;
			    if(pointer < data.length){
			        findChild(pointer);
			    }else{
			        for(var k = 0; k < Length; k++){
			        }
			    }
			}
			findChild(0);
			return array;
		},
		
		renderTable: function($table, options) {
			///请求数据
			
			$table.html('').removeClass('treetable');
			$table.removeData('treetable');
			var _this = this;
			
			var fixColumns = options.columns;
			$table.append(_this.createHead(fixColumns));
			
			if(!options.ajax) {
				//读取本地数据
				$.each(options.data, function(index, item) {
					$table.append(_this.createRow(item,fixColumns,options.alias));
				});

			} else {
				//请求后台数据
			}
			
			$table.treetable(options);
			
		},
		
		
		
		createHead: function(fixColumns) {
			var thead = '<thead><tr>'
			
			$.each(fixColumns, function(index, fixColumn) {
				thead += ('<th>' + fixColumn.name + '</th>');
			});
			thead+='</tr></thead>';
			return thead;
		},

		createRow: function(rowData, fixColumns,alias) {
			var _this = this;
			var tr = '<tr  data-tt-id="' + rowData.id + '" data-tt-parent-id="' + (rowData.pid == undefined?rowData[alias.pid]:rowData.pid) + '">';
			tr += _this.createCols(rowData,fixColumns);
			tr += '</tr>';
			
			
			return $(tr).data('rowData',rowData);
		},

		/**
		 * 生成所有列
		 * @param {Object} columnValue
		 * @param {Object} fixColumns
		 */
		createCols: function(rowData,fixColumns) {
			var _this = this;
			var cols = '';
			$.each(fixColumns, function(index, fixColumn) {
				cols += ('<td>' + _this.getFixColumnValue(rowData,fixColumn.title) + '</td>');
			});
			return cols;
		},

		/**
		 * 获取指定列的值
		 * @param {Object} rowData 行数据
		 * @param {Object} fixColumnName 指定列属性名
		 */
		getFixColumnValue: function(rowData, fixColumnName) {
			var result = '';
			$.each(rowData, function(columnName, columnValue) {
				if(fixColumnName == columnName) {
					
					result = columnValue;
					return false;
				}
			});
			
//			alert('没有找到指定'+fixColumnName+'列');
			return result;
		},
		
		

		bindEvent: function($table,events) {
			var _this = this;
			
			
			$table.on('click','tbody tr',function(){
				$table.find('tr.selected').removeClass('selected');
				$(this).addClass('selected');
				
				events.click($(this).data('rowData'));
				
//				var data =$(this).data('rowData');
//				console.log(data);
			});
		}
	};
	
	
	exports('tree-table',treeTableUtil);
	
	
});