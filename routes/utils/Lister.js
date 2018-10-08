
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');

class Lister {

    constructor(ebayAccount){
        this.ebayAccount = ebayAccount;
        this.listings = [];
    }

    grabEbayListings(){
        this.listings = this.ebayAccount.getInventoryItems();
    }

    start(){
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