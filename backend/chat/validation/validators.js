/**
 * Request validation for chat API endpoints
 * Validates input data before it reaches controllers
 */
const { getLogger } = require('../middleware/logger')
const logger = getLogger('Validation')

/**
 * Validate ObjectId format
 */
const isValidObjectId = (id) => {
  if (!id) return false
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Generic validation middleware factory
 * @param {Object} rules - Field validation rules
 */
const validate = (rules) => {
  return (req, res, next) => {
    const errors = []
    const data = { ...req.body, ...req.query, ...req.params }

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field]

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: rule.message || `${field} is required` })
        continue
      }

      if (value === undefined || value === null) continue

      // Type checks
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push({ field, message: `${field} must be a string` })
        continue
      }
      if (rule.type === 'number' && (isNaN(Number(value)))) {
        errors.push({ field, message: `${field} must be a number` })
        continue
      }
      if (rule.type === 'boolean' && typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        errors.push({ field, message: `${field} must be a boolean` })
        continue
      }

      // String validations
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push({ field, message: `${field} must be at least ${rule.minLength} characters` })
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push({ field, message: `${field} must be at most ${rule.maxLength} characters` })
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push({ field, message: rule.patternMessage || `${field} format is invalid` })
        }
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({ field, message: `${field} must be one of: ${rule.enum.join(', ')}` })
      }

      // ObjectId validation
      if (rule.objectId && !isValidObjectId(value)) {
        errors.push({ field, message: `Invalid ${field} ID format` })
      }
    }

    if (errors.length > 0) {
      logger.warn('Validation failed', { path: req.originalUrl, errors })
      return res.status(400).json({ message: errors.map(e => e.message).join('. '), errors })
    }

    next()
  }
}

// ─── Pre-built validators for chat endpoints ──────────

const sendMessage = validate({
  receiverId: { required: true, objectId: true, message: 'Qabul qiluvchi ID si noto\'g\'ri' },
  text: { type: 'string', maxLength: 10000 },
  replyTo: { objectId: true },
})

const createConversation = validate({
  receiverId: { required: true, objectId: true, message: 'Qabul qiluvchi ID si noto\'g\'ri' },
})

const editMessage = validate({
  text: { required: true, type: 'string', minLength: 1, maxLength: 10000, message: 'Xabar matni talab qilinadi' },
})

const deleteMessage = validate({
  type: { enum: ['forEveryone', 'forMe'] },
})

const toggleReaction = validate({
  messageId: { required: true, objectId: true, message: 'Xabar ID si noto\'g\'ri' },
  emoji: { required: true, type: 'string', minLength: 1, maxLength: 10, message: 'Emoji talab qilinadi' },
})

const forwardMessage = validate({
  messageId: { required: true, objectId: true },
  targetConversationId: { required: true, objectId: true },
})

const markAsRead = validate({
  conversationId: { required: true, objectId: true, message: 'Suhbat ID si noto\'g\'ri' },
})

const typing = validate({
  conversationId: { required: true, objectId: true },
})

const searchMessages = validate({
  conversationId: { required: true, objectId: true },
  q: { required: true, type: 'string', minLength: 1 },
})

const searchUsers = validate({
  q: { type: 'string', minLength: 2 },
  type: { enum: ['worker', 'employer', ''] },
})

const pagination = validate({
  page: { type: 'number' },
  limit: { type: 'number' },
})

module.exports = {
  validate,
  sendMessage,
  createConversation,
  editMessage,
  deleteMessage,
  toggleReaction,
  forwardMessage,
  markAsRead,
  typing,
  searchMessages,
  searchUsers,
  pagination,
  isValidObjectId,
}
