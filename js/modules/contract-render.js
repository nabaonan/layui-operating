/**
 * 合同渲染模块  根据合同类型动态渲染
 * @author nabaonan
 */


var webName = getWebName();

layui.config({
    base: webName + '/js/modules/' //这个路径以页面引入的位置进行计算
});

var requireModules = [
    'form',
    'laytpl',
    'date-single-util',
    'toast'
];

registeModule(window, requireModules);

layui.define('laytpl', function(exports) {
    var laytpl = layui.laytpl;
    var f = layui.form();
    var $ = layui.jquery;
    var toast = layui.toast;
    var dateSingleUtil = layui['date-single-util'];
    var splitRegex = /\d+(\.\d+)?:\d+(\.\d+)?/; //只能是   数字比数字
    var contractRender = {

        initPayment: {
            must: true,
            type: 'number',
            min: 0,
            name: 'initPayment',
            labelName: '首批进货款',
            value:0,
            getElem: function() {
                return $('input[name="' + this.name + '"]');
            },
            cal: function() {
                var $this = $('input[name="' + this.name + '"]');
                var val = $this.val();
                return parseInt(val);
            },
            bindEvent: function() {
                this.getElem().on('change', function() {
                    contractRender.authQuota.cal();
                });
            }
        },

        splitPropogation: {
            must: true,
            type: 'select',
            name: 'splitPropogation',
            labelName: '分成比例',
            value:0,
            getElem: function() {
                return $('select[name="' + this.name + '"]');
            },
            cal: function() {

                var val = this.getElem().val();
                var split = [];
                if (val != '-1') { //-1代表选择其他
                    split = val.split(':');
                } else {
                    split = contractRender.otherSplit.cal();
                }
                return split;
            },

            values: [{
                    key: '1:9',
                    value: '1:9'
                },
                {
                    key: '2:8',
                    value: '2:8'
                },
                {
                    key: '3:7',
                    value: '3:7',
                    select: true
                },
                {
                    key: '4:6',
                    value: '4:6'
                },
                {
                    key: '5:5',
                    value: '5:5'
                },
                {
                    key: '6:4',
                    value: '6:4'
                },
                {
                    key: '7:3',
                    value: '7:3'
                },
                {
                    key: '8:2',
                    value: '8:2'
                },
                {
                    key: '9:1',
                    value: '9:1'
                },
                {
                    key: '-1',
                    value: '其他'
                }
            ],

            bindEvent: function() {
                var $parent = $('#otherSplit').parents('.layui-inline');
                f.on('select(' + this.name + ')', function(data) {
                    if (data.value != '-1') {
                        $parent.hide();
                        contractRender.authQuota.cal();
                    } else {

                        $parent.show();
                    }
                });
            }
        },

        otherSplit: {
            type: 'text',
            name: 'otherSplit',
            getElem: function() {
                return $('input[name="' + this.name + '"]');
            },
            labelName: '其他分成比例', //分成比例选择其他的时候输入的值
            class: 'hidden',
            value:0,
            cal: function() {
                var val = this.getElem().val();
                return val.split(':');
            },
            bindEvent: function() {
                var $elem = this.getElem();
                var $parent = $elem.parents('.layui-inline');
                $parent.hide();
                $elem.on('blur', function() {
                    if (splitRegex.test($(this).val())) {
                        var splits = $(this).val().split(':');
                        var totalSplit = Number(splits[0].toString().replace(".", "")) + Number(splits[1].toString().replace(".", ""));
                        if(totalSplit % 10 != 0){
                            toast.warn('有效比例相加必须等于10');
                            this.focus();
                        }else{
                            contractRender.authQuota.cal();
                        }
                    } else {
                        toast.warn('有效比例格式错误！');
                        this.focus();
                    }
                });
            }
        },

        standQuota: {
            type: 'number',
            class: 'layui-disabled',
            must: true,
            readOnly: true,
            name: 'standQuota',
            labelName: '标准配额',
            value:0,
            cal: function() {
                var initPayment = contractRender.initPayment.cal(),
                    splitPropogation = contractRender.splitPropogation.cal(),
                    propogation = 0;

                if (!$.isEmptyObject(splitPropogation)) {
                    var left = Number(splitPropogation[0].toString().replace(".", "")),
                        right = Number(splitPropogation[1].toString().replace(".", ""));
                    //~~代表强制转换成int
                    propogation = ~~left / (~~right + ~~left);
                }
                var result = ~~(initPayment / propogation);
                this.setValue(result);
                return result;
            },

            setValue: function(value) {
                $('input[name="' + this.name + '"]').val(value);
            }
        },

        addedQuota: {

            type: 'number',
            getElem: function() {
                return $('input[name="' + this.name + '"]');
            },
            name: 'addedQuota',
            labelName: '追加额度',
            value:0,
            cal: function() {
                var val = this.getElem().val();
                val = (val === '' ? 0 : val);
                return val;
            },
            bindEvent: function() {
                this.getElem().on('change', function() {
                    contractRender.authQuota.cal();
                });
            }
        },

        authQuota: {
            type: 'number',
            name: 'authQuota',
            class: 'layui-disabled',
            labelName: '授权额度',
            value:0,
            readOnly: true,
            getElem: function() {
                return $('input[name="' + this.name + '"]');
            },
            cal: function() {
                var standQuota = contractRender.standQuota.cal(),
                    addQuota = contractRender.addedQuota.cal(),
                    quotaPropogation = contractRender.quotaEffProportation.cal();
                var authQuota = parseInt(standQuota) + parseInt(addQuota);
                this.setValue(parseInt(authQuota));
                return authQuota;
            },
            setValue: function(value) {
                this.getElem().val(value);
            },
            bindEvent: function() {
                this.getElem().on('change', function() {
                    contractRender.authQuota.cal();
                });
            }

        },

        quotaEffProportation: {
            must: true,
            type: 'render',
            name: 'quotaEffProportation',
            getElem: function() {
                return $('input[name="' + this.name + '"]');
            },
            labelName: '额度有效比例',
            value:0,
            render: function() {
                return '<input type="number" min="0" max="100" name="' + this.name + '" autocomplete="off" lay-verify="required|quotaEffProportation"  placeholder="" class="layui-input compose-input"/><b class="append">%</b>';
            },
            cal: function() {
                return this.getElem().val() / 100;
            },
            bindEvent: function() {
                this.getElem().on('change', function() {
                    contractRender.authQuota.cal();
                });
            }
        },

        joininPayment: {
            must: true,
            min: 0,
            type: 'number',
            name: 'joininPayment',
            value:0,
            getElem: function() {
                return $('input[name="' + this.name + '"]');
            },
            labelName: '加盟费',
            cal: function() {
                return this.getElem().val();
            }
        },

        stopDate: {
            type: 'text',
            name: 'stopDate',
            value:0,
            labelName: '全部合同款截止上交日期',
            getElem: function() {
                return $('#' + this.name);
            },

            bindEvent: function() {
                if(!this.getElem().is(':disabled')){
                    dateSingleUtil.init(this.getElem());
                }
            }
        },

        buyoutPayment: {
            must: true,
            type: 'number',
            min: 0,
            value:0,
            name: 'buyoutPayment',
            labelName: '买断费用'
        },

        schoolNum: {
            must: true,
            type: 'number',
            min: 1,
            value:0,
            name: 'schoolNum',
            labelName: '学校数量'
        },

        deposit: {
            must: true,
            type: 'number',
            min: 0,
            value:0,
            name: 'deposit',
            labelName: '保证金'
        },

        splitType: {
            must: true,
            type: 'select',
            name: 'splitType',
            labelName: '分成模式',
            value:0,
            getElem: function() {
                return $('# ' + this.name);
            },
            values: [{
                    key: '1',
                    value: '流水分成比例'
                },
                {
                    key: '-1',
                    value: '其他'
                }
            ],
            bindEvent: function() {

            }
        },

        renderTpl: function(callback) {
            var result = [];
            $.each(this.content, function(index, value) {
                result.push($.extend(true, contractRender[value], this[value]));
            });

            var tmpl = contractTemplate.innerHTML;
            laytpl(tmpl).render(result, function(html) {
                //渲染合同信息
                contractContainer.innerHTML = html;
                // e.init();
                f.render('select');

                if(callback){
                    callback();
                }
                contractRender.bindEvent(result);
            });
        },
        bindEvent: function(elems) {

            $.each(elems, function(index, elem) {
                if (elem.bindEvent) {
                    elem.bindEvent();
                }
            });
        }
    };
    //首批进货款
    var initPaymentContract = $.extend({}, contractRender, {
            content: [
                'initPayment',
                'splitPropogation',
                'otherSplit',
                'standQuota',
                'addedQuota',
                'authQuota',
                'quotaEffProportation',
                'stopDate'
            ]
        }),
        //加盟
        joininContract = $.extend({}, contractRender, {
            content: [
                'initPayment',
                'joininPayment',
                'splitPropogation',
                'otherSplit',
                'standQuota',
                'addedQuota',
                'authQuota',
                'quotaEffProportation',
                'stopDate'
            ]
        }),
        //保证金
        depositContract = $.extend({}, contractRender, {
            content: [
                'deposit',
                'splitPropogation',
                'otherSplit'
            ]
        }),
        //直营
        directContract = $.extend({}, contractRender, {
            content: []
        }),
        //合营
        coopContract = $.extend({}, contractRender, {
            content: [
                'splitType',
                'splitPropogation',
                'otherSplit'

            ]
        }),
        //买断
        buyoutContract = $.extend({}, contractRender, {
            content: [
                'buyoutPayment',
                'schoolNum'
            ]
        });
    exports('contract-render', {
        initPaymentContract: initPaymentContract,
        joininContract: joininContract,
        depositContract: depositContract,
        directContract: directContract,
        coopContract: coopContract,
        buyoutContract: buyoutContract
    });
});
