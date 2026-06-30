require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const errorHandler = require('./chat/middleware/errorHandler')

// Routes
const authRoutes = require('./routes/auth')
const jobRoutes = require('./routes/jobs')
const walletRoutes = require('./routes/wallet')

// New chat routes
const chatRoutes = require('./chat/routes/chat')

// Connect to MongoDB (persistent storage - data survives restarts)
connectDB()

// Logger setup
const { requestLogger } = require('./chat/middleware/logger')

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// Global request logging
app.use(requestLogger)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/wallet', walletRoutes)

// New chat API
app.use('/api/chat', chatRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Centralized error handler (must be last)
app.use(errorHandler)

module.exports = app
