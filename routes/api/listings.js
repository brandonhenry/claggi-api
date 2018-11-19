var router = require('express').Router();
var mongoose = require('mongoose');
var Offers = mongoose.model('offers');
var Lister = require('../utils/Lister');
var Sourcer = require('../utils/Sourcer');
var User = mongoose.model('user');
var auth = require('../auth');
var lister = new Lister;
var sourcer = new Sourcer;

router.get('/', auth.required, function (req, res, next) {
        Offers.find({}).then(function(offers){
            res.json({
                count: offers.length,
                offers: offers,
                listerStatus: lister.getStatus(),
                sourcerStatus: sourcer.getStatus(),
                sourcerLastScan: sourcer.getLastScan(),
                listerLastUpdate: lister.getLastUpdate()
            })
        }).catch(next);
});

router.get('/lister/start', auth.required, function(req, res, next){
    if (lister.getStatus()){
        return res.json({status: lister.getStatus()})
    }
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(function(user){
        if (!user){
            return res.json({error: "no user found"})
        }
        if (!user.getEbayAccounts()[0]){
            return res.json({error: "no ebay account found"})
        }

        lister.setAccount(user.getEbayAccounts()[0]).then(function(){
            lister.start();
            return res.json({status: lister.getStatus()})
        });
    }).catch(next);
});

router.get('/lister/stop', auth.required, function(req, res, next){
    if (!lister.getStatus()){
        return res.json({status: lister.getStatus()})
    }
    lister.stop();
    return res.json({status: false})
});

router.get('/lister/getLastUpdate', auth.required, function(req, res, next){
    return res.json({lastUpdate: lister.getLastUpdate()})
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

   sourcer.run();
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

router.get('/lister', auth.required, function(req, res, next){
    return res.json({status: lister.getStatus()})
});

module.exports = router;
