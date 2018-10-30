var router = require('express').Router();
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');
var Lister = require('../utils/Lister');
var User = mongoose.model('user');
var auth = require('../auth');

router.get('/', auth.required, function (req, res, next) {
    var lister;
    User.findById(req.payload.id)
        .populate('ebayAccounts')
        .then(function(user){
        if (!user){
            res.status(422).json({error: "must be logged in"})
        }

        var ebayAccount = user.getEbayAccounts()[0];
        if (ebayAccount.getLister().length === 0){
            ebayAccount.lister = ebayAccount.lister.concat([new Lister()]);
            ebayAccount.save().then(function(){
                ebayAccount.populate('lister').then(function(err, lister){
                    console.log(lister);
                });
                lister = ebayAccount.getLister()[0];
            }).catch(next)
        } else {
            lister = ebayAccount.getLister()[0];
        }

        Listing.find({}).then(function(listing){
            res.json({
                count: listing.length,
                status: lister.getStatus()
            })
        }).catch(next);
    }).catch(next);
});

router.get('/addLister', auth.required, function(req, res, next){
    var lister = new Lister();
    User.findById(req.payload.id).then(function(user){
        if (!user){
            return res.status(422).json({error: "no user found!"})
        }
       var ebayAcc = user.getEbayAccounts()[0];
       ebayAcc.lister = ebayAcc.lister.concat([lister]);
       ebayAcc.save().then(function(){
           return res.json({status: "added lister"})
       })
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
