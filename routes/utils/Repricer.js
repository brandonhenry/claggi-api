var mongoose = require('mongoose');
var Offer = mongoose.model('offer');

class Repricer {
    constructor(){
        this.margin = 0.3;
    }

    /**
     * Main function for repricing items.
     */
    start() {
        var repricer = this;
        Offer.find({}).then(function(listing){
           if (!listing){
               console.log('error');
           }

           listing.forEach(async function(item){
               if (!item.errors){
                   var sourcePrice = item.getSourcePrice();
                   var currentListingPrice = item.getListingPrice() || 1;

                   if (sourcePrice && currentListingPrice){
                       var listingPrice = await repricer.calculate(sourcePrice);

                       if (currentListingPrice !== listingPrice){
                           item.updateListingPrice(listingPrice);
                       }
                   }

                   item.save();
                   console.log(item.toAuthJSON());
               }
           });
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
        var repricer = this;
        return new Promise(function(resolve, reject){
            resolve(Math.round((price + (price * repricer.margin)) * 100 ) / 100);
        });
    }
}

module.exports = Repricer;