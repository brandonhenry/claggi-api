var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
// var sku = require('shortid');

var ListingSchema = new mongoose.Schema({
	 listingNumber: String,
	 itemSKU: String,
	 source: String,
	 sourceID: String,
	 sourcePrice: String,
	 repriceMargin: String,
	 availability: String,
	 quantity: Number,
	 height: Number,
	 width: Number,
	 length: Number,
	 dimensionUnit: String,
	 weight: Number,
	 weightUnit: String,
	 brand: String,
	 description: String,
	 image: String,
	 title: String,
	 mpn: String,
	 upc: String,
	 ean: String,
	 paymentPolicy: String,
	 returnPolicy: String,
	 shippingPolicy: String,
	 price: String,
	 profit: String
}, {timestamp: true});

ListingSchema.plugin(uniqueValidator, {message: 'listing already exists'});

ListingSchema.methods.generateSKU = function(){
	this.itemSKU = "";
};

ListingSchema.methods.calculatePrice = function(){

};

ListingSchema.methods.updatePrice = function(){

};

mongoose.model('listing', ListingSchema);
