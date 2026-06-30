const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    trim: true,
    default: '',
  },
  // Message status
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent',
  },
  // Who has read this message
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Edit support
  editedAt: {
    type: Date,
    default: null,
  },
  editHistory: [{
    text: String,
    editedAt: Date,
  }],
  // Delete support (soft delete)
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Reply support
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  // Forward support
  isForwarded: {
    type: Boolean,
    default: false,
  },
  forwardedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  // Attachments
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file', 'voice', 'video'],
    },
    url: String,
    name: String,
    size: Number,
    mimeType: String,
    width: Number,
    height: Number,
    duration: Number, // for voice/video
    thumbnailUrl: String,
  }],
  // Reactions (emoji)
  reactions: [{
    emoji: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Location share
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
}, {
  timestamps: true,
})

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 })
messageSchema.index({ conversation: 1, status: 1 })
messageSchema.index({ sender: 1, createdAt: -1 })
messageSchema.index({ text: 'text' })
messageSchema.index({ 'reactions.user': 1 })
messageSchema.index({ isDeleted: 1, conversation: 1 })

// Mark message as read
messageSchema.methods.markAsRead = async function (userId) {
  if (!this.readBy.includes(userId)) {
    this.readBy.push(userId)
    if (this.status === 'sent' || this.status === 'delivered') {
      this.status = 'read'
    }
    return this.save()
  }
  return this
}

// Add reaction
messageSchema.methods.addReaction = async function (emoji, userId) {
  const existing = this.reactions.find(
    (r) => r.emoji === emoji && r.user.toString() === userId.toString()
  )
  if (!existing) {
    // Remove any existing reaction from this user
    this.reactions = this.reactions.filter(
      (r) => r.user.toString() !== userId.toString()
    )
    this.reactions.push({ emoji, user: userId })
    return this.save()
  }
  // Remove reaction if already exists (toggle)
  this.reactions = this.reactions.filter(
    (r) => !(r.emoji === emoji && r.user.toString() === userId.toString())
  )
  return this.save()
}

// Soft delete
messageSchema.methods.softDelete = async function (userId) {
  this.isDeleted = true
  this.deletedAt = new Date()
  if (!this.deletedFor.includes(userId)) {
    this.deletedFor.push(userId)
  }
  return this.save()
}

module.exports = mongoose.model('Message', messageSchema)
