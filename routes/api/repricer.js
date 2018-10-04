var router = require('express').Router();
var Repricer = require('../utils/Repricer');
var repricer = new Repricer();

router.get('/settings', function(req, res, next){
    repricer.setMargin(req.query.margin);
});

router.get('/', function(req, res, next){
    repricer.start();
    res.json({message:'success'})
});

module.exports = router;