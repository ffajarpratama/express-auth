const User = require('../../mongodb/models/user');
const PasswordReset = require('../../mongodb/models/passwordReset');
const bcrypt = require('bcrypt');
const SendMail = require('../../config/mailTransporter');
const crypto = require('crypto');

class ResetPasswordController {
    static async sendResetPasswordEmail(req, res) {
        const user = await User.findOne({
            email: req.body.email
        });

        // Delete reset password token of the user if it already exists
        await PasswordReset.findOneAndDelete({ userId: user._id });

        // Check if user exists
        if (!user) {
            return res.status(400).json({
                message: 'User with this credentials does not exist in our record!'
            });
        } else {
            // Create new token for the user
            const token = await PasswordReset.create({
                userId: user._id,
                token: crypto.randomBytes(10).toString('hex')
            });

            // Create new mail to user
            const mail = {
                email: user.email,
                subject: 'Link for Resetting your Password',
                endpoint: '/auth/password/reset/',
                content: 'Please click this link below to reset your password. We will send you an email containing your new password.',
                token: token.token
            }

            SendMail(mail.email, mail.subject, mail.endpoint, mail.content, mail.token).then(() => {
                return res.status(200).json({
                    message: 'Reset password link has been sent to your email!'
                });
            }).catch(error => {
                console.log(error);
                return res.status(400).json({
                    message: 'Something went wrong while sending your email, please try resend the email again'
                });
            });
        }
    }

    static async resetPassword(req, res) {
        const token = await PasswordReset.findOne({
            token: req.params.token
        });

        if (token) {
            // Create new password and hash it using bcrypt
            const newPassword = crypto.randomBytes(10).toString('hex');
            const newHashedPassword = bcrypt.hashSync(newPassword, 12);

            // Find user by id using userId from passwordResets collection
            await User.findByIdAndUpdate(token.userId, { password: newHashedPassword }, { new: true })
                .then((user) => {
                    token.deleteOne();

                    // Send new password to the user
                    const mail = {
                        email: user.email,
                        subject: 'New Password for your Account',
                        endpoint: '',
                        content: 'Your new password is ' + newPassword,
                        token: ''
                    }

                    SendMail(mail.email, mail.subject, mail.endpoint, mail.content, mail.token).then(() => {
                        return res.status(200).json({
                            message: 'Your new password has been sent!'
                        });
                    }).catch(error => {
                        return res.status(400).json({
                            message: 'Something went wrong: ' + error.message
                        });
                    });
                });
        } else {
            return res.status(400).json({
                message: 'Token invalid!'
            });
        }
    }
}

module.exports = ResetPasswordController;