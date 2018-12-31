//container for all environments
var envs = {}

envs.dev = {
  httpPort:4000,
  httpsPort:4001,
  envName: 'development',
  hashSecret: 'thisisasecret',
  maxChecks: 5,
  templateGlobals: {
    companyName: 'Jinko',
    yearCreated: '2018',
    baseUrl: 'http://localhost:4000/'
  }
}
envs.prod = {
  httpPort:5000,
  httpsPort:5001,
  envName: 'production',
  hashSecret: 'thisisasecret', 
  templateGlobals: {
    companyName: 'Jinko',
    yearCreated: '2018',
    baseUrl: 'http://localhost:5000/'
  }
}
if(process.env.NODE_ENV==='production'){
  module.exports = envs.prod;
} else {
  module.exports = envs.dev;
}
