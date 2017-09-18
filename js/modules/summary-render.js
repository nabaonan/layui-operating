/**
 * 合同费用总结渲染
 * @author nabaonan
 */


var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'laytpl'
];

registeModule(window, requireModules);

layui.define('laytpl', function(exports) {
    var laytpl = layui.laytpl;
    var summaryRender = {

        initPayment: {
            labelName: '首批进货款',
            totalLabelName: '本期应交总计',
            finishedLabelName: '本期已交总计',
            leftLabelName: '本期剩余未交总计',
            total: 0,
            finished: 0,
            left: 0
        },

        joininPayment: {
            labelName: '加盟费',
            totalLabelName: '本期应交总计',
            finishedLabelName: '本期已交总计',
            leftLabelName: '本期剩余未交总计',
            total: 0,
            finished: 0,
            left: 0
        },

        quota: {
            labelName: '额度',
            totalLabelName: '本期总计',
            finishedLabelName: '本期消耗总计',
            leftLabelName: '本期剩余可用总计',
            total: 0,
            finished: 0,
            left: 0
        },

        splitPayment: {
            labelName: '分成款',
            totalLabelName: '本期应交总计',
            finishedLabelName: '本期已交总计',
            leftLabelName: '本期剩余未交总计',
            total: 0,
            finished: 0,
            left: 0

        },

        depositPayment: {
            labelName: '保证金',
            totalLabelName: '本期应交总计',
            finishedLabelName: '本期已交总计',
            leftLabelName: '本期剩余未交总计',
            total: 0,
            finished: 0,
            left: 0
        },

        incomePayment: {
            labelName: '发生额（进账）',
            totalLabelName: '本期总计',
            total: 0
        },

        outcomePayment: {
            labelName: '服务费（出账）',
            totalLabelName: '本期总计',
            total: 0
        },


        prePayment: {
            labelName: '预交款',
            totalLabelName: '本期总计',
            total: 0
        },

        otherPayment: {
            labelName: '其他款',
            totalLabelName: '本期总计',
            total: 0
        },

        platformPayment: {
            labelName: '平台费',
            totalLabelName: '本期总计',
            total: 0
        },

        hardwarePayment: {
            labelName: '硬件费',
            totalLabelName: '本期总计',
            total: 0
        },

        buyoutPayment: {
            labelName: '买断费用',
            totalLabelName: '本期总计',
            total: 0
        },

        renderTpl: function(result) {
            var tmpl = summaryTemplate.innerHTML;
            laytpl(tmpl).render(result, function(html) {
                //渲染合同总结
                summaryContainer.innerHTML = html;
            });
        },

        init: function(data) {
            var result = [];
            var order = [
                'initPayment',
                'joininPayment',
                'quota',
                'splitPayment',
                'depositPayment',
                'incomePayment',
                'outcomePayment',
                'prePayment',
                'otherPayment',
                'platformPayment',
                'hardwarePayment',
                'buyoutPayment'
            ];

            $.each(order,function(index, prop) {
                if(data[prop] && summaryRender[prop]){
                    $.each(data[prop], function(key, value) {
                        summaryRender[prop][key] = value;
                    });
                    result.push(summaryRender[prop]);
                }
            });
            summaryRender.renderTpl(result);
        }
    };

    exports('summary-render', {
        init: summaryRender.init
    });
});
