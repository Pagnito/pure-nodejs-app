const https = require('https');
const http = require('http');
const url = require('url');
const config = require('./config');
const fs = require('fs');
const path = require('path');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
const _data = require('./lib/data');
const StringDecoder = require('string_decoder').StringDecoder;
const PORT = process.env.PORT || 4000;
var server = {};
 server.httpServer = http.createServer(function(req, res) {
  server.unifiedServer(req,res);
});


////////////////////////////////////https vs http////////////////////////////////////////
server.httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};

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
		
		chosenHandler(data, function(statusCode, payload, contentType,token) {
			token = typeof(token) === 'string' ? token : false;
			contentType = typeof(contentType)==='string' ? contentType : 'json';	
			statusCode = typeof statusCode == 'number' ? statusCode : 200;		
			var stringPayload = '';
			
			if(token) {
				res.setHeader("Set-Cookie", 'session='+token+';'+'HttpOnly; Max-Age=2222222; Path=/');
				payload = {
					name:payload.firstName,
					checks: payload.checks,
					phone: payload.phone
				}
			}
			if(data.trimmedPath == 'api/tokens' && data.method == 'DELETE'){
				console.log('TOKEN', data)
				res.setHeader("Set-Cookie", 'session=deleted;'+'HttpOnly; Max-Age=0; Path=/');
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
let tokenPath = path.join(__dirname, '.data', 'tokens')

function sanitizeTokens() {
	fs.readdir(tokenPath, function(err, tokens){
		if(err){
			console.error( "Could not list the directory.", err );
		} else {
			let deletedTokens = 0;
			let deletionErrs = false;
			if(tokens.length>0){
			tokens.forEach(function(token, ind){
				_data.readWithExt(tokenPath, token, function(err, data){
					if(!err){
						if(data.expires < Date.now()){
							_data.deleteWithExt(tokenPath, token, function(err){
								if(!err){
									deletedTokens++
								} else {
									deletionErrs = true;
								}
								if((ind+1)==tokens.length){
									if(deletionErrs==false){
										console.log('Tokens Sanitized '+ deletedTokens)
									} else {
										console.log('Token sanitization error')
									}
								}
							})
						}
					} else {
						console.log('Could not read token '+ token)
					}
				})
				
			})
		} else {
			console.log('No tokens to sanitize')
		}
		}
	})
}
server.init = function() {
    server.httpServer.listen(PORT, function() {
        console.log('server listening on port ' + PORT + ' in ' + config.envName + ' mode');
    }); 
    /* server.httpsServer.listen(PORT, function() {
        console.log('server listening on port ' + PORT + ' in ' + config.envName + ' mode');
    }); */
}
sanitizeTokens();
//define router
server.router = {
  '': handlers.index,
  'account/create': handlers.createAccount,
  'account/edit': handlers.editAccount,
  'account/deleted':handlers.accountDeleted,
  'session/create': handlers.createSession,
  'session/deleted': handlers.deletedSession,
  'dashboard': handlers.dashboard,
  'checks/create': handlers.createChecks,
  'checks/edit' : handlers.editChecks, 
  'notFound': handlers.notFound,
  'ping': handlers.ping,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/checks': handlers.checks,
  'public': handlers.public
};

module.exports = server;