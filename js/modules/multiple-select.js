    layui.define(['form','layedit','laydate'],function(exports) {
  		var $ = layui.jquery;
	    var f = layui.form();
    
		exports('multiple-select', {
			render:function(){
				var $select = $('select[multiple]');
				
				$select.each(function(index, el) {
			        var $el = $(el); //select
			        var THIS = 'layui-this',
			            MOD_NAME = 'form',
			            DISABLED = 'layui-disabled'
			
			        var $selectDiv = $(this).next('.layui-form-select'),
			            $input = $selectDiv.find('.layui-select-title input'),
			            $dl = $selectDiv.find('dl'),
			            $dds = $dl.find('dd');
			
			        var $input_h = $('<input />', {
			            type: 'hidden',
			            name: $el.attr('name')
			        }).insertAfter($input);
			        
			        //重写下拉框点击事件
			        $selectDiv.find('.layui-select-title').off("click").on('click', function(e){
		            	$selectDiv.hasClass('layui-form-selected') ? (hideDown()) : (hide(e, true), showDown());
		            	$dl.find('.layui-select-none').remove();
		          	}); 
		          	var showDown = function(){
			        	$selectDiv.addClass('layui-form-selected');
			            $dds.removeClass("layui-hide");
			          },
			          hideDown = function(){
			            $selectDiv.removeClass('layui-form-selected');
			            $input.blur();
			          };
			        var hide = function(e, clear){
			          if(!$(e.target).parent().hasClass("layui-select-title") || clear){
			            $('.layui-form-select').removeClass('layui-form-selected');
			            //thatInput && initValue && thatInput.val(initValue);
			          }
			          //thatInput = null;
			        }
			        //end 
			        
			        var selecteds = $(this).attr("data-value") ? $(this).attr("data-value").split(",") : "";
			        if(selecteds){
			        	var text = [];
			        	$dds.each(function(i,item){
			        		if(selecteds.indexOf($(item).attr('lay-value'))>-1){
			        			$(item).addClass(THIS);
			        			text.push($(item).text());
			        		}
			        	});
			        	$el.data('val',selecteds);
	        			$el.data('text', text);
	        			$input.val(text.join(','));
			            $input_h.val(selecteds.join(','));
			        }
			        
			
			        $dds.off('click').on('click', function() {
			            var othis = $(this),
			                value = othis.attr('lay-value');
			            var filter = $el.attr('lay-filter'); //获取过滤器
			            if (othis.hasClass(DISABLED)) return false;
			            $el.removeClass('layui-form-danger');
			            var val = $el.data('val'),
			                text = $el.data('text');
			                
			            if (othis.hasClass(THIS)) {
			                var index = $.inArray(value, val);
			                if (index !== -1) {
			                    val.splice(index, 1);
			                    text.splice(index, 1);
			                }
			                $el.data('val', val);
			                $el.data('text', text);
			                othis.removeClass(THIS);
			            } else {
			                if (!val) {
			                    val = [];
			                    text = [];
			                }
			                val.push(value);
			                text.push(othis.text());
			                $el.data('val', val);
			                $el.data('text', text);
			                othis.addClass(THIS);
			            }
			            $input.val(text.join(','));
			            $input_h.val(val.join(','));
			            return false;
			        });
			
			    });
			},
			
			setValue:function(dataObj){
				for(var key in dataObj)
				{
				    var $select = $('select[name='+key+'][multiple]');
				    if($select){
				    	var $el = $select; //select
				        var THIS = 'layui-this',
				            MOD_NAME = 'form',
				            DISABLED = 'layui-disabled'
				
				        var $selectDiv = $select.next('.layui-form-select'),
				            $input = $selectDiv.find('.layui-select-title input'),
				            $dl = $selectDiv.find('dl'),
				            $dds = $dl.find('dd');
				        
				        var $input_h = $('input[name='+key+']');
				            
			            var selecteds = dataObj[key].split(",");
			            
				        if(selecteds){
				        	var text = [];
				        	$dds.each(function(i,item){
				        		if(selecteds.indexOf($(item).attr('lay-value'))>-1){
				        			$(item).addClass(THIS);
				        			text.push($(item).text());
				        		}
				        	});
				        	$el.data('val',selecteds);
		        			$el.data('text', text);
		        			$input.val(text.join(','));
				            $input_h.val(selecteds.join(','));
				        }
				    }
				}
			}
		});

	});
