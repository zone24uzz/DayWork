import { useState } from 'react'
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const sidebarItems = [
  {
    label: 'Boshqaruv paneli',
    to: '/employer',
    end: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Ishlar',
    to: '/employer/jobs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Xabarlar',
    to: '/employer/messages',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Hamyon',
    to: '/employer/wallet',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Tarix',
    to: '/employer/history',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Profil',
    to: '/employer/profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

const Sidebar = ({ isOpen, onClose, user, onLogout }) => (
  <>
    {/* Mobile overlay */}
    {isOpen && (
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        onClick={onClose}
      />
    )}
    <aside
      className={`fixed top-0 left-0 h-screen w-[260px] bg-white border-r border-gray-100 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link to="/home" className="flex items-center gap-2.5 no-underline">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="18" fill="#4F6EF7" />
            <path d="M10 26V10h6l4 8 4-8h6v16h-5V17l-3 5-3-5v9h-5z" fill="white" />
          </svg>
          <div>
            <span className="text-lg font-bold text-[#1a1a2e] block leading-tight">DayWork</span>
            <span className="text-[10px] text-gray-400">Ish beruvchi paneli</span>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1 no-underline ${
                isActive
                  ? 'bg-[#4f6ef7] text-white shadow-[0_2px_8px_rgba(79,110,247,0.3)]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a1a2e]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Create job button */}
      <div className="px-3 py-2">
        <Link to="/employer/post-job" onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_14px_rgba(79,110,247,0.35)] no-underline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ish e'lonini qo'shish
        </Link>
      </div>

      {/* Bottom items */}
      <div className="px-3 py-3 border-t border-gray-100">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#1a1a2e] transition-all duration-200 mb-1 no-underline"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Yordam markazi
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onLogout() }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200 mb-1 no-underline"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Chiqish
        </a>
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-sm font-semibold flex items-center justify-center shrink-0">
            {user?.avatar || (user?.name?.[0]?.toUpperCase() || 'U')}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">Kompaniya profili</p>
            <p className="text-[11px] text-gray-400 truncate">Korxona</p>
          </div>
        </div>
      </div>
    </aside>
  </>
)

const EmployerLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} onLogout={handleLogout} />

      {/* Main content */}
      <main className="lg:ml-[260px] min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent shrink-0"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-xl hidden sm:block">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Ishchilarni, ishlarni qidirish..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,110,247,0.1)] transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link to="/employer/profile" className="flex items-center gap-2 pl-2 sm:pl-4 sm:border-l border-gray-200 no-underline">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-sm font-semibold flex items-center justify-center shrink-0">
                {user?.avatar || (user?.name?.[0]?.toUpperCase() || 'U')}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">Profil</span>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default EmployerLayout
