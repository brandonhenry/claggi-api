var moongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Listing = require('Listing');
var Order = require('Order');
var User = require('User');
var request = require('request-promise');

var EbayAccount = new mongoose.Schema({
    accessToken: {type: String, required: [true, 'must have accesstoken']},
    refreshToken: {type: String, required: [true, 'must have refreshtoken']},
    username: String,
    user: User,
    balance: String,
    listings: {},
    orders: {},
});

EbayAccount.methods.toJSONFor = function (user) {
    return {
        listings: this.listings,
        orders: this.orders,
        user: user.toAuthJSON(),
        balance: this.balance
    }
};

EbayAccount.methods.request = function(method, uri, params){
    return request({
        "method": method,
        "uri": uri,
        "json": true,
        "headers": {
            "Authorization": "Bearer " + this.accessToken
        }
    })
};

EbayAccount.methods.grabInfo = function(){

};

EbayAccount.methods.updateInfo = function () {

};

EbayAccount.methods.uri = function (uri, params) {

};

EbayAccount.methods.getEbayListings = function (params) {

};

/**
 * 	Retrieves a seller's account privileges (e.g., selling limits and registration status).
 *
 * 	https://developer.ebay.com/api-docs/sell/account/resources/methods
 */
EbayAccount.methods.getPrivileges = function(){
    this.request("GET", "https://api.ebay.com/sell/account/v1/privilege/").then(function(res){
        return res.body;
    })
};

/**
 * 	Search for and retrieve the details of multiple orders.
 *
 * 	https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrders
 */
EbayAccount.methods.getOrders = function () {
    this.request("GET", "https://api.ebay.com/sell/fulfillment/v1/order").then(function (res) {
        return res.body;
    });
};

mongoose.model('ebayaccount', EbayAccount);