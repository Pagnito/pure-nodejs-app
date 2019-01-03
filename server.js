const https = require('https');
const http = require('http');
const url = require('url');
const config = require('./config');
const fs = require('fs');
const path = require('path');
const knex = require('knex')
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
const _data = require('./lib/data');
const StringDecoder = require('string_decoder').StringDecoder;
const PORT = process.env.PORT || 4000;
var server = {};
 server.httpServer = http.createServer(function(req, res) {
  server.unifiedServer(req,res);
});


/* let date = new Date(Date.now()).toUTCString()
helpers.unhashToken(helpers.createToken({userName: 'booty',
	email: 'booty@gmail.com',
	password: 'booty',
	id: '2',
	date:date})) */
////////////////////////////////////https vs http////////////////////////////////////////
server.httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};
 server.db = knex({
	client: 'pg',
	connection: config.postgresURL
  });
  server.db.schema.hasTable('users').then(function(has){
		if(!has){
		  server.db.schema.createTable('users', function(table) {
			  table.string('id')
			  table.string('email')
			  table.string('password')
			  table.string('userName')			  
			}).then(function(){console.log('createdUsersTable')})
		}
	})
  server.db.schema.hasTable('movies').then(function(has){
		if(!has){
		  server.db.schema.createTable('movies', function(table) {
			  table.string('id')
			  table.string('userid')
			  table.string('name')
			  table.string('year')
			  table.string('rating')
			  table.string('posterUrl')
			 
			}).then(function(){console.log('createdMoviesTable')})
		}
	}) 
  
/* server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
  server.unifiedServer(req,res);
});
 */

server.unifiedServer = function(req, res) {
  	//parse url
	let parsedUrl = url.parse(req.url, true);
	let path = parsedUrl.pathname;
	let trimmedPath = path.replace(/^\/+|\/+$/g, '');

	//get the query string as an object
	let queryStringObj = parsedUrl.query;

	//get http method
	let method = req.method.toUpperCase();
	
	//get the headers as an object
	let headers = req.headers;

	let cookie = typeof(headers.cookie) =="string" ? headers.cookie.replace('session=', '') : '';
	
	//parse the payload
	const decoder = new StringDecoder('utf-8');
	let buffer = '';
	req.on('data', function(data) {
		buffer += decoder.write(data);
	});
	req.on('end', function() {
		buffer += decoder.end();
		//choose handler
		let chosenHandler = typeof server.router[trimmedPath] !== 'undefined' ? server.router[trimmedPath] : server.router['notFound'];
		chosenHandler = trimmedPath.indexOf('public/')> -1 ? handlers.public : chosenHandler;
		//construct data object to send to handler

		var data = {
			trimmedPath: trimmedPath,
			queryStringObj: queryStringObj,
			method: method,
			headers: headers,
			payload: helpers.parseJsonToObject(buffer),
			token: cookie
		};
		
		chosenHandler(data, server.db, function(statusCode, payload, contentType,token) {
			token = typeof(token) === 'string' ? token : false;
			contentType = typeof(contentType)==='string' ? contentType : 'json';	
			statusCode = typeof statusCode == 'number' ? statusCode : 200;		
			var stringPayload = '';
			if(token && data.method == 'POST') {
				res.setHeader("Set-Cookie", 'session='+token+';'+'HttpOnly; Expires='+payload.expires+'; Path=/');
				payload = {
					email:payload.email,
					expires: payload.expires,
					token: 'true',
				}
			}
			if(data.trimmedPath == 'api/session' && data.method == 'DELETE'){
				res.setHeader("Set-Cookie", 'session=deleted;'+'HttpOnly; Max-Age=0; Path=/');
			}
			if(data.trimmedPath == 'api/users' && data.method == 'DELETE'){
				res.setHeader("Set-Cookie", 'session=deleted;'+'HttpOnly; Max-Age=0; Path=/');
			}
			if(data.trimmedPath == 'api/users' && data.method == 'PUT'){
				res.setHeader("Set-Cookie", 'session=deleted;'+'HttpOnly; Max-Age=0; Path=/');
				res.setHeader("Set-Cookie", 'session='+token+';'+'HttpOnly; Expires='+payload.expires+'; Path=/');
			}
			if(contentType == 'json'){
				payload = typeof payload == 'object' ? payload : {};
				stringPayload = JSON.stringify(payload);
				res.writeHead(statusCode, {'Content-Type': 'application/json'});					
				res.end(stringPayload);			
			} if(contentType == 'html'){		
				stringPayload = typeof(payload) == 'string' ? payload : '';					
				res.writeHead(statusCode,{'Content-Type': 'text/html', 'Content-Length': stringPayload.length});				
				res.end(stringPayload)
			}
			if(contentType == 'css'){			
				stringPayload = typeof(payload) !== 'undefined' ? payload : '';					
				res.writeHead(statusCode,{'Content-Type': 'text/css', 'Content-Length': stringPayload.length});				
				res.end(stringPayload)
			}
			if(contentType == 'png'){			
				stringPayload = typeof(payload) !== 'undefined' ? payload : '';					
				res.writeHead(statusCode,{'Content-Type': 'image/png'});				
				res.end(stringPayload)
			}
			if(contentType == 'js'){			
				stringPayload = typeof(payload) !== 'undefined' ? payload : '';					
				res.writeHead(statusCode,{'Content-Type': 'text/javascript'});				
				res.end(stringPayload)
			}
			if(contentType == 'jpg'){			
				stringPayload = typeof(payload) !== 'undefined' ? payload : '';					
				res.writeHead(statusCode,{'Content-Type': 'image/jpeg'});				
				res.end(stringPayload)
			}
			if(contentType == 'svg'){			
				stringPayload = typeof(payload) !== 'undefined' ? payload : '';					
				res.writeHead(statusCode,{'Content-Type': 'image/svg+xml'});				
				res.end(stringPayload)
			}
			if(contentType == 'ttf'){			
				stringPayload = typeof(payload) !== 'undefined' ? payload : '';					
				res.writeHead(statusCode,{'Content-Type': 'font/ttf'});				
				res.end(stringPayload)
			}
			if(contentType == 'plain'){			
				stringPayload = typeof(payload) == 'string' ? payload : '';					
				res.writeHead(statusCode,{'Content-Type': 'text/plain', 'Content-Length': stringPayload.length});				
				res.end(stringPayload)
			}
			//send response
			
			
		});
	});
};



server.init = function() {
    server.httpServer.listen(PORT, function() {
        console.log('server listening on port ' + PORT + ' in ' + config.envName + ' mode');
    }); 
    /* server.httpsServer.listen(PORT, function() {
        console.log('server listening on port ' + PORT + ' in ' + config.envName + ' mode');
    }); */
}

//define router
server.router = {
  '': handlers.index,
  'account/create': handlers.createAccount,
  'account/edit': handlers.editAccount,
  'account/deleted':handlers.accountDeleted,
  'session/create': handlers.createSession,
  'session/deleted': handlers.deletedSession,
  'dashboard': handlers.dashboard,
  'notFound': handlers.notFound,
  'api/users': handlers.users,
  'api/session': handlers.session,
  'api/myMovies': handlers.myMovies,
  'public': handlers.public
};

module.exports = server;