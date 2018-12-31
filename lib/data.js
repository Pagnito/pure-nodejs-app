const fs = require('fs');
const path = require('path');
const helpers = require('./helpers')
const lib = {};
//base directory
lib.baseDir = path.join(__dirname, '/../.data/');
lib.create = function(dir,file,data, callback){
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx', function(err,fileDescriptor){
        if(!err && fileDescriptor){
            var stringData = JSON.stringify(data,null, 4);
            fs.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false)
                        } else {
                            callback('Error closing new file')
                        }
                    })
                } else {
                    callback('error writing to new file')
                }
            })
        } else {
            callback('could not create new file, it may already exist');
        }
    })
}

lib.read = function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8',function(err,data){
        if(!err){
            let parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData)
        } else {
            callback(err,data)
        }
    })
}
lib.readWithExt = function(dir,file,callback){
    fs.readFile(dir+'/'+file, 'utf8',function(err,data){
        if(!err){
            let parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData)
        } else {
            callback(err,data)
        }
    })
}
lib.update = function(dir,file,data,callback){
    fs.open(lib.baseDir+dir+'/'+file+'.json','a',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            var stringData = JSON.stringify(data,null, 4);
            fs.ftruncate(fileDescriptor, function(err){
                if(!err){
                    fs.writeFile(fileDescriptor, stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor, function(err){
                                if(!err){
                                    callback(false)
                                } else {
                                    callback('err closing the file');
                                }
                            })
                        } else {
                            callback('error writing to existing file')
                        }
                    })
                } else {
                    callback('error truncating file')
                }
            })
        } else {
            callback('Could not open the file for updating, it may not exist yet')
        }
    })
}

lib.delete = function(dir,file,callback){
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        if(!err){
            callback(false);
        } else {
            callback('error deleting file');
        }
    })
}
lib.deleteWithExt = function(dir,file,callback){
    fs.unlink(dir+'/'+file, function(err){
        if(!err){
            callback(false);
        } else {
            callback('error deleting file');
        }
    })
}
lib.list = function(dir,callback){
    fs.readdir(dir, function(err,data){
        if(!err && data && data.lenth>0){
            let trimmedList = [];
            data.forEach(function(filename){
                trimmedList.push(filename.replace('.json', ''));
            })
            callback(false, trimmedList);
        } else {
            callback(err,data)
        }
    })
}
module.exports = lib;