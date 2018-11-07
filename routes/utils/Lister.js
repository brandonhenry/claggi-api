
var mongoose = require('mongoose');
var Offers = mongoose.model('offers');

class Lister {

    constructor(){
        this.ebayAccount = null;
        this.listings = [];
        this.active = false;
        this.lastUpdate = 'No data..';
    }

    async grabEbayListings(){
        this.listings = await this.ebayAccount.getInventoryItems();
    }

    start(){
        if (!this.ebayAccount){
            console.log("no ebay account set in lister!!");
            return "no ebay account set in lister!!"
        }

        this.active = true;
        this.createOffers();
        this.publishOffers();
    }

    stop(){
        this.active = false;
    }

    getStatus(){
        return this.active;
    }

    getLastUpdate(){
        return this.lastUpdate;
    }

    setAccount(account){
        this.ebayAccount = account;
    }

    createOffers(){
        //title.substring(0, 78) + '...'
        Offers.find({}).then((offer) => {
            offer.each(async (item) => {
                if (!this.isDuplicate(item) && item.canList() && !item.isCreated()){
                    await this.ebayAccount.createOffer(await item.toRequestPayload())
                        .then(function(offerID){
                            item.setOfferID(offerID);
                            item.setCreated(true);
                            item.save();
                        }).catch();
                }
            });
        }).catch();
        this.queueCreateOffers();
    }

    queueCreateOffers(){
        var delay = 600000; // 10 minutes;
        this.lastUpdate = new Date().toLocaleTimeString();
        if (this.active){
            setInterval(this.createOffers(), delay);
        }
    }

    queuePublishOffers(){
        var delay = 600000; // 10 minutes;
        this.lastUpdate = new Date().toLocaleTimeString();
        if (this.active){
            setInterval(this.publishOffers(), delay);
        }
    }

    isDuplicate(unpubListing){
        var isDuplicate = false;
        this.grabEbayListings().then(function(){
            this.listings.each(function(listing){
                if (listing.ean === unpubListing.ean ||
                    listing.upc === unpubListing.upc ||
                    listing.itemSKU === unpubListing.itemSKU){
                    isDuplicate = true;
                }
            });
        });

        return isDuplicate;
    }

    publishOffers(){
        //title.substring(0, 78) + '...'
        Offers.find({}).then((offer) => {
            offer.each(async (item) => {
                if (!this.isDuplicate(item) && !item.isPublished()){
                    await this.ebayAccount.publishOffer(await item.getOfferID())
                        .then(function(listingID){
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