var request = require('request');
var EbayAPI = require('./Ebay');
var AmazonProductParser = require('./AmazonProductParser');
var mongoose = require('mongoose');
var Offers = mongoose.model('offers');

// Amazon Constants
let OperationHelper = require('apac').OperationHelper;
let azAccessKey = 'nT/nJFQVyGJ1kAlbbk2YveBUuPPMhhvApAeeAc4i',
    azAwsId = 'AKIAI62PB4Y7TBUHEHEA',
    azAssociateTag = 'claggi-20';


class Sourcer {

    constructor() {
        this.active = false;
        this.lastScan = 'No scan yet..';
        this.amazonProductParser = null;
        this.opHelper = new OperationHelper({
            awsId: azAwsId,
            awsSecret: azAccessKey,
            assocId: azAssociateTag,
            maxRequestsPerSecond: 1
        });
    }

    setEbayAccount(ebayAccount) {
        this.amazonProductParser = new AmazonProductParser(ebayAccount);
        return new Promise((resolve, reject) => {
            resolve(ebayAccount);
        })
    }

    async run() {
        this.active = true;
        await this.scrape();
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
        if (!this.active) {
            return;
        }
        await this.scrapeEbayProducts()
            .then(async (ebayProducts) => {
                return await this.findAmazonProducts(ebayProducts).catch((err) => {

                });
            }).then(async (amazonProducts) => {
                return await this.createOffers(amazonProducts).catch((err) => {
                    console.log(err)
                });
            }).then(() => {
                this.queue();
            });
    }

    scrapeEbayProducts() {
        return new Promise(async (resolve, reject) => {
            var products = [];
            let ebay = new EbayAPI();
            let pages = 1;
            for (let pageNumber = 1; pageNumber <= pages; ++pageNumber) {
                await this.findEbayProducts(ebay, pageNumber).then((results) => {
                    products = products.concat(results);
                    if (pageNumber === pages) {
                        // all done
                        resolve(products);
                    }
                }).catch((err) => {
                    console.log(err)
                });
            }
        })
    }

    findAmazonProducts(products) {
        var count = 0;
        return new Promise(async (resolve, reject) => {
            var azProducts = [];
            for (var i = 0; i < products.length; i++) {
                if (products[i] === undefined) {
                    count++;
                    return
                }
                count++;
                await this.findAmazonProduct(products[i])
                    .then((results) => {
                        if (results){azProducts = azProducts.concat(results);}
                        if (count === products.length) {resolve(azProducts);}
                    }).catch((err) => {
                    console.log(err)
                });
            }
        })
    }

    async createOffers(products) {
        var count = 0;
        return new Promise(async (resolve, reject) => {
            for (var i = 0; i < products.length; i++) {
                count++;
                Offers.create(await this.amazonProductParser.parse(products[i]), (err) => {
                    if (err) {console.log(err)}
                    if (count === products.length) {resolve(true);}
                });
            }
        })
    }

    /**
     * Takes an ebay listing title and searches Amazon to see if that item is available on Amazon.
     * @param title ebay recently sold listing title
     * @returns {Promise<any>}
     */
    findAmazonProduct(title) {
        let parseString = require('xml2js').parseString;
        return new Promise((resolve, reject) => {
            this.opHelper.execute('ItemSearch', {
                'SearchIndex': 'All',
                'Keywords': title,
                'MechantId': 'All',
                'Condition': 'New',
                'ResponseGroup': 'Medium',
            }).then((response) => {
                parseString(response.responseBody, // noinspection JSAnnotator
                    async (err, res) => {
                        if (err || !res) {
                            reject(false);
                        } else if (res.hasOwnProperty("ItemSearchErrorResponse")) {
                            console.log(res.ItemSearchErrorResponse.Error[0].Message[0]);
                            reject(false);
                        } else if (res.ItemSearchResponse.hasOwnProperty("Items")) {
                            if (res.ItemSearchResponse.Items[0].Request[0].hasOwnProperty("Errors")){
                                reject(res.ItemSearchResponse.Items[0].Request[0].Errors[0].Error[0].Message[0]);
                            } else {
                                resolve([res])
                            }
                        } else {
                            reject(false)
                        }
                    });
            }).catch((err) => {
                console.error("Something went wrong: ", err);
            });
        });
    }

    /**
     * Searches eBay for all recenlty sold items. Searches 5 pages with 100 results on each page.
     * @param ebay object containing ebay endpoint urls
     * @param pageNumber current pagination number
     * @returns {Promise<*>}
     */
    async findEbayProducts(ebay, pageNumber) {
        var products = [];
        return new Promise(function (resolve, reject) {
            let ebayItems = {};

            request.get(ebay.endpoint[pageNumber - 1], async function (err, res2, body) {
                if (err) {
                    reject('Error requesting eBay items: ' + err)
                } else {
                    try {
                        let jsdata = JSON.parse(body);
                        ebayItems = jsdata.findCompletedItemsResponse[0].searchResult[0].item || [];
                    } catch (err) {
                        reject('Error trying to parse ebay response data: ' + err)
                    }

                    for (let i = 0; i < ebayItems.length; ++i) {
                        let item = ebayItems[i];
                        let ebayTitle = item.title[0];
                        let ebayUrl = item.viewItemURL;

                        if (null != ebayTitle && null != ebayUrl) {
                            products.push(ebayTitle);
                        }

                        if (i === ebayItems.length - 1) {
                            resolve(products);
                        }
                    }
                }
            });
        });
    }
}

module.exports = Sourcer;