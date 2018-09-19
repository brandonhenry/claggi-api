var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var sku = require('shortid');

var ListingSchema = new mongoose.Scheme({
	sku: String,
	quantity: Number,
	sourcePrice: Number,
	salePrice: Number
}, {timestamp: true});

ListingSchema.plugin(uniqueValidator, {message: 'listing already exists'});

mongoose.model('Listing', ListingSchema);