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
        Listing.find({}).then(async function(err, listing){
           if (err){
               console.log(err);
           }

           var sourcePrice = listing.getSourcePrice();
           var currentListingPrice = listing.getListingPrice();
           var listingPrice = await this.calculate(sourcePrice);
           console.log(listingPrice);
           if (currentListingPrice !== listingPrice){
               listing.updateListingPrice(listingPrice);
           }
           console.log(listing);

            listing.save();
        })
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