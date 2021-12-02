const express = require('express');
const router = express.Router();

// Import middleware
const checkAuthenticated = require('../middlewares/checkAuthenticated');
// Import routes
const auth = require('./auth');

// Route using
router.use('/auth', auth);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET dashboard
router.get('/home', checkAuthenticated, function (req, res, next) {
  let user = req.user;
  res.set({
    'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  });
  res.render('home', { user });
});

module.exports = router;
