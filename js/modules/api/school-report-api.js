/**
 * 学校报单api
 * @type {Array}
 * @author nabaonan
 */

var requireModules = [
    'base-url'
];
window.top.registeModule(window, requireModules);

layui.define(requireModules, function(exports) {

    var $ = layui.jquery;
    var baseApi = layui['base-url'];
    var url = {
        baseUrl: 'https://www.easy-mock.com/mock/594ccc9b8ac26d795f44bd04/oc/',
        namespace: 'web/school-report/',
          "getKeyValue": {
            url: "../../code/list"
        },
        'querySchoolInfo': {
            url: 'querySchoolInfo'
        },
        'queryList': {
            url: 'queryList' //学校管理列表
        },
        'queryUsers': {
            url: 'queryUsers' //学校下的用户
        },
        'uploadStudents': {
            url: 'uploadStudents' //上传解析学生xls
        },
        'getConfirmData': {
            url: 'getConfirmData' //获取解析后的数据
        },
        'confirmImport': {
            url: 'confirmImport' //确定导入
        },
        'getClassInfo': { //学生信息
            url: 'getClassInfo'
        },
        'getTeacherInfo': { //教师信息
            url: 'getTeacherInfo'
        },
        'getTeachers': { //获取所有教师
            url: 'getTeachers'
        },
        'newOpenAccount': {
            url: 'newOpenAccount', //新开用户
            type:'post'
        },
        'getAccountList': {
            url: 'queryAccounts', //获取学生或老师的帐号列表信息
            type: 'post'
        },
        'updateSchoolOrder': { //提交学校订单
            url: 'addOrUpdateSchoolOrder',
            type: 'post'
        },
        'orderList': { //获取学校的所有订单
            url: 'orderList'
        },
        'queryOrderBranchCenterInfo': { //查询订单下分中心信息
            url: 'queryOrderBranchCenterInfo'
        },
        'getProductInfo': { //获取订单下的产品信息
            url: 'findOrderCommodity'
        },
        'deleteAccount': { //删除帐号信息
            url: 'deleteAccount'
        },
        'downloadFailRecord': { //下载验证未通过的记录
            url: 'downloadFailRecord'
        },
        'getOrderInfo': { //获取订单信息，查看时候用
            url: 'findSchoolOrder'
        },
        'productDetail': { //获取商品详情
            url: 'productDetail'
        },
        'exportList': { //导出教师或者学生
            url: 'exportList'
        },
        'getClassList': { //根据订单id查看所有课程信息
            url: 'getClassList'
        },
        'enableOrder': { //启用停用订单
            url: 'stopOrStartOrder'
        },
        'getViewClassUrl': { //查看年级地址（调用web层返回其他业务系统链接并拼接好参数）
            url: 'getViewClassUrl'
        },
        'getConfigClassUrl': { //配置年级地址（调用web层返回其他业务系统链接并拼接好参数）
            url: 'getConfigClassUrl'
        },
        'updateSchoolInfo': { //更新学校信息
            url: 'updateSchoolInfo',
            type: 'post'
        },
        'deleteOrders': { //删除学校下订单
            url: 'deleteOrders'
        },
        'getBranchCenterQuota': { //获取分中心下所有合同的额度
            url: 'queryCenterAmounts'
        },
        'enableAccount': { //停用启用帐号
            url: 'stopOrStartAccount'
        },
        'downloadStudentTemplate': { //下载导入学生的模版
            url: 'downloadStudentTemplate'
        },
        'queryCommodityDateRange': { //查询商品的有效期
            url: 'queryCommodityDateRange'
        },
        'querySchoolManagers': { //查询学校的所有管理员
            url: 'querySchoolManagers'
        },
        'getAuditList': { //获取订单的审核记录
            url: 'auditList'
        },
        'updateAccountTemp': { //更新学生和教师列表备注
            url: 'updateAccountTemp'
        },
        'commitTeacherAccount': { //提交所选的教师帐号
            url: 'commitTeacherAccount',
            type: 'post'
        },
        'auditOrder':{//审核学校订单
            url:'schoolOrderAudit'
        },
        'exportSchool':{//导出学校列表
            url:'exportSchool'
        },

        'queryProductVersions':{//查询产品版本信息（其实就是符合的商品）
            url:'queryProductVersions'
        },
        'submitAudit':{//提审订单
            url:'submitAudit'
        },
        'queryContracts':{//查询分中心下所有合同
        	url:'queryContracts'
        },
        'queryBranchCenters':{//查询所有可用的分中心
        	url:'queryBranchCenters'
        }
    };

    var result = $.extend({}, baseApi, url);

    exports('school-report-api', result);

});
