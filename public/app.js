///////////////////////////////////////front end logic/////////////////////////////////////////
console.log('Ahh daddy, harderr');
let app = {};
app.client = {};
app.config = {
	sessionPhone: false
};
app.getSessionToken = function(){
	var phoneString = localStorage.getItem('phone');
	if(typeof(phoneString) == 'string' && phoneString.length === 10){
		  app.setLoggedInClass(true);
		} else {
		  app.setLoggedInClass(false);
		}
  };
  
  // Set (or remove) the loggedIn class from the body
  app.setLoggedInClass = function(add){
	var target = document.querySelector("body");
	if(add){
	  target.classList.add('loggedIn');
	} else {
	  target.classList.remove('loggedIn');
	}
  };
app.client.getFormVals = function() {
	let fieldName = '';
	let fields = document.getElementsByClassName('inputField');
	let formVals = {};
	for (let j = 0; j < fields.length; j++) {
		fieldName = fields[j].name;
        formVals[fieldName] = fields[j].value.trim();
		if (fields[j].name === 'tosAgreement') {
			if (fields[j].value.trim() == 'yes') {
				formVals[fieldName] = true;
			} else {
				formVals[fieldName] = false;
			}
		}
    }
    return formVals;
};
app.client.createAccReq = function(){
    let payload = {};
	let btn = document.getElementById('createAcc');
	if(btn!==null & btn!==undefined){
        btn.addEventListener('click', function(e){
            payload = app.client.getFormVals();
            app.client.request(undefined, 'api/users', 'POST', undefined, payload, function(status, res){
				if(res){
					if(res.name){
						localStorage.setItem('name', res.name);
						localStorage.setItem('phone', res.phone);
						window.location = "/dashboard";
					}
				}				
            })
		}) 
	}    
}
app.client.login = function(){
	let payload = {};
	let btn = document.getElementById('login');
	if(btn!==null & btn!==undefined){
		btn.addEventListener('click', function(e){
			payload = app.client.getFormVals();
			app.client.request(undefined, 'api/tokens', 'POST', undefined, payload, function(status, res){
				if(res){
					if(res.name){
						localStorage.setItem('name', res.name);
						localStorage.setItem('phone', res.phone);
						window.location = "/dashboard";
					}
				}
			})
		}) 
	} 
}
app.client.logout = function(){
	let btn = document.getElementById('logout');
	let phone = localStorage.getItem('phone');
	if(btn!==null & btn!==undefined){
		btn.addEventListener('click', function(e){
			app.client.request(undefined, 'api/tokens?phone='+phone, 'DELETE', undefined, undefined, function(status, res){
				localStorage.removeItem('phone');
				localStorage.removeItem('name');
				window.location = '/'
			})
		}) 
	} 
}
app.client.request = function(headers, path, method, queryStringObj, payload, callback) {
	headers = typeof headers == 'object' && headers !== null ? headers : {};
	path = typeof path == 'string' && path.length > 0 ? path : '/';
	method = typeof method == 'string' && [ 'PUT', 'DELETE', 'POST', 'GET' ].indexOf(method) > -1 ? method : 'GET';
	queryStringObj = typeof queryStringObj == 'object' && queryStringObj !== null ? queryStringObj : {};
	payload = typeof payload == 'object' && payload !== null ? payload : {};
	callback = typeof callback == 'function' ? callback : false;
	let reqUrl = path + '?';
	let counter = 0;
	for (var queryKey in queryStringObj) {
		if (queryStringObj.hasOwnProperty(queryKey)) {
			counter++;
			if (counter > 1) {
				request += '&';
			}
			requestUrl += queryKey + '=' + queryStringObj[queryKey];
		}
	}
	let xhr = new XMLHttpRequest();
	xhr.open(method, reqUrl, true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	for (let headerKey in headers) {
		if (headers.hasOwnProperty(headerKey)) {
			xhr.setRequestHeader(headerKey, headers[headerKey]);
		}
	}
	if (app.config.sessionToken) {
		xhr.setRequestHeader('token', app.config.sessionToken.id);
	}

	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			var statusCode = xhr.status;
			let responseReturned = xhr.responseText;
			if (callback) {
				try {
					let parsedRes = JSON.parse(responseReturned);
					callback(statusCode, parsedRes);
				} catch (e) {
					callback(statusCode, false);
				}
			}
		}
	};

	let payloadString = JSON.stringify(payload);
	xhr.send(payloadString);
};
app.init = function(){
	console.log('cookies', document.cookie)
	app.getSessionToken()
	app.client.createAccReq();
	app.client.login();
	app.client.logout(); 
}	
window.onload = function(){
	app.init();
}
