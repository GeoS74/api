const connection = require('../libs/connection');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    lastVisit: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    }
}, {
    timestamps: true
});

schema.path('lastVisit').index({expires: '1m'});

module.exports = connection.model('Session', schema);