var request = require('request');
var EbayAPI = require('./Ebay');
var mongoose = require('mongoose');
var Offer = mongoose.model('offer');

// Amazon Constants
let OperationHelper = require('apac').OperationHelper;
let azAccessKey = 'nT/nJFQVyGJ1kAlbbk2YveBUuPPMhhvApAeeAc4i',
    azAwsId = 'AKIAI62PB4Y7TBUHEHEA',
    azAssociateTag = 'claggi-20';


class Sourcer {

    constructor() {
        this.active = false;
        this.lastScan = 'No scan yet..';
        this.ebayAccount = null;
    }

    setEbayAccount(ebayAccount) {
        this.ebayAccount = ebayAccount;
    }

    run() {
        this.active = true;
        this.scrape().then(() => {
            this.queue();
        });
    }

    stop() {
        this.active = false;
    }

    getStatus() {
        return this.active;
    }

    getLastScan() {
        return this.lastScan;
    }

    queue() {
        var delay = 600000; // 10 minutes
        if (this.active) {
            setInterval(() => {
                this.run()
            }, delay);
        }
        this.lastScan = new Date().toLocaleTimeString();
    }

    /**
     * Main function. Scrapes eBay for recently sold products and then checks to see if Amazon has those products.
     * Creates Offer models for any products found.
     * @returns {Promise<void>}
     */
    async scrape() {
        return new Promise(async (resolve, reject) => {
            try {
                let ebay = new EbayAPI();
                let pages = 1;
                for (let pageNumber = 1; pageNumber <= pages; ++pageNumber) {
                    await this.findEbayProducts(ebay, pageNumber);
                    if (pageNumber === pages) {
                        // all done
                        resolve(true);
                    }
                }
            } catch (err) {
                console.log(err);
                throw new Error('Failed to send response' + err);
            }
        })
    }

    /**
     * Takes an ebay listing title and searches Amazon to see if that item is available on Amazon.
     * @param title ebay recently sold listing title
     * @returns {Promise<any>}
     */
    findAmazonProduct(title) {
        var i = this;
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
                                if (res.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content[0]) {
                                    let params = {
                                        source: "amazon",
                                        ebayAccount: i.ebayAccount,
                                        sourceID: res.ItemSearchResponse.Items[0].Item[0].ASIN[0],
                                        title: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0],
                                        sourcePrice: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ListPrice[0].FormattedPrice[0],
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
                                        ean: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].EAN[0],
                                        published: false,
                                        created: false
                                    };

                                    var listing = new Offer();
                                    listing.setInitialState(params);
                                    Offer.create(params, (err) => {if (err) {console.log(err) }});
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

    /**
     * Searches eBay for all recenlty sold items. Searches 5 pages with 100 results on each page.
     * @param ebay object containing ebay endpoint urls
     * @param pageNumber current pagination number
     * @returns {Promise<*>}
     */
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

                        if (i === ebayItems.length - 1) {
                            resolve(true);
                        }
                    }
                }
            });
        });
    }
}

module.exports = Sourcer;