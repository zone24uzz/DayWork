require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const messageRoutes = require('./routes/messages')
const jobRoutes = require('./routes/jobs')
const walletRoutes = require('./routes/wallet')

// Connect to MongoDB
connectDB()

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/wallet', walletRoutes)


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

module.exports = app
