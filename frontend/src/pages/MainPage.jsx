import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Stats data ───────────────────────────────────────
const stats = [
  { value: '25K+', label: 'Faol ishchilar' },
  { value: '10K+', label: 'Bajarilgan ishlar' },
  { value: '99%', label: 'Muvaffaqiyatli kelishuvlar' },
]

// ─── Steps data ───────────────────────────────────────
const steps = [
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "1. Ro'yxatdan o'ting",
    desc: "O'rganishni boshlash uchun tezda ro'yxatdan o'ting va profilingizni to'ldiring",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "2. Ish yoki ishchi toping",
    desc: "Kerakli ko'nikmalarga ega ishchilar yoki mos ishni qidirib toping",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "3. Kelishing va ishlang",
    desc: "Shartlarda kelishib, ishni boshlang yoki xizmatlaringizni taklif qiling",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const MainPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.title = 'DayWork — Bosh sahifa'
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16 sm:h-[72px]">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 no-underline">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="18" fill="#4F6EF7" />
              <path d="M10 26V10h6l4 8 4-8h6v16h-5V17l-3 5-3-5v9h-5z" fill="white" />
            </svg>
            <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-[#1a1a2e]' : 'text-white'
            }`}>
              DayWork
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Bosh sahifa', 'Ishlar', 'Ish beruvchilar', 'Aloqa'].map((item) => (
              <a
                key={item}
                href="#"
                className={`text-sm font-medium transition-colors duration-200 ${
                  scrolled ? 'text-gray-600 hover:text-[#4f6ef7]' : 'text-white/80 hover:text-white'
                }`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* User menu */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-sm font-semibold flex items-center justify-center shadow-[0_2px_8px_rgba(79,110,247,0.3)] hover:shadow-[0_4px_14px_rgba(79,110,247,0.5)] transition-all duration-200 cursor-pointer border-0"
            >
              {user?.avatar || (user?.name?.[0]?.toUpperCase() || 'U')}
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg"
            >
              <div className="px-5 py-4 flex flex-col gap-2">
                {['Bosh sahifa', 'Ishlar', 'Ish beruvchilar', 'Aloqa'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm font-medium text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-50 hover:text-[#4f6ef7] transition-colors"
                  >
                    {item}
                  </a>
                ))}
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/profile') }}
                  className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-2 w-full hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer border-0 bg-transparent"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-xs font-semibold flex items-center justify-center">
                    {user?.avatar || (user?.name?.[0]?.toUpperCase() || 'U')}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name || 'Foydalanuvchi'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 w-full pt-24 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Hero text */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a1a2e] leading-[1.1] mb-5"
                variants={itemVariants}
              >
                O'zbekistonida munosib{' '}
                <span className="text-[#4f6ef7]">ish va ishchini</span>{' '}
                tezda toping
              </motion.h1>
              <motion.p
                className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
                variants={itemVariants}
              >
                DayWork — ishchilar va ish beruvchilarni birlashtiruvchi zamonaviy platforma.
                Bir marta boshqarish oson interfeysga kiriting.
              </motion.p>

              {/* Search bar */}
              <motion.div
                className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto lg:mx-0"
                variants={itemVariants}
              >
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Ish turi, joyi yoki ish beruvchi nomi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-0 bg-white text-gray-800 text-sm outline-none shadow-[0_4px_14px_rgba(0,0,0,0.1)] focus:shadow-[0_4px_20px_rgba(79,110,247,0.25)] transition-shadow placeholder:text-gray-400"
                  />
                </div>
                <button className="px-7 py-3.5 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_14px_rgba(79,110,247,0.4)] active:translate-y-[1px] whitespace-nowrap cursor-pointer border-0">
                  Qidirish
                </button>
              </motion.div>
            </motion.div>

            {/* Hero image / illustration */}
            <motion.div
              className="flex-1 w-full max-w-lg lg:max-w-none"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="relative">
                {/* Main card */}
                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.1)]">
                    <div className="w-full h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                    {/* Office meeting illustration */}
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                        <rect x="50" y="150" width="300" height="180" rx="12" fill="#e5e7eb" />
                        <circle cx="120" cy="120" r="40" fill="#d1d5db" />
                        <circle cx="200" cy="100" r="50" fill="#d1d5db" />
                        <circle cx="280" cy="120" r="40" fill="#d1d5db" />
                        <rect x="80" y="200" width="60" height="80" rx="8" fill="#c0c0c0" />
                        <rect x="170" y="180" width="60" height="100" rx="8" fill="#c0c0c0" />
                        <rect x="260" y="200" width="60" height="80" rx="8" fill="#c0c0c0" />
                      </svg>
                    </div>
                    <div className="relative z-10 text-center">
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <p className="text-gray-400 text-sm mt-2">Ishchilar bilan uchrashuv</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hidden sm:block">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Ishonchli xodimlar</p>
                      <p className="text-[10px] text-gray-400">100% ishonchli xizmat</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={`text-center ${i < stats.length - 1 ? 'sm:border-r border-gray-100' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <p className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#667eea] to-[#764ba2]">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1.5">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-3">
              Qanday ishlaysdi?
            </h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Oddiy qadamlarda o'z ishingizni yoki xizmatchingizni toping
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(79,110,247,0.1)] transition-shadow duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#4f6ef7]/5 flex items-center justify-center text-[#4f6ef7] mb-5 group-hover:bg-[#4f6ef7] group-hover:text-white transition-all duration-300">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-[#1a1a2e] text-white">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                  <rect width="36" height="36" rx="18" fill="#4F6EF7" />
                  <path d="M10 26V10h6l4 8 4-8h6v16h-5V17l-3 5-3-5v9h-5z" fill="white" />
                </svg>
                <span className="text-lg font-bold">DayWork</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Ish topish va ishchini topish uchun zamonaviy platforma.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: 'Platforma',
                links: ['Ishlar', 'Xizmatlar', 'Blog', 'Aloqa'],
              },
              {
                title: 'Kompaniya',
                links: ['Biz haqimizda', 'Jamoa', 'Missiya', 'Press'],
              },
              {
                title: 'Xizmat',
                links: ['Yordam', 'FAQ', 'Maxfiylik siyosati', 'Foydalanish shartlari'],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-white mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © 2026 DayWork. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex items-center gap-4">
              {['Facebook', 'Instagram', 'Telegram', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs text-gray-500 hover:text-white transition-colors duration-200"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainPage
