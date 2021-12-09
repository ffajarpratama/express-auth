const jwt = require('jsonwebtoken');
const { User, PasswordReset } = require('../../database/models');
const bcrypt = require('bcrypt');
const SendMail = require('../../config/mailTransporter');
const crypto = require('crypto');
require('dotenv').config();

// Load reset password key from env
const resetPasswordKey = process.env.RESET_PASSWORD_KEY;

class ResetPasswordController {
    static async sendResetPasswordEmail(req, res) {
        const user = await User.findOne({
            where: { email: req.body.email }
        });

        if (!user) {
            res.status(400).json({
                message: 'User with this credentials does not exist on our record!'
            });
        } else {
            const token = await PasswordReset.create({
                userId: user.id,
                token: crypto.randomBytes(10).toString('hex')
            });

            const mail = {
                email: user.email,
                subject: 'Link for Resetting your Password',
                endpoint: '/auth/password/reset/',
                content: 'Please click this link below to reset your password. We will send you an email containing your new password.',
                token: token.token
            }

            SendMail(mail.email, mail.subject, mail.endpoint, mail.content, mail.token).then(() => {
                res.status(200).json({
                    message: 'Reset password link has been sent to your email!'
                });
            }).catch(error => {
                console.log(error);
                res.status(400).json({
                    message: 'Something went wrong while sending your email, please try resend the email again'
                });
            });
        }
    }

    static async resetPassword(req, res) {
        const token = await PasswordReset.findOne({
            where: { token: req.params.token }
        });

        if (token) {
            const user = await User.findByPk(token.userId);

            const newPassword = crypto.randomBytes(10).toString('hex');
            const newHashedPassword = bcrypt.hashSync(newPassword, 12);

            user.update({ password: newHashedPassword });
            token.destroy();

            const mail = {
                email: user.email,
                subject: 'New Password for your Account',
                endpoint: '',
                content: 'Your new password is ' + newPassword,
                token: ''
            }

            SendMail(mail.email, mail.subject, mail.endpoint, mail.content, mail.token).then(() => {
                res.status(200).json({
                    message: 'Your new password has been sent!'
                });
            }).catch(error => {
                res.status(400).json({
                    message: 'Something went wrong: ' + error.message
                });
            });
        } else {
            res.status(400).json({
                message: 'Token invalid!'
            });
        }
    }
}

module.exports = ResetPasswordController;