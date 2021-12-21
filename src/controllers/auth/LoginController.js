const bcrypt = require('bcrypt');
const User = require('../../mongodb/models/user');
const RefreshToken = require('../../mongodb/models/refreshToken');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const client = new OAuth2Client(process.env.CLIENT_ID);

// Load keys from .env
const accessKey = process.env.ACCESS_KEY;

// Load input validation
const validateLoginInput = require('../../validations/login');

class LoginController {
    static async googleAuthCallback(req, res) {
        const googleToken = req.headers.authorization.split(' ')[1];

        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.CLIENT_ID
        });
        const payload = ticket.getPayload();

        const user = await User.findOneAndUpdate(
            { email: payload.email },
            {
                fullName: payload.name,
                isActive: true
            },
            { new: true, upsert: true });

        const refreshToken = await RefreshToken.findOneAndUpdate(
            { userId: user._id },
            { token: crypto.randomUUID() },
            { new: true, upsert: true });

        const accessToken = jwt.sign({ user }, accessKey, { expiresIn: '5m' });
        res.cookie('refresh-token', refreshToken.token);
        res.cookie('access-token', 'Bearer ' + accessToken);
        res.send('success');
    }

    static async login(req, res) {
        // Form validation
        const { errors, isValid } = validateLoginInput(req.body);
        // Check validation
        if (!isValid) {
            return res.status(400).json(errors);
        }

        await User.findOne({ email: req.body.email }).then((user) => {
            // Check if user exists
            if (!user) {
                return res.status(404).json({
                    message: 'User with this credentials does not exist in our record!'
                });
            }
            // Check user activation status
            if (user.isActive === false) {
                return res.status(400).json({
                    message: 'Please activate your account first!'
                });
            }
            // Check user password
            bcrypt.compare(req.body.password, user.password).then((isMatch) => {
                if (isMatch) {
                    // Create JWT payload
                    const accessToken = jwt.sign({ user }, accessKey, { expiresIn: '5m' });

                    RefreshToken.findOneAndUpdate(
                        { userId: user._id },
                        { token: crypto.randomUUID() },
                        { new: true, upsert: true }).then((data) => {
                            return res.status(200).json({
                                user,
                                accessToken: accessToken,
                                refreshToken: data.token
                            });
                        });
                } else {
                    return res.status(400).json({
                        message: 'Password incorrect!'
                    });
                }
            });
        });
    }

    static async refreshAccessToken(req, res) {
        await RefreshToken.findOne({ token: req.body.refreshToken })
            .then((refreshToken) => {
                User.findById(refreshToken.userId).then((user) => {
                    const newAccessToken = jwt.sign({ user }, accessKey, { expiresIn: '5m' });
                    return res.status(200).json({
                        message: 'Your token has been refreshed!',
                        accessToken: newAccessToken
                    });
                });
            }).catch((error) => {
                return res.status(404).json({
                    message: 'Your token does not match any in our database!'
                });
            });
    }

    static async logout(req, res) {
        const refreshToken = req.body.refreshToken || req.cookies['refresh-token'];

        await RefreshToken.findOne({ token: refreshToken })
            .then((token) => {
                token.deleteOne();
                if (req.cookies['access-token']) {
                    res.clearCookie('refresh-token');
                    res.clearCookie('access-token');
                    return res.redirect('/auth/login');
                } else {
                    return res.status(200).json({
                        message: 'You have been logged out!'
                    });
                }
            }).catch((error) => {
                return res.status(400).json({
                    message: 'Your token does not match any in our database! Please try logging in again.'
                });
            });
    }
}

module.exports = LoginController;