var passport = require('passport');
var refresh = require('passport-oauth2-refresh');
var mongoose = require('mongoose');
var User = mongoose.model('user');
var OAuth2Strategy = require('general-oauth2').Strategy;
var info = require('../config/credentials.js');

module.exports = function () {

    var authStrategy = new OAuth2Strategy(
        {
            authorizationURL: info.auth,
            tokenURL: info.token,
            clientID: info.id,
            clientSecret: info.secret,
            redirectURLName: info.redirect,
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, params, done, profile) {
            console.log(params);
            return done(null, accessToken, refreshToken)
        }
    );

    authStrategy._oauth2.setAuthMethod("BASIC");

    authStrategy.authorizationParams = function () {
        return {
            redirect_uri: info.redirect,
            response_type: "code",
            scope: info.scope
        };
    };

    passport.use('oauth2', authStrategy);
    refresh.use('oauth2', authStrategy);
};