var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.post('/users', function (req, res, next) {
    var user = new User();

    user.username = req.body.user.username;
    user.email = req.body.user.email;
    user.setPassword(req.body.user.password);

    user.save().then(function () {
        return res.json({user: user.toAuthJSON()});
    }).catch(next);
});

router.get('/users/access', function (req, res, next) {
    passport.authenticate('oauth2', {
        code: req.query.code,
        failureRedirect: '/',
    }, function (err, accessToken, refreshToken) {

        const {state} = req.query;
        const {returnTo} = JSON.parse(new Buffer(state, 'base64').toString());
        console.log(returnTo);

        // Successful authentication, redirect home.
        res.json({success: 'success', accessToken: accessToken, refreshToken: refreshToken});
    })(req, res, next)
});

router.get('/users/request', function (req, res, next) {
    const {returnTo} = req.query;
    const state = returnTo
        ? new Buffer(JSON.stringify({returnTo})).toString('base64')
        : undefined;

    const authenticator = passport.authenticate('oauth2', {scope: [], state, email: req.query.email});

    authenticator(req, res, next)
});

router.post('/users/login', function (req, res, next) {
    if (!req.body.user.email) {
        return res.status(422).json({errors: {email: "can't be blank"}});
    }

    if (!req.body.user.password) {
        return res.status(422).json({errors: "can't be blank"});
    }

    passport.authenticate('local', {session: false}, function (err, user, info) {
        if (err) {
            return next(err);
        }

        if (user) {
            user.token = user.generateJWT();
            return res.json({user: user.toAuthJSON()});
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next)
});

router.get('/user', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }

        return res.json({user: user.toAuthJSON()});
    }).catch(next);
});

router.put('/user', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.SendStatus(401);
        }

        // only update fields that were actually passed...
        if (typeof req.body.user.username !== 'undefined') {
            user.username = req.body.user.username;
        }
        if (typeof req.body.user.email !== 'undefined') {
            user.email = req.body.user.email;
        }
        if (typeof req.body.user.password !== 'undefined') {
            user.password = req.body.user.password;
        }

        return user.save().then(function () {
            return res.json({user: user.toAuthJSON()});
        })
    }).catch(next);
});


module.exports = router;
