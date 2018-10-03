var request = require('request');
var EbayAPI = require('./Ebay');
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');

// Amazon Constants
let OperationHelper = require('apac').OperationHelper;
let express = require('express');
let router = express.Router(),
    azAccessKey = 'nT/nJFQVyGJ1kAlbbk2YveBUuPPMhhvApAeeAc4i',
    azAwsId = 'AKIAI62PB4Y7TBUHEHEA',
    azAssociateTag = 'claggi-20';


class Sourcer {

    async scrape() {
        try {
            let ebay = new EbayAPI();
            let azItems = [];
            for (let pageNumber = 1; pageNumber <= 5; ++pageNumber) {
                let tempItems = await this.findEbayProducts(ebay, pageNumber);
                azItems = azItems.concat(tempItems);
                if (pageNumber === 5) {
                    azItems.forEach(function (item) {
                        // process all amazon items
                    });
                }
            }
        } catch (err) {
            console.log(err);
            throw new Error('Failed to send response' + err);
        }
    }

    findAmazonProduct(title) {
        let parseString = require('xml2js').parseString;
        if (title === undefined) {
            return new Promise(function (resolve, reject) {
                resolve(undefined);
            })
        } else {
            return new Promise(function (resolve, reject) {
                let opHelper = new OperationHelper({
                    awsId: azAwsId,
                    awsSecret: azAccessKey,
                    assocId: azAssociateTag,
                });
                opHelper.execute('ItemSearch', {
                    'SearchIndex': 'All',
                    'Keywords': title,
                    'MechantId': 'All',
                    'Condition': 'New',
                    'ResponseGroup': 'Medium',
                }).then((response) => {
                    parseString(response.responseBody, // noinspection JSAnnotator
                        async function (err, res) {
                            try {
                                console.log(res.ItemSearchResponse.Items[0].Item[0].ASIN[0]);
                                let params = {
                                    source: "amazon",
                                    sourceID: res.ItemSearchResponse.Items[0].Item[0].ASIN[0],
                                    title: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0],
                                    sourcePrice: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ListPrice[0].FormattedPrice[0],
                                    height: '',
                                    width: '',
                                    length: '',
                                    dimensionUnit: '',
                                    weight: '',
                                    weightUnit: '',
                                    brand: '',
                                    description: '',
                                    image: '',
                                    mpn: '',
                                    upc: '',
                                    ean: '',
                                    price: ''
                                };

                                var listing = new Listing();
                                listing.setInitialState(params);
                                listing.save();
                            } catch (err) {
                                resolve(undefined);
                            }

                        });
                }).catch((err) => {
                    console.error("Something went wrong: ", err);
                });
            });

        }
    }

    async findEbayProducts(ebay, pageNumber) {
        var source = this;
        return new Promise(function (resolve, reject) {
            let itemCounter = 0;
            let ebayItems = {};

            request.get(ebay.endpoint[pageNumber - 1], async function (err, res2, body) {
                if (err) {
                    throw new Error('Error requesting eBay items: ' + err)
                } else {
                    try {
                        let jsdata = JSON.parse(body);
                        ebayItems = jsdata.findCompletedItemsResponse[0].searchResult[0].item || [];
                    } catch (err) {
                        throw new Error('Error trying to parse ebay response data: ' + err)
                    }

                    for (let i = 0; i < ebayItems.length; ++i) {
                        let item = ebayItems[i];
                        let ebayTitle = item.title;
                        let ebayUrl = item.viewItemURL;

                        itemCounter += 1;

                        if (null != ebayTitle && null != ebayUrl) {
                            await source.findAmazonProduct(ebayTitle);
                        }
                    }
                }
            });
        });
    }


}

module.exports = Sourcer;