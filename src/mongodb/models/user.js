const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;