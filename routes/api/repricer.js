var router = require('express').Router();
var Repricer = require('../utils/Repricer');

router.get('/settings', function(req, res, next){

});

router.get('/', function(req, res, next){
    var repricer = new Repricer();
    repricer.start();
    res.json({message:'success'})
});

module.exports = router;