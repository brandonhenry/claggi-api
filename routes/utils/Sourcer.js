var request = require('request');
var EbayAPI = require('./Ebay');
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');

// Amazon Constants
let OperationHelper = require('apac').OperationHelper;
let azAccessKey = 'nT/nJFQVyGJ1kAlbbk2YveBUuPPMhhvApAeeAc4i',
    azAwsId = 'AKIAI62PB4Y7TBUHEHEA',
    azAssociateTag = 'claggi-20';


class Sourcer {

    async scrape() {
        try {
            let ebay = new EbayAPI();
            let azItems = [];
            let pages = 1;
            for (let pageNumber = 1; pageNumber <= pages; ++pageNumber) {
                let tempItems = await this.findEbayProducts(ebay, pageNumber);
                azItems = azItems.concat(tempItems);
                if (pageNumber === pages) {
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
                                if (res.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content[0]){
                                    let params = {
                                        source: "amazon",
                                        sourceID: res.ItemSearchResponse.Items[0].Item[0].ASIN[0],
                                        title: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0].substring(0,78) + '...',
                                        sourcePrice: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ListPrice[0].FormattedPrice,
                                        height: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Height[0]._,
                                        width: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Width[0]._,
                                        length: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Length[0]._,
                                        dimensionUnit: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Length[0].$.Units,
                                        weight: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Weight[0]._,
                                        weightUnit: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Weight[0].$.Units,
                                        brand: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Brand[0],
                                        description: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Feature[0] + '\n\n' +
                                            res.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content[0],
                                        image: res.ItemSearchResponse.Items[0].Item[0].ImageSets[0].ImageSet[0].HiResImage[0].URL[0],
                                        mpn: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].MPN[0],
                                        ean: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].EAN[0]
                                    };
                                    console.log(params);
                                    var listing = new Listing();
                                    listing.setInitialState(params);
                                    listing.save();
                                } else {
                                    resolve(undefined);
                                }
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