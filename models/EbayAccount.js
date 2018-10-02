var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Listing = mongoose.model('listing');
var Order = mongoose.model('order');
var User = mongoose.model('user');
var request = require('request-promise');

var EbayAccount = new mongoose.Schema({
    accessToken: {type: String, required: [true, 'must have accesstoken']},
    refreshToken: String,
    username: String,
    user: String,
    balance: String,
    listings: {},
    orders: {}
}, {timestamp: true});

EbayAccount.methods.toJSONFor = function (user) {
    return {
        listings: this.listings,
        orders: this.orders,
        balance: this.balance
    }
};

EbayAccount.methods.request = function(method, uri, params){
    return new Promise(function(resolve, reject) {
        request({
            "method": method,
            "uri": uri,
            "json": true,
            "headers": {
                "Authorization": "Bearer " + this.accessToken
            }
        }).then(function(res){
            resolve(res);
        }).catch(function(err){
            reject(err);
        })
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
        this.request("GET", "https://api.ebay.com/sell/fulfillment/v1/order");
};

mongoose.model('ebayaccount', EbayAccount);