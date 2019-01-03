var crypto = require('crypto');
var config = require('../config');
var helpers = {};
var querystring = require('querystring');
var https = require('https');
var path = require('path');
var fs = require('fs');
helpers.hash = function(str){
    if(typeof str == 'string' && str.length > 0){
        var hash = crypto.createHmac('sha256', config.hashSecret).update(str).digest('hex');
        return hash
    } else {
        return false;
    }
}
helpers.parseJsonToObject = function(str) {
    try {
        var obj = JSON.parse(str);
        return obj
    } catch(e) {
        return {};
    }
}

helpers.createToken = function(user) {
    user = typeof(user) === 'object' ? user : false;
    if(user){     
          let randoms = 'abscdefghijklmnopqrstuvwxyz56789';
          var randomChar = '';
          let userObjIterator = '';
          let token = '';
          user = JSON.stringify(user)         
          .replace(/{/g,'kafklotp')
          .replace(/}/g, 'kptrlbn')
          .replace(/:/g,'jgnuag')
          .replace(/"/g, 'lkmbng')
          .replace(/,/g,'lepolg');
          
          let userLength = user.length;
          let i = 0;
          while(userLength > 0){
            randomChar = randoms.charAt(Math.floor(Math.random()*randoms.length))  
            if(i%3==0){                
              userObjIterator = i/3;
              token+= user.charAt(userObjIterator)
              userLength-=1
            } else {
              token+=randomChar
            }
            i++;
          }
          return token;
         
    } else {
        return false
    }
}

helpers.unhashToken = function(token){
    token = typeof(token)==='string' && token.length > 180 ? token : false;
    if(token){
        let unhashed = '';
        for(let i = 0; i<token.length; i++){
            if(i%3==0){
                letter = token.charAt(i);          
                unhashed+=letter;
            }
        }
        
     unhashed = unhashed.replace(/lepolg/g,',')
     .replace(/kafklotp/g,'{')
     .replace(/kptrlbn/g, '}')
     .replace(/jgnuag/g,':')    
     .replace(/lkmbng/g, '"')
    
    
      return JSON.parse(unhashed);
    } else {
        return false
    }
}
helpers.getTemplate = function(templateName, data, callback){
    templateName = typeof(templateName) === 'string' && templateName.length > 0 ?
    templateName : false;
    data = typeof(data) =='object' && data!== null ? data : {};
    if(templateName){
        let templatesDir = path.join(__dirname, '/../templates/');
        fs.readFile(templatesDir+templateName+'.html', 'utf8', function(err, str){
            if(!err && str && str.length > 0){
                let finalStr = helpers.interpolate(str,data)
                callback(false, finalStr)
            } else {
                callback('No template found under that name')
            }
        })
    } else {
        callback('A valid template name was not specified');
    }
}

helpers.addUniversalTemp = function(str,data,callback){
    str = typeof(str) =='string' && str.length > 0 ? str : '';
    data = typeof(data) =='object' && data!== null ? data : {};
    helpers.getTemplate('_header', data, function(err,header){
        if(!err && header){
            helpers.getTemplate('_footer', data, function(err,footer){
                if(!err && footer){
                    let fullStr = header+str+footer;
                    callback(false,fullStr);
                } else {
                    callback('Could not find footer')
                }
            })
        } else {
            callback('Could not find header')
        }
    })
}
helpers.interpolate = function(str,data){
    str = typeof(str) =='string' && str.length > 0 ? str : '';
    data = typeof(data) =='object' && data!== null ? data : {};

    for(var key in config.templateGlobals){
        if(config.templateGlobals.hasOwnProperty(key)){
            data['global.'+key] = config.templateGlobals[key];
        }
    }
   
    for(var key2 in data){
        if(data.hasOwnProperty(key2) && typeof(data[key2]=='string')){
            let replace = data[key2];
            let find = '{'+key2+'}';
            str = str.replace(find, replace);
        }
    }
    return str;
}
helpers.getStaticAsset = function(fileName, callback){
    fileName = typeof(fileName)==='string' && fileName.length > 0 ? fileName : false;
    if(fileName){
        let publicDir = path.join(__dirname, '/../public/');
        fs.readFile(publicDir+fileName, function(err, data){
            if(!err && data){
                callback(false, data)
            } else {
                callback('No file can be found')
            }
        })
    } else {
        callback('Filename was not specified');
    }
}
module.exports = helpers
