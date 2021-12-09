const bcrypt = require('bcrypt');
const SendMail = require('../../config/mailTransporter');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Load email verification key from env
const emailVerificationKey = process.env.VERIFICATION_KEY;

// Load models
const { User } = require('../../database/models');
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
            where: { email: req.body.email }
        }).then((isExist) => {
            if (isExist) {
                return res.status(400).json({
                    message: 'Email or username already exists!'
                });
            } else {
                User.create({
                    email: req.body.email,
                    fullName: req.body.firstName + ' ' + req.body.lastName,
                    password: bcrypt.hashSync(req.body.password, 12),
                    isActive: false,
                }).then((user) => {
                    // Create JWT for email verification
                    const token = jwt.sign({ user }, emailVerificationKey, { expiresIn: '5m' });

                    SendMail(user.email, token).then(() => {
                        res.status(200).json({
                            message: 'You have been registered successfully!'
                        });
                    }).catch((error) => {
                        console.log(error);
                        res.status(400).json({
                            message: 'Something went wrong while sending your email, please try resend the activation email again.'
                        });
                    });
                }).catch((error) => {
                    res.status(400).json(error);
                });
            }
        });
    }
}

module.exports = RegisterController;