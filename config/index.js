module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
    clientID: process.env.NODE_ENV === 'production' ? process.env.CLIENTID : 'BrandonH-SkuGrid-PRD-066850dff-54313674',
    clientSecret: process.env.NODE_ENV === 'production' ? process.env.CLIENTSECRET : 'PRD-66850dfff6e9-feec-4725-8aed-13b2'
};
