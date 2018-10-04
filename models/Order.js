var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Listing = require('./Listing.js');

var OrderSchema = new mongoose.Schema({
    orderNo: Number,
    title: String,
    buyerFirstName: String,
    buyerLastName: String,
    buyerUsername: String,
    buyerStreet1: String,
    buyerStreet2: String,
    buyerCity: String,
    buyerState: String,
    buyerZip: String,
    buyerPhone: String,
    orderDate: String,
    sourceInfo: Listing,
    buyNowPrice: String,
    quantity: Number,
    paymentStatus: String,
    trackingNumber: String,
    trackingCarrier: String,
    ordered: Boolean
});

OrderSchema.methods.toJSONFor = function(user){
    return {
        orderNo: this.orderNo,
        title: this.title,
        sourceInfo: this.sourceInfo,
        buyNowPrice: this.buyNowPrice,
        quantity: this.quantity,
        ordered: this.ordered,
        eBayAccount: user.toAuthJSON()
    }
};

mongoose.model('order', OrderSchema);