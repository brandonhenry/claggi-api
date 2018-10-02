var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var EbayAccount = mongoose.model('EbayAccount');

router.get('/ebay/account', function(req, res, next){
   User.findById(req.session.user.id).then(function(user){
       var token = user.getEbayToken();

       var eBayAcc = new EbayAccount({
           AccessToken: token.accessToken,
           RefreshToken: token.refreshToken
       });

       return res.json({eBayAccount: eBayAcc.toAuthJSON()});
   })
});

router.get('/ebay/account/update', function(req, res, next){
    User.findById(req.session.user.id).then(function(user){

        EbayAccount.find({accessToken:user.getEbayToken().accessToken}).then(function(eBayAccount){
           eBayAccount.updateInfo();
            return res.json({eBayAccount: eBayAccount.toAuthJSON()});
        });

    })
});


