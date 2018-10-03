var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Listing = mongoose.model('listing');
var Order = mongoose.model('order');
var User = mongoose.model('user');
var request = require('request-promise');
var refresh = require('passport-oauth2-refresh');

var EbayAccount = new mongoose.Schema({
    accessToken: {type: String, required: [true, 'must have accesstoken']},
    refreshToken: String,
    username: String,
    user: String,
    balance: String,
    listings: {},
    orders: {}
}, {timestamp: true});

EbayAccount.methods.toAuthJSON = function () {
    return {
        listings: this.listings,
        orders: this.orders,
        balance: this.balance
    }
};

EbayAccount.methods.setAccessToken = function(accessToken){
    this.accessToken = accessToken;
};

EbayAccount.methods.request = function(method, uri, params){
    var token = this.accessToken;
    var ebayAccount = this;
    return new Promise(function(resolve, reject){
        request({
            "method": method,
            "uri": uri,
            "json": true,
            "headers": {
                "Authorization": "Bearer " + token
            }
        }).then(function(res){
            resolve(res);
        }).catch(function(err){
            raw = err.message;
            var rawJSON = raw.substr(raw.indexOf("{"), raw.lastIndexOf("}"));
            var error = JSON.parse(rawJSON.replace(/\\/g, "").replace("[","").replace("]",""));
            if (error.errors.message === 'Invalid access token'){
                refresh.requestNewAccessToken('oauth2', ebayAccount.refreshToken , function(err, accessToken, refreshToken) {
                    ebayAccount.setAccessToken(accessToken);
                });
                resolve({error:"tokenRefreshed"})
            }
            resolve(error);
        })
    });
};

//-----------------------------------------FULFILLMENT-----------------------------------------//

/**
 * 	Search for and retrieve the details of multiple orders.
 *
 * 	https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrders
 */
EbayAccount.methods.getOrders = async function () {
        var orders = await this.request("GET", "https://api.ebay.com/sell/fulfillment/v1/order");
        this.orders = orders;
        return orders
};

//-------------------------------------------ACCOUNT-------------------------------------------//

/**
 * 	Retrieves a seller's account privileges (e.g., selling limits and registration status).
 *
 * 	https://developer.ebay.com/api-docs/sell/account/resources/methods
 */
EbayAccount.methods.getPrivileges = async function(){
    return await this.request("GET", "https://api.ebay.com/sell/account/v1/privilege/")
};

//-------------------------------------------ANALYTICS-------------------------------------------//

/**
 * This call retrieves all the profiles for the associated seller.
 *
 * https://developer.ebay.com/api-docs/sell/analytics/resources/seller_standards_profile/methods/findSellerStandardsProfiles#_samples
 */
EbayAccount.methods.getSellerInfo = async function(){
    return await this.request("GET", "https://api.ebay.com/sell/analytics/v1/seller_standards_profile")
};

/**
 * 	Generates a seller's traffic report based on specified days or listings.
 * 	You can specify the metrics to include in the report and use filters to refine the data returned.
 *
 * https://developer.ebay.com/api-docs/sell/analytics/resources/traffic_report/methods/getTrafficReport
 */
EbayAccount.methods.getTrafficReport = async function(params){
    var uri = 'https://api.ebay.com/sell/analytics/v1/traffic_report?' +
                                                         'dimension=' +
                                                      params.dimension;

    return await this.request("GET", uri)
};

//-------------------------------------------INVENTORY-------------------------------------------//

/**
 * 	This call retrieves all inventory item records defined for the seller's account.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems
 */
EbayAccount.methods.getInventoryItems = async function () {
    var listings = await this.request("GET", "https://api.ebay.com/sell/inventory/v1/inventory_item");
    this.listings = listings;
    return listings
};

/**
 * This call creates an offer for a specific inventory item on a specific eBay marketplace.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/createOffer
 */
EbayAccount.methods.createOffer = async function () {
    return await this.request("POST", "https://api.ebay.com/sell/inventory/v1/offer");
};

/**
 * This call updates an existing offer. An existing offer may be in published state (active eBay listing),
 * or in an unpublished state and yet to be published with the publishOffer call.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/updateOffer
 */
EbayAccount.methods.updateOffer = async function (productID) {
    return await this.request("PUT", "https://api.ebay.com/sell/inventory/v1/offer/" + productID);
};

/**
 * This call is used to retrieve the expected listing fees for up to 250 unpublished offers.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getListingFees
 */
EbayAccount.methods.getListingFees = async function () {
    return await this.request("POST", "https://api.ebay.com/sell/inventory/v1/offer/get_listing_fees");
};

mongoose.model('ebayaccount', EbayAccount);