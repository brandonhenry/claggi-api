var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var OAuth2Strategy = require('general-oauth2').Strategy;
var clientID = require('../config').clientID;
var clientSecret = require('../config').clientSecret;
var scope = ["https://api.ebay.com/oauth/api_scope", "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly", "https://api.ebay.com/oauth/api_scope/sell.marketing", "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly", "https://api.ebay.com/oauth/api_scope/sell.inventory", "https://api.ebay.com/oauth/api_scope/sell.account.readonly", "https://api.ebay.com/oauth/api_scope/sell.account", "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly", "https://api.ebay.com/oauth/api_scope/sell.fulfillment", "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly"];


passport.use('local', new LocalStrategy({
    usernameField: 'user[email]',
    passwordField: 'user[password]'
}, function (email, password, done) {
    User.findOne({email: email}).then(function (user) {
        if (!user || !user.validPassword(password)) {
            return done(null, false, {errors: {'email or password': 'is invalid'}})
        }

        return done(null, user);
    }).catch(done);
}));

passport.use('oauth2', new OAuth2Strategy({
        authorizationURL: 'https://signin.ebay.com/authorize',
        tokenURL: 'https://api.ebay.com/identity/v1/oauth2/token',
        clientID: 'BrandonH-SkuGrid-PRD-066850dff-54313674',
        clientSecret: 'PRD-66850dfff6e9-feec-4725-8aed-13b2',
        scope: scope,
        redirectUrlAsName: true,  //for ebay as ebay need a string instead of URL
        callbackURL: "http://localhost:3000/users/access"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOne({ user: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));