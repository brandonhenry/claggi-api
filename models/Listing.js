var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var sku = require('shortid');
var request = require('request-promise');
var EbayAccount = mongoose.model('ebayaccount');

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
    categoryId: Number,
	 image: String,
	 title: String,
	 mpn: String,
	 upc: String,
	 ean: String,
	 paymentPolicy: String,
	 returnPolicy: String,
	 shippingPolicy: String,
	 price: Number,
	 profit: String,
    ebayAccount: EbayAccount
}, {timestamp: true});

ListingSchema.plugin(uniqueValidator, {message: 'listing already exists'});

ListingSchema.methods.toAuthJSON = function(){
	return {
		sourcePrice: this.sourcePrice,
		price: this.price,
		id: this.sourceID
	}
};

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
        this.ebayAccount = params.ebayAccount;
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
        this.categoryId = getCategory(this.title);
        this.mpn = params.mpn;
        this.ean = params.ean;
};

ListingSchema.methods.configure = function(params){
    this.quantity = params.quantity;

};

var getCategory = function(title){
    var token = this.ebayAccount.getAccessToken();
    request({
        "method": 'GET',
        "uri": 'https://api.ebay.com/commerce/taxonomy/v1_beta/get_default_category_tree_id?\n' +
            'marketplace_id=EBAY_US',
        "json": true,
        "headers": {
            "Authorization": "Bearer " + token
        }
    }).then(function(res){
        var categoryTreeID = res.categoryTreeID;
        var uri = 'https://api.ebay.com/commerce/taxonomy/v1_beta/category_tree/'
            + categoryTreeID
            + '/get_category_suggestions?q='
            + title;

        request({
            "method": 'GET',
            "uri": uri,
            "json": true
        }). then(function(results){
            return results.categorySuggestions[0].category.categoryId;
        }).catch()
    }).catch()
};

mongoose.model('listing', ListingSchema);
