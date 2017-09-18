/**
 * 用来缓存未提交报单的所有填写的信息
 * @author nabaonan
 */

var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'request',
    'school-report-api'
];

layui.define(requireModules, function(exports) {

    var ajax = layui.request;
    var schoolReportApi = layui['school-report-api'];
    var $ = layui.jquery;

    var store = {
        currentOrderInfo: {},
        tempOrderInfo:{},//缓存的订单信息
        schoolInfo: {},
        productInfo: {},
        accountInfo: {
            // markId:'',
            // createDate:''
        },
        branchCenterInfo: {},
        orders: [],
        managers:[]
    };

    var actionType = '';// 1： 新增 2：修改   3：追加， 4：替换 5：续费
    var operate = '';
    //add添加订单，
    //change该单，
    //edit：编辑，
    //modify：修改，
    //viewAccount：查看帐号，
    //viewClass：查看班级，
    //configClass:配置班级，
    //appendOrder：追加订单

    var controller = {

        setAccountInfo: function(accountInfo) {
            store.accountInfo = accountInfo;
        },

        getAccountInfo: function() {
            return store.accountInfo;
        },

        setOperate: function(o) {
            operate = o;
        },

        getOperate: function() {
            return operate;
        },

        getActionType: function() {
            return actionType;
        },

        setActionType: function(actionType) {
            actionType = actionType;
        },

        getCurrentOrderInfo:function() {
            return store.currentOrderInfo;
        },

        setCurrentOrderInfo: function(orderInfo) {
            store.currentOrderInfo = orderInfo;
        },

        setTempOrderInfo: function(tempOrderInfo){
            store.tempOrderInfo = tempOrderInfo;
        },

        getTempOrderInfo: function() {
            return store.tempOrderInfo;
        },

        getProductInfo: function(orderId){
            if (orderId && $.isEmptyObject(store.productInfo)) {
                ajax.request(schoolReportApi.getUrl('getProductInfo'), {
                    orderId: orderId
                }, function(result) {

                    controller.setProductInfo(result.data);
                }, false);
            }
            var schoolLevels = [];
            if (store.productInfo && store.productInfo.schoolOrderLevels) {

                $.each(store.productInfo.schoolOrderLevels, function(index, item) {
                    if(typeof(item) == 'string'){
                        schoolLevels.push(item);
                    }else{
                        schoolLevels.push(item.levelId);
                    }
                });
                store.productInfo.schoolOrderLevels = schoolLevels;
            }

            return store.productInfo;
        },

        setProductInfo: function(productInfo) {


            // if (productInfo.schoolOrderLevels) {
            //     $.each(productInfo.schoolOrderLevels, function(index, item) {
            //         schoolLevels.push(item.levelId);
            //     });
            //     productInfo.schoolOrderLevels = schoolLevels;
            // }

            store.productInfo = productInfo;
        },

        /**
         * 获取学校信息
         * @param  {[type]}                schoolId [description]
         * @return {[type]}                         [description]
         * @author nabaonan
         * @date   2017-08-21T15:21:37+080
         */
        getSchoolInfo: function(schoolId) {
            if (schoolId && $.isEmptyObject(store.schoolInfo)) {
                ajax.request(schoolReportApi.getUrl('querySchoolInfo'), {
                    id: schoolId
                }, function(result) {
                    controller.setSchoolInfo(result.data);
                }, false);
            }

            var schoolLevels = [];
            if (store.schoolInfo.schoolLevels) {
                $.each(store.schoolInfo.schoolLevels, function(index, item) {
                    if(typeof(item) == 'string'){
                        schoolLevels.push(item);
                    }else{
                        schoolLevels.push(item.levelId);
                    }
                });
                store.schoolInfo.schoolLevels = schoolLevels;
            }

            if(!store.schoolInfo.zoneName){
                store.schoolInfo.provinceName = store.schoolInfo.provinceName || '';
                store.schoolInfo.cityName = store.schoolInfo.cityName||'';
                store.schoolInfo.areaName = store.schoolInfo.areaName||'';
                store.schoolInfo.zoneName = store.schoolInfo.provinceName + store.schoolInfo.cityName + store.schoolInfo.areaName;
            }
            return store.schoolInfo;
        },

        setSchoolInfo: function(schoolInfo) {
            store.schoolInfo = schoolInfo;
        },

        /**
         * 获取订单的分中心信息
         * @param  {[type]}                orderId [description]
         * @return {[type]}                               [description]
         * @author nabaonan
         * @date   2017-08-21T15:52:50+080
         */
        getBranchCenterInfo: function(orderId) {
            if (orderId && $.isEmptyObject(store.branchCenterInfo)) {
                ajax.request(schoolReportApi.getUrl('queryOrderBranchCenterInfo'), {
                    orderId: orderId
                }, function(result) {
                    controller.setBranchCenterInfo(result.data);
                }, false);
            }
            return store.branchCenterInfo;
        },

        setBranchCenterInfo: function(branchCenterInfo) {
            store.branchCenterInfo = branchCenterInfo;
        },

        /**
         * 获取学校订单
         * @param  {[type]}                schoolId [description]
         * @return {[type]}                         [description]
         * @author nabaonan
         * @date   2017-08-21T15:21:28+080
         */
        getOrders: function(schoolId) {
            if ($.isEmptyObject(store.orders)) {
                ajax.request(schoolReportApi.getUrl('orderList'), {
                    schoolId: schoolId
                }, function(result) {
                    $.each(result.data, function(index, item) {
                        item.checked = false;
                    });
                    controller.setOrders(result.data);
                }, false);
            }
            return store.orders;
        },

        setOrders: function(orders) {
            store.orders = orders;
        },

        /**
         * 获取管理员信息
         * @return {[type]}                [description]
         * @author nabaonan
         * @date   2017-09-02T17:00:40+080
         */
        getManagers: function(schoolId) {
            if ($.isEmptyObject(store.managers)) {
                ajax.request(schoolReportApi.getUrl('querySchoolManagers'), {
                    schoolId: schoolId
                }, function(result) {
                    controller.setManagers(result.data);
                }, false);
            }
            return store.managers;
        },

        setManagers: function(managers) {
            store.managers = managers;
        }

    };

    exports('school-report-store', controller);
});
