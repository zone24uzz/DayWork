const Message = require('../models/Message')
const Conversation = require('../models/Conversation')

class MessageService {
  /**
   * Send a message in a conversation
   */
  async send({ senderId, receiverId, text, replyTo, attachments, location }) {
    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 },
      isActive: true,
    })
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      })
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      text: text || '',
      replyTo: replyTo || null,
      attachments: attachments || [],
      location: location || null,
    })

    // Update conversation
    conversation.lastMessage = message._id
    conversation.lastMessageAt = new Date()
    await conversation.save()

    // Populate sender
    await message.populate('sender', 'name email')
    if (message.replyTo) {
      await message.populate('replyTo', 'text sender')
    }

    return {
      message: this._formatMessage(message, senderId),
      conversationId: conversation._id,
    }
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getByConversation(conversationId, userId, { page = 1, limit = 50 } = {}) {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) throw new Error('Conversation not found')
    if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
      throw new Error('Unauthorized')
    }

    const skip = (page - 1) * limit
    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: userId },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email')
      .populate('replyTo', 'text sender')
      .populate('reactions.user', 'name')

    const total = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: userId },
    })

    return {
      messages: messages.reverse().map((m) => this._formatMessage(m, userId)),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + limit < total,
      },
    }
  }

  /**
   * Edit a message
   */
  async edit(messageId, userId, newText) {
    const message = await Message.findById(messageId)
    if (!message) throw new Error('Message not found')
    if (message.sender.toString() !== userId.toString()) throw new Error('Unauthorized')

    // Save edit history
    message.editHistory.push({ text: message.text, editedAt: new Date() })
    message.text = newText
    message.editedAt = new Date()
    return message.save()
  }

  /**
   * Soft delete a message (for everyone or just for the user)
   */
  async delete(messageId, userId, type = 'forEveryone') {
    const message = await Message.findById(messageId)
    if (!message) throw new Error('Message not found')

    if (type === 'forEveryone') {
      // Only sender can delete for everyone
      if (message.sender.toString() !== userId.toString()) throw new Error('Unauthorized')
      await message.softDelete(userId)
    } else {
      // Delete only for this user
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId)
        await message.save()
      }
    }
    return message
  }

  /**
   * Add/remove reaction (toggle)
   */
  async toggleReaction(messageId, userId, emoji) {
    const message = await Message.findById(messageId)
    if (!message) throw new Error('Message not found')
    return message.addReaction(emoji, userId)
  }

  /**
   * Forward message to another conversation
   */
  async forward(messageId, userId, targetConversationId) {
    const original = await Message.findById(messageId)
    if (!original) throw new Error('Original message not found')

    const forwarded = await Message.create({
      conversation: targetConversationId,
      sender: userId,
      text: original.text,
      isForwarded: true,
      forwardedFrom: messageId,
      attachments: original.attachments,
    })

    // Update target conversation
    await Conversation.findByIdAndUpdate(targetConversationId, {
      lastMessage: forwarded._id,
      lastMessageAt: new Date(),
    })

    await forwarded.populate('sender', 'name email')
    return forwarded
  }

  /**
   * Search messages within a conversation
   */
  async search(conversationId, userId, query, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit
    const messages = await Message.find({
      conversation: conversationId,
      text: { $regex: query, $options: 'i' },
      isDeleted: false,
      deletedFor: { $ne: userId },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email')

    const total = await Message.countDocuments({
      conversation: conversationId,
      text: { $regex: query, $options: 'i' },
      isDeleted: false,
      deletedFor: { $ne: userId },
    })

    return {
      messages: messages.reverse().map((m) => this._formatMessage(m, userId)),
      pagination: { page, limit, total, hasMore: skip + limit < total },
    }
  }

  /**
   * Format message for frontend
   */
  _formatMessage(msg, userId) {
    return {
      id: msg._id,
      conversationId: msg.conversation,
      sender: msg.sender?._id?.toString() || msg.sender?.toString(),
      senderName: msg.sender?.name || 'Unknown',
      text: msg.text,
      status: msg.status,
      readBy: msg.readBy?.map((r) => r._id?.toString() || r.toString()) || [],
      editedAt: msg.editedAt,
      isEdited: !!msg.editedAt,
      isForwarded: msg.isForwarded,
      replyTo: msg.replyTo
        ? {
            id: msg.replyTo._id,
            text: msg.replyTo.text,
            sender: msg.replyTo.sender?.name || 'Unknown',
          }
        : null,
      attachments: msg.attachments || [],
      reactions: (msg.reactions || []).map((r) => ({
        emoji: r.emoji,
        user: r.user?._id?.toString() || r.user?.toString(),
        userName: r.user?.name || 'Unknown',
      })),
      location: msg.location || null,
      time: msg.createdAt,
      isFromMe: (msg.sender?._id?.toString() || msg.sender?.toString()) === userId.toString(),
    }
  }
}

module.exports = new MessageService()
