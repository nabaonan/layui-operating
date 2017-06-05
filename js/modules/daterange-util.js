/**
 * 控制页面跳转
 * @author nabaonan
 */

layui.define('laydate', function(exports) {

	var laydate = layui.laydate;
	var $ = layui.jquery;
	exports('daterange-util', {
		init: function(startSelector, endSelector, startOpt, endOpt) {
			
			var startElem,endElem;
			if(startSelector instanceof $){
				startElem = startSelector[0];
				console.log(startElem);
			}else{
				
				startElem = $(startSelector)[0];
			}
			
			if(endSelector instanceof $){
				endElem = endSelector[0];
			}else{
				endElem = $(endSelector)[0];
			}
			
			var start = {
				elem: startElem,
				format:'YYYY-MM-DD hh:mm:ss',
				istime:true,
//				min: laydate.now(),
				max: '2099-06-16 23:59:59',
				istoday: false,
				choose: function(datas) {
					end.min = datas; //开始日选好后，重置结束日的最小日期
					end.start = datas //将结束日的初始值设定为开始日
				}
			};

			var end = {
				elem: endElem,
				format:'YYYY-MM-DD hh:mm:ss',
				istime:true,
//				min: laydate.now(),
				max: '2099-06-16 23:59:59',
				istoday: false,
				choose: function(datas) {
					start.max = datas; //结束日选好后，重置开始日的最大日期
				}
			};

			$(startSelector).click(function() {
				laydate($.extend(true, start, startOpt));
			});

			$(endSelector).click(function() {
				laydate($.extend(true, end, endOpt));
			});
		}
	});
});