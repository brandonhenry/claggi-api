var router = require('express').Router();
var Repricer = require('../utils/Repricer');

router.get('/settings', function(req, res, next){
    var repricer = new Repricer();
});

module.exports = router;