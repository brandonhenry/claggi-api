var mongoose = require('mongoose');
var request = require('request-promise');
var refresh = require('passport-oauth2-refresh');
var Lister = require('../routes/utils/Lister');

var EbayAccount = new mongoose.Schema({
    accessToken: [{type: String, required: [true, 'must have accesstoken']}],
    refreshToken: String,
    username: String,
    balance: String,
    listings: {},
    orders: {},
    lister: Lister
}, {timestamp: true});

EbayAccount.methods.toAuthJSON = function () {
    return {
        username: this.username,
        listings: this.listings,
        orders: this.orders,
        balance: this.balance
    }
};

EbayAccount.methods.setLister = function(lister){
    this.lister = lister;
};

EbayAccount.methods.getLister = function(){
    return this.lister;
};

EbayAccount.methods.setAccessToken = function(accessToken){
    this.accessToken = accessToken;
};

EbayAccount.methods.setRefreshToken = function(refreshToken){
    this.refreshToken = refreshToken;
};

EbayAccount.methods.getAccessToken = function(){
    return this.accessToken;
};

EbayAccount.methods.request = function(method, uri, params){
    var token = this.accessToken;
    var ebayAccount = this;
    var options = {};
    if (params){
        options = params;
    }
    return new Promise(function(resolve, reject){
        request({
            "method": method,
            "uri": uri,
            "json": true,
            "headers": {
                "Authorization": "Bearer " + token
            },
            "body": options
        }).then(function(res){
            resolve(res);
        }).catch(function(err){
            raw = err.message;
            var rawJSON = raw.substr(raw.indexOf("{"), raw.lastIndexOf("}"));
            var error = JSON.parse(rawJSON.replace(/\\/g, "").replace("[","").replace("]",""));
            if (error.errors.message === 'Invalid access token'){
                refresh.requestNewAccessToken('oauth2', ebayAccount.refreshToken , function(err, accessToken, refreshToken) {
                    ebayAccount.setAccessToken(accessToken);
                    ebayAccount.setRefreshToken(refreshToken);
                    ebayAccount.save().then(function(){
                        resolve({error:"Invalid access token. Attempting to refresh token and attempt new request."})
                    }).catch();
                });
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
EbayAccount.methods.createOffer = async function (payload) {
    return await this.request("POST", "https://api.ebay.com/sell/inventory/v1/offer", payload);
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
 * This call is used to convert an unpublished offer into a published offer, or live eBay listing.
 * The unique identifier of the offer (offerId) is passed in at the end of the call URI.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/publishOffer
 */
EbayAccount.methods.publishOffer = async function (productID) {
    return await this.request("POST", "https://api.ebay.com/sell/inventory/v1/offer/" + productID);
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