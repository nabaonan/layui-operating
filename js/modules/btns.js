/**
 * 用来管理页面中的按钮（包括列表中的）
 * @author nabaonan
 */

layui.define(function(exports) {

	var baseBtnClass = 'layui-btn ';
	var btnConfig = {
		'edit': {
			className: baseBtnClass + 'layui-btn-warm edit',
			icon: '&#xe642;',
			name:'编辑'
		},
		'delete': {
			className: baseBtnClass + 'layui-btn-danger delete',
			icon: '&#xe640;',
			name:'删除'
		},
		'add': {
			className: baseBtnClass + 'add',
			icon: '&#xe654;',
			name:'添加'
		},
		'refresh': {
			className: baseBtnClass + 'layui-btn-normal refresh',
			icon: '&#x1002;',
			name:'刷新'
		},
		'row-edit': {
			className: baseBtnClass + 'layui-btn-small layui-btn-warm row-edit',
			icon: '&#xe642;',
			name:'编辑'
		},
		'row-view': {
			className: baseBtnClass + 'layui-btn-small layui-btn-warm row-view',
			icon: '&#xe615;',
			name:'查看'
		},
		'row-config': {
			className: baseBtnClass + 'layui-btn-small layui-btn-warm row-config',
			icon: '&#xe620;',
			name:'配置'
		},
		'row-reset-pwd': {
			className: baseBtnClass + 'layui-btn-small layui-btn-warm row-reset-pwd',
			icon: '&#xe620;',
			name:'重置密码'
		},
		'row-switch': {
			className: 'row-switch',
			prop: 'enable',//对应提交时候的name值
			name: '启用|禁用'//对应显示的字
		}
	};
	
	

	var btns = {
		bindEvent: function() {
		/*	$('body').on('click', '.add,edit', function() {
				console.log('点击了按钮');
				var href = 'views/user/test/test.html'
				console.log($(window.top.document).find('.layui-nav-tree a[href-url="' + href + '"]')[0]);

				$(window.top.document).find('.layui-nav-tree a[href-url="' + href + '"]').parents('dl').prev('a').trigger('click');
				$(window.top.document).find('.layui-nav-tree a[href-url="' + href + '"]').trigger('click');
				//				$('a[href-url="'+href+'"]').trigger('click');
			});*/
		},
		
		/**
		 * 根据接口返回 的字符串数组，丰富按钮对象并返回
		 * @param {Object} btnNameArr 类似于['edit','row-edit']
		 */
		getBtns: function(btnNameArr) {
			var result = [];
			$.each(btnNameArr, function(index,item) {
				var btn = btnConfig[item.btnKey];
				
				if(btn){
					result.push($.extend(true, item, btn));
				}
			});
			return result;
		},

		/**
		 * 传入总的btns对象，筛选页面按钮,不包含列表按钮
		 * @param {Object} btns
		 */
		getPageBtns: function(btnObjs) {
			return $.grep(btnObjs,function(item,index){
				return !btns.isRowBtn(item.btnKey);
			});
		},
		
		/**
		 * 筛选表格中显示的按钮
		 * @param {Object} btns
		 */
		getRowBtns: function(btnObjs) {
			return $.grep(btnObjs,function(item,index){
				return btns.isRowBtn(item.btnKey);
			});
		},
		
		/**
		 * 筛选表格普通按钮
		 * @param {Object} btns
		 */
		getIconBtns: function(btnObjs) {
			return $.grep(btnObjs,function(item,index){
				return !btns.isSwitchBtn(item.btnKey);//现在的逻辑是只有两种按钮，一个是开关一个是普通按钮，所以筛选普通按钮是非开关按钮
			});
		},
		
		/**
		 * 筛选开关按钮
		 * @param {Object} btnObjs
		 */
		getSwitchBtns: function(btnObjs) {
			return $.grep(btnObjs,function(item,index){
				return btns.isSwitchBtn(item.btnKey);
			});
		},
		
		isRowBtn: function(btnKey) {
			return /^row-/.test(btnKey);
		},
		
		isSwitchBtn: function(btnKey) {
			return btnKey.indexOf('-switch')>0;
		},

		/**
		 * 只渲染普通按钮
		 * @param {Object} btns
		 */
		renderBtns: function(btnObjs) {
			var results = '';
			$.each(btnObjs, function(index, item) {
				var btn = btns.renderBtn(item.className,item.name,item.icon);
				if(btn){
					results+=btn;
				}
			});
			return results;
		},

		/**
		 * 
		 * @param {Object} name 指定的name值
		 * @param {Object} text 开关显示名字  启用|停用
		 * @param {Boolean} isChecked 默认开还是关
		 */
		renderSwitch: function(name, text, isChecked) {
			var checkStr = '';
			if(isChecked){
				checkStr = 'checked';
			}
			return '<div class="layui-form" style="display:inline-block;margin-right:10px;">' +
				'<input type="checkbox" '+checkStr+' lay-filter="'+name+'" name="' + name + '" lay-skin="switch" lay-text="' + text + '">' +
				'</div>';
		},

		renderBtn: function(className, btnName, btnIcon,isDisable) {
			if(isDisable){
				className+=' layui-btn-disabled';
			}
			return '<button class="' + className + '" ><i class="layui-icon">'+btnIcon+'</i> '+btnName+'</button>';
		}

	}

	exports('btns', btns);

});