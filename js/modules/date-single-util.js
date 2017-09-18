/**
 * 单个日期控件渲染
 * @author wangyue
 */

layui.define('laydate', function(exports) {

	var laydate = layui.laydate;
	var $ = layui.jquery;
	exports('date-single-util', {
		init: function(startSelector, startOpt) {
			
			var startElem,endElem;
			if(startSelector instanceof $){
				startElem = startSelector[0];
			}else{
				
				startElem = $(startSelector)[0];
			}
			
			var start = {
				elem: startElem,
				format:'YYYY-MM-DD',
				istime:false,
				istoday: true
			};

			$(startSelector).click(function() {
				laydate($.extend(true, start, startOpt));
			});

		}
	});
});