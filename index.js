const server = require('./server');


let app = {};

app.init = function(){
	server.init();
}

app.init();

module.exports = app;