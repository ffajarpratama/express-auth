const router = require('express').Router();

// Load auth controllers
const registerController = require('../controllers/auth/RegisterController');
const loginController = require('../controllers/auth/LoginController');
const verifyEmailController = require('../controllers/auth/VerifyEmailController');

// @route POST auth/register
// @desc User registration endpoint
router.post('/register', registerController.register);

// @route GET auth/login
// @desc User login endpoint
router.get('/login', function (req, res, next) {
    res.render('login', { client_id: process.env.CLIENT_ID });
})

// @route POST auth/tokensignin
// @desc Proccess sign in with google
router.post('/googleAuthCallback', loginController.googleAuthCallback);

// @route POST auth/login
// @desc User login endpoint
router.post('/login', loginController.login);

// @route GET auth/verifyEmail/:id/:token
// @desc Email verification endpoint
router.get('/verifyEmail/:id/:token', verifyEmailController.verify);

// @route GET auth/logout
// @desc User logout endpoint
router.get('/logout', function (req, res, next) {
    res.clearCookie('session-token');
    res.redirect('/auth/login');
});

module.exports = router;