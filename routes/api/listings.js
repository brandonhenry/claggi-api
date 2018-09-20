var router = require('express').Router();
var mongoose = require('mongoose');
var Listing = mongoose.model('Listing');
var request = require('request');

function getSessionID(){

    var appID = 'BrandonH-SkuGrid-PRD-066850dff-54313674';
    var devID = '986cfb64-ae6a-4a21-95fb-f21a670ae53f';
    var cert = 'PRD-66850dfff6e9-feec-4725-8aed-13b2';

    
}

var options = {
    url: 'https://api.ebay.com/sell/inventory/v1/inventory_item',
    headers: {
        'Authorization': 'Bearer <ebayToken>',
        'Content-Language': 'en-US',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
    }
};

function callback(error, response, body) {

    var allListings = [];

    if (!error && response.statusCode === 200) {
        var info = JSON.parse(body);

        info.each(function (item, index) {
            var newListing = new Listing(item);
            allListings.push(newListing)
        });
    }

    resolve(allListings);

}

function getListings() {
    return new Promise(function (resolve, reject) {
        request(options, callback);
    });
}

router.use('/', async function (req, res, next) {
    res.send(await getListings());
});

module.exports = router;