var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	username: String,
	email: String,
	ebayUsername: String,
	ebayToken: String,
	hash: String
}, {timestamps: true});

mongoose.model('User', UserSchema);
