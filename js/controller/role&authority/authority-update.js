var webName = getWebName();

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
	'form',
	'form-util',
	'layer',
	'request',
	'valid-login'
];

layui.use(requireModules, function(form, formUtil, layer, ajax) {
	var $ = layui.jquery;
	var param = ajax.getAllUrlParam();

	if(!$.isEmptyObject(param)) {
		
		formUtil.renderData($('#auth-form'), param);
	}

	var f = new form();

	f.verify({
		style: function() {
			if($(':radio:checked').val() == '0' && $('input[name="btnStyle"]').val() == '') {
				return '请填写按钮样式';
			}
		}
	});

	//监听提交
	f.on('submit(authority-form)', function(data) {
		var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
		parent.layer.close(index); //再执行关闭   
		parent.authorityList.refreshTable();
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
				var chooseName = datas[0] ? datas[0].title : '';
				$('#input-father').val(chooseName);
				layer.close(index);
			}

		});
	});

});