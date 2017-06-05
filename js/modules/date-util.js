/**
 * 日期转换
 * @author nabaonan
 */

layui.define(function(exports) {

	exports('date-util', {

		// 转换时间戳为日期时间(时间戳,显示年月日时分,加8小时显示正常时间区)
		UnixToDate: function(unixTime, isFull, timeZone) {
			if(unixTime == '' || unixTime == null) {
				return '';
			}
			if(typeof(timeZone) == 'number') {
				unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
			}
			var time = new Date(unixTime * 1000);
			var ymdhis = "";
			var year, month, date, hours, minutes, seconds;
			if(time.getUTCFullYear() < 10) {
				year = '0' + time.getUTCFullYear();
			} else {
				year = time.getUTCFullYear();
			}
			if((time.getUTCMonth() + 1) < 10) {
				month = '0' + (time.getUTCMonth() + 1);
			} else {
				month = (time.getUTCMonth() + 1);
			}
			if(time.getUTCDate() < 10) {
				date = '0' + time.getUTCDate();
			} else {
				date = time.getUTCDate();
			}
			ymdhis += year + "-";
			ymdhis += month + "-";
			ymdhis += date;
			if(isFull === true) {
				if(time.getUTCHours() < 10) {
					hours = '0' + time.getUTCHours();
				} else {
					hours = time.getUTCHours();
				}
				if(time.getUTCMinutes() < 10) {
					minutes = '0' + time.getUTCMinutes();
				} else {
					minutes = time.getUTCMinutes();
				}
				if(time.getUTCSeconds() < 10) {
					seconds = '0' + time.getUTCSeconds();
				} else {
					seconds = time.getUTCSeconds();
				}
				ymdhis += " " + hours + ":";
				ymdhis += minutes;
				// ymdhis += seconds;
			}
			return ymdhis;
		},

		/** * 对Date的扩展，将 Date 转化为指定格式的String * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
		    可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) * eg: * (new
		    Date()).pattern("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423      
		 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04      
		 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04      
		 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04      
		 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18      
		 */
		formatStr: function(date, fmt) {
			var o = {
				"M+": date.getMonth() + 1, //月份         
				"d+": date.getDate(), //日         
				"h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时         
				"H+": date.getHours(), //小时         
				"m+": date.getMinutes(), //分         
				"s+": date.getSeconds(), //秒         
				"q+": Math.floor((date.getMonth() + 3) / 3), //季度         
				"S": date.getMilliseconds() //毫秒         
			};
			var week = {
				"0": "/u65e5",
				"1": "/u4e00",
				"2": "/u4e8c",
				"3": "/u4e09",
				"4": "/u56db",
				"5": "/u4e94",
				"6": "/u516d"
			};
			if(/(y+)/.test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
			}
			if(/(E+)/.test(fmt)) {
				fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
			}
			for(var k in o) {
				if(new RegExp("(" + k + ")").test(fmt)) {
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
				}
			}
			return fmt;
		}
	});
});