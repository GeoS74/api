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


module.exports.allThemas = async function(ctx, next){
   const themas = await LetterThema.find().sort({_id: -1}).populate('foo');

//    ctx.body = themas;
   ctx.body = themas.map(thema => ({
        id: thema._id,
        thema: thema.thema,
        description: thema.description,
        createdAt: thema.createdAt,
        letters: thema.foo.map(letter => ({
            id: letter._id,
            scanCopyFile: letter.scanCopyFile,
            number: letter.number,
            date: letter.date
        })),
   }));
};


module.exports.searchThemas = async function(ctx, next){
    const letters = await LetterThema
        .find()
        .sort({_id: -1})
        .populate({
                path: 'foo',
                match: { $text: { 
                    $search: ctx.params.search_text,
                    $language: 'russian'
                }}
            });
    
    const themas = await LetterThema
        .find({ 
            $text: { 
                $search: ctx.params.search_text,
                $language: 'russian'
        }})
        .sort({_id: -1})
        .populate('foo');            

    const themasWithEmptyLetters = [];
    const themasWithLetters = [];
    
    letters.map(letter => {
        letter.foo.length ? themasWithLetters.push(letter) : themasWithEmptyLetters.push(letter);
    });

    const only_themas = themasWithEmptyLetters.filter(thema => {
        for(let t of themas)
            if(t.thema === thema.thema) return thema;
        return false;
    });

    ctx.body = themasWithLetters.concat(only_themas).map(thema => ({
        id: thema._id,
        thema: thema.thema,
        description: thema.description,
        createdAt: thema.createdAt,
        letters: thema.foo.map(letter => ({
            id: letter._id,
            scanCopyFile: letter.scanCopyFile,
            number: letter.number,
            date: letter.date
        })),
   }));
};



module.exports.addLetter = async function (ctx, next){
    // console.log(ctx.request.body);
    // console.log(ctx.request.files);

    //uncomment this
    //
    // if(!ctx.request.files){
    //     return ctx.throw('400', 'file not uploaded');
    // }
    // let newFileName = Date.now() + '.' + ctx.request.files.scanCopyLetter.name.split('.').pop();
    // fs.rename(ctx.request.files.scanCopyLetter.path, './files/'+newFileName, err => {
    //     if(err) throw err;
    // });

    const letter = await Letter.create({
        thema: ctx.request.body.id_thema,
        number: ctx.request.body.number,
        date: ctx.request.body.date,
        //uncomment this
        //scanCopyFile: newFileName
    });

    ctx.body = {
        id: letter._id,
        thema: letter.thema,
        number: letter.number,
        date: letter.date,
        scanCopyFile: letter.scanCopyFile,
    };
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






