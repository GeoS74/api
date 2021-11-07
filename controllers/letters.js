const fs = require('fs');
const { isValidObjectId } = require('mongoose');
const mongoose = require('mongoose');
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


const limitDocs = 20;


module.exports.handleSearchVars = async function(ctx, next){
    if(ctx.request.query.start_thema_id) 
        if(!isValidObjectId(ctx.request.query.thema_id)) ctx.throw(400, "thema_id is not ObjectId");
    
    if(ctx.request.query.start_letter_id) 
        if(!isValidObjectId(ctx.request.query.thema_id)) ctx.throw(400, "letter_id is not ObjectId");

    await next();
};

module.exports.allThemas = async function(ctx, next){
    if(ctx.request.query.needle) return await next();

    const finder = {};
    if(ctx.request.query.start_thema_id) finder._id = {$lt: ctx.request.query.start_thema_id};

   const themas = await LetterThema
    .find(finder)
    .sort({_id: -1}).limit(limitDocs)
    .populate('foo');

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


module.exports.__searchThemas = async function(ctx, next){
    const result = await LetterThema
        .aggregate([
            
            
            // {'_id': {$gt: "6187c46dc36b48c3f423825b"}},
            
            // {
            //     $match: {
            //        $expr: { $lt: [ "$_id" , "6187accd791b596c33198f0a" ] }
                        
            //     }
            // },

            //{ $match:{ '_id': { $lt: new mongoose.Types.ObjectId('6187accd791b596c33198f0a') } } },
            { $sort: {'_id': -1} },
            { $limit: limitDocs },
            //  {
            //     // $match: { $text: { 
            //     //     $search: ctx.request.query.needle,
            //     //     $language: 'russian'
            //     // }},

            {
                $lookup: {
                    from: "letters", 
                    localField: "_id", 
                    foreignField: "thema",
                    as: "letters"
                }
            },
            {
                $unwind: {
                    path: '$letters',
                    preserveNullAndEmptyArrays: true
                }
            },

            {   
                $match: {
                    
                    $or: [
                        { //       /Вова/i
                            //LIKE %string%
                            'thema': { $regex: new RegExp(ctx.request.query.needle), $options: "i" },
                        },
                        { 
                            'letters.number': { $regex: new RegExp(ctx.request.query.needle), $options: "i" },
                        }
                    ]
                }
            },
        ])

        //{ hint: { 'TextSearchIndex': 1 } })
        // .explain()
        ;
        console.log('~~~~~~~~~~~~~~~~~~~~~');
        console.log(result);
        ctx.body = result;
};


// let key = 'bla';

// [
//     0: 'bla bla bla'
//     1: 'dgdfg'
//     2: 'sdfsdf'
// ]



// let index = {
//     'bla bla bla': {id: 0}
//     'bla bla': {id: 0}
//     'bla': {id: 0}
//     'dgdfg': {id: 1}
//     'sdfsdf': {id: 2}
// }
// index[key]




module.exports.searchThemas = async function(ctx, next){
    //console.log(ctx.request.query);

    const finder_themes = {
        $text: { 
            $search: ctx.request.query.needle,
            $language: 'russian'
        }
    };

    if(ctx.request.query.start_thema_id) finder_themes._id = {$lt: ctx.request.query.start_thema_id};

    const themas = await LetterThema
        .find(finder_themes)
        .sort({_id: -1}).limit(limitDocs)
        .populate({
            path: 'foo',
            match: { $text: { 
                $search: ctx.request.query.needle,
                $language: 'russian'
            }}
        });  
    
    
    const finder_letters = {
            $text: { 
                $search: ctx.request.query.needle,
                $language: 'russian'
            }
        };
    
    if(ctx.request.query.start_letter_id) finder_letters._id = {$lt: ctx.request.query.start_letter_id};

    const letters = await Letter
        .find(finder_letters)
        .sort({_id: -1}).limit(limitDocs)
        .populate('thema');
    
    //нормализация структуры писем
    const letters_new = letters.map(letter => ({
        _id: letter.thema._id,
        thema: letter.thema.thema,
        createdAt: letter.thema.createdAt,
        updatedAt: letter.thema.updatedAt,
        foo: [{
            _id: letter._id,
            number: letter.number,
            date: letter.date,
            createdAt: letter.createdAt,
            updatedAt: letter.updatedAt,
        }]
    }));


    
    console.log(themas);
    console.log('~~~~~~~~~~~~~~~~~~~~~~~');
    //console.log(letters);
    console.log('======================');
     console.log(letters_new);
    console.log('----------------------');


    



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
    
    /*
        const letters = await LetterThema
            .aggregate([
                {
                    $match: { $text: { 
                        $search: ctx.request.query.needle,
                        $language: 'russian'
                    }},
                },
                {
                    $lookup: {
                        from: "letters", 
                        localField: "_id", 
                        foreignField: "thema",
                        pipeline: [
                            { 
                                $match: { $text: { 
                                    $search: ctx.request.query.needle,
                                    $language: 'russian'
                                }}
                             }
                         ],
                        as: "fooz"
                    }
                },
                {$sort: {_id: -1} },
                {$limit: 10}
            ]);
    
    
        const themas = await LetterThema
            .find({ 
                $text: { 
                    $search: '-'+ctx.request.query.needle,
                    $language: 'russian'
            }})
            .sort({_id: -1}).limit(limitDocs)
            .populate('foo');   
        


        console.log(letters);
        console.log('~~~~~~~~~~~~~~~~~~~~~~~');
        // console.log(themas);
        console.log('-----------------------');
    
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
       */
    };





module.exports._searchThemas_ = async function(ctx, next){
console.log(ctx.request.query);

    const letters = await LetterThema
        .find( ctx.request.query.start ? {_id: {$lt: ctx.request.query.start}} : {} )
        .sort({_id: -1}).limit(limitDocs)
        .populate({
                path: 'foo',
                match: { $text: { 
                    $search: ctx.request.query.needle,
                    $language: 'russian'
                }}
            });


    const themas = await LetterThema
        .find({ 
            _id: {$lt: letters[0]._id},
            $text: { 
                $search: ctx.request.query.needle,
                $language: 'russian'
        }})
        .sort({_id: -1}).limit(limitDocs)
        .populate({
            path: 'foo',
            match: { $text: { 
                $search: ctx.request.query.needle,
                $language: 'russian'
            }}
        });            

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






