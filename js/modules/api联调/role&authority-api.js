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
		namespace:'../../',
		'getAllAutorityList': {//加载权限列表树    ----权限列表
			url: 'authority/list'
		},
		'getAuthorityTree':{//这里可以和上边配成同一个接口，但是感觉配成同一个不好，因为这里是纯tree，上面那个有其他字段，最好分开   ---配置权限的树型结构
			url: 'authority/getAuthorityTree'
		},
		'deleteAuthority':{	//删除权限
			url: '../true.json'
		},
		'getDeptTree': {//获取部门的树形结构
			url: 'dept-tree.json'
		},
		'getRoleList': {//角色列表
			url: 'group/list'
		},
		'getRolesSelect': {//获取角色下拉框
			url: 'group/selectList'
		},
		'updateAuthority':{//更新权限
			url:'authority/saveAuthority',
			type:'post'
		},
		'updateRole':{//更新橘色
			url:'group/saveGroup',
			type:'post'
		},
		'updateSysUser':{//更新系统用户
			url:'user/saveorUpdate'
		},
		'getUserNavs': {//获取用户左侧导航   ---左侧导航
			url:'authority/leftMenuList'
		},
		'getNavBtns':{//点击导航获取右侧的按钮  
			url:'authority/getBtns'
		},
		'getAllUsers': {//获取系统用户    --------系统用户列表
			url: 'user/list'
		},
		'enableUser':{//启用系统用户
			url:'user/openUser'
		},
		'resetPwd':{//重置密码
			url:'user/resetPssword'
		}
	}
	
	var result = $.extend({},baseApi, url);

	exports('role&authority-api', result);

});