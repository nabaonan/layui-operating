/**
 * 订单工具
 * @author nabaonan
 */

layui.define(function(exports) {

    exports('order-util', {

        /**
         * 获取当前商品是否生效失效
         * @param  {[str]}                start [description]
         * @param  {[stre]}                end   [description]
         * @return {[type]}                      [description]
         * @author nabaonan
         * @date   2017-09-15T17:33:54+080
         */
        getValidStatus: function(startStr, endStr) {
            var start = new Date(startStr);
            var end = new Date(endStr);
            var now = new Date();
            if (now.getTime() < start) {
                return '1'; //在有效期钱
            } else if (now.getTime() > start && now.getTime() < end) {
                return '2'; //在有效期间
            } else {
                return '3'; //在有效期后
            }
        },

        getLeftDays: function(startStr, endStr) {
            var start = new Date(startStr);
            var end = new Date(endStr);
            var now = new Date();
            var current;
            if (now.getTime() < start) {
                current = start; //在有效期钱
            } else if (now.getTime() > start && now.getTime() < end) {
                current = now; //在有效期间
            } else {
                current = end; //在有效期后
            }
            return Math.ceil((end.getTime() - current.getTime()) / (24 * 60 * 60 * 1000));
        }
    });
});
