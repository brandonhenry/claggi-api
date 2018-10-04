var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Repricer = require('../routes/utils/Repricer');
// var sku = require('shortid');

var ListingSchema = new mongoose.Schema({
	 listingNumber: String,
	 itemSKU: String,
	 source: String,
	 sourceID: {type: String, unique: true},
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

ListingSchema.methods.getSourcePrice = function(){
	return this.sourcePrice;
};

ListingSchema.methods.updatePrice = function(){
	var repricer = new Repricer();
	this.price = repricer.calculate(this);
};

ListingSchema.methods.setInitialState = function(params){
	this.source = params.source;
        this.sourceID = params.sourceID;
        this.sourcePrice = params.sourcePrice;
        this.height = params.height;
        this.width = params.width;
        this.length = params.length;
        this.dimensionUnit = params.dimensionUnit;
        this.weight = params.weight;
        this.weightUnit = params.weightUnit;
        this.brand = params.brand;
        this.description = params.description;
        this.image = params.image;
        this.title = params.title;
        this.mpn = params.mpn;
        this.ean = params.ean;
};

mongoose.model('listing', ListingSchema);
