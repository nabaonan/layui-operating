/**
 * 这个使用来请求后台数据封装的ajax工具
 * @author nabaonan
 */

var webName = window.top.getWebName();

var requireModules = [
	'toast'
];

layui.config({
	base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
}).define(requireModules,function(exports) {
	//这里专门用来请求的
	var toast = layui.toast;
	var $ = layui.jquery;
	
	var request = {

		authorityInterceptor: function(result) {
			//这里可以配置其他权限需要执行什么
			var strategy = {
				"1": function(result) { //没有登录
					toast.error(result.msg);
					return request.backToLogin(result);
				},
				"2": function(result) { //没有权限
					toast.error(result.msg);
					return request.backToLogin(result);
				}
			}
			if(!result.status && result.code) {
				return strategy[result.code] ? strategy[result.code](result) : true;
			}
			return true; //  如果status为true或者没有返回错误码则走这里
		},
		
		/**
		 * 获取特定的get请求参数信息
		 * @param {Object} name
		 */
		getFixUrlParams: function(name) {
		    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		    var search = decodeURI(window.location.search);
		    var r = search.substr(1).match(reg);
		    if (r != null) {
		    	return unescape(r[2]);
		    }
		    return null;
		},
		
		/**
		 *获取所有的get请求参数信息
		 */
		getAllUrlParam: function() {   
		   var url = decodeURI(location.search); //获取url中"?"符后的字串   
		   var theRequest = new Object();   
		   if (url.indexOf("?") != -1) {   
		      var str = url.substr(1);   
		      strs = str.split("&");   
		      for(var i = 0; i < strs.length; i ++) {   
		         theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);   
		      }   
		   }   
		   return theRequest;   
		},
		
		composeUrl: function(url,data,notEncodeUri,isTransArr) {
			
			if(!$.isEmptyObject(data)){
				var str = '&';//如果是有参数的则追加参数
				if(url.indexOf('?') == -1){
					str = '?';
				}
				
				$.each(data,function(prop,value){
					
					
					if(isTransArr && value instanceof Array){
						$.each(value, function(i,v) {
							v = (v == null?'':v);
							str+=(prop+'[]='+v+'&');
						});
					}else{
						value = (value == null?'':value);
						str+=prop+'='+value+'&';
					}
				});
				str = str.substring(0,str.length-1);
				if(notEncodeUri){
					return  url+str;
				}else{
					return encodeURI(url + str);
				}
			}else{
				return url;
			}
		},
		
		
		request: function(urlObj, data, successCallback, isAsync, errorCallback, linkErrorCallback,otherOpts) {
			var returnData;
			var asy = true;
			if(isAsync != undefined || isAsync != null) {
				asy = isAsync;
			}
			var opts = {
				type: urlObj.type,
				url: urlObj.url,
				async: asy,
				contentType:'application/x-www-form-urlencoded',
				data: data || {},
				dataType: "json",
				success: function(result) {
					if(!request.authorityInterceptor(result)) {
						return;
					}

					if(request.isSuccess(result)) {
						returnData = successCallback(result);
					} else {
						toast.error(result.msg);
						if(errorCallback) {
							errorCallback(result);
						}
					}
				},
				error: function() {
					toast.error("系统连接错误，请联系管理员");
					
					if(linkErrorCallback) {
						linkErrorCallback();
					}

				}
			};
			var totalOpt = $.extend({}, opts, otherOpts);
			
			$.ajax(totalOpt);
			//			$.log("请求参数是", result, opts.async);
			return returnData; //如果设置同步请求可以返回，需要用就用，不需要就不用
		},

		isSuccess: function(result) {
			return result.status == true;
		}

	};

	exports("request", request);

});