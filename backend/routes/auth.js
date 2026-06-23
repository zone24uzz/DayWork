const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, company, position, userType } = req.body

    // Validate required fields
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: 'Ism, email, parol va foydalanuvchi turi majburiy' })
    }

    if (!['worker', 'employer'].includes(userType)) {
      return res.status(400).json({ message: 'Foydalanuvchi turi faqat worker yoki employer bo\'lishi mumkin' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Parol kamida 6 belgidan iborat bo\'lishi kerak' })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      company,
      position,
      userType,
    })

    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        position: user.position,
        userType: user.userType,
        avatar: user.name[0].toUpperCase(),
        createdAt: user.createdAt.getFullYear().toString(),
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({ message: messages.join('. ') })
    }
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email va parolni kiriting' })
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' })
    }

    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        position: user.position,
        userType: user.userType,
        avatar: user.name[0].toUpperCase(),
        createdAt: user.createdAt.getFullYear().toString(),
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        company: req.user.company,
        position: req.user.position,
        userType: req.user.userType,
        avatar: req.user.name[0].toUpperCase(),
        createdAt: req.user.createdAt.getFullYear().toString(),
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// PUT /api/auth/profile - Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, surname, age, gender, passport, jshshir, phone, company, position } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, surname, age, gender, passport, jshshir, phone, company, position },
      { new: true, runValidators: true }
    )

    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' })
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        company: user.company,
        position: user.position,
        userType: user.userType,
        age: user.age,
        gender: user.gender,
        passport: user.passport,
        jshshir: user.jshshir,
        avatar: user.name[0].toUpperCase(),
        createdAt: user.createdAt.getFullYear().toString(),
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({ message: messages.join('. ') })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// PUT /api/auth/password - Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Joriy va yangi parolni kiriting' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Yangi parol kamida 6 belgidan iborat bo\'lishi kerak' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' })
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Joriy parol noto\'g\'ri' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' })
  } catch (error) {
    console.error('Password change error:', error)
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// GET /api/auth/search - Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q, type } = req.query
    if (!q || q.length < 2) {
      return res.json({ users: [] })
    }

    const filter = {
      _id: { $ne: req.user._id },
      name: { $regex: q, $options: 'i' },
    }
    if (type) {
      filter.userType = type
    }

    const users = await User.find(filter)
      .limit(10)
      .select('name email userType avatar')

    const formatted = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      userType: u.userType,
      avatar: u.name[0].toUpperCase(),
    }))

    res.json({ users: formatted })
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

module.exports = router