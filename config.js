//container for all environments
const dev = require('./devKeys');


let env = {
  httpPort:4000,
  httpsPort:4001,
  envName: 'development',
  hashSecret: 'thisisasecret',
  postgresURL: process.env.POSTGRES_URL,
  templateGlobals: {
    companyName: 'Jinko',
    yearCreated: '2018',
    baseUrl: 'https://fast-journey-14415.herokuapp.com/'
  }
}

if(process.env.NODE_ENV === 'production'){
  module.exports = env;
} else {
  module.exports = dev;
}

