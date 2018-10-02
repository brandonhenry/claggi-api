var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('user');
var OAuth2Strategy = require('general-oauth2').Strategy;
var clientID = require('../config').clientID;
var clientSecret = require('../config').clientSecret;
var scope = 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly';

module.exports = function(){

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
};