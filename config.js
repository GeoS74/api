require('dotenv').config({path: './secret.env'});

module.exports = {
    mongodb: {
        uri: process.env.MONGO_DB || 'mongodb://localhost:27017/magnus',
    },
};