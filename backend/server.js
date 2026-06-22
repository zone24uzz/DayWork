require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const messageRoutes = require('./routes/messages')
const jobRoutes = require('./routes/jobs')

// Connect to MongoDB
connectDB()

const app = express()
const server = http.createServer(app)

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/jobs', jobRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Socket.IO
const onlineUsers = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // User comes online
  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id)
    socket.userId = userId
    io.emit('users_online', Array.from(onlineUsers.keys()))
  })

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId)
  })

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId)
  })

  // Send message
  socket.on('send_message', (data) => {
    const { conversationId, message } = data
    io.to(conversationId).emit('new_message', { conversationId, message })
  })

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('user_typing', data)
  })

  socket.on('stop_typing', (data) => {
    socket.to(data.conversationId).emit('user_stop_typing', data)
  })

  // User disconnects
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId)
      io.emit('users_online', Array.from(onlineUsers.keys()))
    }
    console.log('User disconnected:', socket.id)
  })
})

// Make io accessible in routes
app.set('io', io)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})