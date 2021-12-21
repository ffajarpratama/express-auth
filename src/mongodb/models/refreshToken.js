const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
    userId: {
        type: String,
    },
    token: {
        type: String
    }
}, { timestamps: true, collection: 'refreshTokens' });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;