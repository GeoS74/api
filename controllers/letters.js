const fs = require('fs');
const path = require('path');
const Letter = require('../models/Letter');
const LetterThema = require('../models/LetterThema');

async function addTheme(ctx, next){
    const thema = await LetterThema.create({
        thema: ctx.request.body.thema,
    });

    ctx.body = thema;
}
module.exports.addTheme = addTheme;

async function addLetter(ctx, next){
    const letter = await Letter.create({
        title: ctx.request.body.title,
        thema: ctx.request.body.thema,
        parent: ctx.request.body.parent,
    });

    ctx.body = letter;
}
module.exports.addLetter = addLetter;

async function allLetter(ctx, next){
    // ctx.body = await Letter.find().populate('thema');
    ctx.body = ctx.params;
}
module.exports.allLetter = allLetter;

async function allLetters(ctx, next){
    ctx.body = await LetterThema.find().populate('foo');
}
module.exports.allLetters = allLetters;




async function uploadLetters(ctx, next){
    const files = {};

    for(let fileName in ctx.request.files){
        if(!ctx.request.files[fileName].size){
            fs.unlink(ctx.request.files[fileName].path, err => {
                if(err) throw err;
            });
            continue;
        }

        const fName = fs.rename(
            ctx.request.files[fileName].path, 
            './files/' + ctx.request.files[fileName].hash + path.extname(ctx.request.files[fileName].path), 
            err => {
                if(err) throw err;
            });

        files[fileName] = {
            size: ctx.request.files[fileName].size,
            path: ctx.request.files[fileName].path,
            name: ctx.request.files[fileName].fName,
            type: ctx.request.files[fileName].type,
            hash: ctx.request.files[fileName].hash,
        };
    }

    ctx.files = files;
    next();
}

module.exports.uploadLetters = uploadLetters;






