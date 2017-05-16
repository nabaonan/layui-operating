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

	if(!$.isEmptyObject(param)) {

		formUtil.renderData($('#auth-form'), param);
	}

	var f = new form();
	
	var fatherId;//选择的fatherid，如果选择了权限树，则要赋值，如果没选择不赋值

	f.verify({
		style: function() {
			if($(':radio:checked').val() == '0' && $('input[name="btnStyle"]').val() == '') {
				return '请填写按钮样式';
			}
		}
	});

	//监听提交
	f.on('submit(authority-form)', function(data) {
		data.field.fid = fatherId;
		console.log('!!!!!!!!!', data.field,data.field.fid);
		
		ajax.request(roleApi.getUrl('updateAuthority'), data.field, function() {
			var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
			parent.layer.close(index); //再执行关闭   
			parent.authorityList.refreshTable();
			toast.success('权限更新成功');
		});

	});

	f.on('radio(btn-type)', function(data) {
		var $div = $('#btn-class-style');
		if(data.value == '0') {
			$div.show();
		} else {
			$div.hide();
		}
	});

	$('#choose-father').click(function() {

		layer.open({
			type: 2,
			title: "选择父权限",
			content: webName + '/views/role&authority/authority-tree.html',
			btn: ['确定了', '取消了'],
			yes: function(index, layero) {
				var iframeWin = window[layero.find('iframe')[0]['name']];
				var datas = iframeWin.tree.getSelectData();
				if(datas[0]){
					$('#input-father').val(datas[0].title);
					fatherId = datas[0].id;
				}
				layer.close(index);
			}

		});
	});

});