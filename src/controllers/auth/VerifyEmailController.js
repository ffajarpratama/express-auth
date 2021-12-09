const { User } = require('../../database/models');
const jwt = require('jsonwebtoken');
const SendMail = require('../../config/mailTransporter');
require('dotenv').config();

// Load email verification key from env
const emailVerificationKey = process.env.VERIFICATION_KEY;
class VerifyEmailController {
    static async resendEmailVerification(req, res) {
        const user = await User.findOne({
            where: { email: req.body.email }
        });

        if (!user) {
            res.status(400).json({
                message: 'User with this credentials does not exist on our record!'
            });
        } else {
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
    }

    static async verify(req, res) {
        const token = req.params.token;
        jwt.verify(token, emailVerificationKey, (err, data) => {
            if (!err) {
                User.findByPk(data.user.id).then((user) => {
                    user.update({ isActive: true }).then(() => {
                        res.status(200).json({ message: 'Email verified! Your account is now active!' });
                    });
                });
            } else {
                res.status(400).json({ message: 'Token expired!' });
            }
        });
    }
}

module.exports = VerifyEmailController;