var request = require('request');
var EbayAPI = require('./Ebay');
var AmazonProductParser = require('AmazonProductParser');
var mongoose = require('mongoose');
var Offers = mongoose.model('offers');
var sku = require('./SkuGenerator');

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
        this.margin = 0.4;
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
        if (!this.active){return;}
        this.scrapeEbayProducts.then((ebayProducts) => {
            this.findAmazonProducts(ebayProducts).catch();
        }).then((amazonProducts) => {
            this.createOffers(amazonProducts).catch();
        }).then(() => {
            this.queue();
        });
    }

    scrapeEbayProducts() {
        var products = [];
        return new Promise(async (resolve, rejeect) => {
            let ebay = new EbayAPI();
            let pages = 1;
            for (let pageNumber = 1; pageNumber <= pages; ++pageNumber) {
                await this.findEbayProducts(ebay, pageNumber).then((results) => {
                    products.concat(results);
                }).catch();
                if (pageNumber === pages) {
                    // all done
                    resolve(products);
                }
            }
        })
    }

    findAmazonProducts(products) {
        var azProducts = [];
        for (var i = 0; i < products.length; i++) {
            if (products[i] === undefined) {
                return
            }
            this.findAmazonProduct(products[i]).then((results) => {
                azProducts.concat(results);
            }).catch((err) => {
                console.log(err)
            })
        }
    }

    async createOffers(products) {
        for (var i = 0; i < products.length; i++){
            Offers.create(await this.amazonProductParser.parse(products[i]), (err) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    }

    /**
     * Takes an ebay listing title and searches Amazon to see if that item is available on Amazon.
     * @param title ebay recently sold listing title
     * @returns {Promise<any>}
     */
    findAmazonProduct(title) {
        let parseString = require('xml2js').parseString;
        return new Promise((resolve, reject) => {
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
                    async (err, res) => {
                        if (res.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content[0]) {
                            resolve(res);
                        } else {
                            reject(err);
                        }
                    });
            }).catch((err) => {
                console.error("Something went wrong: ", err);
            });

        })
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
                        let ebayTitle = item.title;
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