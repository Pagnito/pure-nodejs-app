const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events{}
const e = new _events();
const os = require('os');
const v8 = require('v8');

var cli = {};
//cli gui aligners
cli.verticalSpace = function(lines){
    lines = typeof(lines)==='number' && lines > 0 ? lines : 1;
    for(let i=0; i<lines; i++){
        console.log('')
    }
}
cli.horizontalLine = function(){
    let width = process.stdout.columns;
    let line = '';
    for(let i=0; i<width; i++){
        line+='-';
    }
    console.log(line);
}

cli.centered = function(str){
    str = typeof(str)=='string' && str.trim().length > 0 ? str.trim() : '';
    let width = process.stdout.columns;
    let leftPadding = Math.floor((width-str.length)/2);
    let line = '';
    for(let i=0; i< leftPadding; i++){
        line+=' ';
    }
    line+=str;
    console.log(line);
}
//input handlers

e.on('exit', function(str){
    cli.responders.exit();
})
e.on('help', function(str){
    cli.responders.help();
})
e.on('more movie info', function(input,movie){
    cli.responders.moreMovieInfo(movie);
})
e.on('more user info', function(input, user){
    cli.responders.moreUserInfo(user);
})
e.on('list movies', function(str){
    cli.responders.listMovies();
})
e.on('list users', function(str){
    cli.responders.listUsers();
})
e.on('stats', function(str){
    cli.responders.stats();
})
//responders
cli.responders = {}
cli.responders.exit = function(){
    process.exit(0);
}
cli.responders.help = function(){
    let commands = {
        'help': 'Get a list of commands and its description',
        'exit': 'Kill the Cli and the rest of the app',
        'list movies':'Get a list of movies',
        'list users': 'Get a List of users signed up for this app',
        'more user info --(user)': ' Get details on the specified user', 
        'more movie info --(movie)': ' Get details on the specified movie', 
        'stats': 'Get details about the operating system'     
    }
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    for(let key in commands){
        if(commands.hasOwnProperty(key)){
            let value = commands[key];
            let line = '\x1b[33m'+key+'\x1b[0m';
            let padding = 60 - line.length;
            for(let i=0; i<padding; i++){
                line+=' ';
            }
            line+=value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace(1);
    cli.horizontalLine();
}
cli.responders.stats = function(){
    let stats = {
        'Load Average':os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Free Memory': os.freemem(),
        'Current Malloced Memory':v8.getHeapSpaceStatistics().malloced_memory,
        'Peak Malloced Memory': v8.getHeapSpaceStatistics().peak_malloced_memory,
        'Allocated Heap Used':'',
        'Available Heap Allocated(%)':Math.floor((v8.getHeapSpaceStatistics().used_heap_size / v8.getHeapSpaceStatistics().total_heap_size)*100) ,
        'Uptime': os.uptime()+' seconds'
    }
    cli.horizontalLine();
    cli.centered('SYSTEM STATS');
    cli.horizontalLine();
    cli.verticalSpace(2);
    for(let key in stats){
        if(stats.hasOwnProperty(key)){
            let value = stats[key];
            let line = '\x1b[33m'+key+'\x1b[0m';
            let padding = 60 - line.length;
            for(let i=0; i<padding; i++){
                line+=' ';
            }
            line+=value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace(1);
    cli.horizontalLine();

}
cli.responders.listMovies = function(){
    console.log('Fetching Movies');
}
cli.responders.listUsers = function(){
    console.log('Fetching Users');
}
cli.responders.moreMovieInfo = function(movie){
    console.log('Fetching Movie info on '+movie);
}
cli.responders.moreUserInfo = function(user){
    console.log('Fetching User info on '+user);
}

cli.processInput = function(str){
    str = typeof(str) ==='string' && str.trim().length > 0 ? str.trim() : false;
    if(str){
        var uniqueInputs = [
            'help',
            'list users',
            'more user info',
            'list movies',
            'more movie info',
            'exit',
            'stats'
        ]

        let matchFound = false;
        let counter = 0;
        uniqueInputs.some(function(input){
            if(str.toLowerCase().indexOf(input)>-1){
                matchFound=true;
                
                e.emit(input,str)
                return true;
            }
        });
        if(!matchFound){
            console.log("Sorry try again")
        }
    }
}

cli.init = function(){
    console.log('\x1b[34m%s\x1b[0m',"Cli is running");
    let _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '',
    })

    _interface.prompt();
    _interface.on('line', function(str){
        cli.processInput(str); 
        _interface.prompt(); 
    });
    _interface.on('close', function(){
        process.exit(0);
    })

}
module.exports = cli;