import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const ProfilePage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({
    newJobs: true,
    messages: true,
    payments: false,
  })

  const userName = user?.name || 'Foydalanuvchi'
  const userSurname = user?.surname || ''
  const userAge = user?.age || ''
  const userGender = user?.gender || 'Erkak'
  const userPassport = user?.passport || 'AA 1234567'
  const userJshshir = user?.jshshir || '31201940123456'

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Mening Profiligim</h1>
        <p className="text-sm text-gray-500 mt-1">
          Shaxsiy ma'lumotlaringizni boshqarving va xavfsizlik sozlamalarini yangilang
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal & Passport Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shaxsiy Ma'lumotlar */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#1a1a2e]">Shaxsiy Ma'lumotlar</h2>
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#4f6ef7] bg-[#4f6ef7]/5 hover:bg-[#4f6ef7]/10 rounded-xl transition-colors cursor-pointer border-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Tahrirlash
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {userName[0]?.toUpperCase() || 'U'}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#4f6ef7] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#3b5de7] transition-colors cursor-pointer border-2 border-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
              </div>

              {/* Info Grid */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Ism</label>
                  <p className="text-sm font-medium text-[#1a1a2e]">{userName}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Familiya</label>
                  <p className="text-sm font-medium text-[#1a1a2e]">{userSurname || "Raxmonov"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Yosh</label>
                  <p className="text-sm font-medium text-[#1a1a2e]">{userAge || "28"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Jins</label>
                  <p className="text-sm font-medium text-[#1a1a2e]">{userGender}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pasport Ma'lumotlari */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-6">Pasport Ma'lumotlari</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Seriya va Raqam</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#1a1a2e]">{userPassport}</p>
                  <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">JSHSHIR</label>
                <p className="text-sm font-medium text-[#1a1a2e]">{userJshshir}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Security & Notifications */}
        <div className="space-y-6">
          {/* Xavfsizlik */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-6">Xavfsizlik</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Joriy Parol</label>
                <div className="relative">
                  <input
                    type="password"
                    value="••••••••"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none"
                  />
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white text-sm font-medium rounded-xl transition-colors cursor-pointer border-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Parolni O'zgartirish
              </button>
            </div>
          </div>

          {/* Bildirishnomalar */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-6">Bildirishnomalar</h2>
            <div className="space-y-4">
              {/* Yangi Ishlar */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">Yangi Ishlar</p>
                  <p className="text-xs text-gray-400 mt-0.5">Yangi ish e'lonlari haqida xabarlar</p>
                </div>
                <button
                  onClick={() => toggleNotification('newJobs')}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer border-0 ${
                    notifications.newJobs ? 'bg-[#4f6ef7]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      notifications.newJobs ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Xabarlar */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">Xabarlar</p>
                  <p className="text-xs text-gray-400 mt-0.5">Ish beruvchilardan xabarlar</p>
                </div>
                <button
                  onClick={() => toggleNotification('messages')}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer border-0 ${
                    notifications.messages ? 'bg-[#4f6ef7]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      notifications.messages ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* To'lovlar */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">To'lovlar</p>
                  <p className="text-xs text-gray-400 mt-0.5">Muvaffaqiyatli to'lovlar</p>
                </div>
                <button
                  onClick={() => toggleNotification('payments')}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer border-0 ${
                    notifications.payments ? 'bg-[#4f6ef7]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      notifications.payments ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
