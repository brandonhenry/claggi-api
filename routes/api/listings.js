var router = require('express').Router();
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');
var Lister = require('../utils/Lister');
var User = mongoose.model('user');
var auth = require('../auth');
var lister = new Lister;

router.get('/', auth.required, function (req, res, next) {
        Listing.find({}).then(function(listing){
            res.json({
                count: listing.length,
                status: lister.getStatus()
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

module.exports = router;
