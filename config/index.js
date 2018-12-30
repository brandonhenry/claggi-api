var info = require('../config/credentials.js');
module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
    clientID: process.env.NODE_ENV === 'production' ? process.env.CLIENTID : info.id,
    clientSecret: process.env.NODE_ENV === 'production' ? process.env.CLIENTSECRET : info.secret
};
