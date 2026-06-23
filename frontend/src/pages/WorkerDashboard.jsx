import { Link } from 'react-router-dom'

const nearbyJobs = [
  {
    id: 1,
    title: "Qurilish maydonchasida yordamchi",
    category: "Qurilish",
    location: "Toshkent, Olmazor",
    distance: "2 km uzoqlikda",
    salary: "150 000",
    salaryType: "UZS / kun",
    tag: "Tezkor",
    tagColor: "bg-blue-50 text-blue-600",
    tag2: null,
  },
  {
    id: 2,
    title: "Omborda yuk ortish/tushirish",
    category: "Ombor",
    location: "Toshkent, Sergeli",
    distance: "5 km uzoqlikda",
    salary: "200 000",
    salaryType: "UZS / kun",
    tag: "Yangi",
    tagColor: "bg-emerald-50 text-emerald-600",
    tag2: null,
  },
  {
    id: 3,
    title: "Bog'bon yordamchisi",
    category: "Bog'bon",
    location: "Yunusobod tumani",
    distance: "1.5 km uzoqlikda",
    salary: "120 000",
    salaryType: "UZS / kun",
    tag: "Tezkor",
    tagColor: "bg-blue-50 text-blue-600",
    tag2: "Oddiy",
  },
  {
    id: 4,
    title: "Xonadon tozalash",
    category: "Tozalash",
    location: "Mirzo Ulug'bek",
    distance: "8 km uzoqlikda",
    salary: "250 000",
    salaryType: "UZS / ish",
    tag: null,
    tag2: "Oddiy",
  },
]

const WorkerDashboard = () => {


  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a2e]">Ishchi paneli</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bizning faoliyatingiz xulosasi.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-all cursor-pointer shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Mavjudligimni belgilash
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Jami daromad */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Jami daromad</p>
            <div className="w-8 h-8 rounded-lg bg-[#4f6ef7]/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1a1a2e]">2.4M</p>
          <p className="text-xs text-emerald-500 mt-1 font-medium">12% bu oy</p>
        </div>

        {/* Bajarilgan ishlar */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Bajarilgan ishlar</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1a1a2e]">42</p>
          <p className="text-xs text-gray-400 mt-1">ta ish</p>
        </div>

        {/* O'rtacha reyting */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">O'rtacha reyting</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1a1a2e]">4.9</p>
          <p className="text-xs text-gray-400 mt-1">/ 5.0</p>
        </div>
      </div>

      {/* Map section */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">Yaqin atrofdagi ishlar</h2>
          <Link to="/worker/search" className="text-sm text-[#4f6ef7] font-medium no-underline hover:underline">
            Barchasini ko'rish
          </Link>
        </div>
        <div className="w-full h-[240px] bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 relative overflow-hidden">
          {/* Map placeholder */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 600 240" fill="none">
              <rect width="600" height="240" fill="#f0f0f0" />
              <path d="M0 120 Q150 80 300 120 Q450 160 600 120" stroke="#ddd" strokeWidth="1" fill="none" />
              <path d="M0 160 Q150 120 300 160 Q450 200 600 160" stroke="#ddd" strokeWidth="1" fill="none" />
              <path d="M0 80 Q150 40 300 80 Q450 120 600 80" stroke="#ddd" strokeWidth="1" fill="none" />
              <line x1="200" y1="0" x2="200" y2="240" stroke="#ddd" strokeWidth="1" />
              <line x1="400" y1="0" x2="400" y2="240" stroke="#ddd" strokeWidth="1" />
            </svg>
          </div>
          {/* Map dots */}
          <div className="absolute top-[40%] left-[35%] w-3 h-3 bg-[#4f6ef7] rounded-full shadow-[0_0_8px_rgba(79,110,247,0.5)]"></div>
          <div className="absolute top-[55%] left-[55%] w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <div className="absolute top-[45%] left-[65%] w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
          <div className="relative z-10 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className="text-sm text-gray-400 mt-2">Xarita ko'rinishi</p>
          </div>
        </div>
      </div>

      {/* Recommended jobs */}
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a2e] mb-5">Sizga tavsiya etilgan ishlar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {nearbyJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(79,110,247,0.1)] transition-shadow duration-300 flex flex-col">
              {/* Tags */}
              <div className="flex items-center gap-2 mb-3">
                {job.tag && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${job.tagColor}`}>
                    {job.tag}
                  </span>
                )}
                {job.tag2 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                    {job.tag2}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-[#1a1a2e] mb-2 leading-snug">{job.title}</h3>

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
                <span className="text-xs text-gray-400">{job.distance}</span>
              </div>

              {/* Salary */}
              <div className="mt-auto">
                <p className="text-xl font-bold text-[#1a1a2e]">{job.salary}</p>
                <p className="text-xs text-gray-400">{job.salaryType}</p>
              </div>

              {/* Action button */}
              <Link
                to={`/worker/search`}
                className="mt-4 w-full py-2.5 text-center text-sm font-semibold text-[#4f6ef7] bg-[#4f6ef7]/5 hover:bg-[#4f6ef7] hover:text-white rounded-xl transition-all duration-200 no-underline"
              >
                Qabul qilish
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WorkerDashboard
