var mongoose = require('mongoose');
var Listing = mongoose.model('listing');

class Repricer {
    constructor(){
        this.margin = 0.3;
    }

    /**
     * Main function for repricing items.
     */
    start() {
        var repricer = this;
        Listing.find({}).then(async function(listing){
           if (!listing){
               console.log('error');
           }

           listing.each(function(item){
               var sourcePrice = item.getSourcePrice();
               console.log(sourcePrice);
           });
           var sourcePrice = listing.getSourcePrice();
           var currentListingPrice = listing.getListingPrice();
           var listingPrice = await repricer.calculate(sourcePrice);

           if (currentListingPrice !== listingPrice){
               listing.updateListingPrice(listingPrice);
           }
            listing.save();
        }).catch()
    }

    /**
     * Sets the margin for marking up the price
     * @param margin
     */
    setMargin(margin) {
        this.margin = margin;
    }

    /**
     * Calculates the price that this listing should be on eBay
     * @param price
     */
    calculate(price){
        return new Promise(function(resolve, reject){
            resolve(Math.round((price + (price * this.margin)) * 100 ) / 100);
        });
    }
}

module.exports = Repricer;