var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'form',
	'form-util',
	'layer',
	'request',
	'role&authority-api',
	'toast',
	'valid-login'
];

//这里注册没有初始化注册过的 模块路径，如果是modules下有子集 的模块需要在这里注册
registeModule(window, requireModules);

layui.use(requireModules, function(
	form,
	formUtil,
	layer,
	ajax,
	roleApi,
	toast) {
	var $ = layui.jquery;
	var param = ajax.getAllUrlParam();
	var chooseFather = {
		id:0,//默认值是0，如果没有选择父亲
		levels:0//对于新增没有父权限，level是1，最高级，由于提交时候会自增1所以这里就是设置0
	};//选择的father，如果选择了权限树，则要赋值，如果没选择不赋值
	
	if(!$.isEmptyObject(param)) {
		param.type = param.type.split(',');
		chooseFather.id = param.parentId;
		var levels = parseInt(param.levels);
		chooseFather.levels = --levels;//因为下面需要自增，如果想保持原来的不变，这里需要自减一下
		formUtil.renderData($('#auth-form'), param);
	}

	var f = new form();

	f.verify({
		style: function() {
			if($(':radio:checked').val() == '1' && $('*[name="btnKey"]').val() == '') {
				return '请填写按钮样式';
			}
		}
	});

	//监听提交
	f.on('submit(authority-form)', function(data) {
		
		if(chooseFather){
			data.field.parentId = chooseFather.id;
			var levels = parseInt(chooseFather.levels);
			data.field.authValue = param.authValue;
			data.field.levels = ++levels;//如果选择了父节点则级别加一，没选择的话，保持不变
		}
		
		if(data.field.type == 0){//如果是菜单不穿btnKey
			data.field.btnKey = '';
		}
		
		ajax.request(roleApi.getUrl('updateAuthority'), data.field, function() {
			var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
			parent.layer.close(index); //再执行关闭   
			parent.authorityList.refreshTable();
			toast.success('权限更新成功');
		});
		return false;

	});

	f.on('radio(btn-type)', function(data) {
		var $div = $('#btn-class-style');
		if(data.value == '1') {
			$div.show();
		} else {
			$div.hide();
		}
	});
	
	$('#node-type :radio:checked').each(function(){
		$(this).next('.layui-form-radio').trigger('click');
		$(this).next('.layui-form-radio').trigger('click');
	});

	$('#choose-father').click(function() {
		ajax.composeUrl()
		layer.open({
			type: 2,
			anim: 3,
			title: "选择父权限",
			area:['50%','80%'],
			content: webName + '/views/role&authority/authority-tree.html',
			btn: ['确定了', '取消了'],
			yes: function(index, layero) {
				var iframeWin = window[layero.find('iframe')[0]['name']];
				var datas = iframeWin.tree.getCheckedData();
				if(datas[0]){
					$('#input-father').val(datas[0].menuName);
					chooseFather = datas[0];
				}
				layer.close(index);
			}

		});
	});


});