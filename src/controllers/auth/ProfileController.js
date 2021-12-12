const User = require('../../mongodb/models/user');
const validator = require('validator');
const bcrypt = require('bcrypt');

class ProfileController {
    static async getUserProfile(req, res) {
        return res.status(200).json(req.user);
    }

    static async updateProfile(req, res) {
        let userEmail = req.user.email;
        let userFullName = req.user.fullName;
        let userPassword = req.user.password;
        const isPasswordMatch = await bcrypt.compare(req.body.password, userPassword);

        // Check email
        if (!validator.isEmpty(req.body.email) && req.body.email !== userEmail) {
            if (validator.isEmail(req.body.email)) {
                userEmail = req.body.email;
            } else {
                return res.status(400).json({
                    message: 'Email is not valid!'
                });
            }
        }

        // Check name
        if (!validator.isEmpty(req.body.fullName) && req.body.fullName !== userFullName) {
            userFullName = req.body.fullName;
        }

        // Check password
        if (!validator.isEmpty(req.body.password)) {
            if (!isPasswordMatch) {
                if (!validator.isLength(req.body.password, { min: 6, max: 10 })) {
                    return res.status(400).json({
                        message: 'Password must be at least 6 or 10 characters long!'
                    });
                } else if (validator.isEmpty(req.body.password2)) {
                    return res.status(400).json({
                        message: 'Confirm password field is required!'
                    });
                } else if (!validator.equals(req.body.password, req.body.password2)) {
                    return res.status(400).json({
                        message: 'Password must match!'
                    });
                }
                userPassword = bcrypt.hashSync(req.body.password, 12);
            }
        }

        await User.findByIdAndUpdate(req.user._id, {
            email: userEmail,
            fullName: userFullName,
            password: userPassword
        }, { new: true }).then(() => {
            return res.status(200).json({
                message: 'Your profile has been successfully updated!'
            });
        });
    }
}

module.exports = ProfileController;