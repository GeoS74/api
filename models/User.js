const connection = require('../libs/connection');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: 'не заполнено обязательное поле email',
        unique: true,
    },
    pass: {
        type: String,
        required: 'не заполнено обязательное поле pass',
        unique: true,
    }
}, {
    timestamps: true
});

module.exports = connection.model('User', userSchema);