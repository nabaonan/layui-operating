/**
 * 角色权限api
 * @author nabaonan
 */
var requireModules =[
	'base-url'
];

window.top.registeModule(window,requireModules);

layui.define('base-url', function(exports) {
	var $ = layui.jquery;
	var baseApi = layui['base-url'];
	var url = {
		namespace:'role&authority/',
		'getUserNavs': {//获取用户左侧导航
			url:'user-navs.json'
		},
		'getNavBtns':{//点击导航获取右侧的按钮
			url:'nav-btns.json'
		},
		'getAllUsers': {//获取系统用户
			url: 'sys-user-list.json'
		},
		'getAllAutorityList': {//加载权限列表树
			url: 'authority-tree-list.json'
		},
		'getAuthorityTree':{//这里可以和上边配成同一个接口，但是感觉配成同一个不好，因为这里是纯tree，上面那个有其他字段，最好分开
			url: 'authority-tree-list.json'
		},
		'deleteAuthority':{
			url: '../true.json'
		},
		'getDeptTree': {
			url: 'dept-tree.json'
		},
		'getRoleList': {
			url: 'role-list.json'
		},
		'getRolesSelect': {
			url: 'roles-select.json'
		},
		'addSysUser':{
			url:'../true.json'
		},
		'updateAuthority':{//更新权限
			url:'../true.json'
		},
		'updateRole':{//更新权限
			url:'../true.json'
		},
		'enableUser':{
			url:'../false.json'
		},
		'resetPwd':{
			url:'../true.json'
		}
	}
	
	var result = $.extend({},baseApi, url);

	exports('role&authority-api', result);

});