var Sourcer = require('../utils/Sourcer');
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('user');
var Listing = mongoose.model('listing');
var router = require('express').Router();

router.get('/', function(req, res, next){
    var sourcer = new Sourcer;
    sourcer.scrape();
    res.json({message:'success'});
});

module.exports = router;