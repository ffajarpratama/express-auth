const jwt = require('jsonwebtoken');
const RefreshToken = require('../mongodb/models/refreshToken');
const User = require('../mongodb/models/user');
require('dotenv').config();

// Load access key from .env
const accessKey = process.env.ACCESS_KEY;

const processToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];
    const bearerToken = authHeader && authHeader.split(' ')[1];

    if (!bearerToken) {
        return next();
    }

    try {
        const decoded = jwt.verify(bearerToken, accessKey);
        req.user = decoded.user;
        return next();
    } catch (error) {
        if (error && refreshToken) {
            RefreshToken.findOne({ token: refreshToken }).then((data) => {
                User.findById(data.userId).then((user) => {
                    const newAccessToken = jwt.sign({ user }, accessKey, { expiresIn: '5m' });
                    console.log('ACCESS-TOKEN REFRESHED!');
                    res.cookie('access-token', 'Bearer ' + newAccessToken);
                    req.user = user;
                    return next();
                });
            })
        } else if (error) {
            return next();
        }
    }
}

const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: 'Token expired or invalid!'
        });
    }
    return next();
}

const authorization = {
    processToken: processToken,
    isAuthenticated: isAuthenticated
}

module.exports = authorization;