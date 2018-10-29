var router = require('express').Router();
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');
var Lister = require('../utils/Lister');
var User = mongoose.model('user');
var auth = require('../auth');

router.get('/', auth.required, function (req, res, next) {
    var lister;
    User.findById(req.payload.id).then(function(user){
        if (!user){
            res.status(422).json({error: "must be logged in"})
        }

        var ebayAccount = user.getEbayAccounts()[0];
        if (!ebayAccount.getLister()){
            ebayAccount.setLister(new Lister());
            ebayAccount.save();
        }

        lister = ebayAccount.getLister();
        Listing.find({}).then(function(listing){
            res.json({
                count: listing.length,
                status: lister.getStatus()
            })
        }).catch(next);
    }).catch(next);
});

router.get('/lister/start', auth.required, function(req, res, next){
    User.findById(req.payload.id).then(function(user){

    }).catch(next)
});

router.get('/lister/stop', auth.required, function(req, res, next){
    User.findById(req.payload.id).then(function(user){

    }).catch(next)
});

module.exports = router;
