const validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateRegisterInput(data) {
    let errors = {};

    // Convert empty fields to an empty string so we can use validator functions
    data.email = !isEmpty(data.email) ? data.email : '';
    data.username = !isEmpty(data.username) ? data.username : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    // Email check
    if (validator.isEmpty(data.email)) {
        errors.email = 'Email field is required!';
    } else if (!validator.isEmail(data.email)) {
        errors.email = 'Email is invalid!';
    }

    // Username check
    if (validator.isEmpty(data.username)) {
        errors.username = 'Username field is required!';
    }

    // Password check
    if (validator.isEmpty(data.password)) {
        errors.password = 'Password field is required!';
    } else if (validator.isEmpty(data.password2)) {
        errors.password2 = 'Confirm password field is required!';
    } else if (!validator.isLength(data.password, { min: 6, max: 10 })) {
        errors.password = "Password must be at least 6 characters!";
    } else if (!validator.equals(data.password, data.password2)) {
        errors.password2 = "Passwords must match!";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}