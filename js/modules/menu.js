layui.use(['jquery'], function() {

	var win = top.window;

	var $ = layui.jQuery;

	layui.define(function(exports) {

		exports('menu', {
			renderNavs: function() {
				var navsTpl = navs.innerHTML;

				var data = {
					navs: [{
						href: 'views/user/user-list.html',
						name: '导航1'
					}, {
						href: 'views/user/user-list.html',
						name: '导航1',
						children: [{
							href: 'views/goods/not-audit-goods-list.html',
							name: '导航11'
						}, {
							href: 'views/goods/not-audit-goods-list.html',
							name: '导航12'
						}]
					}, {
						href: 'views/user/user-list.html',
						name: '导航1'
					}, {
						href: 'views/user/user-list.html',
						name: '导航1'
					}, {
						href: 'views/user/user-list.html',
						name: '导航1'
					}]
				}

				laytpl(navsTpl).render(data, function(html) {
					navview.innerHTML = html;
					element.init();
				});
			},
			activeMenu: function() {

//				console.log('这里做一些菜单选择,但是jquery选择器需要绑定到顶级window');
			}
		});

	});
});