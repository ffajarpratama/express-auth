const bcrypt = require('bcrypt');
const { User } = require('../../database/models');
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
        const googleToken = req.body.token;

        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.CLIENT_ID
        });
        const payload = ticket.getPayload();

        await User.findOrCreate({
            where: { email: payload.email },
            defaults: {
                fullName: payload.name,
                password: bcrypt.hashSync(payload.email + gmailRegistrationKey, 12),
                isActive: true
            }
        });

        res.cookie('session-token', googleToken);
        res.send('success');
    }

    static async login(req, res) {
        // Form validation
        const { errors, isValid } = validateLoginInput(req.body);
        // Check validation
        if (!isValid) {
            return res.status(400).json(errors);
        }

        await User.findOne({
            where: { email: req.body.email }
        }).then((user) => {
            // Check if user is exists
            if (!user) {
                return res.status(400).json({
                    message: 'Email does not exist!'
                });
            }
            // Check user activation status
            if (user.isActive === false) {
                return res.status(400).json({
                    message: 'Please activate your account first!'
                });
            }
            // Process password
            bcrypt.compare(req.body.password, user.password).then((isMatch) => {
                if (isMatch) {
                    // Create JWT payload
                    jwt.sign({ user }, accessKey, { expiresIn: '1m' }, (err, token) => {
                        res.status(200).json({
                            token: token,
                            user_data: user
                        });
                    });
                } else {
                    return res.status(400).json({
                        message: 'Password incorrect!',
                    });
                }
            });
        });
    }
}

module.exports = LoginController;