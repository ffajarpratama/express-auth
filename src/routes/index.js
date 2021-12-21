const express = require('express');
const router = express.Router();

// Load middlewares
const { processToken, isAuthenticated } = require('../middlewares/authentication');

const middlewares = [
  processToken,
  isAuthenticated
]

// Import routes
const auth = require('./auth');

// Route using
router.use('/auth', auth);

// @route GET /
// @desc Express index endpoint
router.get('/', function (req, res) {
  res.render('index', { title: 'Express' });
});

// @route /home
// @desc Authenticated user endpoint
router.get('/home', middlewares, function (req, res) {
  res.render('home', { client_id: process.env.CLIENT_ID, user: req.user });
});

module.exports = router;
