const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();
const client = new OAuth2Client(process.env.CLIENT_ID);

const checkAuthenticated = (req, res, next) => {
    let token = req.cookies['session-token'];
    let user = {};

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID
        });

        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }

    verify().then(() => {
        req.user = user;
        next();
    }).catch(err => {
        res.redirect('/auth/login');
    });
}

module.exports = checkAuthenticated;