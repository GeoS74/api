const connection = require('../libs/connection');
const mongoose = require('mongoose');
const LetterThema = require('./LetterThema');

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: 'поле ${PATH} обязательно для заполнения',
    },
    thema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: LetterThema,
        //required: true,
    }
    // date: {
    //     type: Date,
    //     default: Date.now()
    // },
}, {
    timestamps: true,
});

module.exports = connection.model('Letter', schema);