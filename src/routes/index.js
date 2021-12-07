const express = require('express');
const router = express.Router();

// Import middleware
const checkAuthenticated = require('../middlewares/checkAuthenticated');
// Import routes
const auth = require('./auth');

// Route using
router.use('/auth', auth);

// @route GET /
// @desc Express index endpoint
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// @route /home
// @desc Authenticated user endpoint
router.get('/home', checkAuthenticated, function (req, res, next) {
  const user = req.user;
  return res.status(200).json({
    data: user
  });
});

module.exports = router;
