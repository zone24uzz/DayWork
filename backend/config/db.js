const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    })
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.warn('MongoDB connection failed, starting in-memory MongoDB...')
    console.warn(`  Error: ${error.message}`)
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server')
      const mongod = await MongoMemoryServer.create()
      const uri = mongod.getUri()
      const conn = await mongoose.connect(uri)
      console.log(`In-memory MongoDB connected: ${conn.connection.host}`)
    } catch (memoryError) {
      console.error('In-memory MongoDB failed:', memoryError.message)
      process.exit(1)
    }
  }
}

module.exports = connectDB