var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('user');
var auth = require('../auth.js');

router.param('username', function (req, res, next, username) {
    User.findOne({'username': username}).then(function (user) {
        if (!user) {
            return res.sendStatus(404);
        }
        req.profile = user;
        return next();
    }).catch(next)
});

router.get('/:username', auth.optional, function (req, res, next) {
    if (req.payload) {
        User.findById(req.payload.id).then(function(user){
            return !user ? res.json({profile:req.profile.toProfileJSONFor(false)}) :
                res.json({profile:req.profile.toProfileJSONFor(user)});
        });
    } else {
        res.json({profile:req.profile.toProfileJSONFor(false)})
    }
});

module.exports = router;