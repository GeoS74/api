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

router.get('/user', allUsers);
router.get('/user/:id', userById);
router.post('/user', createUser);
router.post('/user/:id', updateUser);

const {v4: uuidv4} = require('uuid');
router.get('/test', ctx => {
    //console.log(require('uuid').v5());
    ctx.body = uuidv4();
});


app.use(router.routes());

app.use(ctx => {
    ctx.set('content-type', 'text/html');
    ctx.body = fs.createReadStream(path.join(__dirname, '/client/registrateForm.html'));
});

module.exports = app;