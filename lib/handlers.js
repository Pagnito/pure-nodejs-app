var _data = require('./data');
var helpers = require('./helpers');
var config = require('../config');
//define handlers
var handlers = {};

//not found handler
handlers.notFound = function(data, db, callback) {
	callback(404);
};
handlers._users = {};
handlers._session = {};
handlers._myMovies = {};
handlers.dashboard = function(data, db, callback) {
	if (data.method == 'GET' || data.method == 'get') {
		let templateData = {
			'head.title': 'Node',
			'head.description': 'This is description',
			'body.class': 'index'
		};
		if (data.token.length > 100) {
			helpers.getTemplate('dashboard', templateData, function(err, str) {
				if (!err) {
					helpers.addUniversalTemp(str, templateData, function(err, fullStr) {
						if (!err) {
							callback(200, fullStr, 'html');
						} else {
							callback(500, undefined, 'html');
						}
					});
				} else {
					callback(500, undefined, 'html');
				}
			});
		} else {
			helpers.getTemplate('404', templateData, function(err, str) {
				if (!err) {
					helpers.addUniversalTemp(str, templateData, function(err, fullStr) {
						if (!err) {
							callback(200, fullStr, 'html');
						} else {
							callback(500, undefined, 'html');
						}
					});
				} else {
					callback(500, undefined, 'html');
				}
			});
		}
	} else {
		callback(405, undfined, 'html');
	}
};
handlers.editAccount = function(data, db, callback) {
	if (data.method == 'GET' || data.method == 'get') {
		let user = helpers.unhashToken(data.token);
		let templateData = {
			'head.title': 'Node',
			'head.description': 'This is description',
			'body.class': 'index',
			'account.userName': user.userName
		};
		if (data.token.length > 100) {
			helpers.getTemplate('account', templateData, function(err, str) {
				if (!err) {
					helpers.addUniversalTemp(str, templateData, function(err, fullStr) {
						if (!err) {
							callback(200, fullStr, 'html');
						} else {
							callback(500, undefined, 'html');
						}
					});
				} else {
					callback(500, undefined, 'html');
				}
			});
		} else {
			helpers.getTemplate('404', templateData, function(err, str) {
				if (!err) {
					helpers.addUniversalTemp(str, templateData, function(err, fullStr) {
						if (!err) {
							callback(200, fullStr, 'html');
						} else {
							callback(500, undefined, 'html');
						}
					});
				} else {
					callback(500, undefined, 'html');
				}
			});
		}
	} else {
		callback(405, undefined, 'html');
	}
};
handlers.index = function(data, db, callback) {
	if (data.method == 'GET' || data.method == 'get') {
		let templateData = {
			'head.title': 'Node',
			'head.description': 'This is description',
			'body.class': 'index'
		};
		helpers.getTemplate('index', templateData, function(err, str) {
			if (!err) {
				helpers.addUniversalTemp(str, templateData, function(err, fullStr) {
					if (!err) {
						callback(200, fullStr, 'html');
					} else {
						callback(500, undefined, 'html');
					}
				});
			} else {
				callback(500, undefined, 'html');
			}
		});
	} else {
		callback(405, undfined, 'html');
	}
};
handlers.createAccount = function(data, db, callback) {
	if (data.method == 'GET' || data.method == 'get') {
		let templateData = {
			'head.title': 'Node',
			'head.description': 'This is description',
			'body.class': 'index'
		};
		helpers.getTemplate('createAccount', templateData, function(err, str) {
			if (!err) {
				helpers.addUniversalTemp(str, templateData, function(err, fullStr) {
					if (!err) {
						callback(200, fullStr, 'html');
					} else {
						callback(500, undefined, 'html');
					}
				});
			} else {
				callback(500, undefined, 'html');
			}
		});
	} else {
		callback(405, undfined, 'html');
	}
};
handlers.createSession = function(data, db, callback) {
	if (data.method == 'GET' || data.method == 'get') {
		let templateData = {
			'head.logStatus': 'Yes',
			'head.description': 'This is description',
			'body.class': 'index'
		};
		helpers.getTemplate('createSession', templateData, function(err, str) {
			if (!err) {
				helpers.addUniversalTemp(str, templateData, function(err, fullStr) {
					if (!err) {
						callback(200, fullStr, 'html');
					} else {
						callback(500, undefined, 'html');
					}
				});
			} else {
				callback(500, undefined, 'html');
			}
		});
	} else {
		callback(405, undfined, 'html');
	}
};

handlers.public = function(data, db, callback) {
	if (data.method === 'GET' || data.method === 'get') {
		let assetName = data.trimmedPath.replace('public/', '').trim();
		if (assetName.length > 0) {
			helpers.getStaticAsset(assetName, function(err, data) {
				if (!err && data) {
					let contentType = 'plain';
					if (assetName.indexOf('.css') > -1) {
						contentType = 'css';
					}
					if (assetName.indexOf('.png') > -1) {
						contentType = 'png';
					}
					if (assetName.indexOf('.jpg') > -1) {
						contentType = 'jpg';
					}
					if (assetName.indexOf('.jpeg') > -1) {
						contentType = 'jpg';
					}
					if (assetName.indexOf('.js') > -1) {
						contentType = 'js';
					}
					if (assetName.indexOf('.svg') > -1) {
						contentType = 'svg';
					}
					callback(200, data, contentType);
				} else {
					callback(404);
				}
			});
		} else {
			callback(404);
		}
	} else {
		callback(405);
	}
};

/////////////////////////////////////users//////////////////////////////////////////
/////////////////////////////////////API////////////////////////////////////////////
handlers._users.POST = function(data, db, callback) {
	let userName =
		typeof data.payload.userName === 'string' && data.payload.userName.trim().length > 0
			? data.payload.userName.trim()
			: false;
	let email =
		typeof data.payload.email === 'string' && data.payload.email.trim().length > 0
			? data.payload.email.trim()
			: false;
	let password =
		typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
			? data.payload.password.trim()
			: false;
	if (userName && email && password) {
		db('users').select().where('email', email).then(function(res) {
			if (res.length === 0) {
				//create new user since it cant read non exisitng file
				let id = res.length + 1;
				let hashedPassword = helpers.hash(password);
				let expires = new Date(Date.now() + 60 * 60 * 60 * 1000).toUTCString();
				let userObject = {
					userName: userName,
					email: email,
					password: hashedPassword,
					id: id
				};
				let forToken = {
					userName: userName,
					email: email,
					expires: expires,
					id: id
				};
				let token = helpers.createToken(forToken);
				if (hashedPassword !== false) {
					let response = {
						userName: userName,
						email: email,
						expires: expires
					};
					db('users').insert([ userObject ]).then(function() {
						callback(200, response, undefined, token);
					});
				} else {
					callback(500, { msg: 'Could not hash password' });
				}
			} else {
				callback(404, { msg: 'Could not find user' });
			}
		});
	} else {
		callback(400, { msg: 'missing required fields' });
	}
};
/////////////////////////////////////////////////////////////////////////////
//@TODO only let authenticated users access this data
handlers._users.GET = function(data, db, callback) {
	let token = typeof data.token == 'string' && data.token.trim().length > 0 ? data.token.trim() : false;
	if (token) {
		let user = helpers.unhashToken(token);
		if (typeof user === 'object') {
			db('users').select().where('email', user.email).then(function(userData) {
				if (userData.length > 0) {
					delete user.password;
					callback(200, user, undefined, token);
				} else {
					callback(404, { msg: 'Could not find user' });
				}
			});
		} else {
			callback(500, { msg: 'Something is wrong with the token' });
		}
	} else {
		callback(400, { msg: 'Missing required field' });
	}
};
/////////////////////////////////////////////////////////////////////////////
//@TODO only let authenticated update their object
handlers._users.PUT = function(data, db, callback) {
	var token = typeof data.token === 'string' && data.token.length > 100 ? data.token : false;
	let email =
		typeof data.payload.email === 'string' && data.payload.email.trim().length > 0
			? data.payload.email.trim()
			: false;
	let password =
		typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
			? data.payload.password.trim()
			: false;
	let user = helpers.unhashToken(token);
	if (user) {
		if (email || password) {
			if (email) {
				db('users').where('email', user.email).update('email', email).then(function(updated) {
					db('users').select().where('id', user.id).then(function(userData) {
						let expires = new Date(Date.now() + 60 * 60 * 60 * 1000).toUTCString();
						let forToken = {
							userName: userData[0].userName,
							email: userData[0].email,
							expires: expires,
							id: userData[0].id
						};
						delete userData[0].password;
						userData[0].expires = expires;
						userData[0].token = 'true';
						let newToken = helpers.createToken(forToken);
						callback(200, userData[0], undefined, newToken);
					});
				});
			} else if (password) {
				let hashedPassword = helpers.hash(password);
				db('users').where('id', user.id).update('password', hashedPassword).then(function(updated) {
					db('users').select().where('id', user.id).then(function(userData) {
						delete userData[0].password;
						callback(200, userData[0], undefined);
					});
				});
			}
		} else {
			callback(400, { msg: 'Missing fields to update' });
		}
	} else {
		callback(400, { msg: 'Missing required field' });
	}
}; /////////////////////////////////////*/
/////////////////////////////////////////////////////////////////////////////
/*@TODO delete movies of the account*/ handlers._users.DELETE = function(data, db, callback) {
	var token = typeof data.token === 'string' && data.token.length > 100 ? data.token : false;
	let user = helpers.unhashToken(token);
	if (user) {
		db('users').select().where('email', user.email).then(function(userData) {
			if (userData.length > 0) {
				db('users').where('email', user.email).del().then(function() {
					callback(200, { msg: 'Account Deleted' });
				});
			} else {
				callback(500, { msg: 'User could not be found' });
			}
		});
	} else {
		callback(404, { msg: 'Token is invalid' });
	}
};
////////////////////////////////////logout///////////////////////////////////////////
////////////////////////////////////cookies///////////////////////////////////////////
handlers._session.DELETE = function(data, db, callback) {
	let token = 'loggedOut';
	callback(200, undefined, undefined, token);
};
//////////////////////////////////////////////////////////////////////////////////////
handlers._session.POST = function(data, db, callback) {
	let email =
		typeof data.payload.email === 'string' && data.payload.email.trim().length > 0
			? data.payload.email.trim()
			: false;
	let password =
		typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
			? data.payload.password.trim()
			: false;
	if (email && password) {
		db('users').select().where('email', email).then(function(res) {
			if (res.length > 0) {
				//create new user since it cant read non exisitng file
				let hashedPassword = helpers.hash(password);
				if (hashedPassword !== false) {
					if (hashedPassword === res[0].password) {
						let expires = new Date(Date.now() + 60 * 60 * 60 * 1000).toUTCString();
						res[0].expires = expires;
						let token = helpers.createToken(res[0]);

						let response = {
							userName: res[0].userName,
							email: email,
							expires: expires,
							id: res[0].id
						};
						callback(200, response, undefined, token);
					} else {
						callback(404, { msg: 'Password did not match' });
					}
				} else {
					callback(500, { msg: 'Could not hash password' });
				}
			} else {
				callback(404, { msg: 'Could not find user' });
			}
		});
	} else {
		callback(400, { msg: 'missing required fields' });
	}
};
/////////////////////////////////////////////////////////////////////////////////
handlers._myMovies.POST = function(data, db, callback) {
	if (data.token.length > 0) {
		let user = helpers.unhashToken(data.token);
		if (user) {
			let name =
				typeof data.payload.name === 'string' && data.payload.name.trim().length > 0
					? data.payload.name.trim()
					: false;
			let year =
				typeof data.payload.year === 'string' && data.payload.year.trim().length > 0
					? data.payload.year.trim()
					: false;
			let rating =
				typeof data.payload.rating === 'number'
					? data.payload.rating
					: false;
				rating = rating == 0 ? '0' : rating.toString();
			let posterUrl =
				typeof data.payload.posterUrl === 'string' && data.payload.posterUrl.trim().length > 0
					? data.payload.posterUrl.trim()
					: false;
					console.log(name, year, rating, posterUrl)
			if(name && year && rating && posterUrl){
				
				db('movies').select().then(function(movies){
					let movieObj = {
						id: movies.length+1,
						userid: user.id,
						name: name,
						year: year,
						rating: rating,
						posterUrl: posterUrl		
					}
					db('movies').insert([movieObj]).then(function(){
						callback(200,movieObj,undefined);
					})
				})
			} else {
				callback(400, {msg: 'Missing required fields'})
			}
		} else {
			callback(404, {msg: "Token is invalid"})
		}
	} else {
		callback(404, {msg: "Missing Token"})
	}
};
/////////////////////////////////////////////////////////////////////////////////
handlers._myMovies.GET = function(data, db, callback) {
	if(data.token.length > 0){
		let user = helpers.unhashToken(data.token);
		if(user){
			db('movies').select().where('userid', user.id).then(function(movies){
				callback(200, movies)
			})
		}
	}
}
/////////////////////////////////////////////////////////////////////////////////
handlers.users = function(data, db, callback) {
	let acceptableMethods = [ 'POST', 'DELETE', 'PUT', 'GET' ];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, db, callback);
	} else {
		callback(405);
	}
};
handlers.myMovies = function(data, db, callback) {
	let acceptableMethods = [ 'POST', 'DELETE', 'PUT', 'GET' ];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._myMovies[data.method](data, db, callback);
	} else {
		callback(405);
	}
};
handlers.session = function(data, db, callback) {
	let acceptableMethods = [ 'POST', 'DELETE', 'PUT', 'GET' ];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._session[data.method](data, db, callback);
	} else {
		callback(405);
	}
};
module.exports = handlers;
