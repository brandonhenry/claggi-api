var mongoose = require('mongoose');
var Offers = mongoose.model('offers');
var sku = require('shortid');

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
        this.createInventoryItem().then(() => {
            this.createOffer().then(() => {
                this.publishOffers().then(() => {

                })
            })
        });
        // this.publishOffers();
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

    setPrice(listing) {
        listing.price = listing.sourcePrice + (listing.sourcePrice * this.margin);
        return listing.save(function () {
            return new Promise((resolve, reject) => {
                resolve(true);
            })
        })
    }

    setAccount(account) {
        this.ebayAccount = account;
        return new Promise((resolve, reject) => {
            resolve(this.ebayAccount);
        })
    }

    createInventoryItem() {
        if (!this.active) {return;}
        return new Promise((resolve, reject) => {
            var i = 0;
            Offers.find({}).then(async (offer) => {
                offer.forEach(async (item) => {
                    ++i;
                    if (!this.isDuplicate(item)) {
                        await this.ebayAccount.createOrReplaceInventoryItem(item.itemSKU, await item.toInventoryItemJSON())
                            .then(function () {
                                item.inventoryItemMade = true;
                                item.save(() => {});
                            }).catch((err) => {console.log(err);});
                    }
                    if (i === offer.length){return resolve(true)}
                });
            }).catch((err) => {console.log(err)});
        })
    }

    createOffer() {
        if (!this.active) {return;}
        return new Promise((resolve, reject) => {
            var i = 0;
            Offers.find({}).then(async (offer) => {
                offer.forEach(async (item) => {
                    ++i;
                    if (!this.isDuplicate(item) && item.canList()) {
                        await this.ebayAccount.createOffer(await item.toOfferJSON())
                            .then(function (res) {
                                if (res.errors || res.error) {
                                    // resolve(console.log({errors: res.errors, error: res.error}))
                                } else if (res.offerId) {
                                    console.log("OfferID: " + res.offerId);
                                    item.setOfferID(res.offerId);
                                    item.setCreated(true);
                                    item.save(() => {});
                                } else {
                                    resolve(console.log("error!"))
                                }
                            }).catch((err) => {resolve(console.log(err))});
                    }
                    if (i === offer.length){return resolve(true)}
                });
            }).catch((err) => {console.log(err)});
        })
    }

    publishOffers() {
        if (!this.active) {return;}
        return new Promise((resolve, reject) => {
            var i = 0;
            Offers.find({}).then(async (offer) => {
                offer.each(async (item) => {
                    i++;
                    if (!this.isDuplicate(item) && !item.isPublished() && item.offerID) {
                        await this.ebayAccount.publishOffer(await item.getOfferID())
                            .then(function (res) {
                                if (res.errors || res.error) {
                                    // resolve(console.log({errors: res.errors, error: res.error}))
                                } else if (res.listingID) {
                                    item.setListingID(res.listingID);
                                    item.setPublished(true);
                                    item.save(() => { });
                                }
                            }).catch((err) => { resolve(console.log(err)) });
                    } else {
                        reject(false);
                    }
                    if (i === offer.length){return resolve(true)}
                });
            }).catch((err)=>{resolve(console.log(err))});
        })
    }

    queueCreateInventoryItem() {
        var delay = 600000; // 10 minutes;
        this.lastUpdate = new Date().toLocaleTimeString();
        if (this.active) {
            setInterval(() => {
                this.createInventoryItem()
            }, delay);
        }
    }

    queueCreateOffers() {
        var delay = 600000; // 10 minutes;
        this.lastUpdate = new Date().toLocaleTimeString();
        if (this.active) {
            setInterval(() => {
                this.createInventoryItem()
            }, delay);
        }
    }

    queuePublishOffers() {
        var delay = 600000; // 10 minutes;
        this.lastUpdate = new Date().toLocaleTimeString();
        if (this.active) {
            setInterval(this.publishOffers(), delay);
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