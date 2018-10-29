var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('user');
var auth = require('../auth');
var EbayAccount = mongoose.model('ebayaccount');
var states = {};

router.post('/updateUser', auth.required, function (req, res, next) {
    EbayAccount.findById(states.ebayID).then(function (ebayAcc) {
        console.log(req.body);
        ebayAcc.username = req.body.name;
        ebayAcc.save().then(function(){
            return res.status(200).json({status: "set"});
        }).catch(next)
    }).catch(next)
});

router.post('/', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(function (user) {
            if (!user.getEbayToken()) {
                return res.status(422).json({errors: 'no ebay tokens have been set'})
            }

            var userEbayAccounts = user.getEbayAccounts();
            var token = user.getEbayToken();
            if (userEbayAccounts.length > 0) {
                var ebayAcc = userEbayAccounts[0];
                ebayAcc.accessToken = token.accessToken;
                ebayAcc.refreshToken = token.refreshToken;
                states["ebayID"] = ebayAcc.id;
                ebayAcc.save().then(function () {
                    return res.json({eBayAccount: ebayAcc.toAuthJSON()});
                }).catch(next)
            } else {
                var ebayAcc = new EbayAccount();
                ebayAcc.accessToken = token.accessToken;
                ebayAcc.refreshToken = token.refreshToken;
                states["ebayID"] = ebayAcc.id;

                ebayAcc.save().then(function () {
                    user.addEbayAccount(ebayAcc);
                    user.save().then(function () {
                        return res.json({eBayAccount: ebayAcc.toAuthJSON()});
                    }).catch(next)
                }).catch(next)
            }
        }).catch(next)
});

router.get('/', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(function (user) {
            if (!user){
                return res.status(422).json({error: "no user logged in"})
            }

            return res.json(user.getEbayAccounts()[0].toAuthJSON())
        }).catch(next);


});

router.put('/update', function (req, res, next) {
    User.findById(req.session.user.id).then(function (user) {
        EbayAccount.find({accessToken: user.getEbayToken().accessToken}).then(function (eBayAccount) {
            eBayAccount.updateInfo();
            eBayAccount.save().then(function () {
                return res.json({eBayAccount: eBayAccount.toAuthJSON()});
            }).catch(next);
        }).catch(next);
    }).catch(next)
});

//-----------------------------------------FULFILLMENT-----------------------------------------//

router.get('/fulfillment/orders', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user){
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            return res.json(await ebayAcc.getOrders());
        }).catch(next);
});

//-------------------------------------------ACCOUNT-------------------------------------------//

router.get('/account/privileges', function (req, res, next) {
    EbayAccount.findById(states["ebayID"]).then(async function (ebayAcc) {
        if (!ebayAcc) {
            return res.status(422).json({errors: "no ebay account found"})
        }
        return res.json(await ebayAcc.getPrivileges());
    }).catch(next)
});

//-------------------------------------------ANALYTICS-------------------------------------------//

router.get('/analytics/sellerinfo', function (req, res, next) {
    EbayAccount.findById(states["ebayID"]).then(async function (ebayAcc) {
        if (!ebayAcc) {
            return res.status(422).json({errors: "no ebay account found"})
        }
        return res.json(await ebayAcc.getSellerInfo());
    }).catch(next)
});

router.get('/analytics/trafficreport', function (req, res, next) {
    EbayAccount.findById(states["ebayID"]).then(async function (ebayAcc) {
        if (!ebayAcc) {
            return res.status(422).json({errors: "no ebay account found"})
        }
        return res.json(await ebayAcc.getTrafficReport({dimension: 'DAY'}));
    }).catch(next)
});

//-------------------------------------------INVENTORY-------------------------------------------//

router.get('/inventory/', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user){
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            return res.json(await ebayAcc.getInventoryItems());
        }).catch(next);
});

module.exports = router;

