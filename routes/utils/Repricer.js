
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');

class Repricer {
    static margin;

    /**
     * Main function for repricing items.
     */
    start() {
        Listing.find({}).then(function(err, listing){
           if (err){
               console.log(err);
           }

           var sourcePrice = listing.getSourcePrice();
           var currentListingPrice = listing.getListingPrice();
           var listingPrice = Repricer.calculate(currentListingPrice);

           if (currentListingPrice !== listingPrice){
               listing.updateListingPrice(listingPrice);
           }
           console.log(listing);
        })
    }

    /**
     * Sets the margin for marking up the price
     * @param margin
     */
    static setMargin(margin) {
        this.margin = margin;
    }

    /**
     * Calculates the price that this listing should be on eBay
     * @param price
     */
    static calculate(price){

    }
}

module.exports = Repricer;