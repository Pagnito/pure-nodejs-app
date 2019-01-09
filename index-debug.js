const server = require('./server');
const cli = require('./lib/cli')

let app = {};

app.init = function(){
	server.init();
	setTimeout(function(){
		cli.init();
	},300)


	 g = 1;
	debugger;


	g+=10;
	debugger;


	g=5;
	debugger;
	
	console.log('g son son')
}

app.init();


module.exports = app;