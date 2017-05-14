(function($) {

	$.fn.serialzeJSON=function() {
		var serialObj = {};

		$(this.serializeArray()).each(function() {
			serialObj[this.name] = this.value
		});
		return serialObj;
	}

})(jQuery);