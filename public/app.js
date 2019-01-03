///////////////////////////////////////front end logic/////////////////////////////////////////
console.log('Ahh daddy, harderr');
let app = {};
app.client = {};
app.api = {};
app.paint = {};
app.account = {};
app.api.pageCounter = 1;
app.myMovies = [];
app.getSessionToken = function(){
	var emailstring = localStorage.getItem('email');
	if(typeof(emailstring) == 'string' && emailstring.length > 0){
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
					console.log(res)
					if(res.email){
						localStorage.setItem('token', res.token);
						localStorage.setItem('expires', res.expires);
						localStorage.setItem('email', res.email);
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
			console.log(payload)
			app.client.request(undefined, 'api/session', 'POST', undefined, payload, function(status, res){
				if(res){
					if(res.email){
						localStorage.setItem('token', res.token);
						localStorage.setItem('email', res.email);
						localStorage.setItem('expires', res.expires);
						window.location = "/dashboard";
					}
				}
			})
		}) 
	} 
}
app.client.logout = function(){
	let btn = document.getElementById('logout');
	if(btn!==null & btn!==undefined){
		btn.addEventListener('click', function(e){
			app.client.request(undefined, 'api/session', 'DELETE', undefined, undefined, function(status, res){
				localStorage.removeItem('email');
				localStorage.removeItem('expires');
				localStorage.removeItem('token');
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
app.client.checkSession = function(){
	let expires = localStorage.getItem('expires')
	if(expires !== undefined && expires !== null && expires.length>0){
		if(Date.now()>expires){
			localStorage.removeItem('expires');
			localStorage.removeItem('token');
			localStorage.removeItem('email');
		
		}
	}
}


app.api.getArchive = function(movie,page, callback){
	movie = typeof(movie)==='string' && movie.length>3 ? movie : ''; 
	page = typeof(page)==='number' && page>0 ? page : 1; 
   let url = 'https://api.themoviedb.org/3/search/movie?api_key=a7858965a05f95c13389f11b75ad117d&language=en-US&query='+movie+'&page='+page+'&include_adult=false'
   app.client.request(undefined, url, 'GET', undefined, undefined, function(status,res){
	   callback(res);
   })
}
app.api.addMovie = function(event){
	let data=event.target.getAttribute('data');
	let parsedData = JSON.parse(data);
	console.log(parsedData)
	app.client.request(undefined, 'api/myMovies', 'POST', undefined, parsedData, function(status, res){
		console.log(res)
	})
}

app.paint.paintArchives = function(movie,page){
	let dash = document.getElementById('dashboard');
	if(dash!==null && dash !== undefined){
		let posterBaseUrl = 'http://image.tmdb.org/t/p/w185/';
		let moviesWrap = document.getElementById('archiveMoviesList');
		let html = [];
		let metaData = '';
		let img = ''; 
		
		app.api.getArchive(movie,page,function(res){
			res.results.forEach(function(mov){
				img = mov.poster_path !== null && mov.poster_path.length>4  ? posterBaseUrl+mov.poster_path : 'public/fofo-01.png'
				metaData = JSON.stringify({
					name:mov.title,
					year:mov.release_date,
					rating:mov.vote_average,
					posterUrl: posterBaseUrl+mov.poster_path
				})
				html.push(`
				<div class="movie">              
					<div class="movieInfo">
						<img src="`+img+`" class="poster">
						<div class="titles">
							<div class="info title">`+mov.title+`</div>
							<div class="info year">`+mov.release_date+`</div>
							<div class="info rating">`+mov.vote_average+`/10`+`</div>
						</div>
					</div>
					<div class="otherInfo">					
						<div data='`+metaData+`' onclick="app.api.addMovie(event)" class="plusBtn"></div>
					</div>
				</div>`)
			})
			moviesWrap.innerHTML = html.join('');
		})
	}
}
//////////////////////////////////////////bound inside html///////////////////////////////////////////
app.paint.searchArchives = function(){
	let value = document.getElementById('searchInputArchive').value;	
		app.api.pageCounter = 1;
		app.paint.paintArchives(value,1);
}
app.paint.searchMyMovies = function(){
	let value = document.getElementById('searchInputMy').value;	
	let html = [];
	let myMovies = document.getElementById('myMoviesList');
	let img = '';
		app.myMovies.forEach(function(mov){
				if(mov.name.toLowerCase().indexOf(value.toLowerCase())>-1){
					img = mov.posterUrl !== null && mov.posterUrl.length>4  ? mov.posterUrl : 'public/fofo-01.png';
					html.push(`
					<div class="movie">              
						<div class="movieInfo">
							<img src="`+img+`" class="poster">
							<div class="titles">
								<div class="info title">`+mov.name+`</div>
								<div class="info year">`+mov.year+`</div>
								<div class="info rating">`+mov.rating+`/10`+`</div>
							</div>
						</div>
						<div class="otherInfo">					
							
						</div>
					</div>`)
				}
		})
		myMovies.innerHTML = html.join('');
}
//////////////////////////////////////////bound inside html///////////////////////////////////////////
app.paint.nextPageArchives = function() {
	let dash = document.getElementById('dashboard');
	if(dash !== null && dash !==undefined){		
		let arrow = document.getElementById('arrowRight');
		arrow.addEventListener('click', function(){
			let value = document.getElementById('searchInputArchive').value;
			app.api.pageCounter+=1;
			app.paint.paintArchives(value, app.api.pageCounter)
		})
	}
}
app.paint.prevPageArchives = function() {
	let dash = document.getElementById('dashboard');
	if(dash !== null && dash !==undefined){		
		let arrow = document.getElementById('arrowLeft');
		arrow.addEventListener('click', function(){
			if(app.api.pageCounter>1){
				let value = document.getElementById('searchInputArchive').value;
				app.api.pageCounter-=1;
				app.paint.paintArchives(value, app.api.pageCounter)
			}		
		})
	}
}
app.api.getMovies = function(callback){
	let dash = document.getElementById('dashboard');
	if(dash!==null && dash !== undefined){
		app.client.request(undefined, 'api/myMovies', 'GET', undefined, undefined, function(status, res){
			if(res){
				if(res.length>0){
					app.myMovies = res;
					callback(res)
				}
			}		
		})	
	}
}
app.paint.switchToArchives = function(){
	let movie = document.getElementById('searchInputArchive').value || 'drive';
	let archives = document.getElementById('archiveMoviesList');
	let myMovies = document.getElementById('myMoviesList');	
	myMovies.style.display = 'none';
	archives.style.display = 'flex';
	app.paint.paintArchives(movie, 1);
	
}
app.paint.switchToMyMovies = function(){
	let archives = document.getElementById('archiveMoviesList');
	let myMovies = document.getElementById('myMoviesList');	
	archives.style.display = 'none';
	myMovies.style.display = 'flex';
	app.paint.paintMyMovies();
	
}
app.paint.paintMyMovies = function(movie){
	let dash = document.getElementById('dashboard');
	let myMovies = document.getElementById('myMoviesList');
	let html = [];
	let img = '';
	movie = typeof(movie)==='string' && movie.length > 0 ? movie : false;
	if(dash!==null && dash !== undefined){
		app.api.getMovies(function(movies){	
			movies.forEach(function(mov){
				if(movie){
					if(mov.name.toLowerCase().indexOf(movie.toLowerCase())>-1){
						img = mov.posterUrl !== null && mov.posterUrl.length>4  ? mov.posterUrl : 'public/fofo-01.png';
						html.push(`
						<div class="movie">              
							<div class="movieInfo">
								<img src="`+img+`" class="poster">
								<div class="titles">
									<div class="info title">`+mov.name+`</div>
									<div class="info year">`+mov.year+`</div>
									<div class="info rating">`+mov.rating+`/10`+`</div>
								</div>
							</div>
							<div class="otherInfo">					
								
							</div>
						</div>`)
					}
				} else {
					img = mov.posterUrl !== null && mov.posterUrl.length>4  ? mov.posterUrl : 'public/fofo-01.png';
				html.push(`
				<div class="movie">              
					<div class="movieInfo">
						<img src="`+img+`" class="poster">
						<div class="titles">
							<div class="info title">`+mov.name+`</div>
							<div class="info year">`+mov.year+`</div>
							<div class="info rating">`+mov.rating+`/10`+`</div>
						</div>
					</div>
					<div class="otherInfo">					
						
					</div>
				</div>`)
				}		
			})
			myMovies.innerHTML = html.join('');		
		})
	}
}
app.paint.switchMovieMenu = function() {
	let dash = document.getElementById('dashboard');
	let myMovies= document.getElementById('myMoviesMenu');
	let archives = document.getElementById('idbArchiveMenu');
	let toggle = true;
	if(dash!==null && dash!==undefined){
		let btns = document.getElementsByClassName('menuSwitcher');
		for(let i=0; i<btns.length; i++){
			btns[i].addEventListener('click', function(){
				if(toggle===false){					
					archives.style.display = 'none';
					myMovies.style.display = 'flex';
					toggle=true;
					app.paint.switchToMyMovies();
				} else {
					myMovies.style.display = 'none';
					archives.style.display = 'flex';
					toggle=false;
					app.paint.switchToArchives();
				}
			})
		}
	}	
}
app.account.deleteAccount = function(){
	let account = document.getElementById('account');
	let password = '';
	if(account!==null && account!==undefined){
		let btn = document.getElementById('decYesDelete');
		btn.addEventListener('click', function(){
			password = app.client.getFormVals();	
			app.client.request(undefined,'api/users', 'DELETE',undefined, undefined, function(status, res){
				localStorage.removeItem('expires');
				localStorage.removeItem('token');
				localStorage.removeItem('email');
				modal.style.display = 'none';
				window.location = '/';
			})
		})
	}
}
app.account.showAccInput = function(btn, inputName){
	let acc = document.getElementById('account');
	if(acc!==null && acc!==undefined){
		let accBtn = document.getElementById(btn);
		let input = document.getElementById(inputName);
		accBtn.addEventListener('click', function(){
			input.style.display = 'flex';
		})
	}
}
app.account.showModal = function(){
	let acc = document.getElementById('account');
	if(acc!==null && acc!==undefined){
		let accBtns = document.getElementsByClassName('accBtnChange');
		let modal = document.getElementById('confirmModal');
		for(let i=0; i< accBtns.length; i++){
			accBtns[i].addEventListener('click', function(){
				modal.style.display = 'flex';
			})
		}		
	}
}
app.account.showDeleteModal = function(){
	let acc = document.getElementById('account');
	if(acc!==null && acc!==undefined){
		let accBtn = document.getElementById('deleteAccount');
		let modal = document.getElementById('confirmDeleteModal');
		accBtn.addEventListener('click', function(){
			modal.style.display = 'flex';
		})
	}
}
app.account.hideModal = function(modalIs, btn){
	let acc = document.getElementById('account');
	if(acc!==null && acc!==undefined){
		let accBtn = document.getElementById(btn);
		let modal = document.getElementById(modalIs);
		accBtn.addEventListener('click', function(){
			modal.style.display = 'none';
		})
	}
}
app.account.update = function(btn){
	let acc = document.getElementById('account');
	let modal = document.getElementById('confirmModal');
	if(acc!==null && acc!==undefined){
		let sendBtn = document.getElementById(btn);
		sendBtn.addEventListener('click', function(){
			let payload = app.client.getFormVals();
			app.client.request(undefined,'api/users', 'PUT', undefined, payload, function(status, res){
				localStorage.setItem('token', res.token);
				localStorage.setItem('email', res.email);
				localStorage.setItem('expires', res.expires);
				modal.style.display = 'none';
				document.getElementById('accEmailInputs').style.display = 'none';
				document.getElementById('accPasswordInputs').style.display = 'none';
			})
		})
	}
}
app.init = function(){
	app.client.request(undefined,'api/users', 'GET', undefined,undefined,function(st,res){
		if(res){
			if(res.email){
				if(window.location.pathname =='/'){
					window.location = '/dashboard'
				}	
			}
		}		
	})
	app.paint.paintMyMovies();
	app.paint.switchMovieMenu();
	app.paint.nextPageArchives();
	app.paint.prevPageArchives();
	app.account.showAccInput('emailAccBtn', 'accEmailInputs'); 
	app.account.showAccInput('passwordAccBtn', 'accPasswordInputs'); 
	app.account.showDeleteModal();
	app.account.showModal();
	app.account.hideModal('confirmDeleteModal','decNoDelete');
	app.account.hideModal('confirmModal','decNo');
	app.account.update('decYes');
	app.account.deleteAccount();  
	app.getSessionToken()
	app.client.createAccReq();
	app.client.login();
	app.client.logout(); 
}	
window.onload = function(){
	app.init();
}
