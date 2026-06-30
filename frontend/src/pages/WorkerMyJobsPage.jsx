import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const WorkerMyJobsPage = () => {
  const { apiCall } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await apiCall('/jobs?status=active')
        setJobs(data.jobs || [])
      } catch (err) {
        console.error('Failed to fetch jobs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const handleContact = async (employerId) => {
    try {
      const data = await apiCall('/chat/conversation', {
        method: 'POST',
        body: JSON.stringify({ receiverId: employerId }),
      })
      window.location.href = '/worker/messages'
    } catch (err) {
      console.error('Failed to start conversation:', err)
    }
  }

  useEffect(() => {
    document.title = 'DayWork — Barcha ishlar'
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Barcha ishlar</h1>
          <p className="text-sm text-gray-500">Mavjud ish e'lonlari</p>
        </div>
        <Link to="/worker/search" className="flex items-center gap-2 px-5 py-2.5 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white rounded-xl font-semibold text-sm transition-all no-underline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Ish qidirish
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-gray-400 text-sm">Hozircha ishlar yo'q</p>
          <Link to="/worker/search" className="inline-block mt-4 px-5 py-2.5 bg-[#4f6ef7] text-white text-sm font-medium rounded-xl no-underline hover:bg-[#3b5de7] transition-colors">
            Ish qidirish
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(79,110,247,0.1)] transition-shadow duration-300 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                {job.category && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#4f6ef7]/10 text-[#4f6ef7]">
                    {job.category}
                  </span>
                )}
                {job.isUrgent && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-red-50 text-red-600">
                    Shoshilinch
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-[#1a1a2e] mb-2 leading-snug">{job.title}</h3>
              <div className="flex items-center gap-1.5 mb-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-xs text-gray-400">{job.location || "Noma'lum"}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="text-xs font-medium text-gray-600">{job.salary?.toLocaleString()} UZS / {job.salaryPeriod || 'kun'}</span>
              </div>
              {job.duration && (
                <div className="flex items-center gap-1.5 mb-4">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-xs text-gray-400">{job.duration}</span>
                </div>
              )}
              <div className="mt-auto pt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleContact(job.employer?._id)}
                    className="flex-1 py-2.5 text-center text-sm font-semibold text-white bg-[#4f6ef7] hover:bg-[#3b5de7] rounded-xl transition-all duration-200 cursor-pointer border-0"
                  >
                    Xabar yozish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkerMyJobsPage
