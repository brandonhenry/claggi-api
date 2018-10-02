var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Order = mongoose.model('Order');
var User = mongoose.model('User');
var auth = require('../auth');

module.exports = router;