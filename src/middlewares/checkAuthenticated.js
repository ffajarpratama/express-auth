const jwt = require('jsonwebtoken');
require('dotenv').config();

// Load access key from .env
const accessKey = process.env.ACCESS_KEY;

const checkAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.split(' ')[1];
    const cookieToken = req.cookies['session-token'];

    if (cookieToken) {
        try {
            const JWT = jwt.decode(cookieToken);
            req.user = JWT;
            next();
        } catch (error) {
            console.log('Google token invalid!');
        }
    } else if (bearerToken) {
        jwt.verify(bearerToken, accessKey, (err, user) => {
            if (err) {
                return res.status(401).json({
                    message: 'Token invalid!'
                });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({
            message: 'You need to login first!'
        });
    }
}

module.exports = checkAuthenticated;