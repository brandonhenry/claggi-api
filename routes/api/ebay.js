var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('user');
var auth = require('../auth');
var EbayAccount = mongoose.model('ebayaccount');
var AccountValidator = require('../utils/AccountValidator');
var states = {};

function refresh(user, ebayAcc, res, next) {
    AccountValidator.refreshAccessToken(user.ebayRefreshToken).then((success) => {
        if (success) {
            ebayAcc.accessToken = success.accessToken;
            ebayAcc.refreshToken = user.ebayRefreshToken;
            ebayAcc.save(function () {
                return res.json({reRequestSuccess: success.info, message: "refresh token reset"})
            }).catch(next);
        }
    }).catch((err) => {
        console.log(err);
        return res.json({error: err})
    });
}

router.post('/updateUser', auth.required, function (req, res, next) {
    EbayAccount.findById(states.ebayID).then(function (ebayAcc) {
        console.log(req.body);
        ebayAcc.username = req.body.name;
        ebayAcc.save().then(function () {
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
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }

            var accountValidator = new AccountValidator(user);
            await accountValidator.validate();
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
    delete req.body.__v;
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            await ebayAcc.getOrders().then((success) => {
                if (success) {
                    return res.json(success);
                } else {
                    refresh(user, ebayAcc, res, next);
                }
            });
        }).catch(next);
});

//-------------------------------------------ACCOUNT-------------------------------------------//

router.get('/account/privileges', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            ebayAcc.getPrivileges().then((success) => {
                if (success) {
                    return res.json(success);
                } else {
                    refresh(user, ebayAcc, res, next);
                }
            })
        }).catch(next);
});

router.get('/account/updatePolicies', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            ebayAcc.fulfillmentPolicies = [];
            ebayAcc.paymentPolicies = [];
            ebayAcc.returnPolicies = [];
            await ebayAcc.getFulfillmentPolicies().then(async (res) => {
                console.log(res);
                res.fulfillmentPolicies.forEach(async (policy) => {
                    await ebayAcc.addPolicy("fulfillment", [{
                        name: policy.name,
                        policyId: policy.fulfillmentPolicyId
                    }]);
                });
            });
            await ebayAcc.getReturnPolicies().then(async (res) => {
                res.returnPolicies.forEach(async (policy) => {
                    await ebayAcc.addPolicy("return", [{
                        name: policy.name,
                        policyId: policy.returnPolicyId
                    }]);
                });
            });
            await ebayAcc.getPaymentPolicies().then(async (res) => {
                res.paymentPolicies.forEach(async (policy) => {
                    await ebayAcc.addPolicy("payment", [{
                        name: policy.name,
                        policyId: policy.paymentPolicyId
                    }]);
                });
            });
            ebayAcc.save(() => {
                return res.json(ebayAcc.toAuthJSON())
            })
        }).catch(next);
});

router.post('/account/updatePolicies', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            await ebayAcc.setFulfillmentPolicy(req.body.fulfillmentPolicy.policyId);
            await ebayAcc.setPaymentPolicy(req.body.paymentPolicy.policyId);
            await ebayAcc.setReturnPolicy(req.body.returnPolicy.policyId);
            ebayAcc.save(() => {
                return res.json(ebayAcc.toAuthJSON())
            })
        }).catch(next);
});

//-------------------------------------------ANALYTICS-------------------------------------------//

router.get('/analytics/sellerinfo', function (req, res, next) {
    EbayAccount.findById(states["ebayID"]).then(async function (ebayAcc) {
        if (!ebayAcc) {
            return res.status(422).json({errors: "no ebay account found"})
        }

        ebayAcc.getSellerInfo().then((success) => {
            if (success) {
                return res.json(success);
            } else {
                refresh(user, ebayAcc, res, next);
            }
        });
    }).catch(next)
});

router.get('/analytics/trafficreport', function (req, res, next) {
    EbayAccount.findById(states["ebayID"]).then(async function (ebayAcc) {
        if (!ebayAcc) {
            return res.status(422).json({errors: "no ebay account found"})
        }
        ebayAcc.getTrafficReport({dimension: 'DAY'}).then((success) => {
            if (success) {
                return res.json(success);
            } else {
                refresh(user, ebayAcc, res, next);
            }
        })
    }).catch(next)
});

//-------------------------------------------INVENTORY-------------------------------------------//

router.get('/inventory/', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            ebayAcc.getInventoryItems().then((success) => {
                if (success) {
                    return res.json(success);
                } else {
                    refresh(user, ebayAcc, res, next);
                }
            });
        }).catch(next);
});

router.post('/inventory/sku', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            ebayAcc.getInventoryItem(req.body.sku).then((success) => {
                if (success) {
                    return res.json(success);
                } else {
                    refresh(user, ebayAcc, res, next);
                }
            })
        }).catch(next);
});

router.post('/inventory/offer', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            ebayAcc.getOffer(req.body.offerid).then((success) => {
                if (success) {
                    return res.json(success);
                } else {
                    refresh(user, ebayAcc, res, next);
                }
            });
        }).catch(next);
});

router.post('/inventory/publishOffer', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            ebayAcc.publishOffer(req.body.offerid).then((success) => {
                if (success) {
                    return res.json(success);
                } else {
                    refresh(user, ebayAcc, res, next);
                }
            })
        }).catch(next);
});

router.post('/inventory/updateOffer', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            return res.json(await ebayAcc.updateOffer(req.body.offerid, {
                "merchantLocationKey": ebayAcc.merchantLocationKey,
                "pricingSummary":
                    {
                        /* PricingSummary */
                        "price":
                            {
                                /* Amount */
                                "currency": "USD",
                                "value": "40"
                            }
                    },
                "listingPolicies":
                    {
                        /* ListingPolicies */
                        "paymentPolicyId": ebayAcc.activePayment,
                        "returnPolicyId": ebayAcc.activeReturn,
                        "fulfillmentPolicyId": ebayAcc.activeFulfillment,
                    },
            }));
        }).catch(next);
});

router.post('/inventory/createLocation', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            console.log(req.body.location);
            ebayAcc.createLocation(req.body.location).then((success) => {
                if (success) {
                    return res.json(success);
                } else {
                    refresh(user, ebayAcc, res, next);
                }
            })
        }).catch(next);
});

router.post('/inventory/getLocation', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            await ebayAcc.getLocation().then((success) => {
                if (success) {
                    return res.json(success);
                } else {
                    refresh(user, ebayAcc, res, next);
                }
            })
        }).catch(next);
});

router.post('/inventory/setLocation', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            await ebayAcc.setLocation(req.body.loc).then((success) => {
                if (success) {
                    return res.json(success);
                } else {
                    refresh(user, ebayAcc, res, next);
                }
            })
        }).catch(next);
});

//-------------------------------------------TAXONOMY-------------------------------------------//

router.get('/taxonomy/getDefaultCategory', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(async function (user) {1
            if (!user) {
                return res.status(422).json({error: "no user logged in"})
            }
            var ebayAcc = user.getEbayAccounts()[0];
            if (!ebayAcc) {
                return res.status(422).json({errors: "no ebay account found"})
            }
            await ebayAcc.setDefaultCategory().then((success) => {
                if (success) {
                    return res.json(success);
                } else {
                    refresh(user, ebayAcc, res, next);
                }
            })
        }).catch(next);
});

module.exports = router;

