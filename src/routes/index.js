const express = require('express');
const router = express.Router();
// const nodemailer = require('nodemailer');

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

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   host: 'smtp.gmail.com',
//   auth: {
//     user: process.env.GMAIL_USERNAME,
//     pass: process.env.GMAIL_PASS
//   }
// });

// router.post('/mail-test', (req, res, next) => {
//   const { to, subject, text } = req.body;

//   const mailOptions = {
//     from: process.env.GMAIL_USERNAME,
//     to: to,
//     subject: subject,
//     text: text
//   }

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log('Error: ' + error);
//     } else {
//       console.log(info);
//     }
//   });
// });

module.exports = router;
