var router = require('express').Router();
var mongoose = require('mongoose');
var Listing = mongoose.model('listing');
var request = require('request');

router.get('/', function (req, res, next) {
    Listing.find({}).then(function(listing){
        res.json(JSON.stringify(listing))
    }).catch();
});

router.get('/lister', function (req, res, next){

});

module.exports = router;
