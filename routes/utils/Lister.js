var mongoose = require('mongoose');
var Offers = mongoose.model('offers');
var sku = require('shortid');

class Lister {

    constructor() {
        this.ebayAccount = null;
        this.active = false;
        this.lastUpdate = 'No data..';
        this.margin = 0.4;
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
        this.createOffers().then(() => {
            this.queueCreateOffers();
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

    setPrice(listing){
        listing.price = listing.sourcePrice + (listing.sourcePrice * this.margin);
        return listing.save(function(){
            return new Promise((resolve, reject)=>{
                resolve(true);
            })
        })
    }

    setSKU(listing){
        listing.itemSKU = sku.generate();
        return listing.save(function(){
            return new Promise(((resolve, reject) => {
                resolve(true);
            }))
        })
    }

    setAccount(account) {
        this.ebayAccount = account;
        return new Promise((resolve, reject) => {
            resolve(this.ebayAccount);
        })
    }

    createOffers() {
        return new Promise((resolve, reject)=>{
            //title.substring(0, 78) + '...'
            var i = 0;
            Offers.find({}).then(async (offer) => {
                var itemsLen = offer.length;
                // offer.forEach(async (item) => {
                    ++i;
                    var item = offer[4];
                    if (!this.active) {
                        return;
                    }
                    if (!this.isDuplicate(item) && item.canList() && !item.isCreated()) {
                        await this.ebayAccount.createOffer(await item.toRequestPayload())
                            .then(function (res) {
                                if (res.errors){
                                    console.log(res.errors);
                                } else {
                                    console.log(res);
                                    item.setOfferID(res.offerId);
                                    item.setCreated(true);
                                    item.save(function (err) {
                                        console.log(err);
                                    });
                                }
                            }).catch();
                    } else {
                        if (this.isDuplicate()) {
                            console.log('This item is a duplicate');
                        } else if (!item.canList()) {
                            console.log("Item can't be listed because no sku or price.")
                            if (!item.price){
                                this.setPrice(item).then();
                            }
                            if (!item.itemSKU){
                                this.setSKU(item).then();
                            }
                        } else {
                            console.log("Item created already? " + item.isCreated())
                        }
                    }
                    resolve(true);
                // });
            }).catch((err)=>{console.log(err)});
        })
    }

    queueCreateOffers() {
        var delay = 600000; // 10 minutes;
        this.lastUpdate = new Date().toLocaleTimeString();
        if (this.active) {
            setInterval(() => {
                this.createOffers()
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
            if (listings.size === 0){
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

    publishOffers() {
        //title.substring(0, 78) + '...'
        Offers.find({}).then((offer) => {
            offer.each(async (item) => {
                if (!this.isDuplicate(item) && !item.isPublished()) {
                    await this.ebayAccount.publishOffer(await item.getOfferID())
                        .then(function (listingID) {
                            item.setListingID(listingID);
                            item.setPublished(true);
                            item.save();
                        }).catch();
                }
            });
        }).catch();
        this.queuePublishOffers();
    }
}

module.exports = Lister;