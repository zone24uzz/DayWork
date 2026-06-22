const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Ish nomi kiritish shart'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Joylashuvni kiriting'],
    trim: true,
  },
  salary: {
    type: Number,
    required: [true, 'Maoshni kiriting'],
  },
  salaryPeriod: {
    type: String,
    enum: ['kun', 'oy', 'loyiha'],
    default: 'kun',
  },
  duration: {
    type: String,
    trim: true,
  },
  workersNeeded: {
    type: Number,
    default: 1,
  },
  workersFound: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'completed', 'cancelled'],
    default: 'active',
  },
  category: {
    type: String,
    trim: true,
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

jobSchema.index({ employer: 1, status: 1 })
jobSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model('Job', jobSchema)