const app = require('./app');
const socket = require('./socket');

const server = app.listen(3000, _ => {
    console.log('server run http://localhost:3000');
});

socket(server);