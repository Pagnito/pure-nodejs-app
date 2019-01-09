const server = require('./server');
const cli = require('./lib/cli')

let app = {};

app.init = function(){
	server.init();
	setTimeout(function(){
		cli.init();
	},300)
}

app.init();

module.exports = app;