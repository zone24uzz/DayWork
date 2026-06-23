import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

const gradientColors = [
  'from-yellow-400 to-orange-500',
  'from-blue-400 to-blue-600',
  'from-pink-400 to-rose-500',
  'from-gray-400 to-gray-600',
  'from-emerald-400 to-emerald-600',
  'from-purple-400 to-purple-600',
  'from-red-400 to-red-600',
  'from-cyan-400 to-cyan-600',
]

const getGradient = (name) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradientColors[Math.abs(hash) % gradientColors.length]
}

const WorkerMessagesPage = () => {
  const { user, apiCall } = useAuth()
  const [activeTab, setActiveTab] = useState('employer')
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const messagesEndRef = useRef(null)
  const [typingUsers, setTypingUsers] = useState([])

  // Connect socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    if (user?.id) {
      newSocket.emit('user_online', user.id)
    }

    newSocket.on('new_message', (data) => {
      if (selectedConversation?.id === data.conversationId) {
        setMessages((prev) => [...prev, data.message])
      }
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === data.conversationId) {
            return {
              ...conv,
              lastMessage: {
                text: data.message.text,
                time: data.message.time,
                isFromMe: data.message.isFromMe,
              },
            }
          }
          return conv
        })
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      })
    })

    newSocket.on('users_online', (onlineUsers) => {
      setConversations((prev) =>
        prev.map((conv) => ({
          ...conv,
          contact: {
            ...conv.contact,
            isOnline: onlineUsers.includes(conv.contact?.id),
          },
        }))
      )
    })

    return () => newSocket.disconnect()
  }, [user?.id, selectedConversation?.id])

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await apiCall('/messages/conversations')
        setConversations(data.conversations || [])
      } catch (err) {
        console.error('Failed to fetch conversations:', err)
      }
    }
    fetchConversations()
  }, [])

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConversation?.id) return

    const fetchMessages = async () => {
      try {
        const data = await apiCall(`/messages/${selectedConversation.id}`)
        setMessages(data.messages || [])
        socket?.emit('join_conversation', selectedConversation.id)
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      }
    }
    fetchMessages()

    return () => {
      if (selectedConversation?.id) {
        socket?.emit('leave_conversation', selectedConversation.id)
      }
    }
  }, [selectedConversation?.id])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([])
        return
      }
      try {
        const data = await apiCall(`/auth/search?q=${searchQuery}&type=${activeTab}`)
        setUsers(data.users || [])
      } catch (err) {
        console.error('Search failed:', err)
      }
    }
    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, activeTab])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation?.id) return

    try {
      const data = await apiCall('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: selectedConversation.contact.id,
          text: messageText,
        }),
      })

      setMessages((prev) => [...prev, data.message])
      setMessageText('')

      socket?.emit('send_message', {
        conversationId: selectedConversation.id,
        message: data.message,
      })
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleStartConversation = async (userId) => {
    try {
      const data = await apiCall('/messages/conversation', {
        method: 'POST',
        body: JSON.stringify({ receiverId: userId }),
      })

      const newConv = {
        id: data.conversation.id,
        contact: data.conversation.contact,
        lastMessage: null,
        updatedAt: new Date().toISOString(),
      }

      setConversations((prev) => {
        const exists = prev.find((c) => c.id === newConv.id)
        if (exists) return prev
        return [newConv, ...prev]
      })

      setSelectedConversation(newConv)
      setUsers([])
      setSearchQuery('')
    } catch (err) {
      console.error('Failed to start conversation:', err)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (time) => {
    if (!time) return ''
    const date = new Date(time)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Kecha'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('uz-UZ', { weekday: 'short' })
    }
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-120px)] -m-8 bg-white rounded-2xl overflow-hidden border border-gray-100">
      {/* ═══ LEFT: Contact List ═══ */}
      <div className="w-[340px] border-r border-gray-100 flex flex-col bg-white">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Xabarlar</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-3">
            <button
              onClick={() => setActiveTab('employer')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 ${
                activeTab === 'employer'
                  ? 'bg-white text-[#4f6ef7] shadow-sm'
                  : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ish beruvchilar
            </button>
            <button
              onClick={() => setActiveTab('worker')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 ${
                activeTab === 'worker'
                  ? 'bg-white text-[#4f6ef7] shadow-sm'
                  : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ishchilar
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Ism yoki kasb orqali izlash"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Search Results */}
        {users.length > 0 && (
          <div className="border-b border-gray-100 max-h-48 overflow-y-auto">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleStartConversation(u.id)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-all cursor-pointer border-0 bg-transparent"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(u.name)} text-white text-sm font-semibold flex items-center justify-center shrink-0`}>
                  {u.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.userType === 'employer' ? 'Ish beruvchi' : 'Ishchi'}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm mt-2">Hali suhbat yo'q</p>
              <p className="text-xs mt-1 text-gray-300">Ish beruvchilarga xabar yozib boshlang</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-all cursor-pointer border-0 ${
                  selectedConversation?.id === conv.id
                    ? 'bg-[#4f6ef7]/5 border-l-3 border-l-[#4f6ef7]'
                    : 'bg-transparent hover:bg-gray-50 border-l-3 border-l-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getGradient(conv.contact?.name || 'U')} text-white text-sm font-semibold flex items-center justify-center`}>
                    {conv.contact?.avatar || conv.contact?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {conv.contact?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{conv.contact?.name || "Noma'lum"}</span>
                    <span className="text-[11px] text-gray-400 shrink-0">{formatTime(conv.lastMessage?.time || conv.updatedAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage?.text || 'Suhbat boshlash...'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ═══ RIGHT: Chat Area ═══ */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(selectedConversation.contact?.name || 'U')} text-white text-sm font-semibold flex items-center justify-center`}>
                    {selectedConversation.contact?.avatar || selectedConversation.contact?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {selectedConversation.contact?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedConversation.contact?.name || "Noma'lum"}</h3>
                  <p className="text-xs text-green-500">{selectedConversation.contact?.isOnline ? 'Onlayn' : 'Oflayn'}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p className="text-sm">Xabar yozib boshlang</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromMe ? 'justify-end' : 'justify-start'}`}>
                  {!msg.isFromMe && (
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(msg.senderName || 'U')} text-white text-xs font-semibold flex items-center justify-center mr-2 mt-1 shrink-0`}>
                      {msg.senderName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className={`max-w-[70%] ${msg.isFromMe ? 'order-first' : ''}`}>
                    {msg.location ? (
                      <div className={`px-4 py-3 rounded-2xl ${msg.isFromMe ? 'bg-[#4f6ef7] text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>
                        <p className="text-sm mb-2">{msg.text}</p>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${msg.isFromMe ? 'bg-white/20' : 'bg-gray-50'}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={msg.isFromMe ? 'text-white' : 'text-[#4f6ef7]'}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="text-xs font-medium">{msg.location}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`px-4 py-2.5 rounded-2xl ${
                        msg.isFromMe
                          ? 'bg-[#4f6ef7] text-white'
                          : 'bg-white text-gray-800 border border-gray-100'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    )}
                    <div className={`flex items-center gap-1 mt-1 ${msg.isFromMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                      {msg.isFromMe && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Xabar yozish..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors cursor-pointer border-0 ${
                    messageText.trim()
                      ? 'bg-[#4f6ef7] hover:bg-[#3b5de7]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-lg mt-4">Suhbatni tanlang</p>
            <p className="text-sm mt-1">Mavjud suhbatni tanlang yoki yangisini boshlang</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkerMessagesPage
