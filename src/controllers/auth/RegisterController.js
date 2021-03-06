const bcrypt = require('bcrypt');
const SendMail = require('../../config/mailTransporter');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Load email verification key from env
const emailVerificationKey = process.env.VERIFICATION_KEY;

// Load MongoDB user model
const User = require('../../mongodb/models/user');
// Load input validation
const validateRegisterInput = require('../../validations/register');

class RegisterController {
    static async register(req, res) {
        // Form validation
        const { errors, isValid } = validateRegisterInput(req.body);
        // Check validation
        if (!isValid) {
            return res.status(400).json(errors);
        }

        await User.findOne({
            email: req.body.email
        }).then((isExist) => {
            if (isExist) {
                return res.status(400).json({ message: 'User with this email already exists!' });
            } else {
                User.create({
                    email: req.body.email,
                    fullName: req.body.firstName + ' ' + req.body.lastName,
                    password: bcrypt.hashSync(req.body.password, 12),
                    isActive: false
                }).then((user) => {
                    const mail = {
                        email: user.email,
                        subject: 'Email Registration Verification for Our Application',
                        endpoint: '/auth/email/verify/',
                        content: 'Please verify your email by clicking the link below',
                        token: jwt.sign({ user }, emailVerificationKey, { expiresIn: '5m' })
                    }

                    SendMail(mail.email, mail.subject, mail.endpoint, mail.content, mail.token).then(() => {
                        return res.status(200).json({
                            message: 'You have been registered successfully!'
                        });
                    }).catch((error) => {
                        console.log(error);
                        return res.status(400).json({
                            message: 'Something went wrong while sending your email, please try resend the activation email again.'
                        });
                    });
                }).catch((error) => {
                    return res.status(400).json(error);
                });
            }
        });
    }
}

module.exports = RegisterController;