require('dotenv').config()
const http = require('http')
const { Server } = require('socket.io')
const app = require('./app')
const { setupSocketHandlers } = require('./chat/socket/handlers')

const server = http.createServer(app)

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Set up all socket event handlers
setupSocketHandlers(io)

// Make io accessible in routes and controllers
app.set('io', io)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Socket.IO ready for real-time connections`)
})
