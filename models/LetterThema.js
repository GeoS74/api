const connection = require('../libs/connection');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    thema: {
        type: String,
        required: 'заполните поле Тема письма',
    },
    user: {
        type: mongoose.ObjectId,
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// const Letter = require('./LetterThema');
schema.virtual('foo', {
    ref: 'Letter',
    localField: '_id',
    foreignField: 'thema'
});

module.exports = connection.model('LetterTheme', schema);