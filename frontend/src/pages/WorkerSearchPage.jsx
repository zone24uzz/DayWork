import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const categories = [
  'Barchasi', 'Qurilish', 'Yuk tashish', 'Tozalash', 'Ombor ishlari',
  'Yetkazish', "Ko'kalamzorlashtirish", "Bog'bon", 'Mehmonxona', 'Parrandachilik',
]

const WorkerSearchPage = () => {
  const { apiCall } = useAuth()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Barchasi')
  const [sortBy, setSortBy] = useState('newest')
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

  const filteredJobs = jobs.filter((job) => {
    const matchesQuery =
      !query ||
      job.title?.toLowerCase().includes(query.toLowerCase()) ||
      job.location?.toLowerCase().includes(query.toLowerCase()) ||
      job.category?.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = activeCategory === 'Barchasi' || job.category === activeCategory
    return matchesQuery && matchesCategory
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'salary-high') return (b.salary || 0) - (a.salary || 0)
    if (sortBy === 'salary-low') return (a.salary || 0) - (b.salary || 0)
    return new Date(b.createdAt) - new Date(a.createdAt) // newest
  })

  const handleContact = async (employerId) => {
    try {
      await apiCall('/messages/conversation', {
        method: 'POST',
        body: JSON.stringify({ receiverId: employerId }),
      })
      window.location.href = '/worker/messages'
    } catch (err) {
      console.error('Failed to start conversation:', err)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Ish qidirish</h1>
        <p className="text-sm text-gray-500 mt-1">
          O'zingizga mos ishni toping va ariza yuboring
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ish nomi, kategoriya yoki joy..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors cursor-pointer border-0 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all cursor-pointer appearance-none pr-10 min-w-[180px]"
          >
            <option value="newest">Eng yangi</option>
            <option value="salary-high">Maosh (yuqori)</option>
            <option value="salary-low">Maosh (past)</option>
          </select>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer border-0 ${
                activeCategory === cat
                  ? 'bg-[#4f6ef7] text-white shadow-[0_2px_8px_rgba(79,110,247,0.3)]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-3 border-[#4f6ef7] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-[#1a1a2e]">{sortedJobs.length}</span> ta ish topildi
            </p>
          </div>

          {sortedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-gray-400 text-sm">Hech qanday ish topilmadi</p>
              <p className="text-gray-300 text-xs mt-1">Boshqa kalit so'zlar bilan qidirib ko'ring</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedJobs.map((job) => (
                <div key={job._id} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(79,110,247,0.1)] transition-shadow duration-300 flex flex-col">
                  {/* Tags */}
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

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-[#1a1a2e] mb-2 leading-snug">{job.title}</h3>

                  {/* Employer Name */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">{job.employer?.name || job.employer?.company || 'Ish beruvchi'}</span>
                  </div>

                  {/* Location & duration */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-xs text-gray-400">{job.location || "Noma'lum"}</span>
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

                  {/* Salary */}
                  <div className="mt-auto">
                    <p className="text-xl font-bold text-[#1a1a2e]">{job.salary?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">UZS / {job.salaryPeriod || 'kun'}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleContact(job.employer?._id)}
                      className="flex-1 py-2.5 text-center text-sm font-semibold text-white bg-[#4f6ef7] hover:bg-[#3b5de7] rounded-xl transition-all duration-200 cursor-pointer border-0"
                    >
                      Xabar yozish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WorkerSearchPage
