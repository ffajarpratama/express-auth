const bcrypt = require('bcrypt');
const SendMail = require('../../config/mailTransporter');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Load models
const { User, Token } = require('../../database/models');
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
            where: {
                [Op.or]: [
                    { email: req.body.email },
                    { username: req.body.username }
                ]
            }
        }).then((isExist) => {
            if (isExist) {
                return res.status(400).json({
                    message: 'Email or username already exists!'
                });
            } else {
                User.create({
                    email: req.body.email,
                    username: req.body.username,
                    password: bcrypt.hashSync(req.body.password, 10),
                    isActive: false,
                }).then((user) => {
                    // Generate token for newly registered user
                    const newToken = crypto.randomBytes(10).toString('hex');

                    Token.create({
                        token: newToken,
                    }).then((token) => {
                        const data = {
                            id: user.id,
                            email: user.email,
                            token: token.token
                        }
                        // Send verification email to user
                        SendMail(data.id, data.email, data.token).then(() => {
                            res.status(200).json({
                                message: 'You have been registered successfully!'
                            });
                        }).catch((error) => {
                            res.status(400).json({
                                message: 'Something went wrong while sending your email, please try resend the activation email again.'
                            })
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