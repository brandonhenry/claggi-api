var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;
var clientID = require('../config').clientID;
var clientSecret = require('../config').clientSecret;
var scope = ["https://api.ebay.com/oauth/api_scope", "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly", "https://api.ebay.com/oauth/api_scope/sell.marketing", "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly", "https://api.ebay.com/oauth/api_scope/sell.inventory", "https://api.ebay.com/oauth/api_scope/sell.account.readonly", "https://api.ebay.com/oauth/api_scope/sell.account", "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly", "https://api.ebay.com/oauth/api_scope/sell.fulfillment", "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly"];
// Set the configuration settings
const credentials = {
    client: {
        id: clientID,
        secret: clientSecret
    },
    auth: {
        tokenHost: 'https://api.ebay.com/identity/v1/oauth2/token',
		authorizeHost: 'https://signin.ebay.com/authorize'
    }
};

const oauth2 = require('simple-oauth2').create(credentials);


var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
	email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
	ebayUsername: String,
	ebayToken: String,
	hash: String,
	salt: String
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: 'is already taken'});

UserSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')

};

UserSchema.methods.validPassword = function(password){
	var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
	return this.hash === hash;
};

UserSchema.methods.generateJWT = function(){
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 60);

	return jwt.sign({
		id: this._id,
		username: this.username,
		exp: parseInt(exp.getTime() / 1000),
	}, secret)
};

UserSchema.methods.toAuthJSON = function(){
	return {
		username: this.username,
		email: this.email,
		token: this.generateJWT(),
		ebayUsername: this.ebayUsername,
		ebayToken: this.generateAccessToken()
	}
};

UserSchema.methods.setEbayToken = function(){

};

UserSchema.methods.generateAccessToken = async function () {


// Authorization oauth2 URI
    const authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri: 'Brandon_Henry-BrandonH-SkuGri-akmrj',
        scope: scope, // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
        state: ''
    });

// Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
    res.redirect(authorizationUri);

// Get the access token object (the authorization code is given from the previous step).
    const tokenConfig = {
        code: '<code>',
        redirect_uri: 'Brandon_Henry-BrandonH-SkuGri-akmrj',
        scope: scope, // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
    };

// Save the access token
    try {
        const result = await oauth2.authorizationCode.getToken(tokenConfig);
        const accessToken = oauth2.accessToken.create(result);
        console.log(accessToken);
    } catch (error) {
        console.log('Access Token Error', error.message);
    }

};

mongoose.model('User', UserSchema);
