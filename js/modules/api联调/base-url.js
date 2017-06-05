
/**
 * 基类配置api，其他的api全继承于此
 * @author nabaonan
 */
layui.define(function(exports) {
	var AjaxUrlConfig = {

		baseUrl:window.top.getWebName()+ "/json/", //根目录
		"datatables/language": {
			url:window.top.getWebName() + "/frame/datatables/language/chs.json"//这个url是相对baseUrl的
		},
		//下拉框和radio，checkbox接口
		"getKeyValue": {
			url: "code/list"
		},
		getUrl: function(urlKey) {
			var url, type;
			try {
				url = this[urlKey].url;
				type = this[urlKey].type;
			} catch(e) {
				console.log("urlkey错误，请配置：", urlKey);
			}
			var namespace = this.namespace||'';
			return {
				url: (this.baseUrl + namespace + url),
				type: type || "get"
			};

		},
		getAbsoluteUrl:function(urlKey){
			return this[urlKey].url;
		}
		

	};

	exports("base-url", AjaxUrlConfig);//这个输出的key相当于是应用的时候的名字
});