const bcrypt = require('bcrypt');
const User = require('../../mongodb/models/user');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const client = new OAuth2Client(process.env.CLIENT_ID);
const gmailRegistrationKey = process.env.REGISTRATION_KEY;

// Load access key from .env
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

        await User.findOneAndUpdate(
            { email: payload.email },
            {
                fullName: payload.name,
                password: bcrypt.hashSync(payload.email + gmailRegistrationKey, 12),
                isActive: true
            }, { new: true, upsert: true })
            .then((user) => {
                jwt.sign({ user }, accessKey, { expiresIn: '5m' }, (err, token) => {
                    res.cookie('session-token', 'Bearer ' + token);
                    res.send('success');
                });
            });
    }

    static async login(req, res) {
        // Form validation
        const { errors, isValid } = validateLoginInput(req.body);
        // Check validation
        if (!isValid) {
            return res.status(400).json(errors);
        }

        await User.findOne({
            email: req.body.email
        }).then((user) => {
            // Check if user exists
            if (!user) {
                return res.status(400).json({
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
                    jwt.sign({ user }, accessKey, { expiresIn: '5m' }, (err, token) => {
                        return res.status(200).json({
                            token: token,
                            userData: user
                        })
                    })
                } else {
                    return res.status(400).json({
                        message: 'Password incorrect!'
                    });
                }
            });
        });
    }
}

module.exports = LoginController;