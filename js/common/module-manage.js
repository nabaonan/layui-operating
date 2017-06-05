/**
 * 模块依赖管理
 * @author nabaonan
 */
function getpath() {

	var pathName = window.location.pathname.substring(1);
	var webName = pathName == '' ? '' : pathName.substring(0, pathName.indexOf('/'));
	if(webName == "") {
		return window.location.protocol + '//' + window.location.host;
	} else {
		return window.location.protocol + '//' + window.location.host + '/' + webName;
	}

}

function getWebName() {
	var pathName = window.location.pathname.substring(1);
	var webName = pathName == '' ? '' : pathName.substring(0, pathName.indexOf('/'));
	return "/"+webName;
	
}

function toLowerCase(str){
	return str.replace(/([A-Z])/g,"-$1").toLowerCase();
}

function toCamel(str){
    var re=/-(\w)/g;
    return str.replace(re,function ($0,$1){
        return $1.toUpperCase();
    });
}

/**
 * 管理扩展模块
 * @param {Object} window  当前iframe的window对象
 * @param {Object} modulesYouWanted  需要依赖的module名字
 * @param {Object} otherModules  需要扩展的modules对象，包括名字和路径，路径以modules包作为根路径
 */
function registeModule(window,modulesYouWanted,otherModules) {
	var layui = window.layui;
	window.apiConfig = window.apiConfig || {}
	
	var apiConfig = window.apiConfig;
	layui.use('jquery',function(){
		var $ = layui.jquery;
		
		//预定好的扩展的自定义modules
		var myModules = {//只有模块下中的子目录模块需要在这里配置
			 //可以在这里定义依赖的js，路径	都是相对于base的,这里不能用相对路径写，感觉这个应该有待改进
			'base-url':'api/base-url',
			'commodity-api':'api/commodity-api',
			'login-api':'api/login-api',
			'role&authority-api':'api/role&authority-api',
			'user-api':'api/user-api',
			'product-api':'api/product-api',
			'file-api':'api/file-api'
		}
		
		//刨除系统自带modules
		var exceptModules = {
		  layer: 'modules/layer' //弹层
		  ,laydate: 'modules/laydate' //日期
		  ,laypage: 'modules/laypage' //分页
		  ,laytpl: 'modules/laytpl' //模板引擎
		  ,layim: 'modules/layim' //web通讯
		  ,layedit: 'modules/layedit' //富文本编辑器
		  ,form: 'modules/form' //表单集
		  ,upload: 'modules/upload' //上传
		  ,tree: 'modules/tree' //树结构
		  ,table: 'modules/table' //富表格
		  ,element: 'modules/element' //常用元素操作
		  ,util: 'modules/util' //工具块
		  ,flow: 'modules/flow' //流加载
		  ,carousel: 'modules/carousel' //轮播
		  ,code: 'modules/code' //代码修饰器
		  ,jquery: 'modules/jquery' //DOM库（第三方）
		  ,mobile: 'modules/mobile' //移动大模块 | 若当前为开发目录，则为移动模块入口，否则为移动模块集合
		  ,'layui.all': 'dest/layui.all' //PC模块合并版
		};
		
		
		var totalModules;
		if(otherModules){
			 totalModules = $.extend(true,myModules, otherModules);
		}else{
			totalModules = myModules;
		}

		var extendModules = {};
		
		$.each(modulesYouWanted,function(key,moduleKey){
			
			if(!exceptModules[moduleKey] && totalModules[moduleKey] && !apiConfig[moduleKey] ){
				extendModules[moduleKey] = totalModules[moduleKey];
				apiConfig[moduleKey] = totalModules[moduleKey];//全局变量注册
				
			}
		});
		
		if(!$.isEmptyObject(extendModules)){
			layui.extend(extendModules);
		}
		
	});
}