const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passwordResetSchema = new Schema({
    userId: {
        type: String
    },
    token: {
        type: String
    }
}, { timestamps: true, collection: 'passwordResets' });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);
module.exports = PasswordReset;