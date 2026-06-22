const express = require('express')
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// GET /api/messages/conversations - Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar isOnline lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })

    // Filter out the current user from participants and format
    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      )
      return {
        id: conv._id,
        contact: otherParticipant
          ? {
              id: otherParticipant._id,
              name: otherParticipant.name,
              avatar: otherParticipant.name[0].toUpperCase(),
              isOnline: otherParticipant.isOnline,
              lastSeen: otherParticipant.lastSeen,
            }
          : null,
        lastMessage: conv.lastMessage
          ? {
              text: conv.lastMessage.text,
              time: conv.lastMessageAt,
              isFromMe: conv.lastMessage.sender.toString() === req.user._id.toString(),
            }
          : null,
        updatedAt: conv.lastMessageAt,
      }
    })

    res.json({ conversations: formatted })
  } catch (error) {
    console.error('Get conversations error:', error)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Noto\'g\'ri so\'rov formati' })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// GET /api/messages/:conversationId - Get messages in a conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ message: 'Suhbat topilmadi' })
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })

    const formatted = messages.map((msg) => ({
      id: msg._id,
      sender: msg.sender._id.toString(),
      senderName: msg.sender.name,
      text: msg.text,
      location: msg.location,
      time: msg.createdAt,
      isFromMe: msg.sender._id.toString() === req.user._id.toString(),
    }))

    res.json({ messages: formatted })
  } catch (error) {
    console.error('Get messages error:', error)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Noto\'g\'ri suhbat ID' })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// POST /api/messages/send - Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, text, location } = req.body

    if (!receiverId || !text) {
      return res.status(400).json({ message: 'Qabul qiluvchi va xabar matni shart' })
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    })

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
      })
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
      location,
    })

    // Update conversation
    conversation.lastMessage = message._id
    conversation.lastMessageAt = new Date()
    await conversation.save()

    // Populate and return
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')

    res.status(201).json({
      message: {
        id: populatedMessage._id,
        sender: populatedMessage.sender._id.toString(),
        senderName: populatedMessage.sender.name,
        text: populatedMessage.text,
        location: populatedMessage.location,
        time: populatedMessage.createdAt,
        isFromMe: true,
      },
      conversationId: conversation._id,
    })
  } catch (error) {
    console.error('Send message error:', error)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Noto\'g\'ri foydalanuvchi ID' })
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({ message: messages.join('. ') })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// POST /api/messages/conversation - Create conversation with a user
router.post('/conversation', auth, async (req, res) => {
  try {
    const { receiverId } = req.body

    if (!receiverId) {
      return res.status(400).json({ message: 'Qabul qiluvchi ID si shart' })
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    })

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
      })
    }

    await conversation.populate('participants', 'name avatar isOnline')

    const otherParticipant = conversation.participants.find(
      (p) => p._id.toString() !== req.user._id.toString()
    )

    res.json({
      conversation: {
        id: conversation._id,
        contact: otherParticipant
          ? {
              id: otherParticipant._id,
              name: otherParticipant.name,
              avatar: otherParticipant.name[0].toUpperCase(),
              isOnline: otherParticipant.isOnline,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Noto\'g\'ri foydalanuvchi ID' })
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({ message: messages.join('. ') })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

module.exports = router