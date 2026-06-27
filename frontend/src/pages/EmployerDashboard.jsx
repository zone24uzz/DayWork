import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const EmployerDashboard = () => {
  const { apiCall } = useAuth()
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiCall('/jobs/my')
        setStats(data.stats)
        setJobs(data.jobs.filter((j) => j.status === 'active'))
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = stats
    ? [
        { label: 'Jami e\'lonlar', value: stats.total, sub: 'ta', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        )},
        { label: 'Faol e\'lonlar', value: stats.active, sub: 'ta', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        )},
        { label: 'Tugatilgan', value: stats.completed, sub: 'ta', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )},
      ]
    : []

  useEffect(() => {
    document.title = 'DayWork — Ish beruvchi paneli'
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
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-1">Ish Beruvchi Paneli</h1>
          <p className="text-sm text-gray-500">Faoliyatingizning umumiy ko'rinishi.</p>
        </div>
        <Link
          to="/employer/jobs"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_14px_rgba(79,110,247,0.35)] no-underline whitespace-nowrap shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yangi ish joylash
        </Link>
      </motion.div>

      {/* Stats cards */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500">{stat.label}</span>
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#1a1a2e]">{stat.value}</span>
                <span className="text-xs text-gray-400">{stat.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Faol ish e'lonlari */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1a1a2e]">Faol ish e'lonlari</h2>
          <Link to="/employer/jobs" className="text-sm font-semibold text-[#4f6ef7] hover:underline no-underline">Barchasini ko'rish</Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center">
            <svg className="mx-auto mb-3 text-gray-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-gray-500 text-sm mb-1">Hali faol ish e'lonlari yo'q</p>
            <p className="text-gray-400 text-xs">Yangi ish e'lonini yaratish uchun "Ishlar" sahifasiga o'ting</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {jobs.map((job, i) => {
              const progress = job.workersNeeded > 0 ? Math.round((job.workersFound / job.workersNeeded) * 100) : 0
              return (
                <motion.div
                  key={job._id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow duration-300"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#1a1a2e] leading-snug">{job.title}</h3>
                    {job.isUrgent && (
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full text-red-600 bg-red-50 whitespace-nowrap shrink-0">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-xs text-gray-500">{job.location}</span>
                    </div>
                    {job.duration && (
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="text-xs text-gray-500">{job.duration}</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-gray-400">Muvofiqlash jarayoni</span>
                      <span className="text-[11px] font-medium text-gray-600">{job.workersFound || 0} / {job.workersNeeded} ishchi topildi</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4f6ef7] rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </>
  )
}

export default EmployerDashboard
