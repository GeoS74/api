const fs = require('fs');
const { isValidObjectId } = require('mongoose');
const mongoose = require('mongoose');
const path = require('path');
const Letter = require('../models/Letter');
const LetterThema = require('../models/LetterThema');

//if(!mongoose.Types.ObjectId.isValid(subcategory)){

module.exports.manyCreate = async function(ctx, next){
        
        const arr = [
            {thema: 'Lorem ipsum dolor sit amet'},
            {thema: 'Pellentesque habitant morbi tristique'},
            {thema: 'Vestibulum efficitur pharetra neque'},
            {thema: 'Aliquam et augue'},
            {thema: 'Morbi id mauris condimentum'},
            {thema: 'Donec tincidunt dapibus libero'},
            {thema: 'Curabitur eu nibh eu lorem posuere sagittis'},
            {thema: 'Nam vitae porta odio'},
            {thema: 'Mauris vitae nulla rhoncu'},
            {thema: 'Cras lacinia sapien'},
            {thema: 'Pellentesque pharetra eleifend enim non pulvinar'},
            {thema: 'Duis tincidunt ultrices neque quis vestibulum'},
            {thema: 'Nunc dignissim felis magna'},
            {thema: 'Pellentesque'},
            {thema: 'Vestibulum vulputate condimentum enim in varius'},
            {thema: 'Class aptent taciti sociosqu'},
            {thema: 'litora torquent per'},
            {thema: 'Phasellus sed facilisis ante'},
            {thema: 'Quisque fringilla'},
            {thema: 'neque leo vestibulum ipsum'},
        ];



        for(let i = 0; i < 10000; i++) await LetterThema.create(arr);
    
        ctx.body = 'ok';
};


module.exports.addThema = async function(ctx, next){
    if(!ctx.request.body.title) return ctx.throw(400, 'Тема должна быть заполнена');
    const thema = await LetterThema.create({
        title: ctx.request.body.title
        //description: ctx.request.body.description || undefined
        // user: ...
    });

    ctx.body = {
        id: thema._id,
        title: thema.title,
        createdAt: thema.createdAt, 
    };
};


const limitDocs = 20;


module.exports.handleSearchVars = async function(ctx, next){
    if(ctx.request.query.start_thema_id) 
        if(!isValidObjectId(ctx.request.query.thema_id)) ctx.throw(400, "thema_id is not ObjectId");

    await next();
};

module.exports.allThemas = async function(ctx, next){
    if(ctx.request.query.needle) return await next();

    const finder = {};
    if(ctx.request.query.start_thema_id) finder._id = {$lt: ctx.request.query.start_thema_id};

   const themas = await LetterThema
    .find(finder)
    .sort({_id: -1}).limit(limitDocs)
    .populate('letters');

    ctx.body = themas.map(thema => ({
        id: thema._id,
        title: thema.title,
        createdAt: thema.createdAt,
        letters: thema.letters.map(letter => ({
            id: letter._id,
            scanCopyFile: letter.scanCopyFile,
            number: letter.number,
            date: letter.date,
            description: letter.description,
        })),
   }));
};

module.exports.searchThemas = async function(ctx, next){
    const finder = {
        $text: { 
            $search: ctx.request.query.needle,
            $language: 'russian'
        }};
    
    if(ctx.request.query.thema_id) finder._id = {$lt: ctx.request.query.thema_id};
    
    const letters = await Letter
        .find({
            $text: { 
                $search: ctx.request.query.needle,
                $language: 'russian'
            }})
        .sort({_id: -1}).limit(limitDocs)
        .populate('thema');

    let themas = {};
    letters.map(letter => {
        if(themas[letter.thema._id]){
            themas[letter.thema._id].letters.push(getLetterStruct(letter));
            return;
        }

        themas[letter.thema._id] = {
            _id: letter.thema._id,
            title: letter.thema.title,
            createdAt: letter.thema.createdAt,
            updatedAt: letter.thema.updatedAt,
            letters: [getLetterStruct(letter)]
        };
    });

    //console.log(letters);
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log(themas);
    console.log('all');
    console.log('-------------------------------');

    ctx.body = Object.values(themas);
};

function getLetterStruct(letter){
    return {
        _id: letter._id,
        description: letter.description,
        number: letter.number,
        date: letter.date,
        pathFile: letter.scanCopyFile,
        createdAt: letter.createdAt,
        updatedAt: letter.updatedAt,
    };
}




//работает - агрегация
module.exports._searchThemas = async function(ctx, next){
    let start = Date.now();

    const regexp = new RegExp(ctx.request.query.needle);

    const result = await LetterThema
        .aggregate([
            //{ $match:{ '_id': { $lt: new mongoose.Types.ObjectId('6188cb6691ec020242f21239') } } },
            
            
            //  {
            //     // $match: { $text: { 
            //     //     $search: ctx.request.query.needle,
            //     //     $language: 'russian'
            //     // }},
            { $sort: {'_id': -1} }, //этап сортировки должен быть первым иначе поиск тормозит. При этом выдачу почему-то трясёт
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
                        { 'thema':          { $regex: regexp, $options: "i" } },
                        { 'letters.number': { $regex: regexp, $options: "i" } }
                    ]
                }
            },
            { $limit: limitDocs },
            {
                $group: { 
                    _id: "$_id",
                    thema:     { "$first": "$thema" },
                    createdAt: { "$first": "$createdAt" },
                    updatedAt: { "$first": "$updatedAt" },
                    letters: { "$push": "$letters" }
                }
            }
        ])

        //{ hint: { 'TextSearchIndex': 1 } })
        //.explain()
        ;
        console.log('~~~~~~~~~~~~~~~~~~~~~');
        console.log( 'run time: ', (Date.now() - start)/1000, ' sec' );
        ctx.body = result;
};


//работает - поиск по индексам
module.exports.__searchThemas = async function(ctx, next){
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


//тест агрегации
//ограничения https://docs.mongodb.com/v4.2/tutorial/text-search-in-aggregation/
module.exports.___searchThemas = async function(ctx, next){
    let start = Date.now();

    const regexp = new RegExp(ctx.request.query.needle);

    const result = await LetterThema
        .aggregate([
            //{ $match:{ '_id': { $lt: new mongoose.Types.ObjectId('6188cb6691ec020242f21239') } } },
            
            
             {
                $match: { $text: { 
                    $search: ctx.request.query.needle,
                    $language: 'russian'
                }}
             },

             {
                $lookup: {
                        from: "letters", 
                        pipeline: [
                            {
                              $match: { $text: { 
                                $search: ctx.request.query.needle,
                                $language: 'russian'
                                }}
                            }
                          ],
                        localField: "_id", 
                        foreignField: "thema",
                        as: "letters"
                }
            },



             { $sort: {'_id': -1} },

            // {
            //     $lookup: {
            //         from: "letters", 
            //         localField: "_id", 
            //         foreignField: "thema",
            //         as: "letters"
            //     }
            // },
            {
                $unwind: {
                    path: '$letters',
                    preserveNullAndEmptyArrays: true
                }
            },
            {  
                $match: {
                    $or: [
                        { 'thema':          { $regex: regexp, $options: "i" } },
                        { 'letters.number': { $regex: regexp, $options: "i" } }
                    ]
                }
            },
            { $limit: limitDocs },
            {
                $group: { 
                    _id: "$_id",
                    thema:     { "$first": "$thema" },
                    createdAt: { "$first": "$createdAt" },
                    updatedAt: { "$first": "$updatedAt" },
                    letters: { "$push": "$letters" }
                }
            }
        ])

        //{ hint: { 'TextSearchIndex': 1 } })
        //.explain()
        ;
        console.log('~~~~~~~~~~~~~~~~~~~~~');
        console.log( 'run time: ', (Date.now() - start)/1000, ' sec' );
        ctx.body = result;  
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

    const tags = await LetterThema.findOne({'_id': ctx.request.body.id_thema});

    const letter = await Letter.create({
        thema: ctx.request.body.id_thema,
        thema_tags: tags.title,
        number: ctx.request.body.number,
        date: ctx.request.body.date || undefined,
        description: ctx.request.body.description || undefined,
        //uncomment this
        //
        //scanCopyFile: newFileName
    });


    ctx.body = {
        id: letter._id,
        thema: letter.thema,
        number: letter.number,
        date: letter.date,
        description: letter.description,
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






