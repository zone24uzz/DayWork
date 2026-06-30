import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'

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
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradientColors[Math.abs(hash) % gradientColors.length]
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Kecha'
  if (diffDays < 7) return date.toLocaleDateString('uz-UZ', { weekday: 'short' })
  return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })
}

const formatTimeFull = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  })
}

const ChatPage = ({ role = 'worker' }) => {
  const { user } = useAuth()
  const {
    socket,
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
    markAsRead,
    setSelectedConv,
  } = useChat()

  const [activeTab, setActiveTab] = useState(role === 'worker' ? 'employer' : 'worker')
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)

  // Load conversations
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConv?.id, messages[selectedConv?.id]?.length])

  // Search users
  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }
      const users = await searchUsers(searchQuery, activeTab)
      setSearchResults(users || [])
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, activeTab, searchUsers])

  // Handle typing indicator
  const handleTyping = useCallback((isTyping) => {
    if (!selectedConv?.id) return
    socket?.emit(isTyping ? 'typing' : 'stop_typing', {
      conversationId: selectedConv.id,
      userName: user?.name,
    })
  }, [selectedConv?.id, socket, user?.name])

  const handleMessageChange = (e) => {
    setMessageText(e.target.value)
    if (!typingTimeout) {
      handleTyping(true)
    }
    clearTimeout(typingTimeout)
    const timeout = setTimeout(() => {
      handleTyping(false)
      setTypingTimeout(null)
    }, 2000)
    setTypingTimeout(timeout)
  }

  // Send message
  const handleSend = async () => {
    if (!messageText.trim() || !selectedConv?.contact?.id) return

    if (editingMessage) {
      await editMessage(editingMessage.id, messageText)
      setEditingMessage(null)
      setMessageText('')
      return
    }

    const result = await sendMessage({
      receiverId: selectedConv.contact.id,
      text: messageText,
      replyTo: replyingTo?.id,
    })

    if (result) {
      socket?.emit('send_message', {
        receiverId: selectedConv.contact.id,
        text: messageText,
        replyTo: replyingTo?.id,
      })
      setMessageText('')
      setReplyingTo(null)
    }
  }

  // Load more messages (pagination)
  const loadMore = async () => {
    if (!selectedConv?.id || !hasMore || loadingMessages) return
    setLoadingMessages(true)
    const nextPage = page + 1
    const result = await fetchMessages(selectedConv.id, nextPage)
    if (result) {
      setHasMore(result.pagination?.hasMore || false)
      setPage(nextPage)
    }
    setLoadingMessages(false)
  }

  // Handle scroll to top for pagination
  const handleScroll = (e) => {
    if (e.target.scrollTop < 50 && hasMore && !loadingMessages) {
      loadMore()
    }
  }

  // Start conversation with user
  const handleStartConversation = async (userId) => {
    const conv = await startConversation(userId)
    if (conv) {
      setSelectedConv(conv)
      setSearchResults([])
      setSearchQuery('')
      setShowSearch(false)
    }
  }

  // Select conversation
  const handleSelectConversation = async (conv) => {
    setPage(1)
    setHasMore(true)
    setMessages({})
    await selectConversation(conv)
  }

  // Handle reaction
  const handleReaction = async (messageId, emoji) => {
    await toggleReaction(messageId, emoji)
  }

  // Handle edit
  const handleEdit = (msg) => {
    setEditingMessage(msg)
    setMessageText(msg.text)
    inputRef.current?.focus()
    setContextMenu(null)
  }

  // Handle delete
  const handleDelete = async (msgId, type = 'forEveryone') => {
    await deleteMessage(msgId, type)
    setContextMenu(null)
  }

  // Handle reply
  const handleReply = (msg) => {
    setReplyingTo(msg)
    setEditingMessage(null)
    inputRef.current?.focus()
    setContextMenu(null)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentMessages = selectedConv?.id ? (messages[selectedConv.id] || []) : []
  const typingInConv = selectedConv?.id ? typingUsers[selectedConv.id] || {} : {}
  const isTyping = Object.keys(typingInConv).length > 0

  return (
    <div className="flex gap-0 h-[calc(100vh-120px)] -m-8 bg-white rounded-2xl overflow-hidden border border-gray-100">
      {/* ═══ LEFT: Contact List ═══ */}
      <div className="w-[340px] min-w-[340px] border-r border-gray-100 flex flex-col bg-white">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Xabarlar</h2>
            <div className="flex items-center gap-2">
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-9 h-9 rounded-xl bg-[#4f6ef7] flex items-center justify-center text-white hover:bg-[#3b5de7] transition-colors cursor-pointer border-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>

          {/* User type tabs */}
          {showSearch && (
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-3">
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
            </div>
          )}
        </div>

        {/* Search Results */}
        {showSearch && searchResults.length > 0 && (
          <div className="border-b border-gray-100 max-h-48 overflow-y-auto">
            {searchResults.map((u) => (
              <button
                key={u.id}
                onClick={() => handleStartConversation(u.id)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-all cursor-pointer border-0 bg-transparent"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(u.name)} text-white text-sm font-semibold flex items-center justify-center shrink-0`}>
                  {u.avatar || u.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">
                    {u.userType === 'worker' ? 'Ishchi' : 'Ish beruvchi'}
                    {u.isOnline && <span className="text-green-500 ml-2">• Onlayn</span>}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSearch && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="py-8 text-center text-gray-400 text-sm border-b border-gray-100">
            Foydalanuvchi topilmadi
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-[#4f6ef7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-5">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm mt-2">Hali suhbat yo'q</p>
              <p className="text-xs mt-1 text-gray-300">
                {role === 'worker' ? "Ish beruvchilarga xabar yozing" : "Ishchilarga xabar yozing"}
              </p>
              <button
                onClick={() => setShowSearch(true)}
                className="mt-4 px-4 py-2 bg-[#4f6ef7] text-white text-sm font-medium rounded-xl hover:bg-[#3b5de7] transition-all cursor-pointer border-0"
              >
                Yangi suhbat
              </button>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-all cursor-pointer border-0 ${
                  selectedConv?.id === conv.id
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
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {conv.contact?.name || "Noma'lum"}
                      </span>
                      {conv.contact?.isOnline && (
                        <span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                      {formatTime(conv.lastMessage?.time || conv.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.lastMessage?.text || 'Suhbat boshlash...'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-[#4f6ef7] text-white text-[10px] font-bold rounded-full mt-1">
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ═══ RIGHT: Chat Area ═══ */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(selectedConv.contact?.name || 'U')} text-white text-sm font-semibold flex items-center justify-center`}>
                    {selectedConv.contact?.avatar || selectedConv.contact?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {selectedConv.contact?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedConv.contact?.name || "Noma'lum"}</h3>
                  <p className={`text-xs ${selectedConv.contact?.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                    {selectedConv.contact?.isOnline ? 'Onlayn' : 'Oflayn'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent"
                  title="Yangi suhbat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-1"
            >
              {/* Loading indicator */}
              {loadingMessages && (
                <div className="flex justify-center py-3">
                  <div className="w-5 h-5 border-2 border-[#4f6ef7] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Empty state */}
              {currentMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-sm mt-3">Xabar yozib boshlang</p>
                  <p className="text-xs mt-1 text-gray-300">
                    {selectedConv.contact?.name} ga birinchi xabarni yozing
                  </p>
                </div>
              )}

              {/* Messages */}
              {currentMessages.map((msg, idx) => {
                const prevMsg = idx > 0 ? currentMessages[idx - 1] : null
                const showAvatar = !msg.isFromMe && (!prevMsg || prevMsg.sender !== msg.sender)
                const isSameSender = prevMsg && prevMsg.sender === msg.sender
                const showTime = !isSameSender || (msg.time && prevMsg?.time && new Date(msg.time) - new Date(prevMsg.time) > 300000)

                return (
                  <div key={msg.id} className="group relative">
                    {showTime && (
                      <div className="flex justify-center my-3">
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {formatTimeFull(msg.time)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${msg.isFromMe ? 'justify-end' : 'justify-start'} mb-0.5`}>
                      {/* Avatar for others */}
                      {!msg.isFromMe && showAvatar && (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(msg.senderName || 'U')} text-white text-xs font-semibold flex items-center justify-center mr-2 mt-0.5 shrink-0`}>
                          {msg.senderName?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      {/* Spacer if no avatar */}
                      {!msg.isFromMe && !showAvatar && <div className="w-[40px] shrink-0" />}

                      {/* Message bubble */}
                      <div
                        className={`max-w-[75%] relative ${msg.isFromMe ? '' : ''}`}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          setContextMenu({ x: e.clientX, y: e.clientY, msg })
                        }}
                      >
                        {/* Reply preview */}
                        {msg.replyTo && (
                          <div className={`px-3 py-1.5 rounded-t-xl text-xs border-l-2 mb-1 ${
                            msg.isFromMe ? 'bg-[#3b5de7] border-white/30 text-white/80' : 'bg-gray-100 border-[#4f6ef7] text-gray-500'
                          }`}>
                            <p className="font-medium text-[11px]">{msg.replyTo.sender || 'Xabar'}</p>
                            <p className="truncate">{msg.replyTo.text}</p>
                          </div>
                        )}

                        {/* Forwarded badge */}
                        {msg.isForwarded && (
                          <div className={`px-3 pt-1.5 text-[10px] font-medium ${
                            msg.isFromMe ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            ⤴ Forwarded
                          </div>
                        )}

                        {/* Message content */}
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          msg.isFromMe
                            ? 'bg-[#4f6ef7] text-white rounded-tr-md'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-md'
                        }`}>
                          {msg.isDeleted ? (
                            <p className="text-xs italic opacity-60">Bu xabar o'chirildi</p>
                          ) : (
                            <>
                              {msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>}
                              {msg.attachments?.map((att, i) => (
                                <div key={i} className="mt-2">
                                  {att.type === 'image' ? (
                                    <img src={att.url} alt={att.name} className="max-w-full rounded-lg" loading="lazy" />
                                  ) : (
                                    <a href={att.url} target="_blank" rel="noopener noreferrer"
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                                        msg.isFromMe ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                      </svg>
                                      {att.name}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`flex flex-wrap gap-1 -mt-2 ${msg.isFromMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`inline-flex gap-0.5 px-2 py-0.5 rounded-full shadow-sm ${
                              msg.isFromMe ? 'bg-[#3b5de7]' : 'bg-white border border-gray-100'
                            }`}>
                              {groupReactions(msg.reactions).map((r, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleReaction(msg.id, r.emoji)}
                                  className={`text-sm hover:scale-110 transition-transform cursor-pointer border-0 bg-transparent ${
                                    r.isMe ? 'ring-1 ring-[#4f6ef7] rounded-full' : ''
                                  }`}
                                  title={r.users.join(', ')}
                                >
                                  {r.emoji} {r.count > 1 ? <span className="text-[10px] font-medium">{r.count}</span> : null}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Message status */}
                        <div className={`flex items-center gap-1 mt-0.5 ${msg.isFromMe ? 'justify-end' : 'justify-start'} px-1`}>
                          {msg.isEdited && <span className="text-[9px] text-gray-400">tahrirlangan</span>}
                          <span className={`text-[10px] ${msg.isFromMe ? 'text-gray-400' : 'text-gray-400'}`}>
                            {formatTime(msg.time)}
                          </span>
                          {msg.isFromMe && (
                            <span className="text-[10px]">
                              {msg.status === 'sending' && <span className="text-gray-400">◷</span>}
                              {msg.status === 'sent' && <span className="text-gray-400">✓</span>}
                              {msg.status === 'delivered' && <span className="text-gray-500">✓✓</span>}
                              {msg.status === 'read' && <span className="text-[#4f6ef7]">✓✓</span>}
                            </span>
                          )}
                        </div>

                        {/* Quick reaction buttons (on hover) */}
                        <div className={`absolute top-0 ${msg.isFromMe ? 'left-0 -translate-x-full pl-1' : 'right-0 translate-x-full pr-1'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5`}>
                          {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-sm hover:scale-110 transition-transform cursor-pointer border-0 hover:bg-gray-50"
                              title={`React ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mb-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400">
                      {Object.values(typingInConv).join(', ')} yozmoqda...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Context Menu */}
            {contextMenu && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} />
                <div
                  className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-1 min-w-[180px]"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                  <button onClick={() => handleReply(contextMenu.msg)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-0 bg-transparent">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    Javob berish
                  </button>
                  {contextMenu.msg.isFromMe && !contextMenu.msg.isDeleted && (
                    <>
                      <button onClick={() => handleEdit(contextMenu.msg)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-0 bg-transparent">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Tahrirlash
                      </button>
                      <button onClick={() => handleDelete(contextMenu.msg.id, 'forEveryone')}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-0 bg-transparent">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        O'chirish
                      </button>
                    </>
                  )}
                  {!contextMenu.msg.isFromMe && (
                    <button onClick={() => handleDelete(contextMenu.msg.id, 'forMe')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-0 bg-transparent">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /></svg>
                      Men uchun o'chirish
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Message Input */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 shrink-0">
              {/* Reply preview */}
              {replyingTo && (
                <div className="flex items-center gap-2 px-4 py-2 mb-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-1 h-8 bg-[#4f6ef7] rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#4f6ef7]">
                      {replyingTo.senderName || 'Xabar'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{replyingTo.text}</p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent p-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Editing indicator */}
              {editingMessage && (
                <div className="flex items-center gap-2 px-4 py-2 mb-3 bg-amber-50 rounded-xl border border-amber-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span className="text-xs text-amber-700 font-medium flex-1">Xabarni tahrirlash</span>
                  <button
                    onClick={() => { setEditingMessage(null); setMessageText('') }}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent p-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Emoji button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer border-0 bg-transparent shrink-0"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </button>

                {/* Emoji quick picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-6 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-40">
                    <div className="grid grid-cols-8 gap-1">
                      {['😊', '😂', '❤️', '👍', '🎉', '😢', '😮', '🔥', '💯', '✅', '⭐', '🙏', '💪', '🤝', '👋', '📸'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setMessageText((prev) => prev + emoji)
                            setShowEmojiPicker(false)
                            inputRef.current?.focus()
                          }}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Xabar yozish..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors cursor-pointer border-0 shrink-0 ${
                    messageText.trim()
                      ? 'bg-[#4f6ef7] hover:bg-[#3b5de7]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {editingMessage ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // No conversation selected
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-lg mt-4 font-medium text-gray-500">Suhbatni tanlang</p>
            <p className="text-sm mt-1 text-gray-300">
              Mavjud suhbatni tanlang yoki yangi suhbat boshlang
            </p>
            <button
              onClick={() => setShowSearch(true)}
              className="mt-6 px-5 py-2.5 bg-[#4f6ef7] text-white text-sm font-medium rounded-xl hover:bg-[#3b5de7] transition-all cursor-pointer border-0"
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Yangi suhbat
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper: group reactions by emoji
function groupReactions(reactions) {
  const grouped = {}
  reactions.forEach((r) => {
    if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, users: [], count: 0 }
    grouped[r.emoji].users.push(r.userName || 'Unknown')
    grouped[r.emoji].count++
  })
  return Object.values(grouped)
}

export default ChatPage
