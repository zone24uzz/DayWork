import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Stats data ───────────────────────────────────────
const stats = [
  { value: '8,500+', label: 'Kunlik ishlar' },
  { value: '32,000+', label: 'Ishchilar' },
  { value: '4,200+', label: 'Ish beruvchilar' },
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
    title: 'Ro\'yxatdan o\'ting',
    desc: 'Tezda profilingizni yarating va ish qidirishni boshlang',
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: 'Ish toping',
    desc: 'O\'zingizga yaqin va mos kunlik ishni toping',
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Ish boshlang',
    desc: 'Ish beruvchi bilan kelishib, darhol ishga kirishing',
  },
]

// ─── Featured jobs ─────────────────────────────────────
const featuredJobs = [
  {
    company: 'Azimut Logistika',
    logo: 'A',
    position: 'Yuk tashuvchi kurer',
    location: 'Toshkent, Chilonzor',
    type: 'Kunlik',
    salary: '300-500 ming so\'m/kun',
    color: 'from-blue-500 to-blue-600',
  },
  {
    company: 'Qurilish Servis',
    logo: 'Q',
    position: 'Qurilish ishchisi',
    location: 'Toshkent, Sergeli',
    type: 'Kunlik',
    salary: '400-600 ming so\'m/kun',
    color: 'from-orange-500 to-orange-600',
  },
  {
    company: 'Toza Hudud',
    logo: 'T',
    position: 'Farrosh / Tozalash xodimi',
    location: 'Toshkent, Mirzo Ulug\'bek',
    type: 'Kunlik',
    salary: '200-350 ming so\'m/kun',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    company: 'Express Yetkazish',
    logo: 'E',
    position: 'Omborchi / Saralovchi',
    location: 'Toshkent, Yunusobod',
    type: 'Kunlik',
    salary: '250-400 ming so\'m/kun',
    color: 'from-purple-500 to-purple-600',
  },
  {
    company: 'Bog\'dorchilik',
    logo: 'B',
    position: 'Ko\'kalamzorlashtirish ishchisi',
    location: 'Toshkent, Olmazor',
    type: 'Mavsumiy',
    salary: '300-450 ming so\'m/kun',
    color: 'from-rose-500 to-rose-600',
  },
  {
    company: 'Yuk Mash Servis',
    logo: 'Y',
    position: 'Yuk ortish/tushirish ishchisi',
    location: 'Toshkent, Bektemir',
    type: 'Kunlik',
    salary: '350-500 ming so\'m/kun',
    color: 'from-cyan-500 to-cyan-600',
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
              <rect width="36" height="36" rx="8" fill="#4F6EF7" />
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
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#1a1a2e] overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02] blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-5 w-full pt-24 pb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Hero text */}
            <motion.div className="flex-1 text-center lg:text-left" variants={itemVariants}>
              <motion.span
                className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-semibold mb-5 tracking-wide"
                variants={itemVariants}
              >
                #1 O'zbekistondagi kunlik ish platformasi
              </motion.span>
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5"
                variants={itemVariants}
              >
                Kunlik{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f9d976] to-[#f39f86]">
                  ish topish
                </span>{' '}
                endi oson
              </motion.h1>
              <motion.p
                className="text-base sm:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
                variants={itemVariants}
              >
                DayWork — mardikorlar va ish beruvchilarni birlashtiruvchi zamonaviy platforma.
                Yuk tashish, qurilish, tozalash va boshqa kunlik ishlarni topish juda oson.
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

              {/* Trust indicators */}
              <motion.div
                className="flex items-center gap-6 mt-8 justify-center lg:justify-start"
                variants={itemVariants}
              >
                <div className="flex -space-x-2">
                  {['#4f6ef7', '#667eea', '#764ba2', '#f39f86'].map((color, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white`}
                      style={{ backgroundColor: color }}
                    >
                      {['B', 'E', 'K', 'J'][i]}
                    </div>
                  ))}
                </div>
                <span className="text-white/60 text-sm">
                  <strong className="text-white font-semibold">32,000+</strong> ishchilar ro'yxatdan o'tgan
                </span>
              </motion.div>
            </motion.div>

            {/* Hero image / illustration */}
            <motion.div className="flex-1 w-full max-w-lg lg:max-w-none" variants={itemVariants}>
              <div className="relative">
                {/* Main card */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_20px_80px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold text-sm">
                        D
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">DayWork</p>
                        <p className="text-xs text-gray-400">Kunlik ishlar</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                      Aktiv
                    </span>
                  </div>

                  {/* Mini stat cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Bajarilgan', value: '18', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Jarayonda', value: '3', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Takliflar', value: '9', color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((s) => (
                      <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent activity */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mening ishlarim</p>
                    {[
                      { title: 'Yuk tashish', company: 'Azimut Logistika', status: 'Yangi' },
                      { title: 'Qurilish yordamchi', company: 'Qurilish Servis', status: 'Bajarilgan' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.company}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                          item.status === 'Yangi'
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-gray-500 bg-gray-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
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
                      <p className="text-sm font-bold text-gray-800">24/7</p>
                      <p className="text-[10px] text-gray-400">Qo'llab-quvvatlash</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="relative -mt-16 z-20 max-w-6xl mx-auto px-5">
        <motion.div
          className="bg-white rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.08)] p-8 sm:p-10 grid grid-cols-1 sm:grid-cols-3 gap-8"
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
            <span className="inline-block px-4 py-1 rounded-full bg-[#4f6ef7]/10 text-[#4f6ef7] text-xs font-semibold mb-3">
              QANDAY ISHLAYDI
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-3">
              Kunlik ish topish — 3 oddiy qadam
            </h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              DayWork platformasida ish topish juda oson va tez
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
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-sm font-bold flex items-center justify-center shadow-[0_2px_8px_rgba(79,110,247,0.3)]">
                  {i + 1}
                </div>

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

      {/* ═══════════════ FEATURED JOBS ═══════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold mb-3">
              SO'NGI ISHLAR
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-3">
              Bugungi kunlik ishlar
            </h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Eng so'nggi kunlik ish o'rinlari — bugunoq boshlang
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredJobs.map((job, i) => (
              <motion.div
                key={job.position}
                className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#4f6ef7]/20 hover:shadow-[0_8px_30px_rgba(79,110,247,0.08)] transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <div className="flex items-start gap-3.5 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {job.logo}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{job.position}</p>
                    <p className="text-xs text-gray-400">{job.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 font-medium">
                    {job.type}
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 font-medium">
                    {job.location}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-sm font-bold text-[#4f6ef7]">{job.salary}</span>
                  <button className="text-xs font-semibold text-[#4f6ef7] bg-[#4f6ef7]/5 px-3.5 py-1.5 rounded-lg hover:bg-[#4f6ef7] hover:text-white transition-all duration-200 cursor-pointer border-0">
                    Batafsil
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-[#667eea] to-[#764ba2] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-white/5 blur-3xl" />
        </div>
        <motion.div
          className="relative z-10 max-w-3xl mx-auto px-5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Bugunoq ish topishni boshlang
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-lg mx-auto mb-8">
            Kunlik ishlar, ishonchli ish beruvchilar va qulay interfeys — barchasi DayWork da
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="px-8 py-3.5 bg-white text-[#4f6ef7] rounded-xl font-semibold text-sm hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all duration-200 active:translate-y-[1px] cursor-pointer border-0">
              Bepul ro'yxatdan o'tish
            </button>
            <button className="px-8 py-3.5 bg-white/15 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-all duration-200 cursor-pointer border-0 backdrop-blur-sm">
              Ko'proq ma'lumot
            </button>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-[#1a1a2e] text-white">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                  <rect width="36" height="36" rx="8" fill="#4F6EF7" />
                  <path d="M10 26V10h6l4 8 4-8h6v16h-5V17l-3 5-3-5v9h-5z" fill="white" />
                </svg>
                <span className="text-lg font-bold">DayWork</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                O'zbekistondagi eng yirik kunlik ish platformasi. 32,000+ ishchilar va 4,200+ ish beruvchilar.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: 'Platforma',
                links: ['Bosh sahifa', 'Ishlar', 'Ish beruvchilar', 'Blog', 'Aloqa'],
              },
              {
                title: 'Ishchilar uchun',
                links: ['Ro\'yxatdan o\'tish', 'Ish qidirish', 'Profil', 'Yordam', 'FAQ'],
              },
              {
                title: 'Ish beruvchilar',
                links: ['Ish joylash', 'Ishchilarni topish', 'Tariflar', 'Biz bilan bog\'laning'],
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
