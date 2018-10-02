var moongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Listing = require('Listing');
var Order = require('Order');
var User = require('User');

var EbayAccount = new mongoose.Schema({
   AccessToken: {type: String, required: [true, 'must have accesstoken']},
   RefreshToken: {type: String, required: [true, 'must have refreshtoken']},
    User: User,
    Balance: String,
    Listings: {},
    Orders: {},
});

EbayAccount.methods.toJSONFor = function(user){
  return {
      Listings: this.Listings,
      Orders: this.Orders,
      User: user.toAuthJSON(),
      Balance: this.Balance
  }
};

EbayAccount.methods.getEbayListings = function(){
    // make request to ebay
    this.Listings = req.response;
};

EbayAccount.methods.updateInfo = function(){
    this.getEbayListings();
};