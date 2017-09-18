/**
 * 续签合同，转移项目动态渲染
 * @author nabaonan
 */


var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'form',
    'laytpl'
];

registeModule(window, requireModules);

layui.define(requireModules, function(exports) {
    var $ = layui.jquery,
        f = layui.form(),
        laytpl = layui.laytpl;

    var transRender = {
        prePaymentTotal: {
            name: 'prePaymentTotal',

            labelName: '预交款总计',
            dealTypes: [{
                key: 'zydxqyjk',
                value: '转移到下期预交款'
            }],
            getElem: function() {
                return $('#' + this.name);
            },
            value: 0,

            setValue: function(value) {
                this.getElem().val(value);
            },
            renderAmount: function() {
                var max = this.value;
                return '<input type="number" lay-verify="limit" class="layui-input compose-input" name="amount" max="' + max + '" min="0" /><b class="append">(元)</b>';
            }
        },

        depositTotal: {

            name: 'depositTotal',

            labelName: '保证金',
            dealTypes: [{
                key: 'bzjzywxqyjk',
                value: '转移到下期预交款'
            }],
            renderAmount: function() {
                var max = this.value;
                return '<input type="number"  lay-verify="limit" class="layui-input compose-input" name="amount" max="' + max + '" min="0" /><b class="append">(元)</b>';
            },
            getElem: function() {
                return $('#' + this.name);
            },
            value: 0,

            setValue: function(value) {
                this.getElem().val(value);
            }
        },

        leftQuotaTotal: {
            name: 'leftQuotaTotal',

            labelName: '剩余额度总计',
            dealTypes: [{
                key: 'zydxqed',
                value: '转移到下期额度'
            }],
            getElem: function() {
                return $('input[name="' + this.name + '"]');
            },
            renderAmount: function() {
                var max = 100;
                return '<input type="number" lay-verify="limit" class="layui-input compose-input" name="amount" max="' + max + '" min="0" /><b class="append">%</b>';
            },
            value: 0,
            setValue: function(value) {
                this.getElem().val(value);
            }

        },
        renderTpl: function(data) {
            var result = [];
            $.each(this.content, function(index, value) {
                var r = $.extend({}, transRender[value], this[value]);
                if (r.name == 'leftQuotaTotal') {
                    r.value = data.quota.left;
                } else if (r.name == 'depositTotal') {
                    r.value = data.depositPayment.total;
                } else if (r.name == 'prePaymentTotal') {
                    r.value = data.prePayment.total;
                }
                result.push(r);
            });

            var tmpl = transTemplate.innerHTML;
            laytpl(tmpl).render(result, function(html) {
                transContainer.innerHTML = html;
                f.render('select');
                $.each(result, function(index, item) {
                    item.setValue(item.value);
                });
                transRender.bindEvent();

            });


        },
        bindEvent: function() {
            f.verify({
                limit: function(value, item) { //value：表单的值、item：表单的DOM对象
                    var $p = $(item).parents('.layui-form-item');
                    var $total = $p.find('input[data-total]');
                    if ($total.attr('name') == 'leftQuotaTotal' && value > 100) {
                        return '比例最多只能是100%';
                    } else if ($total.attr('name') != 'leftQuotaTotal' && parseFloat(value) > parseFloat($total.val())) {
                        return '输入的值超出范围';
                    }
                }
            });
        }
    };

    //首批进货款
    var initPaymentContract = $.extend({}, transRender, {
            content: [
                'leftQuotaTotal',
                'prePaymentTotal'
            ]
        }),
        //加盟
        joininContract = $.extend({}, transRender, {
            content: [
                'leftQuotaTotal',
                'prePaymentTotal'
            ]
        }),
        //保证金
        depositContract = $.extend({}, transRender, {
            content: [
                'prePaymentTotal',
                'depositTotal'
            ]
        }),
        //直营
        directContract = $.extend({}, transRender, {
            content: [
                'prePaymentTotal'
            ]
        }),
        //合营
        coopContract = $.extend({}, transRender, {
            content: [
                'prePaymentTotal'
            ]
        }),
        //买断
        buyoutContract = $.extend({}, transRender, {
            content: [
                'prePaymentTotal'
            ]
        });

    exports('trans-contract-render', {
        initPaymentContract: initPaymentContract,
        joininContract: joininContract,
        depositContract: depositContract,
        directContract: directContract,
        coopContract: coopContract,
        buyoutContract: buyoutContract
    });
});
