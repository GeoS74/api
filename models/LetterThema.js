const connection = require('../libs/connection');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    thema: {
        type: String,
        required: 'заполните поле Тема письма',
    },
    description:{
        type: String
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



schema.index(
    {
        thema: 'text'
    }, 
    {
      name: 'TextSearchIndex',
      default_language: 'russian'
  });

module.exports = connection.model('LetterTheme', schema);