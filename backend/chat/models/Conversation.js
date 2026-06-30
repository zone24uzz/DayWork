const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Indexes
conversationSchema.index({ participants: 1 })
conversationSchema.index({ lastMessageAt: -1 })
conversationSchema.index({ participants: 1, lastMessageAt: -1 })

// Static: find or create a conversation between two users
conversationSchema.statics.findOrCreate = async function (userA, userB) {
  let conversation = await this.findOne({
    participants: { $all: [userA, userB], $size: 2 },
    isActive: true,
  })
  if (!conversation) {
    conversation = await this.create({
      participants: [userA, userB],
    })
  }
  return conversation
}

// Static: get all conversations for a user with unread counts
conversationSchema.statics.getForUser = async function (userId) {
  return this.aggregate([
    { $match: { participants: new mongoose.Types.ObjectId(userId), isActive: true } },
    { $sort: { lastMessageAt: -1 } },
    {
      $lookup: {
        from: 'users',
        localField: 'participants',
        foreignField: '_id',
        as: 'participantData',
      },
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'lastMessage',
        foreignField: '_id',
        as: 'lastMessageData',
      },
    },
    { $unwind: { path: '$lastMessageData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'messages',
        let: { convId: '$_id', userId: new mongoose.Types.ObjectId(userId) },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$conversation', '$$convId'] },
                  { $ne: ['$sender', '$$userId'] },
                  { $not: [{ $in: ['$$userId', { $ifNull: ['$readBy', []] }] }] },
                  { $eq: ['$isDeleted', false] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'unreadData',
      },
    },
    {
      $addFields: {
        unreadCount: {
          $ifNull: [{ $arrayElemAt: ['$unreadData.count', 0] }, 0],
        },
        otherParticipant: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$participantData',
                as: 'p',
                cond: { $ne: ['$$p._id', new mongoose.Types.ObjectId(userId)] },
              },
            },
            0,
          ],
        },
        lastMessageText: '$lastMessageData.text',
        lastMessageTime: '$lastMessageAt',
        lastMessageSender: '$lastMessageData.sender',
      },
    },
    {
      $project: {
        _id: 1,
        otherParticipant: {
          _id: 1,
          name: 1,
          email: 1,
          userType: 1,
          isOnline: 1,
          lastSeen: 1,
        },
        lastMessage: {
          text: '$lastMessageText',
          time: '$lastMessageTime',
          sender: '$lastMessageSender',
        },
        unreadCount: 1,
        lastMessageAt: 1,
        updatedAt: 1,
      },
    },
  ])
}

module.exports = mongoose.model('Conversation', conversationSchema)
