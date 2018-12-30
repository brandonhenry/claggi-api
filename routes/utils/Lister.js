var mongoose = require('mongoose');
var Offers = mongoose.model('offers');
var sku = require('shortid');
var AccountValidator = require('../utils/AccountValidator');

class Lister {

    constructor() {
        this.ebayAccount = null;
        this.active = false;
        this.lastUpdate = 'No data..';
        this.margin = 0.4;
        this.itemIndex = 0;
    }

    async grabEbayListings() {
        return new Promise((async (resolve, reject) => {
            resolve(await this.ebayAccount.getInventoryItems())
        }))
    }

    start() {
        if (!this.ebayAccount) {
            console.log("no ebay account set in lister!!");
            return "no ebay account set in lister!!"
        }

        this.active = true;
        this.list();

    }

    stop() {
        this.active = false;
    }

    getStatus() {
        return this.active;
    }

    getLastUpdate() {
        return this.lastUpdate;
    }

    setAccount(account) {
        this.ebayAccount = account;
        return new Promise((resolve, reject) => {
            resolve(this.ebayAccount);
        })
    }


    list() {
        Offers.find({}).then(async (offer) => {
                for (let i = 0; i < offer.length; i++) {
                    if (!this.active) {
                        break;
                    }
                    await this.prepare(offer[i])
                        .then(() => {
                            offer[i].save()
                        })
                        .catch((err) => {
                            console.log(err)
                        });
                }
            }
        )
    }

    async prepare(item) {
        if (this.isDuplicate(item)) {
            return;
        }
        return new Promise(async (resolve, reject) => {
            await this.createInventoryItem(item)
                .then(async () => {
                    item.inventoryItemMade = true;
                    await this.createOffer(item).catch((err) => {
                        reject(console.log(err))
                    });
                }).then(async (offerID) => {
                    console.log("OfferID: " + offerID);
                    item.setOfferID(offerID);
                    item.setCreated(true);
                    resolve(offerID);
                    // await publishOffer(offerID).catch((err) => {
                    //     reject(console.log(err))
                    // });
                }).then(async (listingID) => {
                    // item.setListingID(listingID);
                    // item.setPublished(true);
                    // item.save(() => {
                    //     resolve(true)
                    // });
                })
        })
    }

    createInventoryItem(item) {
        return new Promise(async (resolve, reject) => {
            await this.ebayAccount.createOrReplaceInventoryItem(item.itemSKU, await item.toInventoryItemJSON(this.ebayAccount.getMerchantLocationKey()))
                .then(() => {
                    resolve(true)
                })
        })

    }

    createOffer(item) {
        return new Promise(async (resolve, reject) => {
            if (item.canList()) {
                await this.ebayAccount.createOffer(await item.toOfferJSON(this.ebayAccount.getMerchantLocationKey()))
                    .then((res) => {
                        if (res.errors || res.error) {
                            reject(({errors: res.errors + res.error}))
                        } else if (res.offerId) {
                            resolve(res.offerId)
                        } else if (res === false) {
                            AccountValidator.refreshAccessToken(this.ebayAccount.ebayRefreshToken).then((success) => {
                                if (success) {
                                    this.ebayAccount.accessToken = success.accessToken;
                                    this.ebayAccount.save(function () {
                                        createOffer(item).catch((err) => {
                                            console.log(err);
                                        })
                                    }).catch();
                                }
                            }).catch((err) => {
                                console.log(err);
                                return res.json({error: err})
                            });
                        } else {
                            throw new Error(res);
                        }
                    })
            }
        });
    }

    publishOffer(offerID) {
        return new Promise(async (resolve, reject) => {
            await this.ebayAccount.publishOffer(offerID)
                .then(function (res) {
                    if (res.errors || res.error) {
                        reject(({errors: res.errors + res.error}))
                    } else if (res.listingID) {
                        resolve(res.listingID)
                    }
                }).catch((err) => {
                    throw new Error(err)
                });
        })
    }

    queueLister() {
        var delay = 600000; // 10 minutes;
        this.lastUpdate = new Date().toLocaleTimeString();
        if (this.active) {
            setInterval(() => {
                this.createInventoryItem()
            }, delay);
        }
    }

    isDuplicate(unpubListing) {
        var isDuplicate = false;
        this.grabEbayListings().then(function (listings) {
            if (listings.size === 0 || listings.inventoryItems === undefined || unpubListing === undefined) {
                return isDuplicate;
            } else {
                listings.inventoryItems.forEach(function (listing) {
                    if (listing.ean === unpubListing.ean ||
                        listing.upc === unpubListing.upc ||
                        listing.itemSKU === unpubListing.itemSKU) {
                        isDuplicate = true;
                    }
                });
            }
        });

        return isDuplicate;
    }
}

module.exports = Lister;