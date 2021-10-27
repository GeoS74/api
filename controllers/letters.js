const fs = require('fs');
const path = require('path');
const Letter = require('../models/Letter');
const LetterThema = require('../models/LetterThema');

//if(!mongoose.Types.ObjectId.isValid(subcategory)){

module.exports.addThema = async function(ctx, next){
    if(!ctx.request.body.thema) return ctx.throw(400, 'Тема должна быть заполнена');
    const thema = await LetterThema.create({
        thema: ctx.request.body.thema,
        description: ctx.request.body.description || undefined
        // user: ...
    });

    ctx.body = {
        id: thema._id,
        thema: thema.thema,
        description: thema.description,
        createdAt: thema.createdAt, 
    };
};


//добавить populate
module.exports.allThemas = async function(ctx, next){
    if(!ctx.params) return next();

    //ctx.body = await LetterThema.find().populate('foo');
   const themas = await LetterThema.find().sort({_id: -1});

   ctx.body = themas.map(thema => ({
        id: thema._id,
        thema: thema.thema,
        description: thema.description,
        createdAt: thema.createdAt,
   }));
};


//добавить populate
module.exports.searchThemas = async function(ctx, next){
    //ctx.body = await LetterThema.find().populate('foo');
   const themas = await LetterThema.find({
        $text: { 
            $search: ctx.params.search_text,
            $language: 'russian'
        }})
        .sort({_id: -1});

   ctx.body = themas.map(thema => ({
        id: thema._id,
        thema: thema.thema,
        description: thema.description,
        createdAt: thema.createdAt,
   }));
};



module.exports.addLetter = async function (ctx, next){
        console.log(ctx.request.body);
    console.log(ctx.request.files);
    if(ctx.request.files){
       fs.rename(ctx.request.files.scanCopyLetter.path, './files/'+ctx.request.files.scanCopyLetter.name, err => {
        if(err) throw err;
        console.log('rename complete');
        });
    }
    ctx.status = 505;
    ctx.body ={ok:'ok'};
}









async function allLetter(ctx, next){
    // ctx.body = await Letter.find().populate('thema');
    ctx.body = ctx.params;
}
module.exports.allLetter = allLetter;






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






