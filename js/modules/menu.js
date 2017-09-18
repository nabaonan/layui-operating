var requireModules = [
	'authority',
	'toast'
];
registeModule(window, requireModules);

/*layui.use(['jquery','authority'], function() {*/
layui.use(requireModules, function(
	authority,
	toast
) {

	var win = top.window;

	var $ = layui.jquery;

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
			activeMenu: function(menuName) {
				var id = "";
				authority.getNavs().success(function(result){
					$.each(result.data, function(index,item) {
						$.each(item.children, function(i,child) {
							if(child.menuName == menuName){
								id = child.id;
							}
						});
					});
					if(id){
						$("a[data-id='"+id+"']",window.top.document)[0].click();					
					}else{
						toast.warn('没有找到所查找的栏目！');
					}
				});
			}
		});

	});
});