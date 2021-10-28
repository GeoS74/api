const connection = require('../libs/connection');
const mongoose = require('mongoose');
const LetterThema = require('./LetterThema');

const schema = new mongoose.Schema({
    thema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: LetterThema,
        required: 'поле ${PATH} обязательно для заполнения',
    },
    number: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now()
    },
    scanCopyFile: {
        type: String,
        //required: 'поле ${PATH} обязательно для заполнения',
    },
}, {
    timestamps: true,
});


schema.index(
    {
        number: 'text'
    }, 
    {
      name: 'NumberSearchIndex',
      default_language: 'russian'
  });

module.exports = connection.model('Letter', schema);