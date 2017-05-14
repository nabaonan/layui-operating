## 运营管理系统前端规范

### 分包说明

1. frame包：放所有外部引用插件，如果插件包含css和image则需要创建文件夹放到一起

2. js/controller:放所有页面的js，一个js对应一个页面，按照功能模块分包

3. js/modules:存放公用的模块，比如datatable-util

4. js/mudules/api:存放所有的功能对应的api，按照功能模分包，每个功能模块相对独立，继承base-url

5. json：存放所有的请求的api模拟文件，按照功能分包，比如json/user

6. views:存放所有页面，按照功能分包

7. css:存放所有样式，按照功能分包

8. demo：所有用于测试的页面放在这里，只要不重名就行

   ​

### 模块定义规则

1. ```javascript
   //依赖在这里定义
   var requireModules =[
   	'base-url'
   ];
   //需要在这里注册依赖
   window.top.registeModule(window,requireModules);
   //这里使用依赖，引用依赖模块名字（模块名相同）
   layui.define('base-url', function(exports) {
   	//这样使用依赖模块
   	var baseApi = layui['base-url'];
   	var url = {
         	//命名空间对应的json包下的功能文件夹
   		namespace:'role&authority/',
   		"getAllUsers": {
   			url: "sys-user-list.json"
   		}
   	}
   	
   	var result = $.extend({},baseApi, url);
   	//这里输出模块，模块名与文件名相同
   	exports('role&authority-api', result);

   });
   ```

### 命名规范

命名要统一，比如views/goods对应controller/goods对应modules/api/goods

列表以-list命名，比如user-list代表用户管理

树形结构以-tree结尾，

添加和修改公用一个页面，都以-update为结尾，比如user-update代表修改用户信息

以此类推，最后跟的名字都是基本业务功能名

### 页面规范

如果页面中存在嵌套弹窗，需要使用iframe引用页面，尽量能保证不同页面可以复用统一个内嵌页面

尽量保证被复用的页面对内封闭，对外开放，对外开放一些接口，绑定到当前window对象上，外部可以调用到当前window对象并获取相应方法;

例如：

```javascript
//...省略
layui.use(requireModules, function(ajax, authorityApi, toast, treeUtil) {
//....省略
	//对外开方api，供父iframe访问
	window.tree = {
		getSelectData: function() {
			return treeUtil.getSelectData(treeId);
		}
	}
});
```

打开页面使用*layui.open*这样使用，后期会封装相应的方法，封装传参接受参数等，减少重复工作，iframe传参暂定使用get方式



## 尽量使用模块开发，保证复用	￥^V^￥