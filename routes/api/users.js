var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('user');
var auth = require('../auth');
// declare states where it's accessible inside the clusre functions
var states = {};

function isLoggedIn(){
    return states["user"];
}

router.post('/users', function (req, res, next) {
    var user = new User();

    user.username = req.body.user.username;
    user.email = req.body.user.email;
    user.setPassword(req.body.user.password);

    user.save().then(function () {
        return res.json({user: user.toAuthJSON()});
    }).catch(next);
});

router.post('/users/manual', function(req, res, next){
    if (!isLoggedIn()){
        return res.status(422).json({error: "invalid_user"})
    }
    var userState = states["user"].user;
    if (!req.session) {
        return res.status(401).json({error: 'must be signed in'});
    }
    User.findById(userState.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }
        user.ebayToken = req.body.token;
        user.save( () => {return res.json({user:user.toAuthJSON()})}).catch(next);
    }).catch(next);
});

router.get('/users/access', function (req, res, next) {
    if (!isLoggedIn()){
        return res.status(422).json({error: "invalid_user"})
    }
    var userState = states["user"].user;
    passport.authenticate('oauth2', {
        code: req.query.code,
        failureRedirect: '/',
    }, function (err, accessToken, refreshToken) {
        if (err){
            console.log(err);
            return res.redirect('http://localhost:3000/#/main/settings');
        }
        if (!req.session) {
            return res.status(401).json({error: 'must be signed in'});
        }
        User.findById(userState.id).then(function (user) {
            if (!user) {
                return res.sendStatus(401);
            }
            user.setEbayToken(accessToken, refreshToken);
            user.save(()=>{return res.redirect('http://localhost:3000/#/main/settings')}).catch(next);
        }).catch(next);
    })(req, res, next)
});

router.get('/users/request', passport.authenticate('oauth2'));

router.get('/users/revoke', function (req, res, next) {
    if (!isLoggedIn()){
        return res.status(422).json({error: "invalid_user"})
    }
    var userState = states["user"].user;
    User.findById(userState.id).then(function (user) {
        user.removeAccess();
        user.save().then(function () {
            console.log(user);
            res.redirect("http://localhost:3000/#/main/settings");
        }).catch(next);
    }).catch(next)
});

router.get('/users/reset', function (req, res, next) {
    if (!isLoggedIn()){
        return res.status(422).json({error: "invalid_user"})
    }
    var userState = states["user"].user;
    User.findById(userState.id).then(function (user) {
        user.removeEbayAccounts();
        user.save().then(function () {
            return res.status(200).redirect('http://localhost:3000/#/main/settings');
        }).catch(next)
    }).catch(next)
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
            states["user"] = {
                user: user
            };
            user.save();
            return res.json({user: user.toAuthJSON()});
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next)
});

router.get('/user', auth.required, function (req, res, next) {
    if (!isLoggedIn()){
        return res.json({error: "invalid_user"})
    }
    User.findById(req.payload.id)
        .populate("ebayAccounts")
        .then(function (user) {
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
