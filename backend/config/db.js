const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')

// ─── Global cache for serverless environments (Vercel) ───
let cached = global._mongoConnection
if (!cached) {
  cached = global._mongoConnection = { conn: null, promise: null, mongod: null }
}

// ─── Track mongod instance for graceful shutdown ───
let _mongod = null
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const connectDB = async (retryCount = 0) => {
  try {
    // Return cached connection if available
    if (cached.conn && mongoose.connection.readyState === 1) {
      return cached.conn
    }

    // If MONGODB_URI is set, connect to real MongoDB (production / Vercel)
    if (process.env.MONGODB_URI) {
      if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        }).then((conn) => {
          console.log(`MongoDB connected: ${conn.connection.host}`)
          // Handle connection events
          mongoose.connection.on('error', (err) => {
            console.error('MongoDB runtime error:', err.message)
          })
          mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Will retry...')
            cached.conn = null
            cached.promise = null
          })
          return conn
        })
      }
      try {
        cached.conn = await cached.promise
      } catch (error) {
        cached.promise = null
        console.warn('MongoDB URI connection failed:', error.message)
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying connection (${retryCount + 1}/${MAX_RETRIES})...`)
          await sleep(RETRY_DELAY)
          return connectDB(retryCount + 1)
        }
        console.log('Falling back to persistent local MongoDB...')
        return connectInMemory()
      }
      return cached.conn
    }

    // Fallback: persistent local MongoDB (data survives restarts)
    return connectInMemory()
  } catch (err) {
    console.error('connectDB error:', err.message)
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection (${retryCount + 1}/${MAX_RETRIES})...`)
      await sleep(RETRY_DELAY)
      return connectDB(retryCount + 1)
    }
    throw err
  }
}

const connectInMemory = async (retryCount = 0) => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server')
    const dbPath = path.join(__dirname, '..', 'data', 'db')
    
    // Ensure the data directory exists
    fs.mkdirSync(dbPath, { recursive: true })
    
    console.log(`Starting persistent local MongoDB at: ${dbPath}`)
    
    // Create MongoMemoryServer with persistent storage
    // The 'dbPath' option ensures data is stored to disk using wiredTiger storage engine
    // When the server restarts and creates a new MongoMemoryServer with the same dbPath,
    // MongoDB loads the existing data from disk - so NO data is lost across restarts!
    const mongod = await MongoMemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger',
      },
      binary: {
        // Use a consistent binary version to avoid re-downloads
        version: '7.0.0',
      },
    })
    
    _mongod = mongod
    cached.mongod = mongod
    
    const uri = mongod.getUri()
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    })
    
    console.log(`Persistent local MongoDB connected: ${conn.connection.host}`)
    
    // Handle connection events for auto-reconnect
    mongoose.connection.on('disconnected', async () => {
      console.warn('Local MongoDB disconnected. Attempting to reconnect...')
      cached.conn = null
      try {
        await mongoose.connect(uri)
        console.log('Reconnected to local MongoDB')
      } catch (err) {
        console.error('Reconnection failed:', err.message)
      }
    })
    
    return conn
  } catch (memoryError) {
    console.error('Local MongoDB failed:', memoryError.message)
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying local MongoDB (${retryCount + 1}/${MAX_RETRIES})...`)
      await sleep(RETRY_DELAY * 2)
      return connectInMemory(retryCount + 1)
    }
    throw memoryError
  }
}

// Graceful shutdown handler
const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    if (_mongod) {
      await _mongod.stop()
    }
    console.log('MongoDB disconnected gracefully')
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err.message)
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectDB()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await disconnectDB()
  process.exit(0)
})

// For Vercel serverless - handle connection cleanup
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message)
})

module.exports = connectDB
module.exports.disconnect = disconnectDB