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
EbayAccount.methods.getPrivileges = async function(){
    return await this.request("GET", "https://api.ebay.com/sell/account/v1/privilege/")
};

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

mongoose.model('ebayaccount', EbayAccount);