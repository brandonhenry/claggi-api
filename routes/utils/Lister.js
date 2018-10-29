
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');

class Lister {

    constructor(){
        this.ebayAccount = null;
        this.listings = [];
        this.active = false;
    }

    grabEbayListings(){
        this.listings = this.ebayAccount.getInventoryItems();
    }

    start(account){
        this.active = true;
        this.ebayAccount = account;
        var i = this;
        //title.substring(0, 78) + '...'
        Listing.find({}).then(function(listing){
            listing.each(async function(item){
                if (!i.isDuplicate(item) && item.canList()){
                    await i.ebayAccount.createOffer(await item.toRequestPayload()).catch();
                }
            })
        }).catch();
    }

    stop(){
        this.active = false;
    }

    getStatus(){
        return this.active;
    }

    isDuplicate(unpubListing){
        var isDuplicate = false;
        this.listings.each(function(listing){
            if (listing.ean === unpubListing.ean ||
                listing.upc === unpubListing.upc ||
                listing.itemSKU === unpubListing.itemSKU){
                isDuplicate = true;
            }
        });
        return isDuplicate;
    }
}

module.export = Lister;