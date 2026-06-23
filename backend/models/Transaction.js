const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw', 'payment', 'refund'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'UZS',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  description: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    enum: ['payme', 'click', 'uzum', 'system', 'none'],
    default: 'none',
  },
  // Payme/Click transaction reference
  paymentTransactionId: {
    type: String,
    default: null,
  },
  paymentOrderId: {
    type: String,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
})

transactionSchema.index({ user: 1, createdAt: -1 })
transactionSchema.index({ wallet: 1 })
transactionSchema.index({ paymentTransactionId: 1 })
transactionSchema.index({ status: 1 })

module.exports = mongoose.model('Transaction', transactionSchema)
