require('dotenv').config({path: './secret.env'});

module.exports = {
    server: {
        port: process.env.SERVER_PORT || 3000,
    },
    mongodb: {
        uri: process.env.MONGO_DB || 'mongodb://localhost:27017/magnus',
    },
    app: {
        uploadFilesDir: './files/upload',
    },
};