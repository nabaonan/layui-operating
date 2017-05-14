
/**
 * 控制页面跳转
 * @author nabaonan
 */

layui.define(function(exports) {

	exports('redirect', function(targetPage) {

		var location = window.location;
		var protocol = location.protocol;
		var host = location.host;
		var pathName = location.pathname;

		var webName = pathName.split("/")[1];
		location.href = 'http://' + host + '/' + webName + '/' + targetPage;

	});
});