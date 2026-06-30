const express = require('express')
const auth = require('../../middleware/auth')
const ConversationController = require('../controllers/ConversationController')
const MessageController = require('../controllers/MessageController')
const V = require('../validation/validators')

const router = express.Router()

// All routes require authentication
router.use(auth)

// ─── Conversations ────────────────────────────────
router.get('/conversations', (req, res, next) => ConversationController.getConversations(req, res, next))
router.get('/conversation/:id', (req, res, next) => ConversationController.getConversation(req, res, next))
router.post('/conversation', V.createConversation, (req, res, next) => ConversationController.createConversation(req, res, next))
router.delete('/conversation/:id', (req, res, next) => ConversationController.deleteConversation(req, res, next))

// ─── Messages ─────────────────────────────────────
router.get('/messages/:conversationId', (req, res, next) => MessageController.getMessages(req, res, next))
router.post('/message', V.sendMessage, (req, res, next) => MessageController.sendMessage(req, res, next))
router.patch('/message/:id', V.editMessage, (req, res, next) => MessageController.editMessage(req, res, next))
router.delete('/message/:id', V.deleteMessage, (req, res, next) => MessageController.deleteMessage(req, res, next))
router.post('/message/react', V.toggleReaction, (req, res, next) => MessageController.toggleReaction(req, res, next))
router.post('/message/forward', V.forwardMessage, (req, res, next) => MessageController.forwardMessage(req, res, next))
router.post('/message/pin', (req, res, next) => MessageController.pinMessage(req, res, next))

// ─── Status ───────────────────────────────────────
router.get('/unread', (req, res, next) => ConversationController.getUnreadCount(req, res, next))
router.post('/read', V.markAsRead, (req, res, next) => ConversationController.markAsRead(req, res, next))
router.post('/typing', V.typing, (req, res, next) => MessageController.typing(req, res, next))

// ─── Search ───────────────────────────────────────
router.get('/search/messages', V.searchMessages, (req, res, next) => MessageController.searchMessages(req, res, next))
router.get('/search/users', V.searchUsers, (req, res, next) => MessageController.searchUsers(req, res, next))

module.exports = router
