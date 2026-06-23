import { useState } from 'react'
import { Link } from 'react-router-dom'

const categories = [
  'Barchasi', 'Qurilish', 'Yuk tashish', 'Tozalash', 'Ombor ishlari',
  'Yetkazish', 'Ko\'kalamzorlashtirish', 'Bog\'bon', 'Mehmonxona', 'Parrandachilik',
]

const allJobs = [
  {
    id: 1,
    title: "Qurilish maydonchasida yordamchi",
    category: "Qurilish",
    location: "Toshkent, Olmazor",
    distance: "2 km",
    salary: "150 000",
    salaryType: "UZS / kun",
    tag: "Tezkor",
    tagColor: "bg-blue-50 text-blue-600",
    urgency: "Shoshilinch",
    urgencyColor: "bg-red-50 text-red-600",
    employer: "BuildPro",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Omborda yuk ortish/tushirish",
    category: "Ombor ishlari",
    location: "Toshkent, Sergeli",
    distance: "5 km",
    salary: "200 000",
    salaryType: "UZS / kun",
    tag: "Yangi",
    tagColor: "bg-emerald-50 text-emerald-600",
    urgency: null,
    employer: "Logistic Center",
    rating: 4.5,
  },
  {
    id: 3,
    title: "Bog'bon yordamchisi",
    category: "Bog'bon",
    location: "Yunusobod tumani",
    distance: "1.5 km",
    salary: "120 000",
    salaryType: "UZS / kun",
    tag: "Tezkor",
    tagColor: "bg-blue-50 text-blue-600",
    urgency: null,
    employer: "Green Park",
    rating: 4.9,
  },
  {
    id: 4,
    title: "Xonadon tozalash",
    category: "Tozalash",
    location: "Mirzo Ulug'bek",
    distance: "8 km",
    salary: "250 000",
    salaryType: "UZS / ish",
    tag: null,
    urgency: null,
    employer: "CleanHouse",
    rating: 4.7,
  },
  {
    id: 5,
    title: "Yuk tashish haydovchisi",
    category: "Yuk tashish",
    location: "Toshkent, Chilonzor",
    distance: "3 km",
    salary: "300 000",
    salaryType: "UZS / kun",
    tag: "Yangi",
    tagColor: "bg-emerald-50 text-emerald-600",
    urgency: "Shoshilinch",
    urgencyColor: "bg-red-50 text-red-600",
    employer: "FastDelivery",
    rating: 4.6,
  },
  {
    id: 6,
    title: "Mehmonxona xonadoni tozalash",
    category: "Mehmonxona",
    location: "Toshkent markazi",
    distance: "4 km",
    salary: "180 000",
    salaryType: "UZS / kun",
    tag: null,
    urgency: null,
    employer: "Grand Hotel",
    rating: 4.4,
  },
  {
    id: 7,
    title: "Parrandachilik fermasi ishchisi",
    category: "Parrandachilik",
    location: "Toshkent viloyati",
    distance: "15 km",
    salary: "220 000",
    salaryType: "UZS / kun",
    tag: "Yangi",
    tagColor: "bg-emerald-50 text-emerald-600",
    urgency: null,
    employer: "AgroFarm",
    rating: 4.3,
  },
  {
    id: 8,
    title: "Ko'kalamzorlashtirish ishchisi",
    category: "Ko'kalamzorlashtirish",
    location: "Toshkent, Shayxontohur",
    distance: "6 km",
    salary: "160 000",
    salaryType: "UZS / kun",
    tag: null,
    urgency: null,
    employer: "GreenCity",
    rating: 4.8,
  },
]

const WorkerSearchPage = () => {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Barchasi')
  const [sortBy, setSortBy] = useState('newest')

  const filteredJobs = allJobs.filter((job) => {
    const matchesQuery =
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.location.toLowerCase().includes(query.toLowerCase()) ||
      job.category.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = activeCategory === 'Barchasi' || job.category === activeCategory
    return matchesQuery && matchesCategory
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'salary-high') return Number(b.salary.replace(/\s/g, '')) - Number(a.salary.replace(/\s/g, ''))
    if (sortBy === 'salary-low') return Number(a.salary.replace(/\s/g, '')) - Number(b.salary.replace(/\s/g, ''))
    if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
    return 0 // newest = default order
  })

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
            <option value="salary-high">Oylik (yuqori)</option>
            <option value="salary-low">Oylik (past)</option>
            <option value="distance">Masofa (yaqin)</option>
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

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-[#1a1a2e]">{sortedJobs.length}</span> ta ish topildi
        </p>
      </div>

      {/* Job results */}
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
            <div key={job.id} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(79,110,247,0.1)] transition-shadow duration-300 flex flex-col">
              {/* Tags */}
              <div className="flex items-center gap-2 mb-3">
                {job.tag && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${job.tagColor}`}>
                    {job.tag}
                  </span>
                )}
                {job.urgency && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${job.urgencyColor}`}>
                    {job.urgency}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-[#1a1a2e] mb-2 leading-snug">{job.title}</h3>

              {/* Employer & Rating */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{job.employer}</span>
                <div className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-600">{job.rating}</span>
                </div>
              </div>

              {/* Location & distance */}
              <div className="flex items-center gap-1.5 mb-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-xs text-gray-400">{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-xs text-gray-400">{job.distance} uzoqlikda</span>
              </div>

              {/* Salary */}
              <div className="mt-auto">
                <p className="text-xl font-bold text-[#1a1a2e]">{job.salary}</p>
                <p className="text-xs text-gray-400">{job.salaryType}</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <Link
                  to={`/worker/my-jobs`}
                  className="flex-1 py-2.5 text-center text-sm font-semibold text-[#4f6ef7] bg-[#4f6ef7]/5 hover:bg-[#4f6ef7] hover:text-white rounded-xl transition-all duration-200 no-underline"
                >
                  Qabul qilish
                </Link>
                <button className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-all duration-200 cursor-pointer border-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkerSearchPage
