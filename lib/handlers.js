var _data = require('./data');
var helpers = require('./helpers');
var config = require('../config')
//define handlers
var handlers = {};
handlers.ping = function(data, callback) {
	callback(200);
};
//not found handler
handlers.notFound = function(data, callback) {
	callback(404);
};
handlers._users = {};

handlers.dashboard = function(data, callback){
	if(data.method == 'GET' || data.method == 'get'){
		let templateData = {
			'head.title': 'Node',
			'head.description': 'This is description',
			'body.class': 'index',
			'body.title': 'big shits son'
		}
		if(data.token.length === 80){
			helpers.getTemplate('dashboard', templateData,function(err, str){
				if(!err){
					helpers.addUniversalTemp(str,templateData,function(err,fullStr){
						if(!err){
							callback(200,fullStr,'html');
						} else {
							callback(500, undefined, 'html');
						}
					})
					
				} else {
					callback(500, undefined, 'html');
				}
			})
		} else {
			helpers.getTemplate('404', templateData,function(err, str){
				if(!err){
					helpers.addUniversalTemp(str,templateData,function(err,fullStr){
						if(!err){
							callback(200,fullStr,'html');
						} else {
							callback(500, undefined, 'html');
						}
					})
					
				} else {
					callback(500, undefined, 'html');
				}
			})
		}		
	} else {
		callback(405, undfined, 'html');
	}
}
handlers.index = function(data, callback){
	if(data.method == 'GET' || data.method == 'get'){
		let templateData = {
			'head.title': 'Node',
			'head.description': 'This is description',
			'body.class': 'index',
			'body.title': 'big shits son'
		}
		helpers.getTemplate('index', templateData,function(err, str){
			if(!err){
				helpers.addUniversalTemp(str,templateData,function(err,fullStr){
					if(!err){
						callback(200,fullStr,'html');
					} else {
						callback(500, undefined, 'html');
					}
				})
				
			} else {
				callback(500, undefined, 'html');
			}
		})
	} else {
		callback(405, undfined, 'html');
	}
}
handlers.createAccount = function(data, callback){
	if(data.method == 'GET' || data.method == 'get'){
		let templateData = {
			'head.title': 'Node',
			'head.description': 'This is description',
			'body.class': 'index',
			'body.title': 'big shits son'
		}
		helpers.getTemplate('createAccount', templateData,function(err, str){
			if(!err){
				helpers.addUniversalTemp(str,templateData,function(err,fullStr){
					if(!err){
						callback(200,fullStr,'html');
					} else {
						callback(500, undefined, 'html');
					}
				})
				
			} else {
				callback(500, undefined, 'html');
			}
		})
	} else {
		callback(405, undfined, 'html');
	}
}
handlers.createSession = function(data, callback){
	if(data.method == 'GET' || data.method == 'get'){
		let templateData = {
			'head.logStatus': 'Yes',
			'head.description': 'This is description',
			'body.class': 'index',
			'body.title': 'big shits son'
		}
		helpers.getTemplate('createSession', templateData,function(err, str){
			if(!err){
				helpers.addUniversalTemp(str,templateData,function(err,fullStr){
					if(!err){
						callback(200,fullStr,'html');
					} else {
						callback(500, undefined, 'html');
					}
				})
				
			} else {
				callback(500, undefined, 'html');
			}
		})
	} else {
		callback(405, undfined, 'html');
	}
}

handlers.public = function(data, callback){
	if(data.method ==='GET' || data.method==='get'){
		let assetName = data.trimmedPath.replace('public/', '').trim();
		if(assetName.length>0){
			helpers.getStaticAsset(assetName, function(err, data){
				if(!err && data){
					let contentType = 'plain';
					if(assetName.indexOf('.css')>-1){
						contentType = 'css';
					} 
					if(assetName.indexOf('.png')>-1){
						contentType = 'png';
					} 
					if(assetName.indexOf('.jpg')>-1){
						contentType = 'jpg';
					} 
					if(assetName.indexOf('.jpeg')>-1){
						contentType = 'jpg';
					} 
					if(assetName.indexOf('.js')>-1){
						contentType = 'js';
					} 
					if(assetName.indexOf('.svg')>-1){
						contentType = 'svg';
					} 
					callback(200,data,contentType)
				} else {
					callback(404)
				}
			})
		} else {
			callback(404)
		}
	} else {
		callback(405)
	}
}

/////////////////////////////////////users//////////////////////////////////////////
/////////////////////////////////////API////////////////////////////////////////////
handlers._users.POST = function(data, callback) {
	console.log(data.payload)
	if (
		data.payload.firstName &&
		data.payload.lastName &&
		data.payload.password &&
		data.payload.phone 
	) {
		let firstName =
			typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0
				? data.payload.firstName.trim()
				: false;
		let lastName =
			typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0
				? data.payload.lastName.trim()
				: false;
		let phone =
			typeof data.payload.phone === 'string' && data.payload.phone.trim().length == 10
				? data.payload.phone.trim()
				: false;
		let password =
			typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
				? data.payload.password.trim()
				: false;
		
		_data.read('users', phone, function(err, data) {
			if (err) {			
				//create new user since it cant read non exisitng file
				var hashedPassword = helpers.hash(password);
				if (hashedPassword !== false) {
					var tokenId = helpers.createToken(80);
					var expires = Date.now() + 1000 * 60 * 60;
					var tokenObj = {
						phone: phone,
						token: tokenId,
						expires: expires
					};
					_data.create('tokens', tokenId, tokenObj, function(err) {
						if (err) {
							callback(500, { msg: 'Could not create token' });
						} 
					});
					var userObject = {
						firstName: firstName,
						lastName: lastName,
						phone: phone,
						hashedPassword: hashedPassword					
					};
					_data.create('users', phone, userObject, function(err) {
						if (!err) {
							callback(200,userObject, null, tokenId);
						} else {
							console.log(err);
							callback(500, { msg: 'Could not create the new user' });
						}
					});
				} else {
					callback(500, { msg: 'Could not hash password' });
				}
			} else {
				callback(400, { msg: 'A user with that phone number already exists' });
			}
		});
	} else {
		callback(400, { msg: 'missing required fields' });
	}
};
/////////////////////////////////////////////////////////////////////////////
//@TODO only let authenticated users access this data
handlers._users.GET = function(data, callback) {
	let phone =
		typeof data.queryStringObj.phone == 'string' && data.queryStringObj.phone.trim().length > 0
			? data.queryStringObj.phone.trim()
			: false;
	if (phone) {
		var token =
			typeof data.headers.token === 'string' && data.headers.token.length === 20 ? data.headers.token : false;
	
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
			if (tokenIsValid) {
				_data.read('users', phone, function(err, dataRes) {
					if (!err) {
						delete dataRes.hashedPassword;
						callback(200, dataRes);
					} else {
						callback(404);
					}
				});
			} else {
				callback(403, { msg: 'Missing required token in header, or token is expired' });
			}
		});
	} else {
		callback(400, { msg: 'Missing required field' });
	}
};
/////////////////////////////////////////////////////////////////////////////
//@TODO only let authenticated update their object
handlers._users.PUT = function(data, callback) {
	let phone =
		typeof data.payload.phone == 'string' && data.payload.phone.trim().length > 0
			? data.payload.phone.trim()
			: false;
	let firstName =
		typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0
			? data.payload.firstName.trim()
			: false;
	let lastName =
		typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0
			? data.payload.lastName.trim()
			: false;
	let password =
		typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
			? data.payload.password.trim()
			: false;
	if (phone) {
		var token =
			typeof data.headers.token === 'string' && data.headers.token.length === 20 ? data.headers.token : false;
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
			if (tokenIsValid) {
				if (firstName || lastName || password) {
					_data.read('users', phone, function(err, userData) {
						if (!err && userData) {
							if (firstName) {
								userData.firstName = firstName;
							}
							if (lastName) {
								userData.lastName = lastName;
							}
							if (password) {
								userData.password = helpers.hash(password);
							}
							_data.update('users', phone, userData, function(err) {
								if (!err) {
									callback(200);
								} else {
									console.log(err);
									callback(500, { msg: 'Could not update the user' });
								}
							});
						} else {
							callback(400, { msg: 'The specified user does not exist' });
						}
					});
				} else {
					callback(400, { msg: 'Missing fields to update' });
				}
			}
		});
	} else {
		callback(400, { msg: 'Missing required field' });
	}
};
/////////////////////////////////////////////////////////////////////////////
handlers._users.DELETE = function(data, callback) {
	let phone =
		typeof data.queryStringObj.phone == 'string' && data.queryStringObj.phone.trim().length > 0
			? data.queryStringObj.phone.trim()
			: false;
	if (phone) {
		var token =
			typeof data.headers.token === 'string' && data.headers.token.length === 20 ? data.headers.token : false;
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
			if (tokenIsValid) {
				_data.read('users', phone, function(err, userData) {
					if (!err) {
						_data.delete('users', phone, function(err) {
							if (!err) {
								let userChecks = typeof(userData.checks) === 'object' &&
                                    userData.checks instanceof Array ? userData.checks : [];
                                if(userChecks.length > 0){
                                    let deletionErrs = false;
                                    let deletedChecks = 0;
                                    userChecks.forEach(function(checkId, ind){
                                        _data.delete('checks', checkId, function(err){
                                            if(err){
                                                deletionErrs = true
                                            } else {
                                                deletedChecks++;
                                            }
                                            if((ind+1)==userChecks.length){
                                                if(deletionErrs==false){
                                                    callback(200)
                                                } else {
                                                    callback(500, {msg: 'Errors encountered while attempting delete all of the users checks'})
                                                }
                                            }
                                        })
                                    });
                                } else {
                                    callback(200, userData )
                                }
							} else {
								callback(500, { msg: 'Could not delete the specified user' });
							}
						});
					} else {
						callback(404);
					}
				});
			}
		});
	} else {
		callback(400, { msg: 'Missing required field' });
	}
};
////////////////////////////////////cookies///////////////////////////////////////////
/////////////////////////////required phone and password//////////////////////////////
 handlers._tokens = {};

handlers._tokens.POST = function(data, callback) {
	let phone =
		typeof data.payload.phone === 'string' && data.payload.phone.trim().length == 10
			? data.payload.phone.trim()
			: false;
	let password =
		typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
			? data.payload.password.trim()
			: false;
	if (phone && password) {
		_data.read('users', phone, function(err, userData) {
			if (!err) {
				var hashedPassword = helpers.hash(password);
				if (hashedPassword == userData.hashedPassword) {
					var tokenId = helpers.createToken(80);
					var expires = Date.now() + 2222222;
					var tokenObj = {
						phone: phone,
						token: tokenId,
						expires: expires
					};
					_data.create('tokens', tokenId, tokenObj, function(err) {
						if (!err) {
							callback(200, userData, null, tokenObj.token);
						} else {
							callback(500, { msg: 'Could not create token' });
						}
					});
				} else {
					callback(400, { msg: 'Password did not match' });
				}
			} else {
				callback(400, { msg: 'Could not find the specified user' });
			}
		});
	} else {
		callback(400, { msg: 'Missing required field(s)' });
	}
};
/////////////////////////////////////////////////////////////////////////////////////////
handlers._tokens.GET = function(data, callback) {
	let token =
		typeof data.queryStringObj.token == 'string' && data.queryStringObj.token.trim().length === 20
			? data.queryStringObj.token.trim()
			: false;
	if (token) {
		_data.read('tokens', token, function(err, dataRes) {
			if (!err) {
				callback(200, dataRes);
			} else {
				callback(404, { msg: 'Token could not be found' });
			}
		});
	} else {
		callback(400, { msg: 'Missing required field' });
	}
}; 
handlers._tokens.PUT = function(data, callback) {

	let token =
		typeof data.token === 'string' && data.token.trim().length === 20
			? data.token.trim()
			: false;
	let extend = typeof data.payload.extend === 'boolean' && data.payload.extend === true ? true : false;
	if (token && extend) {
		_data.read('tokens', token, function(err, tokenData) {
			if (!err && tokenData) {
				if (tokenData.expires > Date.now()) {
					tokenData.expires = Date.now() + 1000 * 60 * 60;
					_data.update('tokens', token, tokenData, function(err) {
						if (!err) {
							callback(200, tokenData);
						} else {
							callback(500, { msg: 'Could not extend token' });
						}
					});
				} else {
					callback(400, { msg: 'The token has been expired' });
				}
			} else {
				callback(404, { msg: 'Could not find the specified token' });
			}
		});
	} else {
		callback(400, { msg: 'Missing required field(s) or fields are invalid' });
	}
};
/////////////////////////////////////////////////////////////////////////////////////////
handlers._tokens.DELETE = function(data, callback) {

	let token =
		typeof data.token == 'string' && data.token.trim().length === 80
			? data.token.trim()
			: false;
	if (token) {
		_data.read('tokens', token, function(err, dataRes) {
			if (!err) {
				_data.delete('tokens', token, function(err) {
					if (!err) {
						callback(200, {msg: 'Session deleted'});
					} else {
						callback(500, { msg: 'Could not delete the specified token' });
					}
				});
			} else {
				callback(404, { msg: 'Could not find the specified token' });
			}
		});
	} else {
		callback(400, { msg: 'Missing required field' });
	}
};
 

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
handlers._tokens.verifyToken = function(token, phone, callback) {
	_data.read('tokens', token, function(err, tokenData) {
		if (!err && tokenData) {
			if (tokenData.phone == phone && tokenData.expires > Date.now()) {
				callback(true);
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	});
};
/////////////////////////////////////////////////////////////////////////////////
handlers.users = function(data, callback) {
	let acceptableMethods = [ 'POST', 'DELETE', 'PUT', 'GET' ];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback);
	} else {
		callback(405);
	}
};
handlers.tokens = function(data, callback) {
	let acceptableMethods = [ 'POST', 'DELETE', 'PUT', 'GET' ];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, callback);
	} else {
		callback(405);
	}
};
module.exports = handlers;
