const Conversation = require('../models/Conversation')
const Message = require('../models/Message')

class ConversationService {
  /**
   * Get or create a conversation between two users
   */
  async findOrCreate(userA, userB) {
    return Conversation.findOrCreate(userA, userB)
  }

  /**
   * Get all conversations for a user with unread counts
   */
  async getForUser(userId) {
    const conversations = await Conversation.getForUser(userId)
    // Format for frontend
    return conversations.map((conv) => {
      const other = conv.otherParticipant || {}
      const lastMsg = conv.lastMessage || {}
      return {
        id: conv._id,
        contact: {
          id: other._id,
          name: other.name || 'Unknown',
          email: other.email,
          userType: other.userType,
          isOnline: other.isOnline || false,
          lastSeen: other.lastSeen,
          avatar: other.name ? other.name[0].toUpperCase() : 'U',
        },
        lastMessage: lastMsg.text
          ? {
              text: lastMsg.text,
              time: lastMsg.time,
              isFromMe: lastMsg.sender
                ? lastMsg.sender.toString() === userId.toString()
                : false,
            }
          : null,
        unreadCount: conv.unreadCount || 0,
        updatedAt: conv.lastMessageAt || conv.updatedAt,
      }
    })
  }

  /**
   * Get conversation by ID with participant check
   */
  async getById(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email userType isOnline lastSeen')
    if (!conversation) return null
    if (!conversation.participants.some((p) => p._id.toString() === userId.toString())) {
      return null
    }
    return conversation
  }

  /**
   * Mark all messages in a conversation as read for a user
   */
  async markAsRead(conversationId, userId) {
    const messages = await Message.find({
      conversation: conversationId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
      isDeleted: false,
    })
    for (const msg of messages) {
      await msg.markAsRead(userId)
    }
    return messages.length
  }

  /**
   * Get unread count for all conversations
   */
  async getUnreadCount(userId) {
    const conversations = await Conversation.getForUser(userId)
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  }

  /**
   * Get unread count per conversation
   */
  async getUnreadByConversation(userId) {
    const conversations = await Conversation.getForUser(userId)
    const result = {}
    conversations.forEach((c) => {
      result[c._id] = c.unreadCount || 0
    })
    return result
  }

  /**
   * Delete conversation (soft delete - just mark inactive)
   */
  async delete(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) throw new Error('Conversation not found')
    if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
      throw new Error('Unauthorized')
    }
    conversation.isActive = false
    return conversation.save()
  }
}

module.exports = new ConversationService()
