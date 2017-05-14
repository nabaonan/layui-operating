{
	logLevel: "debug",
	log: function(info) {
		//console[Controller.logLevel](" ~~~~~~~~~~~~~~~开始打印debug信息~~~~~~~~~~~~~~~~~~");

		if(typeof arguments[0] != "string") {
			//console[Controller.logLevel]("以下是你要打印的数据");
		}

		for(var i in arguments) {

			//console[Controller.logLevel](arguments[i]);
		}

		//console[Controller.logLevel]("~~~~~~~~~~~~~~~~~~打印结束！~~~~~~~~~~~~~~~~~~~~~~~~~~");

	}
}