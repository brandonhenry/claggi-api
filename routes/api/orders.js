var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Order = mongoose.model('order');
var User = mongoose.model('user');
var auth = require('../auth');
var AmazonBot = require('../utils/AmazonBot');
var amazon = new AmazonBot();

router.get('/', function(req, res, next){
    amazon.login('#', '#').then(function(results){
        res.json({message: results});
    }).catch(next);
});

module.exports = router;