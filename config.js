//container for all environments

let baseUrl = process.env.NODE_ENV == 'production' ? 'https://fast-journey-14415.herokuapp.com/' : 'http://localhost:4000/';
let env = {
  httpPort:4000,
  httpsPort:4001,
  envName: 'development',
  hashSecret: 'thisisasecret',
  maxChecks: 5,
  templateGlobals: {
    companyName: 'Jinko',
    yearCreated: '2018',
    baseUrl: baseUrl
  }
}
module.exports = env;
