var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('user');
var auth = require('../auth');
var EbayAccount = mongoose.model('ebayaccount');

router.get('/ebay', auth.required, function(req, res, next){
   User.findById(req.payload.id).then(function(user){
       if (!user.getEbayToken()){
           return res.status(422).json({errors:'no ebay tokens have been set'})
       }

       var token = user.getEbayToken();
       var ebayAcc = new EbayAccount;

       ebayAcc.accessToken = token.accessToken;
       ebayAcc.accessToken = token.refreshToken;

       ebayAcc.save().then(function(){
           return res.json({eBayAccount: ebayAcc.toAuthJSON()});
       })
   })
});

router.get('/ebay/update', function(req, res, next){
    User.findById(req.session.user.id).then(function(user){

        EbayAccount.find({accessToken:user.getEbayToken().accessToken}).then(function(eBayAccount){
           eBayAccount.updateInfo();
            return res.json({eBayAccount: eBayAccount.toAuthJSON()});
        });

    })
});


