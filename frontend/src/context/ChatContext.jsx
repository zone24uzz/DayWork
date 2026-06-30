import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SOCKET_URL = window.location.origin
const API_URL = import.meta.env.VITE_API_URL || '/api'

const ChatContext = createContext(null)

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [conversations, setConversations] = useState([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState({})
  const [typingUsers, setTypingUsers] = useState({})
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const reconnectAttempts = useRef(0)

  // Connect socket
  useEffect(() => {
    if (!user?.id) return

    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    newSocket.on('connect', () => {
      setConnected(true)
      newSocket.emit('authenticate', user.id)
      reconnectAttempts.current = 0
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
    })

    newSocket.on('connect_error', () => {
      reconnectAttempts.current++
    })

    // Handle new messages
    newSocket.on('new_message', (data) => {
      const { conversationId, message } = data

      // Add to messages if viewing this conversation
      setMessages((prev) => {
        if (prev[conversationId]) {
          const exists = prev[conversationId].some((m) => m.id === message.id)
          if (exists) return prev
          return { ...prev, [conversationId]: [...prev[conversationId], message] }
        }
        return prev
      })

      // Update conversations list
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: {
                text: message.text,
                time: message.time,
                isFromMe: message.isFromMe,
              },
              updatedAt: message.time,
            }
          }
          return c
        })
        return updated.sort((a, b) => new Date(b.updatedAt || b.updatedAt) - new Date(a.updatedAt || a.updatedAt))
      })

      // Update unread count if not viewing this conversation
      if (selectedConv?.id !== conversationId) {
        setTotalUnread((prev) => prev + 1)
      }
    })

    // Handle typing indicators
    newSocket.on('user_typing', (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.conversationId]: { ...prev[data.conversationId], [data.userId]: data.userName },
      }))
    })

    newSocket.on('user_stop_typing', (data) => {
      setTypingUsers((prev) => {
        const conv = { ...prev[data.conversationId] }
        delete conv[data.userId]
        return { ...prev, [data.conversationId]: conv }
      })
    })

    // Handle message edits
    newSocket.on('message_edited', (data) => {
      setMessages((prev) => {
        const msgs = prev[data.conversationId]
        if (!msgs) return prev
        return {
          ...prev,
          [data.conversationId]: msgs.map((m) =>
            m.id === data.messageId
              ? { ...m, text: data.text, editedAt: data.editedAt, isEdited: true }
              : m
          ),
        }
      })
    })

    // Handle message deletes
    newSocket.on('message_deleted', (data) => {
      setMessages((prev) => {
        const msgs = prev[data.conversationId]
        if (!msgs) return prev
        return {
          ...prev,
          [data.conversationId]: msgs.filter((m) => !data.deletedFor?.includes(m.sender) || m.id !== data.messageId)
        }
      })
    })

    // Handle pinned messages
    newSocket.on('message_pinned', (data) => {
      // We don't have a pinned state to update, but we can refetch
      // conversations to reflect the change
      fetchConversations()
    })

    // Handle reactions
    newSocket.on('message_reacted', (data) => {
      setMessages((prev) => {
        const msgs = prev[data.conversationId]
        if (!msgs) return prev
        return {
          ...prev,
          [data.conversationId]: msgs.map((m) =>
            m.id === data.messageId ? { ...m, reactions: data.reactions } : m
          ),
        }
      })
    })

    // Handle message status updates (delivered)
    newSocket.on('message_status_updated', (data) => {
      setMessages((prev) => {
        const msgs = prev[data.conversationId]
        if (!msgs) return prev
        return {
          ...prev,
          [data.conversationId]: msgs.map((m) =>
            m.id === data.messageId ? { ...m, status: data.status } : m
          ),
        }
      })
    })

    // Handle conversation list updates
    newSocket.on('conversation_updated', () => {
      fetchConversations()
    })

    // Handle messages read
    newSocket.on('messages_read', (data) => {
      const { conversationId, userId: readerId } = data
      setMessages((prev) => {
        const msgs = prev[conversationId]
        if (!msgs) return prev
        return {
          ...prev,
          [conversationId]: msgs.map((m) =>
            !m.isFromMe && m.status !== 'read'
              ? { ...m, status: 'read', readBy: [...(m.readBy || []), readerId] }
              : m
          ),
        }
      })
    })

    // Handle online status
    newSocket.on('users_online', (userIds) => {
      setOnlineUsers(userIds)
    })

    newSocket.on('user_offline', (data) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId))
    })

    return () => {
      newSocket.disconnect()
      setConnected(false)
    }
  }, [user?.id])

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.conversations) {
        setConversations(data.conversations)
        setTotalUnread(data.totalUnread || 0)
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId, page = 1) => {
    try {
      const res = await fetch(`${API_URL}/chat/messages/${conversationId}?page=${page}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.messages) {
        setMessages((prev) => ({
          ...prev,
          [conversationId]: page === 1
            ? data.messages
            : [...(prev[conversationId] || []), ...data.messages],
        }))
      }
      return data
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      return null
    }
  }, [token])

  // Send message
  const sendMessage = useCallback(async ({ receiverId, text, replyTo }) => {
    try {
      const res = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId, text, replyTo }),
      })
      return await res.json()
    } catch (err) {
      console.error('Failed to send message:', err)
      return null
    }
  }, [token])

  // Edit message
  const editMessage = useCallback(async (messageId, text) => {
    try {
      const res = await fetch(`${API_URL}/chat/message/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      })
      return await res.json()
    } catch (err) {
      console.error('Failed to edit message:', err)
      return null
    }
  }, [token])

  // Delete message
  const deleteMessage = useCallback(async (messageId, type = 'forEveryone') => {
    try {
      const res = await fetch(`${API_URL}/chat/message/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      })
      return await res.json()
    } catch (err) {
      console.error('Failed to delete message:', err)
      return null
    }
  }, [token])

  // Toggle reaction
  const toggleReaction = useCallback(async (messageId, emoji) => {
    try {
      const res = await fetch(`${API_URL}/chat/message/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId, emoji }),
      })
      return await res.json()
    } catch (err) {
      console.error('Failed to toggle reaction:', err)
      return null
    }
  }, [token])

  // Mark as read
  const markAsRead = useCallback(async (conversationId) => {
    try {
      await fetch(`${API_URL}/chat/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId }),
      })
      socketRef.current?.emit('mark_read', { conversationId })
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }, [token])

  // Select conversation
  const selectConversation = useCallback(async (conv) => {
    setSelectedConv(conv)
    if (conv?.id) {
      socketRef.current?.emit('join_conversation', conv.id)
      await fetchMessages(conv.id)
      await markAsRead(conv.id)
    }
  }, [fetchMessages, markAsRead])

  // Start conversation
  const startConversation = useCallback(async (receiverId) => {
    try {
      const res = await fetch(`${API_URL}/chat/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId }),
      })
      const data = await res.json()
      if (data.conversation) {
        const newConv = {
          id: data.conversation.id,
          contact: data.conversation.contact,
          lastMessage: null,
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
        }
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === newConv.id)
          if (exists) return prev
          return [newConv, ...prev]
        })
        return newConv
      }
      return null
    } catch (err) {
      console.error('Failed to start conversation:', err)
      return null
    }
  }, [token])

  // Search users
  const searchUsers = useCallback(async (query, type) => {
    try {
      const res = await fetch(`${API_URL}/chat/search/users?q=${query}&type=${type || ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      return data.users || []
    } catch (err) {
      console.error('Failed to search users:', err)
      return []
    }
  }, [token])

  // Search messages
  const searchMessages = useCallback(async (conversationId, query) => {
    try {
      const res = await fetch(`${API_URL}/chat/search/messages?conversationId=${conversationId}&q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      return data.messages || []
    } catch (err) {
      console.error('Failed to search messages:', err)
      return []
    }
  }, [token])

  return (
    <ChatContext.Provider value={{
      socket,
      connected,
      conversations,
      totalUnread,
      selectedConv,
      messages,
      typingUsers,
      onlineUsers,
      loading,
      fetchConversations,
      fetchMessages,
      sendMessage,
      editMessage,
      deleteMessage,
      toggleReaction,
      selectConversation,
      startConversation,
      searchUsers,
      searchMessages,
      markAsRead,
      setSelectedConv,
    }}>
      {children}
    </ChatContext.Provider>
  )
}
