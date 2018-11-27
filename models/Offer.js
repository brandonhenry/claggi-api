var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var sku = require('shortid');
var request = require('request-promise');
var Description = require('../routes/utils/Description');

var OfferSchema = new mongoose.Schema({
    listingNumber: String,
    itemSKU: {type: String, unique: true},
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
    profit: Number,
    inventoryItemMade: Boolean,
    offerMade: Boolean,
    published: Boolean,
    created: Boolean,
    offerID: String
}, {timestamp: true});

OfferSchema.plugin(uniqueValidator, {message: 'listing already exists'});

OfferSchema.methods.toAuthJSON = function () {
    return {
        sourcePrice: this.sourcePrice,
        price: this.price,
        id: this.sourceID,
        offerID: this.offerID
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
    return this.price && this.itemSKU && this.inventoryItemMade && !this.offerMade;
};

OfferSchema.methods.isPublished = function (){
    return this.published;
};

OfferSchema.methods.isOfferCreated = function (){
    return this.offerMade;
};

OfferSchema.methods.isInventoryItemCreated = function (){
    return this.inventoryItemMade;
};

OfferSchema.methods.updateListingPrice = function (price) {
    this.price = price;
};

OfferSchema.methods.updateOfferLocation = async function(){
  if (this.offerMade){
      return await this.request("PUT", "https://api.ebay.com/sell/inventory/v1/offer/" + this.offerID,
          {"merchantLocationKey" : this.ebayAccount.merchantLocationKey})
  }
};

OfferSchema.methods.getTitle = function(){
    return this.title;
};

OfferSchema.methods.formatDescription = function () {
    return Description.generate(this);
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

OfferSchema.methods.toOfferJSON = function (merchantLocationKey) {
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
        "merchantLocationKey": `"${merchantLocationKey}"`,
        "pricingSummary":
            {
                /* PricingSummary */
                "price":
                    {
                        /* Amount */
                        "currency": "USD",
                        "value": this.price
                    }
            },
        "quantityLimitPerBuyer": 3,
        "sku": this.itemSKU,
        "marketplaceId": "EBAY_US",
        "format": "FIXED_PRICE"
    }
};


OfferSchema.methods.toInventoryItemJSON = function (merchantLocationKey) {
    var dimensionEnumValue = "";
    if (this.dimensionUnit === "inches"){
        dimensionEnumValue = "INCH";
    }
    return {
        /* InventoryItem */
        "availability":
            {
                /* Availability */
                "pickupAtLocationAvailability" : [
                    { /* PickupAtLocationAvailability */
                        "availabilityType" : "OUT_OF_STOCK",
                        "merchantLocationKey" : `"${merchantLocationKey}"`,
                        "quantity" : 0
                    }
                ],
                "shipToLocationAvailability":
                    {
                        /* ShipToLocationAvailability */
                        "quantity": 3
                    }
            },
        "condition": "NEW",
        "packageWeightAndSize":
            {
                /* PackageWeightAndSize */
                "dimensions":
                    {
                        /* Dimension */
                        "height": this.height,
                        "length": this.length,
                        "unit": dimensionEnumValue,
                        "width": this.width
                    },
                "weight":
                    {
                        /* Weight */
                        "unit": "POUND",
                        "value": this.weight
                    }
            },
        "product":
            {
                /* Product */
                "brand": this.brand,
                "imageUrls": [
                    this.image
                ],
                "mpn": this.mpn,
                "title": this.title,
                "ean": [
                    this.ean
                ]
            }
    }
};

mongoose.model('offers', OfferSchema);
