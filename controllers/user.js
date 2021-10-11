const User = require('../models/User');

exports.allUsers = async (ctx) => {
    const user = await User.find();
    if(!user){
        ctx.status = 404;
        ctx.body = {error: 'User not found'};
        return;
    }

    ctx.body = user;
};

exports.userById = async (ctx) => {
    const user = await User.findOne({_id: ctx.params.id});
    if(!user){
        ctx.status = 404;
        ctx.body = {error: 'User not found'};
        return;
    }

    ctx.body = user;
};

exports.createUser = async (ctx) => {
    ctx.body = await User.create({
        email: ctx.request.body.email,
        pass: ctx.request.body.pass,
    });
};

exports.updateUser = async (ctx) => {
    const user = await User.findOneAndUpdate(
        {_id: ctx.params.id},
        {
            email: ctx.request.body.email,
            pass: ctx.request.body.pass,
        },
        {new: true});
    if(!user){
        ctx.status = 404;
        ctx.body = {error: 'User not found'};
        return;
    }

    ctx.body = user;
};