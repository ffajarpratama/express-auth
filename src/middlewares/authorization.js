const User = require('../mongodb/models/user');

const isProfileOwner = (req, res, next) => {
    User.findById(req.user.user._id).then((user) => {
        if (req.user.user._id != user._id) {
            return res.status(403).json({
                message: 'You do not have permission to access this resource!'
            });
        }
        req.user = user;
        return next();
    }).catch((err) => {
        console.log(err);
    });
}

const authorization = {
    isProfileOwner: isProfileOwner
}

module.exports = authorization;