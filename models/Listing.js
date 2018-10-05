var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var sku = require('shortid');

var ListingSchema = new mongoose.Schema({
	 listingNumber: String,
	 itemSKU: String,
	 source: String,
	 sourceID: {type: String, unique: true},
	 sourcePrice: {type: Number, min: 11},
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
	 price: Number,
	 profit: String
}, {timestamp: true});

ListingSchema.plugin(uniqueValidator, {message: 'listing already exists'});

ListingSchema.methods.getSourcePrice = function(){
	return this.sourcePrice;
};

ListingSchema.methods.getListingPrice = function(){
    return this.price;
};

ListingSchema.methods.updateListingPrice = function(price){
	this.price = price;
};

ListingSchema.methods.setInitialState = function(params){
	this.source = params.source;
        this.sourceID = params.sourceID;
        this.itemSKU = sku.generate();
        this.sourcePrice = params.sourcePrice.replace('$','');
        this.height = (params.height / 100).toFixed(2);
        this.width = (params.width / 100).toFixed(2);
        this.length = (params.length / 100).toFixed(2);
        this.dimensionUnit = params.dimensionUnit.split('-')[1];
        this.weight = (params.weight / 100).toFixed(2);
        this.weightUnit = params.weightUnit.split(' ')[1];
        this.brand = params.brand;
        this.description = params.description;
        this.image = params.image;
        this.title = params.title;
        this.mpn = params.mpn;
        this.ean = params.ean;
};

mongoose.model('listing', ListingSchema);
