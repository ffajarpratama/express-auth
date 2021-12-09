const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASS
    }
});

const sendMail = async (email, token) => {
    const mailOptions = {
        from: process.env.GMAIL_USERNAME,
        to: email,
        subject: 'Email Registration Verification for Our Application',
        html: `
            <h2>Please verify your email by clicking on the link below.</h2>
            <a href='${process.env.CLIENT_URL}/auth/email/verify/${token}'>
            ${process.env.CLIENT_URL}/auth/email/verify/${token}
            </a>
            `
    }

    await transporter.sendMail(mailOptions);
}

module.exports = sendMail;