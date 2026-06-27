import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const WorkerHistoryPage = () => {
  const { apiCall } = useAuth()
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Fetch completed jobs as history
        const data = await apiCall('/jobs?status=completed')
        setHistoryData(data.jobs || [])
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  useEffect(() => {
    document.title = 'DayWork — Tarix (Ishchi)'
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[#4f6ef7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Tarix</h1>
        <p className="text-sm text-gray-500">O'tgan ishlaringiz tarixi</p>
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {historyData.length === 0 ? (
          <div className="text-center py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-gray-400 text-sm">Hozircha tarix yo'q</p>
            <p className="text-gray-300 text-xs mt-1">Tugatilgan ishlar shu yerda ko'rinadi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-4">Ish nomi</div>
              <div className="col-span-3">Sana</div>
              <div className="col-span-2 text-right">To'lov</div>
              <div className="col-span-2 text-center">Holat</div>
              <div className="col-span-1"></div>
            </div>
            {historyData.map((item) => (
              <div
                key={item._id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
              >
                <div className="col-span-4">
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.category || 'Umumiy'}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-gray-700">
                    {new Date(item.updatedAt || item.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-bold text-gray-800">{item.salary?.toLocaleString()} UZS</p>
                  <p className="text-[11px] text-gray-400">{item.salaryPeriod || 'kun'}</p>
                </div>
                <div className="col-span-2 text-center">
                  <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full text-emerald-600 bg-emerald-50">
                    BAJARILDI
                  </span>
                </div>
                <div className="col-span-1"></div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default WorkerHistoryPage
