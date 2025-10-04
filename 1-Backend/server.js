require('dotenv').config();
const app = require('./src/app');

// Socket.io
const initSocketServer = require('./src/sockets/socket.server');
const connectDB = require('./src/db/db');
const httpServer = require('http').createServer(app)

connectDB()
initSocketServer(httpServer);

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000")
})