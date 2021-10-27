const connection = require('../libs/connection');
const mongoose = require('mongoose');
const LetterThema = require('./LetterThema');

const schema = new mongoose.Schema({
    thema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: LetterThema,
        required: 'поле ${PATH} обязательно для заполнения',
    },
    date: {
        type: Date,
        default: Date.now()
    },
    number: {
        type: String
    },
    scanCopyFile: {
        type: String,
        required: 'поле ${PATH} обязательно для заполнения',
    },
}, {
    timestamps: true,
});

module.exports = connection.model('Letter', schema);