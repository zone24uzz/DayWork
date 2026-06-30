const User = require('../../models/User')
const MessageService = require('../services/MessageService')
const ConversationService = require('../services/ConversationService')
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const { getLogger } = require('../middleware/logger')

const logger = getLogger('Socket')

// Online users tracking: userId -> { sockets: Set<socketId>, lastSeen: Date, userName: string }
const onlineUsers = new Map()
// Socket conversations: socketId -> Set<conversationId>
const socketConversations = new Map()
// Socket metadata: socketId -> { userId, connectedAt, userAgent }
const socketMeta = new Map()

const MAX_RECONNECT_ATTEMPTS = 50

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    const clientAddress = socket.handshake.address
    const userAgent = socket.handshake.headers['user-agent'] || 'unknown'
    logger.info(`Socket connected: ${socket.id} from ${clientAddress}`)

    // Store metadata
    socketMeta.set(socket.id, {
      connectedAt: new Date(),
      userAgent,
      address: clientAddress,
    })

    // ── Authentication ─────────────────────────────
    socket.on('authenticate', async (userId) => {
      try {
        if (!userId) {
          socket.emit('error', { message: 'User ID is required' })
          return
        }

        socket.userId = userId
        socketMeta.set(socket.id, { ...socketMeta.get(socket.id), userId })

        // Track online status
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, { sockets: new Set(), lastSeen: new Date(), userName: 'Unknown' })
        }
        const userData = onlineUsers.get(userId)
        userData.sockets.add(socket.id)
        userData.lastSeen = new Date()

        // Update user in DB
        const user = await User.findByIdAndUpdate(userId,
          { isOnline: true, lastSeen: new Date() },
          { new: true }
        )
        if (user) {
          userData.userName = user.name
        }

        // Broadcast online status to all
        io.emit('users_online', getOnlineUsers())
        logger.info(`User online: ${userId}`)

        // Rejoin all previous conversations (for reconnection)
        const userConversations = await ConversationService.getForUser(userId)
        for (const conv of userConversations) {
          socket.join(conv.id.toString())
          if (!socketConversations.has(socket.id)) {
            socketConversations.set(socket.id, new Set())
          }
          socketConversations.get(socket.id).add(conv.id.toString())
        }
      } catch (err) {
        logger.error('Socket authenticate error:', err.message)
        socket.emit('error', { message: 'Authentication failed' })
      }
    })

    // ── Join conversation room ─────────────────────
    socket.on('join_conversation', (conversationId) => {
      if (!conversationId) return
      socket.join(conversationId)

      if (!socketConversations.has(socket.id)) {
        socketConversations.set(socket.id, new Set())
      }
      socketConversations.get(socket.id).add(conversationId)
      logger.debug(`Socket ${socket.id} joined conversation ${conversationId}`)
    })

    // ── Leave conversation room ────────────────────
    socket.on('leave_conversation', (conversationId) => {
      if (!conversationId) return
      socket.leave(conversationId)
      if (socketConversations.has(socket.id)) {
        socketConversations.get(socket.id).delete(conversationId)
      }
    })

    // ── Send message ──────────────────────────────
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, text, replyTo, attachments } = data
        if (!socket.userId || !receiverId) {
          socket.emit('error', { message: 'Authentication required' })
          return
        }

        const result = await MessageService.send({
          senderId: socket.userId,
          receiverId,
          text,
          replyTo,
          attachments,
        })

        // Emit to conversation room
        io.to(result.conversationId.toString()).emit('new_message', {
          conversationId: result.conversationId,
          message: result.message,
        })

        // Update conversations list for both participants
        io.to(result.conversationId.toString()).emit('conversation_updated', {
          conversationId: result.conversationId,
        })

        // — Delivery status tracking —
        // Check if receiver is currently in the conversation room
        const receiverSockets = getUserSockets(receiverId)
        let isReceiverInRoom = false

        for (const sid of receiverSockets) {
          const rooms = socketConversations.get(sid)
          if (rooms && rooms.has(result.conversationId.toString())) {
            isReceiverInRoom = true
            break
          }
        }

        if (isReceiverInRoom) {
          // Receiver is actively viewing this conversation → mark as delivered
          try {
            await Message.findByIdAndUpdate(result.message.id, { status: 'delivered' })
            io.to(result.conversationId.toString()).emit('message_status_updated', {
              conversationId: result.conversationId,
              messageId: result.message.id,
              status: 'delivered',
            })
          } catch (err) {
            logger.error('Failed to update delivery status:', err.message)
          }
        }

        // Send notification to receiver if not in the room
        if (receiverSockets.length > 0) {
          for (const sid of receiverSockets) {
            const rooms = socketConversations.get(sid)
            if (!rooms || !rooms.has(result.conversationId.toString())) {
              // Send notification event to receiver's other sockets
              io.to(sid).emit('notification', {
                type: 'new_message',
                conversationId: result.conversationId,
                message: {
                  id: result.message.id,
                  senderName: result.message.senderName,
                  text: result.message.text,
                  time: result.message.time,
                },
                unreadCount: 1,
              })
            }
          }
        } else {
          // Receiver is offline entirely
          // Message stays as 'sent' status until receiver comes online
          logger.debug(`Message ${result.message.id} sent to offline user ${receiverId}`)
        }

        logger.debug(`Message sent in conversation ${result.conversationId}`)
      } catch (err) {
        logger.error('Socket send_message error:', err.message)
        socket.emit('error', { message: 'Xabar yuborilmadi. Qayta urinib ko\'ring.' })
      }
    })

    // ── Typing indicator ──────────────────────────
    let typingTimeout = null
    socket.on('typing', (data) => {
      const { conversationId } = data
      if (!conversationId || !socket.userId) return

      socket.to(conversationId).emit('user_typing', {
        conversationId,
        userId: socket.userId,
        userName: data.userName || 'Someone',
      })

      // Auto-stop typing after 5 seconds as fallback
      clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => {
        socket.to(conversationId).emit('user_stop_typing', {
          conversationId,
          userId: socket.userId,
        })
      }, 5000)
    })

    socket.on('stop_typing', (data) => {
      const { conversationId } = data
      if (!conversationId || !socket.userId) return
      clearTimeout(typingTimeout)
      socket.to(conversationId).emit('user_stop_typing', {
        conversationId,
        userId: socket.userId,
      })
    })

    // ── Read messages ─────────────────────────────
    socket.on('mark_read', async (data) => {
      try {
        const { conversationId } = data
        if (!conversationId || !socket.userId) return

        const count = await ConversationService.markAsRead(conversationId, socket.userId)

        // Notify conversation that messages were read
        io.to(conversationId).emit('messages_read', {
          conversationId,
          userId: socket.userId,
          count,
        })

        // Update unread count for users
        io.to(conversationId).emit('unread_updated', {
          conversationId,
          userId: socket.userId,
        })

        if (count > 0) {
          logger.debug(`${count} messages marked as read in ${conversationId}`)
        }
      } catch (err) {
        logger.error('Socket mark_read error:', err.message)
      }
    })

    // ── Edit message ──────────────────────────────
    socket.on('edit_message', async (data) => {
      try {
        const { messageId, text } = data
        if (!messageId || !text || !socket.userId) return

        const message = await MessageService.edit(messageId, socket.userId, text)

        io.to(message.conversation.toString()).emit('message_edited', {
          conversationId: message.conversation,
          messageId: message._id,
          text: message.text,
          editedAt: message.editedAt,
        })
      } catch (err) {
        logger.error('Socket edit_message error:', err.message)
        socket.emit('error', { message: err.message || 'Xabarni tahrirlashda xatolik' })
      }
    })

    // ── Delete message ────────────────────────────
    socket.on('delete_message', async (data) => {
      try {
        const { messageId, type } = data
        if (!messageId || !socket.userId) return

        const message = await MessageService.delete(messageId, socket.userId, type || 'forEveryone')

        io.to(message.conversation.toString()).emit('message_deleted', {
          conversationId: message.conversation,
          messageId: message._id,
          deletedFor: message.deletedFor,
          isDeleted: message.isDeleted,
        })
      } catch (err) {
        logger.error('Socket delete_message error:', err.message)
        socket.emit('error', { message: err.message || 'Xabarni o\'chirishda xatolik' })
      }
    })

    // ── React to message ──────────────────────────
    socket.on('react_message', async (data) => {
      try {
        const { messageId, emoji } = data
        if (!messageId || !emoji || !socket.userId) return

        const message = await MessageService.toggleReaction(messageId, socket.userId, emoji)

        io.to(message.conversation.toString()).emit('message_reacted', {
          conversationId: message.conversation,
          messageId: message._id,
          reactions: message.reactions,
        })
      } catch (err) {
        logger.error('Socket react_message error:', err.message)
        socket.emit('error', { message: 'Reaksiya qo\'shishda xatolik' })
      }
    })

    // ── Pin message ───────────────────────────────
    socket.on('pin_message', async (data) => {
      try {
        const { messageId, conversationId } = data
        if (!messageId || !conversationId || !socket.userId) return

        const conv = await Conversation.findById(conversationId)
        if (!conv) return

        // Toggle pin
        const idx = conv.pinnedMessages.indexOf(messageId)
        if (idx > -1) {
          conv.pinnedMessages.splice(idx, 1)
        } else {
          conv.pinnedMessages.push(messageId)
        }
        await conv.save()

        io.to(conversationId).emit('message_pinned', {
          conversationId,
          messageId,
          pinned: idx === -1,
        })
      } catch (err) {
        logger.error('Socket pin_message error:', err.message)
      }
    })

    // ── Ping / Pong (keep alive) ──────────────────
    socket.on('ping', () => {
      socket.emit('pong', { time: Date.now() })
    })

    // ── Disconnect ────────────────────────────────
    socket.on('disconnect', async (reason) => {
      logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`)

      // Remove from conversations tracking
      socketConversations.delete(socket.id)
      socketMeta.delete(socket.id)

      // Update online status
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const userData = onlineUsers.get(socket.userId)
        userData.sockets.delete(socket.id)

        if (userData.sockets.size === 0) {
          // User is fully offline - update DB
          onlineUsers.delete(socket.userId)
          const lastSeen = new Date()

          try {
            await User.findByIdAndUpdate(socket.userId, {
              isOnline: false,
              lastSeen,
            })
          } catch (err) {
            logger.error('Failed to update user offline status:', err.message)
          }

          // Broadcast offline status
          io.emit('user_offline', { userId: socket.userId, lastSeen })
          io.emit('users_online', getOnlineUsers())
          logger.info(`User fully offline: ${socket.userId}`)
        } else {
          logger.debug(`User ${socket.userId} has ${userData.sockets.size} remaining socket(s)`)
        }
      }
    })

    // ── Error handler ─────────────────────────────
    socket.on('error', (err) => {
      logger.error(`Socket error for ${socket.id}:`, err?.message || err)
    })
  })
}

/**
 * Get all online users with their metadata
 */
function getOnlineUsers() {
  const users = []
  for (const [userId, data] of onlineUsers) {
    users.push({
      userId,
      userName: data.userName,
      lastSeen: data.lastSeen,
      deviceCount: data.sockets.size,
    })
  }
  return users
}

/**
 * Get online user IDs (backward compatibility)
 */
function getOnlineUserIds() {
  return Array.from(onlineUsers.keys())
}

/**
 * Get socket IDs for a user (supporting multi-device)
 */
function getUserSockets(userId) {
  const userData = onlineUsers.get(userId.toString())
  if (userData && userData.sockets.size > 0) {
    return Array.from(userData.sockets)
  }
  return []
}

/**
 * Get first socket ID for a user
 */
function getReceiverSocket(receiverId) {
  const sockets = getUserSockets(receiverId)
  return sockets.length > 0 ? sockets[0] : null
}

module.exports = {
  setupSocketHandlers,
  onlineUsers,
  getOnlineUsers,
  getOnlineUserIds,
  getUserSockets,
  getReceiverSocket,
}
