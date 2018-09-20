var express = require('express');
var router = express.Router();

router.use('/listings', require('.listings'));
router.use('/', require('./users'));

module.exports = router;
