const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();
const client = new OAuth2Client(process.env.CLIENT_ID);

class LoginController {
    static async tokenSignIn(req, res) {
        let token = req.body.token;

        async function verify() {
            await client.verifyIdToken({
                idToken: token,
                audience: process.env.CLIENT_ID
            });
        }

        verify().then(() => {
            res.cookie('session-token', token);
            res.send('success');
        }).catch(console.error);
    }
}

module.exports = LoginController;