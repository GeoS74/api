const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const {allUsers, userById, createUser, updateUser} = require('./controllers/user');

const app = new Koa();

app.use(require('koa-body')());

app.use(async (ctx, next) => {
    try{
        await next();
    }
    catch(err){
        if(err.status){
            ctx.status = err.status;
            ctx.body = {error: err.message};
        } else {
            if(err.code === 11000){
                ctx.status = 400;
                ctx.body = {error: `field '${Object.keys(err.keyPattern).join('')}' - not unique`};
            } 
            else if(err.name){
                console.log(err);
                ctx.status = 401;
                ctx.body = {error: err.message};
            }
            else {
                console.log(err);
                ctx.status = 500;
                ctx.body = {error: '~Internal server error~'};
            }
        }
    }
});

const router = new Router();


const {v4: uuidv4} = require('uuid');
const pug = require('pug');
router.get('/test', async ctx => {
    //console.log(require('uuid').v5());
    //ctx.body = uuidv4();
    // const err = new Error({'goo':'bingo'});
    // err.name = 'ValidationError';
    // ctx.throw(408, err);

    ctx.body = pug.renderFile(
        path.join(__dirname, './templates/form') + '.pug'
    );
});





// // Создание сервера
const httpServer = require('http').createServer(app.callback());
// Берём API socket.io
const io = require('socket.io')(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
 
// Подключаем клиенты
io.on('connection', (socket) => {
    // Выводим в консоль 'connection'
    console.log('connection');
    // Отправляем всем кто подключился сообщение привет
    io.emit('hello', 'Привет');
    // Что делать при случае дисконнекта
    socket.on('disconnect', () => {
        // Выводи 'disconnected'
        console.log('disconnected');
    });
    socket.on('message', message => {
        console.log('message', message);
        io.emit('hello', message);
    });
});

 
// Назначаем порт для сервера
//httpServer.listen(3001);

router.get('/chat', async (ctx, next) => {
    ctx.set('content-type', 'text/html');
    ctx.body = await fs.createReadStream(path.join(__dirname, './templates/form_chat.html'));
});
router.post('/chat', async (ctx, next) => {
    
    ctx.body = 'ok';
});




router.get('/user', allUsers);
router.get('/user/:id', userById);
router.post('/user', createUser);
router.post('/user/:id', updateUser);

app.use(router.routes());

app.use(ctx => {
    ctx.set('content-type', 'text/html');
    ctx.body = fs.createReadStream(path.join(__dirname, '/client/registrateForm.html'));
});

module.exports = httpServer;