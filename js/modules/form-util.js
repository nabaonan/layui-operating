/**
 * 为了避免和原生模块form歧义所以这里命名form-util
 * 这里写有关form的渲染操作，比如渲染下拉框
 * @author nabaonan
 *	
 * 渲染下拉列表
 * @param {Object} targetSelector
 * @param {Object} templates
 */



layui.define('form',function(exports) {
	var $ = layui.jquery;
	var form = layui.form;
	
	
	var formUtil = {
		
		init: function() {
			this.bindEvent();
		},
		
		/**
		 * 动态渲染下拉框
		 * @param {Object} targetSelector
		 * @param {Object} templates
		 */
		renderSelects: function(targetSelector, templates,isDisable) {
			$(targetSelector).html("");
			
			if(isDisable){
				$(targetSelector).attr('disabled',true);
			}
			var options = "<option value='-1'>全部</option>";
			$.each(templates, function(index, item) { //这个是后台开发加上的
				options += "<option value='" + item.key + "'>" + item.value + "</option>";
			});
			$(targetSelector).append(options);
		},
		
		/**
		 * 渲染checkbox
		 * @param {Object} targetSelector
		 * @param {Object} datas
		 * @param {Object} targetName 表单提交的name属性名
		 */
		renderCheckboxes: function(targetSelector, datas, targetName,layFilter,isDisable) {
			$(targetSelector).html("");
			var checkboxes = '';
			var filter = layFilter?'lay-filter="'+layFilter+'"':'';
			var disable = isDisable?'disabled':'';
			
			$.each(datas, function(index, item) {
				checkboxes += '<input type="checkbox" '+disable+' '+filter+' name="' + targetName + '" value="' + item.key + '" title="'+item.value+'"/>';
			});
			$(targetSelector).append(checkboxes);
		},
		
		/**
		 * 动态渲染radio
		 * @param {Object} targetSelector
		 * @param {Object} templates
		 * @param {Object} targetName
		 */
		renderRadios: function(targetSelector, datas,targetName) {

			$(targetSelector).html("");
			var radios = '';
			$.each(datas, function(index, item) {
				radios += '<input type="radio" name="' + targetName + '" value="' + item.key + '" title="'+item.value+'"/>';
			});
			$(targetSelector).append(radios);
		},
		
		/**
		 * 回显数据  radio和checkbox都要传数组，即使有一个元素也要放到一个数组中
		 * @param {Object} $form
		 * @param {Object} data
		 */
		renderData: function($form,data) {

			for(var i in data) { //这里的所属角色是个js对象，特殊对待
				var $ele = $form.find("*[name='" + i + "']");
				$ele.val(data[i]);
				new form().render();//赋值重新渲染
				
			}
		},
		
		/**
		 * 组织数据
		 * @param {Object} $form
		 */
		composeData: function($form) {
			
			var serialObj = {};

			$($form.serializeArray()).each(function() {
				
				if(serialObj[this.name]){
				
					if(!(serialObj[this.name] instanceof Array)){
						var arr = [];
						arr.push(serialObj[this.name]);//放入原来的值
						serialObj[this.name] = arr;
					}
					serialObj[this.name].push(this.value);//放入新值
				}else{
					serialObj[this.name] = this.value
				}
			});
			return serialObj;
		},
		
		
		
		/**
		 * 组织checkbox的内容，返回一个对象，多选的内容放到属性对应的数组里面
		 * @param {Object} $form
		 */
		composeCheckboxesValue: function($form) {
			var result = {};
			
			$form.find(":checkbox:checked").each(function(index, item) {
				if(!result[item.name]) {
					result[item.name] = [];
				}
				result[item.name].push(item.value);
			});
			return result;
		},
		
		
		/**
		 * 转换id数组为对象数组
		 * @param {Object} strArr  string数组
		 * @param {Object} fixColumn 指定id属性名
		 */
		transStrToObj: function(strArr,fixColumn) {
			var results = []
			$.each(strArr,function(index,value) {
				var obj = {};
				obj[fixColumn] = value;
				results.push(obj);
			});
			return results;
		},
		
		bindEvent: function() {
			$('#cancel').click(function(){
				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.layer.close(index);
			});
		}
		
	

	};
	
	formUtil.init();
	
	exports('form-util', formUtil);

});