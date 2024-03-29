var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;
var Schema = mongoose.Schema;


var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
	email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
	ebayToken: String,
	ebayRefreshToken: String,
	ebayAccounts: [{ type: Schema.Types.ObjectId, ref: 'ebayaccount' }],
	sessionID: String,
	hash: String,
	salt: String,
}, {timestamps: true, usePushEach: true});

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

UserSchema.methods.getUsername = function(){
    return this.username;
};

UserSchema.methods.removeAccess = function(){
    this.ebayToken = null;
	this.ebayRefreshToken = null;
};

UserSchema.methods.toAuthJSON = function(){
	return {
		username: this.username,
		email: this.email,
		token: this.generateJWT(),
		ebayAccounts: this.ebayAccounts,
		ebayUsername: this.ebayUsername,
		ebayToken: this.ebayToken,
		refreshToken: this.ebayRefreshToken,
		sessionID: this.sessionID
	}
};

UserSchema.methods.toProfileJSONFor = function(user){
    return {
        username: this.username,
        bio: this.bio,
        image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
        following: false
    }
};

UserSchema.methods.setEbayToken = function(token, refreshToken){
		this.ebayToken = token;
		this.ebayRefreshToken = refreshToken;
};

UserSchema.methods.getEbayToken = function(){
	return {accessToken:this.ebayToken, refreshToken:this.ebayRefreshToken};
};

UserSchema.methods.addEbayAccount = function(account){
    this.ebayAccounts = this.ebayAccounts.concat([account]);
};

UserSchema.methods.removeEbayAccounts = function(){
    this.ebayAccounts = [];
};

UserSchema.methods.getEbayAccounts = function(){
	return this.ebayAccounts;
};

mongoose.model('user', UserSchema);
