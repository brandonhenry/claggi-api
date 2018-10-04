var margin;
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');

class Repricer {
    setMargin(margin) {
        this.margin = margin;
    }

    start() {
        Listing.find({}).then(function(err, listing){
           if (err){
               console.log(err);
           }

           console.log(listing);
        })
    }
}

module.exports = Repricer;