import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const tabs = [
  { id: 'about', label: 'Profil' },
  { id: 'stats', label: 'Statistika' },
  { id: 'activity', label: 'Faoliyat' },
]

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('about')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userName = user?.name || 'Foydalanuvchi'
  const userEmail = user?.email || 'email@example.com'
  const userPhone = user?.phone || '+998 __ ___ __ __'
  const userInitial = userName[0]?.toUpperCase() || 'U'
  const userType = user?.userType === 'employer' ? 'Ish beruvchi' : 'Ishchi'
  const memberSince = user?.createdAt || '2026'

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="relative bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#1a1a2e] overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-6 pb-28 sm:pb-36">
          {/* Back button */}
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors mb-6 bg-transparent border-none cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Orqaga
          </button>

          {/* Profile info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-[0_8px_30px_rgba(0,0,0,0.2)] ring-4 ring-white/20">
                {userInitial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-[3px] border-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </motion.div>

            <motion.div
              className="text-center sm:text-left flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{userName}</h1>
              <p className="text-white/70 text-sm mt-1">{userType} • {memberSince} dan beri</p>
              <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {userEmail}
                </span>
                {userPhone && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {userPhone}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Edit / Logout buttons */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <button className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer border-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Tahrirlash
              </button>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="px-4 py-2 bg-white/10 hover:bg-red-500/20 backdrop-blur-sm text-white/70 hover:text-red-300 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer border-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Chiqish
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <main className="max-w-6xl mx-auto px-5 -mt-16 sm:-mt-24 relative z-20 pb-16">
        {/* Quick stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { label: 'Bajarilgan ishlar', value: '18', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Jarayondagi', value: '3', color: 'text-blue-600', bg: 'bg-blue-50', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Takliflar', value: '9', color: 'text-purple-600', bg: 'bg-purple-50', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Reyting', value: '4.9', color: 'text-amber-600', bg: 'bg-amber-50', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-2xl p-5 flex items-center gap-4`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color.replace('text-', 'bg-').replace('600', '100')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={stat.color}>
                  <path d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex gap-1 bg-white rounded-xl p-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-center text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] shadow-[0_2px_8px_rgba(79,110,247,0.25)]'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {activeTab === 'about' && (
            <div className="space-y-5">
              {/* Personal info card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Shaxsiy ma'lumotlar
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: 'To\'liq ism', value: userName, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                    { label: 'Email', value: userEmail, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                    { label: 'Telefon', value: userPhone, icon: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z' },
                    { label: 'Rol', value: userType, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                  ].map((info) => (
                    <div key={info.label} className="flex items-center gap-3.5 p-4 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d={info.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{info.label}</p>
                        <p className="text-sm font-medium text-gray-800 mt-0.5">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills / Badges */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15l-2 5 2 1 2-5z" />
                    <path d="M12 15l-2-5 2-1 2 5z" />
                    <path d="M12 9V3" />
                  </svg>
                  Ko'nikmalar va nishonlar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Yuk tashish', 'Qurilish', 'Tozalash', 'Ombor ishlari', 'Yuk ortish', 'Ko\'kalamzorlashtirish', 'Mijozlar bilan muloqot', 'Jamoaviy ish'].map((skill) => (
                    <span
                      key={skill}
                      className="px-3.5 py-1.5 bg-[#4f6ef7]/5 text-[#4f6ef7] text-xs font-medium rounded-lg hover:bg-[#4f6ef7]/10 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { label: 'Ishonchli', color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Tezkor', color: 'bg-blue-50 text-blue-600' },
                    { label: 'Professional', color: 'bg-purple-50 text-purple-600' },
                    { label: 'Mas\'uliyatli', color: 'bg-amber-50 text-amber-600' },
                  ].map((badge) => (
                    <span
                      key={badge.label}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${badge.color}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <h3 className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Ish statistikasi
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Bajarilgan ishlar', value: 18, max: 20, color: 'bg-emerald-500' },
                  { label: 'Muddatida topshirilgan', value: 95, max: 100, color: 'bg-blue-500', suffix: '%' },
                  { label: 'Ijobiy baholar', value: 92, max: 100, color: 'bg-purple-500', suffix: '%' },
                  { label: 'Qayta kelgan mijozlar', value: 75, max: 100, color: 'bg-amber-500', suffix: '%' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-600">{stat.label}</span>
                      <span className="text-sm font-semibold text-gray-800">{stat.value}{stat.suffix || ''}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${stat.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <h3 className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                  So'nggi faoliyat
              </h3>
              <div className="space-y-4">
                {[
                  { action: 'Yuk tashish ishi bajarildi', company: 'Azimut Logistika', time: '2 soat oldin', status: 'completed' },
                  { action: 'Qurilish ishiga taklif yuborildi', company: 'Qurilish Servis', time: '5 soat oldin', status: 'pending' },
                  { action: 'Profil yangilandi', company: '', time: '1 kun oldin', status: 'info' },
                  { action: 'Farrosh ishi bajarildi', company: 'Toza Hudud', time: '2 kun oldin', status: 'completed' },
                  { action: 'Omborchi ishiga ariza berildi', company: 'Express Yetkazish', time: '3 kun oldin', status: 'pending' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-b-0">
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activity.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : activity.status === 'pending'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-50 text-gray-500'
                    }`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {activity.status === 'completed'
                          ? <polyline points="20 6 9 17 4 12" />
                          : activity.status === 'pending'
                          ? <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
                          : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>
                        }
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                      {activity.company && (
                        <p className="text-xs text-gray-400 mt-0.5">{activity.company}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* ═══════════════ LOGOUT CONFIRM MODAL ═══════════════ */}
      {showLogoutConfirm && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Chiqish</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Haqiqatan ham akkountingizdan chiqmoqchimisiz?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer border-0"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-all duration-200 cursor-pointer border-0"
              >
                Chiqish
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default ProfilePage
