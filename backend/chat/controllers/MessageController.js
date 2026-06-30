const MessageService = require('../services/MessageService')
const ConversationService = require('../services/ConversationService')
const User = require('../../models/User')
const { getReceiverSocket } = require('../socket/handlers')

class MessageController {
  /**
   * POST /api/chat/message
   * Send a message
   */
  async sendMessage(req, res, next) {
    try {
      const { receiverId, text, replyTo, attachments, location } = req.body

      if (!receiverId) {
        return res.status(400).json({ message: 'Receiver ID is required' })
      }
      if (!text && (!attachments || attachments.length === 0)) {
        return res.status(400).json({ message: 'Message text or attachment is required' })
      }

      const result = await MessageService.send({
        senderId: req.user._id,
        receiverId,
        text,
        replyTo,
        attachments,
        location,
      })

      // Emit socket event
      const io = req.app.get('io')
      if (io) {
        // Emit to conversation room
        io.to(result.conversationId.toString()).emit('new_message', {
          conversationId: result.conversationId,
          message: result.message,
        })

        // Update conversation list for both participants
        io.to(result.conversationId.toString()).emit('conversation_updated', {
          conversationId: result.conversationId,
        })

        // Also notify receiver directly if not in room
        const receiverSocket = await getReceiverSocket(receiverId)
        if (receiverSocket) {
          io.to(receiverSocket).emit('new_message', {
            conversationId: result.conversationId,
            message: result.message,
          })
          io.to(receiverSocket).emit('conversation_updated', {
            conversationId: result.conversationId,
          })
        }
      }

      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/chat/messages/:conversationId
   * Get messages with pagination
   */
  async getMessages(req, res, next) {
    try {
      const { page = 1, limit = 50 } = req.query
      const result = await MessageService.getByConversation(
        req.params.conversationId,
        req.user._id,
        { page: parseInt(page), limit: parseInt(limit) }
      )
      res.json(result)
    } catch (err) {
      if (err.message === 'Conversation not found') {
        return res.status(404).json({ message: err.message })
      }
      if (err.message === 'Unauthorized') {
        return res.status(403).json({ message: err.message })
      }
      next(err)
    }
  }

  /**
   * PATCH /api/chat/message/:id
   * Edit a message
   */
  async editMessage(req, res, next) {
    try {
      const { text } = req.body
      if (!text) return res.status(400).json({ message: 'Message text is required' })

      const message = await MessageService.edit(req.params.id, req.user._id, text)

      const io = req.app.get('io')
      if (io) {
        io.to(message.conversation.toString()).emit('message_edited', {
          conversationId: message.conversation,
          messageId: message._id,
          text: message.text,
          editedAt: message.editedAt,
        })
      }

      res.json({ message: { id: message._id, text: message.text, editedAt: message.editedAt } })
    } catch (err) {
      if (err.message === 'Unauthorized') return res.status(403).json({ message: err.message })
      if (err.message === 'Message not found') return res.status(404).json({ message: err.message })
      next(err)
    }
  }

  /**
   * DELETE /api/chat/message/:id
   * Delete a message
   */
  async deleteMessage(req, res, next) {
    try {
      const { type = 'forEveryone' } = req.body
      const message = await MessageService.delete(req.params.id, req.user._id, type)

      const io = req.app.get('io')
      if (io) {
        io.to(message.conversation.toString()).emit('message_deleted', {
          conversationId: message.conversation,
          messageId: message._id,
          deletedFor: message.deletedFor,
        })
      }

      res.json({ message: 'Message deleted', id: req.params.id })
    } catch (err) {
      if (err.message === 'Unauthorized') return res.status(403).json({ message: err.message })
      if (err.message === 'Message not found') return res.status(404).json({ message: err.message })
      next(err)
    }
  }

  /**
   * POST /api/chat/message/react
   * Toggle reaction on a message
   */
  async toggleReaction(req, res, next) {
    try {
      const { messageId, emoji } = req.body
      if (!messageId || !emoji) {
        return res.status(400).json({ message: 'Message ID and emoji are required' })
      }

      const message = await MessageService.toggleReaction(messageId, req.user._id, emoji)

      const io = req.app.get('io')
      if (io) {
        io.to(message.conversation.toString()).emit('message_reacted', {
          conversationId: message.conversation,
          messageId: message._id,
          reactions: message.reactions,
        })
      }

      res.json({ reactions: message.reactions })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/chat/message/forward
   * Forward a message
   */
  async forwardMessage(req, res, next) {
    try {
      const { messageId, targetConversationId } = req.body
      if (!messageId || !targetConversationId) {
        return res.status(400).json({ message: 'Message ID and target conversation ID are required' })
      }

      const forwarded = await MessageService.forward(
        messageId,
        req.user._id,
        targetConversationId
      )

      const io = req.app.get('io')
      if (io) {
        io.to(targetConversationId).emit('new_message', {
          conversationId: targetConversationId,
          message: forwarded,
        })
      }

      res.status(201).json({ message: forwarded })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/chat/search/messages
   * Search messages in a conversation
   */
  async searchMessages(req, res, next) {
    try {
      const { conversationId, q, page = 1, limit = 20 } = req.query
      if (!conversationId || !q) {
        return res.status(400).json({ message: 'Conversation ID and search query are required' })
      }
      const result = await MessageService.search(
        conversationId,
        req.user._id,
        q,
        { page: parseInt(page), limit: parseInt(limit) }
      )
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/chat/message/pin
   * Pin/unpin a message
   */
  async pinMessage(req, res, next) {
    try {
      const { messageId, conversationId } = req.body
      if (!messageId || !conversationId) {
        return res.status(400).json({ message: 'Message ID and Conversation ID are required' })
      }

      const Conversation = require('../models/Conversation')
      const conv = await Conversation.findById(conversationId)
      if (!conv) {
        return res.status(404).json({ message: 'Conversation not found' })
      }

      const idx = conv.pinnedMessages.findIndex(
        (p) => p.toString() === messageId
      )
      let pinned = false
      if (idx > -1) {
        conv.pinnedMessages.splice(idx, 1)
      } else {
        conv.pinnedMessages.push(messageId)
        pinned = true
      }
      await conv.save()

      const io = req.app.get('io')
      if (io) {
        io.to(conversationId).emit('message_pinned', {
          conversationId,
          messageId,
          pinned,
        })
      }

      res.json({ pinned, pinnedMessages: conv.pinnedMessages })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/chat/search/users
   * Search users by name
   */
  async searchUsers(req, res, next) {
    try {
      const { q, type } = req.query
      if (!q || q.length < 2) {
        return res.json({ users: [] })
      }

      const filter = {
        _id: { $ne: req.user._id },
        name: { $regex: q, $options: 'i' },
      }
      if (type) filter.userType = type

      const users = await User.find(filter)
        .limit(10)
        .select('name email userType isOnline lastSeen')

      const formatted = users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        userType: u.userType,
        isOnline: u.isOnline || false,
        lastSeen: u.lastSeen,
        avatar: u.name[0].toUpperCase(),
      }))

      res.json({ users: formatted })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/chat/typing
   * Send typing indicator
   */
  async typing(req, res, next) {
    try {
      const { conversationId, isTyping } = req.body
      if (!conversationId) {
        return res.status(400).json({ message: 'Conversation ID is required' })
      }

      const io = req.app.get('io')
      if (io) {
        const event = isTyping ? 'user_typing' : 'user_stop_typing'
        io.to(conversationId).emit(event, {
          conversationId,
          userId: req.user._id,
          userName: req.user.name,
        })
      }

      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new MessageController()
