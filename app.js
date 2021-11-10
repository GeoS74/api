const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const pug = require('pug');
const {allUsers, userById, createUser, updateUser} = require('./controllers/user');
const {manyCreate, handleSearchVars, allThemas, addThema, searchThemas, addLetter} = require('./controllers/letters');
const koaBody = require('./libs/koaBody');

const app = new Koa();

app.use(require('koa-static')('client/public'));



app.use(async (ctx, next) => {
    try{
        await next();
    }
    catch(error){
        if(error.status){
            ctx.status = error.status;
            ctx.body = {error: error.message};
        } else {
            console.log(error);
            ctx.status = 500;
            ctx.body = {error: '~Internal server error~'};
            // if(err.code === 11000){
            //     ctx.status = 400;
            //     ctx.body = {error: `field '${Object.keys(err.keyPattern).join('')}' - not unique`};
            // } 
            // else if(err.name){
            //     console.log(err);
            //     ctx.status = 401;
            //     ctx.body = {error: err.message};
            // }
            // else {
            //     console.log(err);
            //     ctx.status = 500;
            //     ctx.body = {error: '~Internal server error~'};
            // }
        }
    }
});



const router = new Router();

router.get('/hello', ctx => {
    ctx.body = 'ok';
});


router.get('/manycreate', manyCreate);


router.get('/themas', handleSearchVars, allThemas, searchThemas);
//router.get('/themas/search', searchThemas);


router.post('/thema', koaBody, addThema);
// router.put('/thema/:id', koaBody, allLetter);


const connection = require('./libs/connection');
router.del('/themas', ctx => {
    connection.db.dropCollection('letters', function(err, result) {});
    connection.db.dropCollection('letterthemes', function(err, result) {});
    ctx.body = 'ok';
});



router.get('/letters', async ctx => {
    ctx.set('content-type', 'text/html');
    ctx.body = fs.createReadStream(path.join(__dirname, 'client/boot.html'));
});
router.post('/letter', koaBody, addLetter);
// router.del('/letter/:id', allLetter);








router.get('/test', async ctx => {
    ctx.body = ctx.request.query;
});


router.get('/echo', async ctx => {
    ctx.set('content-type', 'text/html');
    ctx.body = fs.createReadStream(path.join(__dirname, 'client/example.html'));
});
router.post('/echo', koaBody, ctx => {
    ctx.body = {
        message: ctx.request.body.message,
        date: Date.now(),
    };
});



// app.use(require('koa-body')({
//     formidable:{uploadDir: './files'},    //This is where the files would come
//     multipart: true,
//     onFileBegin: (formName, file) => {
//         //file.newFilename = 'test.jpg';
//         console.log('onFileBegin');
//         console.log(file);
//     },
// }));

// app.use((ctx, next) => {
//     console.log(ctx.request.body);
//     console.log(ctx.request.files);
//     if(ctx.request.files){
//        fs.rename(ctx.request.files.any_file_1.path, './files/'+ctx.request.files.any_file_1.name, err => {
//         if(err) throw err;
//         console.log('rename complete');
//         });
//     }
    
//     next();
// });



// app.use((ctx, next) => {
//     if(ctx.request.url !== '/') return next();
//     ctx.set('content-type', 'text/html');
//     ctx.body = fs.createReadStream('./files/form.htm');
// });









//router.post('/letters', koaBody, uploadLetters, saveLetter);

// const config = require('./config');
// const formidable = require('formidable');
// const form = formidable({
//     uploadDir: config.app.uploadFilesDir,
//     allowEmptyFiles: false, //разрешить загрузку пустых файлов - не работает или я не понимаю как это должно работать
//     //minFileSize: 1,
//     multiples: true,
//     hashAlgorithm: 'md5',
//     keepExtensions: true
// });

// router.post('/letters', async ctx => {
//     form.parse(ctx.req, (err, fields, files) => {
//         console.log(err);
//         console.log(fields);
//     });

//     ctx.body = 'ok';
// });







// app.use(require('koa-body')({
//     formidable:{uploadDir: './files'},    //This is where the files would come
//     multipart: true,
//     onFileBegin: (formName, file) => {
//         //file.newFilename = 'test.jpg';
//         console.log('onFileBegin');
//         console.log(file);
//     },
// }));



// const router = new Router();



// router.get('/letters', async ctx => {
//     ctx.set('content-type', 'text/html');
//     ctx.body = await fs.createReadStream(path.join(__dirname, './client/letters.html'));
// });
// // router.post('/letters', uploadLetters);
// router.post('/letters', require('koa-body')({
//         formidable:{uploadDir: './files'},    //This is where the files would come
//         multipart: true,
//         onFileBegin: (formName, file) => {
//             //file.newFilename = 'test.jpg';
//             console.log('onFileBegin');
//             console.log(file);
//         },
//     }), async ctx => {
//     ctx.body = ctx.request.files;
// });








// const {v4: uuidv4} = require('uuid');

// router.get('/test', async ctx => {
//     //console.log(require('uuid').v5());
//     //ctx.body = uuidv4();
//     // const err = new Error({'goo':'bingo'});
//     // err.name = 'ValidationError';
//     // ctx.throw(408, err);

//     ctx.body = pug.renderFile(
//         path.join(__dirname, './templates/form') + '.pug'
//     );
// });





// // Создание сервера
//const httpServer = require('http').createServer(app.callback());
// Берём API socket.io
// const io = require('socket.io')(httpServer, {
//     cors: {
//       origin: "http://localhost:3000",
//       methods: ["GET", "POST"]
//     }
//   });
// const io = require('./socket');
 
// // Подключаем клиенты
// io.on('connection', (socket) => {
//     // Выводим в консоль 'connection'
//     console.log('connection');
//     // Отправляем всем кто подключился сообщение привет
//     io.emit('hello', 'Привет');
//     // Что делать при случае дисконнекта
//     socket.on('disconnect', () => {
//         // Выводи 'disconnected'
//         console.log('disconnected');
//     });
//     socket.on('message', message => {
//         console.log('message', message);
//         io.emit('hello', message);
//     });
// });

 
// Назначаем порт для сервера
//httpServer.listen(3001);

// router.get('/chat', async (ctx, next) => {
//     ctx.set('content-type', 'text/html');
//     ctx.body = await fs.createReadStream(path.join(__dirname, './templates/form_chat.html'));

//     // ctx.body = pug.renderFile(
//     //     path.join(__dirname, './templates/form_chat') + '.pug'
//     // );
// });



router.get('/user', allUsers);
router.get('/user/:id', userById);
router.post('/user', koaBody, createUser);
router.post('/user/:id', koaBody, updateUser);

app.use(router.routes());

// app.use(ctx => {
//     ctx.set('content-type', 'text/html');
//     ctx.body = fs.createReadStream(path.join(__dirname, '/client/registrateForm.html'));
// });

module.exports = app;