const User = require('../../mongodb/models/user');
const jwt = require('jsonwebtoken');
const SendMail = require('../../config/mailTransporter');
require('dotenv').config();

// Load email verification key from env
const emailVerificationKey = process.env.VERIFICATION_KEY;
class VerifyEmailController {
    static async resendEmailVerification(req, res) {
        const user = await User.findOne({
            email: req.body.email
        });

        // Check if user exists
        if (!user) {
            return res.status(400).json({
                message: 'User with this credentials does not exist in our record!'
            });
        }

        // Check user activation status
        if (user.isActive === true) {
            return res.status(400).json({
                message: 'Your account is already activated!'
            });
        }

        // Re-send email verification to user
        const mail = {
            email: user.email,
            subject: 'Re-Sent Email Registration Verification for Our Application',
            endpoint: '/auth/email/verify/',
            content: 'Please try verifying your email again by clicking the link below',
            token: jwt.sign({ user }, emailVerificationKey, { expiresIn: '15m' })
        }

        SendMail(mail.email, mail.subject, mail.endpoint, mail.content, mail.token).then(() => {
            res.status(200).json({
                message: 'Email verification has been sent to your email!'
            });
        }).catch(error => {
            console.log(error);
            res.status(400).json({
                message: 'Something went wrong while sending your email, please try resend the activation email again.'
            });
        });
    }

    static async verify(req, res) {
        const token = req.params.token;
        jwt.verify(token, emailVerificationKey, (err, data) => {
            if (!err) {
                User.findByIdAndUpdate(data.user._id, { isActive: true }, { new: true })
                    .then(() => {
                        return res.status(200).json({
                            message: 'Email verified! Your account is now active!'
                        });
                    });
            } else {
                return res.status(400).json({ message: 'Token expired!' });
            }
        });
    }
}

module.exports = VerifyEmailController;