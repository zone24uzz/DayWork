const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: 'Foydalanuvchi topilmadi' })
    }

    req.user = user
    req.token = token
    next()
  } catch (error) {
    res.status(401).json({ message: 'Noto\'g\'ri token' })
  }
}

module.exports = auth