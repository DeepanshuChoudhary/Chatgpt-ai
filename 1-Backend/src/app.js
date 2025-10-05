const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Routes
const authRouter = require('./routes/auth.routes')
const chatRouter = require('./routes/chat.routes')

const app = express();


// Using middlewares
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.static(path.join(__dirname, '../public')))

// Using Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);

app.get("*name", (req,res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
})

module.exports = app;