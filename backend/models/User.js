const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ism kiritish shart'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email kiritish shart'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Parol kiritish shart'],
    minlength: 6,
    select: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
  userType: {
    type: String,
    enum: ['worker', 'employer'],
    required: [true, 'Foydalanuvchi turini tanlang'],
  },
  surname: {
    type: String,
    trim: true,
    maxlength: 100,
    default: '',
  },
  age: {
    type: Number,
    min: 0,
    max: 120,
  },
  gender: {
    type: String,
    enum: ['Erkak', 'Ayol', ''],
    default: '',
  },
  passport: {
    type: String,
    trim: true,
    default: '',
  },
  jshshir: {
    type: String,
    trim: true,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)