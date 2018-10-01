var passport = require('passport');
var local = require('./local');
var ebay = require('./ebay');

module.exports = function(app){
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser(function(user, done){
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    local();
    ebay();
};

