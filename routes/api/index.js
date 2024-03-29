var router = require('express').Router();

router.use('/listings', require('./listings'));
router.use('/', require('./users'));
router.use('/profiles', require('./profiles'));
router.use('/orders', require('./orders'));
router.use('/ebay', require('./ebay'));
router.use('/source', require('./source'));
router.use('/repricer', require('./repricer'));

router.use(function(err, req, res, next){
  if (err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
