var mongoose = require('mongoose');
var request = require('request-promise');
var Lister = require('../routes/utils/Lister');
var AccountValidator = require('../routes/utils/AccountValidator');

var EbayAccount = new mongoose.Schema({
    accessToken: [{type: String, required: [true, 'must have accesstoken']}],
    refreshToken: String,
    username: String,
    balance: String,
    listings: {},
    orders: {},
    lister: [{type: Lister}],
    merchantLocationKey: String,
    fulfillmentPolicies: [],
    paymentPolicies: [],
    returnPolicies: [],
    activeFulfillment: String,
    activeReturn: String,
    activePayment: String,
    defaultCategoryTreeId: String

}, {timestamp: true});

EbayAccount.methods.toAuthJSON = function () {
    return {
        username: this.username,
        listings: this.listings,
        orders: this.orders,
        balance: this.balance,
        fulfillmentPolicies: this.fulfillmentPolicies,
        paymentPolicies: this.paymentPolicies,
        returnPolicies: this.returnPolicies,
        activePayment: this.activePayment,
        activeFulfillment: this.activeFulfillment,
        activeReturn: this.activeReturn,
        defaultCategoryTreeId: this.defaultCategoryTreeId,
        merchantLocationKey: this.merchantLocationKey
    }
};

EbayAccount.methods.setLister = function (lister) {
    this.lister = this.lister.concat([lister]);
};

EbayAccount.methods.getLister = function () {
    return this.lister;
};

EbayAccount.methods.setAccessToken = function (accessToken) {
    this.accessToken = accessToken;
};

EbayAccount.methods.setRefreshToken = function (refreshToken) {
    this.refreshToken = refreshToken;
};

EbayAccount.methods.getAccessToken = function () {
    return this.accessToken;
};

EbayAccount.methods.getMerchantLocationKey = function () {
    return this.merchantLocationKey;
};

EbayAccount.methods.setFulfillmentPolicy = async function (policyId) {
    this.activeFulfillment = policyId;
};

EbayAccount.methods.setLocation = function (location) {
    this.merchantLocationKey = location;
    this.save((res) => {
    })
};

EbayAccount.methods.setDefaultCategory = async function () {
    return this.request('GET', "https://api.ebay.com/commerce/taxonomy/v1_beta/get_default_category_tree_id?marketplace_id=EBAY_US")
        .then((res) => {
            console.log(res);
            this.defaultCategoryTreeId = res.categoryTreeId;
            this.save(() => {
                return true
            })
        })
};

EbayAccount.methods.setReturnPolicy = async function (policyId) {
    this.activeReturn = policyId;
};

EbayAccount.methods.setPaymentPolicy = async function (policyId) {
    this.activePayment = policyId;
};

EbayAccount.methods.getPaymentPolicy = function () {
    return this.activePayment;
};

EbayAccount.methods.getReturnPolicy = function () {
    return this.activeReturn;
};

EbayAccount.methods.getFulfillmentPolicy = function () {
    return this.activeFulfillment;
};

EbayAccount.methods.addPolicy = async function (type, policy) {
    switch (type) {
        case "fulfillment":
            this.fulfillmentPolicies = this.fulfillmentPolicies.concat(policy);
            break;
        case "payment":
            this.paymentPolicies = this.paymentPolicies.concat(policy);
            break;
        case "return":
            this.returnPolicies = this.fulfillmentPolicies.concat(policy);
            break;
    }
    this.save(() => {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    });
};

EbayAccount.methods.request = async function (method, uri, params) {
    var token = this.accessToken;
    var options = {};
    if (params) {
        options = params;
    }
    return new Promise(function (resolve, reject) {
        var i = this;
        request({
            "method": method,
            "uri": uri,
            "json": true,
            "headers": {
                "Authorization": "Bearer " + token,
                "Content-Language": "en-US"
            },
            "body": options
        }).then((res) => {
            resolve(res);
        }).catch((err) => {
            raw = err.message;
            var rawJSON = raw.substr(raw.indexOf("{"), raw.lastIndexOf("}"));
            try {
                var error = JSON.parse(rawJSON.replace(/\\/g, "").replace("[", "").replace("]", ""));
            } catch (err) {
                console.log(rawJSON);
                return resolve({error: rawJSON});
            }

            if (error.errors.message === 'Invalid access token') {
                AccountValidator.refreshAccessToken(this.refreshToken).then((success) => {
                    if (success) {
                        this.accessToken = success.accessToken;
                        this.refreshToken = success.refreshToken;
                        this.save(function(){this.request(method, uri, params)});
                    }
                }).catch((err)=>{console.log(err)});
            }
            resolve(error);
        })
    });
};

//-----------------------------------------FULFILLMENT-----------------------------------------//

/**
 *    Search for and retrieve the details of multiple orders.
 *
 *    https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrders
 */
EbayAccount.methods.getOrders = async function () {
    var orders = await this.request("GET", "https://api.ebay.com/sell/fulfillment/v1/order");
    this.orders = orders;
    return orders
};

//-------------------------------------------ACCOUNT-------------------------------------------//

/**
 *    Retrieves a seller's account privileges (e.g., selling limits and registration status).
 *
 *    https://developer.ebay.com/api-docs/sell/account/resources/methods
 */
EbayAccount.methods.getPrivileges = async function () {
    return await this.request("GET", "https://api.ebay.com/sell/account/v1/privilege/")
};

/**
 *    This method retrieves all the fulfillment policies configured for the marketplace you specify.
 *
 *    https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies
 */
EbayAccount.methods.getFulfillmentPolicies = async function () {
    return await this.request("GET", "https://api.ebay.com/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_US")
};


/**
 *    This method retrieves all the payment policies configured for the marketplace you specify.
 *
 *    https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies
 */
EbayAccount.methods.getPaymentPolicies = async function () {
    return await this.request("GET", "https://api.ebay.com/sell/account/v1/payment_policy?marketplace_id=EBAY_US")
};


/**
 *    This method retrieves all the return policies configured for the marketplace you specify .
 *
 *    https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/getReturnPolicies
 */
EbayAccount.methods.getReturnPolicies = async function () {
    return await this.request("GET", "https://api.ebay.com/sell/account/v1/return_policy?marketplace_id=EBAY_US")
};


//-------------------------------------------ANALYTICS-------------------------------------------//

/**
 * This call retrieves all the profiles for the associated seller.
 *
 * https://developer.ebay.com/api-docs/sell/analytics/resources/seller_standards_profile/methods/findSellerStandardsProfiles#_samples
 */
EbayAccount.methods.getSellerInfo = async function () {
    return await this.request("GET", "https://api.ebay.com/sell/analytics/v1/seller_standards_profile")
};

/**
 *    Generates a seller's traffic report based on specified days or listings.
 *    You can specify the metrics to include in the report and use filters to refine the data returned.
 *
 * https://developer.ebay.com/api-docs/sell/analytics/resources/traffic_report/methods/getTrafficReport
 */
EbayAccount.methods.getTrafficReport = async function (params) {
    var uri = 'https://api.ebay.com/sell/analytics/v1/traffic_report?' +
        'dimension=' +
        params.dimension;

    return await this.request("GET", uri)
};

//-------------------------------------------INVENTORY-------------------------------------------//

/**
 *    This call retrieves all inventory item records defined for the seller's account.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems
 */
EbayAccount.methods.getInventoryItems = async function () {
    return await this.request("GET", "https://api.ebay.com/sell/inventory/v1/inventory_item?limit=100&offset=0")
};

/**
 *    This call retrieves all inventory item records defined for the seller's account.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems
 */
EbayAccount.methods.getInventoryItem = async function (sku) {
    return await this.request("GET", `https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`)
};

/**
 *    This call creates a new inventory item record or replaces an existing inventory item record.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem
 */
EbayAccount.methods.createOrReplaceInventoryItem = async function (sku, payload) {
    return await this.request("PUT", `https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, payload);
};

/**
 * This call creates an offer for a specific inventory item on a specific eBay marketplace.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getOffer
 */
EbayAccount.methods.getOffer = async function (offerId) {
    return await this.request("GET", "https://api.ebay.com/sell/inventory/v1/offer/" + offerId);
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
EbayAccount.methods.updateOffer = async function (productID, payload) {
    return await this.request("PUT", "https://api.ebay.com/sell/inventory/v1/offer/" + productID, payload);
};

/**
 * This call is used to convert an unpublished offer into a published offer, or live eBay listing.
 * The unique identifier of the offer (offerId) is passed in at the end of the call URI.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/publishOffer
 */
EbayAccount.methods.publishOffer = async function (productID) {
    return await this.request("POST", "https://api.ebay.com/sell/inventory/v1/offer/" + productID + "/publish/");
};

/**
 * This call is used to retrieve the expected listing fees for up to 250 unpublished offers.
 *
 * https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getListingFees
 */
EbayAccount.methods.getListingFees = async function () {
    return await this.request("POST", "https://api.ebay.com/sell/inventory/v1/offer/get_listing_fees");
};

EbayAccount.methods.createLocation = async function (payload) {
    this.merchantLocationKey = payload.name;
    this.save(async () => {
        return await this.request("POST", "https://api.ebay.com/sell/inventory/v1/location/" + payload.name, payload);
    });
};

EbayAccount.methods.getLocation = async function () {
    return await this.request("GET", "https://api.ebay.com/sell/inventory/v1/location");
};

//-------------------------------------------TAXONOMY-------------------------------------------//


EbayAccount.methods.getCategory = function (title) {
    var uri = 'https://api.ebay.com/commerce/taxonomy/v1_beta/category_tree/' + this.defaultCategoryTreeId + '/get_category_suggestions?q=' + title;
    this.request("GET", uri).then((results) => {
        return results.categorySuggestions[0].category.categoryId;
    }).catch()
};

mongoose.model('ebayaccount', EbayAccount);