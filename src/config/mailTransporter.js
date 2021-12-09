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

const sendMail = async (email, subject, endpoint, content, token) => {
    const mailOptions = {
        from: process.env.GMAIL_USERNAME,
        to: email,
        subject: subject,
        html: `
            <h2>${content}</h2>
            <a href='${process.env.CLIENT_URL}${endpoint}${token}'>
            ${process.env.CLIENT_URL}${endpoint}${token}
            </a>
            `
    }

    await transporter.sendMail(mailOptions);
}

module.exports = sendMail;