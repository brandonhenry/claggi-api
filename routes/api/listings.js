var router = require('express').Router();
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');
var Lister = require('../utils/Lister');
var Sourcer = require('../utils/Sourcer');
var User = mongoose.model('user');
var auth = require('../auth');
var lister = new Lister;
var sourcer = new Sourcer;

router.get('/', auth.required, function (req, res, next) {
        Listing.find({}).then(function(listing){
            res.json({
                count: listing.length,
                listerStatus: lister.getStatus(),
                sourcerStatus: sourcer.getStatus()
            })
        }).catch(next);
});

router.get('/lister/start', auth.required, function(req, res, next){
    User.findById(req.payload.id).then(function(user){

    }).catch(next)
});

router.get('/lister/stop', auth.required, function(req, res, next){
    lister = null;
});

router.get('/sourcer/start', auth.required, function(req, res, next){
    if (sourcer.getStatus()){
        return res.json({status: sourcer.getStatus()});
    }
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(function(user){
        if (!user){
            return res.json({error: "no user logged in "});
        }

        sourcer.setEbayAccount(user.getEbayAccounts()[0])
    }).catch(next);

   sourcer.start();
   return res.json({status: sourcer.getStatus()})
});

router.get('/sourcer/stop', auth.required, function(req, res, next){
    if (!sourcer.getStatus()){
        return res.json({status: sourcer.getStatus()});
    }
    sourcer.stop();
    return res.json({status: sourcer.getStatus()})
});

router.get('/sourcer', auth.required, function(req, res, next){
    return res.json({status: sourcer.getStatus()})
});

module.exports = router;
