var Sourcer = require('../utils/Sourcer');
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('user');
var Listing = mongoose.model('listing');
var router = require('express').Router();
var EbayAccount = mongoose.model('ebayaccount');

router.get('/', function(req, res, next){
    EbayAccount.find({user:'claggi'}).then(function(account){
        account.forEach(function(acc){
            var sourcer = new Sourcer(acc);
            sourcer.scrape();
        });
        res.json({message:'success'});
    }).catch();
});

module.exports = router;