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
	
	exports('form-util', {
		renderSelects: function(targetSelector, templates) {
			$(targetSelector).html("");
			var options = "<option value=''>请选择</option>";
			$.each(templates, function(index, item) { //这个是后台开发加上的
				options += "<option value='" + item.key + "'>" + item.value + "</option>";
			});
			$(targetSelector).append(options);
		},
		
		/**
		 * 渲染checkbox
		 * @param {Object} targetDomId
		 * @param {Object} datas
		 * @param {Object} targetName 表单提交的name属性名
		 */
		renderCheckboxes: function(targetDomId, datas, targetName) {
			$("#" + targetDomId).html("");
			var checkboxes = '';
			$.each(datas, function(index, item) {
				checkboxes += '<input type="checkbox" name="' + targetName + '" value="' + item.value + '" title="'+item.name+'"/>';
			});
			$("#" + targetDomId).append(checkboxes);
		},
		
		renderRadios: function(targetSelector, templates) {

			$("#" + targetDomId).html("");
			var radios = '';
			$.each(datas, function(index, item) {
				radios += '<input type="radio" name="' + targetName + '" value="' + item.value + '" title="'+item.name+'"/>';
			});
			$("#" + targetDomId).append(radios);
		},
		
		/**
		 * 渲染数据  radio和checkbox都要传数组，即使有一个元素也要放到一个数组中
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
		
		composeData: function($form) {
			
			var serialObj = {};

			$($form.serializeArray()).each(function() {
				serialObj[this.name] = this.value
			});
			return serialObj;
		},
		
		composeCheckboxesValue: function($form) {
			var result = {};
			
			$form.find(":checkbox:checked").each(function(index, item) {
				if(!result[item.name].push) {
					result[item.name] = [];
				}
				result[item.name].push(item.value);
			});
			return result;
		}

	});

});