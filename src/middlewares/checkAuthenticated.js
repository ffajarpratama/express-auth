const jwt = require('jsonwebtoken');
require('dotenv').config();

// Load access key from .env
const accessKey = process.env.ACCESS_KEY;

const checkAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization || req.cookies['session-token'];
    const bearerToken = authHeader && authHeader.split(' ')[1];

    jwt.verify(bearerToken, accessKey, (err, user) => {
        if (err) {
            return res.status(401).json({
                message: 'Token expired!'
            });
        }
        req.user = user;
        next();
    });
}

module.exports = checkAuthenticated;