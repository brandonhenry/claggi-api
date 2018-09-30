var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var OAuth2Strategy = require('general-oauth2').Strategy;
var clientID = require('../config').clientID;
var clientSecret = require('../config').clientSecret;
var scope = 'https://api.ebay.com/oauth/api_scope/sell.marketing';
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

var authStrategy = new OAuth2Strategy(
    {
        authorizationURL: 'https://auth.ebay.com/oauth2/authorize?',
        tokenURL: 'https://api.ebay.com/identity/v1/oauth2/token',
        clientID: 'BrandonH-SkuGrid-PRD-066850dff-54313674',
        clientSecret: 'PRD-66850dfff6e9-feec-4725-8aed-13b2',
        redirectURLName: 'Brandon_Henry-BrandonH-SkuGri-akmrj',
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, params, done, profile) {
        console.log(params);
        return done(null, accessToken, refreshToken)
    }
);

authStrategy._oauth2.setAuthMethod("BASIC");

authStrategy.authorizationParams = function () {
    return {
        redirect_uri: "Brandon_Henry-BrandonH-SkuGri-akmrj",
        response_type: "code",
        scope: scope
    };
};

passport.use('oauth2', authStrategy);
