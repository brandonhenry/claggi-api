var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Order = mongoose.model('order');
var User = mongoose.model('user');
var auth = require('../auth');
var AmazonBot = require('../utils/AmazonBot');
var amazon = new AmazonBot();

router.get('/', function(req, res, next){
    amazon.login('claggiebay@gmail.com', 'iloveJesus210').then({
    }).catch(next).then(function(){
        amazon.addToCart('B0029U2IOK', 1).then(function(result){
            res.json({message: result})
        }).catch()
    });
});

module.exports = router;