import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const EmployerJobsPage = () => {
  const { apiCall } = useAuth()
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await apiCall('/jobs/my')
        setJobs(data.jobs)
        setStats(data.stats)
      } catch (err) {
        console.error('Failed to fetch jobs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const tabs = [
    { label: "Faol e'lonlar", count: stats?.active || 0, status: 'active' },
    { label: "Qoralamalar", count: stats?.draft || 0, status: 'draft' },
    { label: "Tugatilgan", count: stats?.completed || 0, status: 'completed' },
  ]

  const currentStatus = tabs[activeTab].status
  const filteredJobs = jobs.filter((j) => j.status === currentStatus)

  const getStatusBadge = (job) => {
    if (job.status === 'completed') return { label: 'Tugatilgan', color: 'text-emerald-600 bg-emerald-50' }
    if (job.isUrgent) return { label: 'Urgent', color: 'text-red-600 bg-red-50' }
    return { label: 'Faol', color: 'text-[#4f6ef7] bg-[#4f6ef7]/10' }
  }

  useEffect(() => {
    document.title = 'DayWork — Mening e\'lonlarim'
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
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Mening e'lonlarim</h1>
          <p className="text-sm text-gray-500">Sizning e'lon qilgan va jaroyindingizdagi ishingiz ro'yxati.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_14px_rgba(79,110,247,0.35)] cursor-pointer border-0 whitespace-nowrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yangi ish e'lonini qo'shish
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex gap-1 mb-6 border-b border-gray-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer bg-transparent ${
              activeTab === i
                ? 'text-[#4f6ef7] border-[#4f6ef7]'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </motion.div>

      {/* Job listings */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center">
          <svg className="mx-auto mb-3 text-gray-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-gray-500 text-sm mb-1">Bu turda hali ishlar yo'q</p>
          <p className="text-gray-400 text-xs">Yangi ish e'lonini yaratish uchun yuqoridagi tugmani bosing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredJobs.map((job, i) => {
            const badge = getStatusBadge(job)
            const progress = job.workersNeeded > 0 ? Math.round((job.workersFound / job.workersNeeded) * 100) : 0
            return (
              <motion.div
                key={job._id}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#4f6ef7]/20 hover:shadow-[0_8px_30px_rgba(79,110,247,0.08)] transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#1a1a2e] leading-snug pr-2">{job.title}</h3>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-3">
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
                <div className="flex items-center gap-1.5 mb-4">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">{job.salary?.toLocaleString()} UZS / {job.salaryPeriod || 'kun'}</span>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-gray-400">Muvofiqlash jarayoni</span>
                    <span className="text-[11px] font-medium text-gray-600">{job.workersFound || 0} / {job.workersNeeded} ishchi topildi</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${job.status === 'completed' ? 'bg-emerald-500' : 'bg-[#4f6ef7]'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end pt-3 border-t border-gray-50 mt-3">
                  <button className="text-xs font-semibold text-[#4f6ef7] bg-[#4f6ef7]/5 px-3 py-1.5 rounded-lg hover:bg-[#4f6ef7] hover:text-white transition-all duration-200 cursor-pointer border-0">
                    {job.status === 'active' ? "Ko'rish" : "Batafsil"}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default EmployerJobsPage
