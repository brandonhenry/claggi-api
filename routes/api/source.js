var Sourcer = require('../utils/Sourcer');
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('user');
var Offers = mongoose.model('offers');
var router = require('express').Router();
var EbayAccount = mongoose.model('ebayaccount');
var auth = require('../auth');

router.get('/', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user.getEbayToken()) {
            return res.status(422).json({errors: 'no ebay tokens have been set'})
        }

        var sourcer = new Sourcer(user.getEbayAccount());
        sourcer.scrape();
        res.json({message: 'success'});
    }).catch();
});

module.exports = router;