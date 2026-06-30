const ConversationService = require('../services/ConversationService')
const MessageService = require('../services/MessageService')
const User = require('../../models/User')

class ConversationController {
  /**
   * GET /api/chat/conversations
   * Get all conversations for current user with unread counts
   */
  async getConversations(req, res, next) {
    try {
      const conversations = await ConversationService.getForUser(req.user._id)
      const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0)
      res.json({ conversations, totalUnread })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/chat/conversation/:id
   * Get a single conversation with participant details
   */
  async getConversation(req, res, next) {
    try {
      const conversation = await ConversationService.getById(req.params.id, req.user._id)
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }

      const other = conversation.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      )

      res.json({
        conversation: {
          id: conversation._id,
          contact: other
            ? {
                id: other._id,
                name: other.name,
                email: other.email,
                userType: other.userType,
                isOnline: other.isOnline || false,
                lastSeen: other.lastSeen,
                avatar: other.name[0].toUpperCase(),
              }
            : null,
          createdAt: conversation.createdAt,
        },
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/chat/conversation
   * Create or get existing conversation
   */
  async createConversation(req, res, next) {
    try {
      const { receiverId } = req.body
      if (!receiverId) {
        return res.status(400).json({ message: 'Receiver ID is required' })
      }

      const conversation = await ConversationService.findOrCreate(
        req.user._id,
        receiverId
      )

      await conversation.populate('participants', 'name email userType isOnline lastSeen')

      const other = conversation.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      )

      res.json({
        conversation: {
          id: conversation._id,
          contact: other
            ? {
                id: other._id,
                name: other.name,
                email: other.email,
                userType: other.userType,
                isOnline: other.isOnline || false,
                lastSeen: other.lastSeen,
                avatar: other.name[0].toUpperCase(),
              }
            : null,
        },
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/chat/unread
   * Get unread counts
   */
  async getUnreadCount(req, res, next) {
    try {
      const total = await ConversationService.getUnreadCount(req.user._id)
      const byConversation = await ConversationService.getUnreadByConversation(req.user._id)
      res.json({ total, byConversation })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/chat/read
   * Mark conversation messages as read
   */
  async markAsRead(req, res, next) {
    try {
      const { conversationId } = req.body
      if (!conversationId) {
        return res.status(400).json({ message: 'Conversation ID is required' })
      }
      const count = await ConversationService.markAsRead(conversationId, req.user._id)
      res.json({ markedAsRead: count })
    } catch (err) {
      next(err)
    }
  }

  /**
   * DELETE /api/chat/conversation/:id
   * Delete/archive a conversation
   */
  async deleteConversation(req, res, next) {
    try {
      await ConversationService.delete(req.params.id, req.user._id)
      res.json({ message: 'Conversation deleted' })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new ConversationController()
