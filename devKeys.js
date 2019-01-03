let dev = {
    httpPort:4000,
    httpsPort:4001,
    envName: 'development',
    hashSecret: 'thisisasecret',
    postgresURL: 'postgres://uvsvkzlx:zz8pJ0LdX-3IWvxwHOKJclrHVq4Ba0CE@baasu.db.elephantsql.com:5432/uvsvkzlx',
    templateGlobals: {
      companyName: 'Jinko',
      yearCreated: '2018',
      baseUrl: 'http://localhost:4000/'
    }
  }
  module.exports = dev;