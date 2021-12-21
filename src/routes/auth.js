const router = require('express').Router();

// Load middlewares
const { processToken, isAuthenticated } = require('../middlewares/authentication');

// Insert middlewares into array
const middlewares = [
    processToken,
    isAuthenticated
];

// Load auth controllers
const registerController = require('../controllers/auth/RegisterController');
const loginController = require('../controllers/auth/LoginController');
const verifyEmailController = require('../controllers/auth/VerifyEmailController');
const resetPasswordController = require('../controllers/auth/ResetPasswordController');
const profileController = require('../controllers/auth/ProfileController');

// @route POST auth/register
// @desc User registration endpoint
router.post('/register', registerController.register);

// @route GET auth/login
// @desc User login endpoint
router.get('/login', function (req, res, next) {
    res.render('login', { client_id: process.env.CLIENT_ID });
})

// @route POST auth/googleAuthCallback
// @desc Proccess sign in with google
router.post('/googleAuthCallback', loginController.googleAuthCallback);

// @route POST auth/login
// @desc User login endpoint
router.post('/login', loginController.login);

// @route POST auth/refreshAccessToken
// @desc Refresh access token endpoint
router.post('/refreshAccessToken', loginController.refreshAccessToken);

// @route GET auth/logout
// @desc User logout endpoint
router.post('/logout', loginController.logout);

// @route GET auth/profile
// @desc User profile endpoint
router.get('/profile', middlewares, profileController.getUserProfile);

// @route PUT auth/profile/update
// @desc User profile update endpoint
router.put('/profile/update', middlewares, profileController.updateProfile);

// @route GET auth/email/verify/:token
// @desc Email verification endpoint
router.get('/email/verify/:token', verifyEmailController.verify);

// @route GET auth/email/resendVerification
// @desc Resend email verification endpoint
router.get('/email/resendVerification', verifyEmailController.resendEmailVerification);

// @route GET auth/password/reset/:token
// @desc User reset password endpoint
router.get('/password/reset/:token', resetPasswordController.resetPassword);

// @route GET auth/password/sendEmail
// @desc Send reset password link by email
router.get('/password/sendEmail', resetPasswordController.sendResetPasswordEmail);

module.exports = router;