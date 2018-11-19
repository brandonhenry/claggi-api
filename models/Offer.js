var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var sku = require('shortid');
var request = require('request-promise');
var Description = require('../routes/utils/Description');

var OfferSchema = new mongoose.Schema({
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
    productDetails: [],
    categoryId: String,
    image: String,
    title: String,
    mpn: String,
    upc: String,
    ean: String,
    paymentPolicy: String,
    returnPolicy: String,
    shippingPolicy: String,
    fulfillmentPolicy: String,
    listingID: String,
    price: Number,
    profit: String,
    published: Boolean,
    created: Boolean,
    offerID: String
}, {timestamp: true});

OfferSchema.plugin(uniqueValidator, {message: 'listing already exists'});

OfferSchema.methods.toAuthJSON = function () {
    return {
        sourcePrice: this.sourcePrice,
        price: this.price,
        id: this.sourceID
    }
};

OfferSchema.methods.getSourcePrice = function () {
    return this.sourcePrice;
};

OfferSchema.methods.getListingPrice = function () {
    return this.price;
};

OfferSchema.methods.getImage = function () {
    return this.image;
};

OfferSchema.methods.setPublished = function(isPublished){
    this.published = isPublished;
};

OfferSchema.methods.setCreated = function(isCreated){
    this.created = isCreated;
};

OfferSchema.methods.setOfferID = function(offerID){
    this.offerID = offerID;
};

OfferSchema.methods.getOfferID = function(){
    return this.offerID;
};

OfferSchema.methods.setListingID = function(listingID){
    this.listingID = listingID;
};

OfferSchema.methods.canList = function () {
    return this.price && this.itemSKU;
};

OfferSchema.methods.isPublished = function (){
    return this.published;
};

OfferSchema.methods.isCreated = function (){
    return this.created;
};

OfferSchema.methods.updateListingPrice = function (price) {
    this.price = price;
};

OfferSchema.methods.getTitle = function(){
    return this.title;
};

OfferSchema.methods.formatDescription = function () {
    return Description.generate(this);
};

OfferSchema.methods.setInitialState = function (params) {
    this.source = params.source;
    this.sourceID = params.sourceID;
    this.itemSKU = sku.generate();
    this.ebayAccount = params.ebayAccount;
    this.sourcePrice = params.sourcePrice.replace('$', '');
    this.height = (params.height / 100).toFixed(2);
    this.width = (params.width / 100).toFixed(2);
    this.length = (params.length / 100).toFixed(2);
    this.productDetails = params.productDetails;
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
    this.published = params.published;
    this.created = params.created;
};

OfferSchema.methods.configure = function (params) {
    this.quantity = params.quantity;
};

OfferSchema.methods.getProductDescription = function () {
    return this.description;
};

OfferSchema.methods.getProductDetails = function () {
    var productDetails = '';
    this.productDetails.forEach(function (detail) {
        productDetails += `<li>${detail}</li>\n`
    });
    return productDetails;
};

OfferSchema.methods.toRequestPayload = function () {
    return {
        /* EbayOfferDetailsWithKeys */
        "availableQuantity": this.quantity,
        "categoryId": this.categoryId,
        "listingDescription": this.formatDescription(),
        "listingPolicies":
            {
                /* ListingPolicies */
                "paymentPolicyId": this.paymentPolicy,
                "returnPolicyId": this.returnPolicy,
                "fulfillmentPolicyId": this.fulfillmentPolicy,
            },
        "merchantLocationKey": "string",
        "pricingSummary":
            {
                /* PricingSummary */
                "price":
                    {
                        /* Amount */
                        "value": this.price,
                        "currency": "USD"
                    }
            },
        "quantityLimitPerBuyer": 3,
        "sku": this.itemSKU,
        "marketplaceId": "EBAY_US",
        "format": "FIXED_PRICE"
    }
};

var getCategory = function (title) {
    var token = this.ebayAccount.getAccessToken();
    request({
        "method": 'GET',
        "uri": 'https://api.ebay.com/commerce/taxonomy/v1_beta/get_default_category_tree_id?\n' +
        'marketplace_id=EBAY_US',
        "json": true,
        "headers": {
            "Authorization": "Bearer " + token
        }
    }).then(function (res) {
        var categoryTreeID = res.categoryTreeID;
        var uri = 'https://api.ebay.com/commerce/taxonomy/v1_beta/category_tree/'
            + categoryTreeID
            + '/get_category_suggestions?q='
            + title;

        request({
            "method": 'GET',
            "uri": uri,
            "json": true
        }).then(function (results) {
            return results.categorySuggestions[0].category.categoryId;
        }).catch()
    }).catch()
};

mongoose.model('offers', OfferSchema);
