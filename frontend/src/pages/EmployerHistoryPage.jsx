import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const gradientColors = [
  'from-yellow-400 to-orange-500',
  'from-blue-400 to-blue-600',
  'from-pink-400 to-rose-500',
  'from-gray-400 to-gray-600',
  'from-emerald-400 to-emerald-600',
  'from-purple-400 to-purple-600',
]

const getGradient = (name) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradientColors[Math.abs(hash) % gradientColors.length]
}

const EmployerHistoryPage = () => {
  const { apiCall } = useAuth()
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('Oxirgi 30 kun')
  const [jobType, setJobType] = useState('Barcha turlar')
  const [statusFilter, setStatusFilter] = useState('Barchasi')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiCall('/jobs/my')
        // Show completed jobs as history
        const completed = (data.jobs || []).filter((j) => j.status === 'completed')
        setHistoryData(completed)
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(historyData.length / ITEMS_PER_PAGE)
  const startItem = historyData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, historyData.length)

  useEffect(() => {
    document.title = 'DayWork — Tarix (Ish beruvchi)'
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[#4f6ef7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Tarix</h1>
          <p className="text-sm text-gray-500">Barcha yakunlangan ishlar va tranzaksiyalar jurnali.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_14px_rgba(79,110,247,0.35)] cursor-pointer border-0 whitespace-nowrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Hisobotni yuklash
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-white rounded-2xl p-5 border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Qidirish</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Ishchi yoki ish nomi"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Sana oralig'i</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option>Oxirgi 7 kun</option>
                <option>Oxirgi 30 kun</option>
                <option>Oxirgi 90 kun</option>
                <option>Bu yil</option>
                <option>Barchasi</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Turi</label>
            <div className="relative">
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option>Barcha turlar</option>
                <option>Qurilish</option>
                <option>Yuk tashish</option>
                <option>Tozalash</option>
                <option>Omborxona</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Holat</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option>Barchasi</option>
                <option>Bajarildi</option>
                <option>Bechor qilindi</option>
                <option>Jarayonda</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {historyData.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto mb-3 text-gray-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-gray-500 text-sm mb-1">Hali tarix ma'lumotlari yo'q</p>
            <p className="text-gray-400 text-xs">Tugatilgan ishlar shu yerda ko'rinadi</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-3">Ish nomi & toifa</div>
              <div className="col-span-3">Sana</div>
              <div className="col-span-3 text-right">To'lov</div>
              <div className="col-span-2 text-center">Holat</div>
              <div className="col-span-1 text-center">{' '}</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-50">
              {historyData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((item) => (
                <motion.div
                  key={item._id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Job Title & Category */}
                  <div className="col-span-3">
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.category || 'Umumiy'}</p>
                  </div>

                  {/* Date */}
                  <div className="col-span-3">
                    <p className="text-sm text-gray-700">
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="col-span-3 text-right">
                    <p className="text-sm font-bold text-gray-800">{item.salary?.toLocaleString()} UZS</p>
                    <p className="text-[11px] text-gray-400">{item.salaryPeriod || 'kun'}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-center">
                    <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full text-emerald-600 bg-emerald-50">
                      BAJARILDI
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-center">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer border-0 bg-transparent">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Jami: <span className="font-semibold text-gray-700">{historyData.length}</span> ta natija. {startItem}-{endItem} ko'rsatilmoqda.
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors cursor-pointer border-0 ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors cursor-pointer border-0 ${
                        currentPage === page
                          ? 'bg-[#4f6ef7] text-white shadow-[0_2px_8px_rgba(79,110,247,0.3)]'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors cursor-pointer border-0 ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </>
  )
}

export default EmployerHistoryPage
