const { Server } = require('socket.io');
const cookie = require('cookie')
const jwt = require('jsonwebtoken');
const userModel = require('../model/user.mode');
const aiService = require('../service/ai.service')
const messageModel = require('../model/message.model')
const { createMemory, queryMemory } = require('../service/vector.service')

const initSocketServer = (httpServer) => {

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            allowedHeaders: [ "Content-Type", "Authorization" ],
            credentials: true
        }
    });

    io.use(async (socket, next) => {

        const cookies = cookie.parse(socket.handshake.headers?.cookie || "")

        if (!cookies.token) {
            next(new Error("Authentication error: No token provided"))
        }

        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)

            const user = await userModel.findById(decoded.id)

            socket.user = user

            next();
        }
        catch {
            next(new Error("Authentication error: No token provided"))
        }

    })

    io.on("connection", (socket) => {

        // console.log("User connected: ", socket.user._id);

        socket.on('ai-message', async (messagePayload) => {
            console.log('hello: ', messagePayload)

            const [message, vectors] = await Promise.all([  // this execute both at same time
                messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: messagePayload.content,
                    role: "user"
                }),
                aiService.generateVector(messagePayload.content)
            ])
            
            await createMemory({       
                vectors,
                messageId: message._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content
                }
            })

            const [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: vectors,
                    limit: 3,
                    metadata: {
                        user: socket.user._id
                    }
                }),
                messageModel.find({
                    chat: messagePayload.chat
                }).sort({ createAt: -1 }).limit(20).lean().then(messages => messages.reverse())
            ])


            const stm = chatHistory.map(item => {       // short term memory - generate from chathistory
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            })

            const ltm = [       // long term memory - generate from pinecone memory
                {
                    role: 'user',
                    parts: [{
                        text: `${memory.map(item => item.metadata.text).join("\n")}`
                    }]
                }
            ]

            const response = await aiService.generateResponse(...ltm, ...stm)       

            const [responseMessage, responseVector] = await Promise.all([
                messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: response,
                    role: 'model'
                }),
                aiService.generateVector(response)
            ])

            await createMemory({        
                vectors: responseVector,
                messageId: responseMessage._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: response
                }

            })

            socket.emit('ai-response', {        
                chat: messagePayload,
                content: response
            })

        })
    })

}

module.exports = initSocketServer