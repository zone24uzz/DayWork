import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../context/AuthContext'

// Fix default marker icon issue with Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const TASHKENT_CENTER = [41.2995, 69.2401]

// Component to recenter map when position changes
const RecenterMap = ({ position }) => {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, 13)
    }
  }, [position, map])
  return null
}

const WorkerDashboard = () => {
  const { apiCall } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [userPosition, setUserPosition] = useState(null)

  // Get user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude])
        },
        () => {
          setUserPosition(TASHKENT_CENTER)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setUserPosition(TASHKENT_CENTER)
    }
  }, [])

  // Fetch active jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await apiCall('/jobs?status=active')
        setJobs((data.jobs || []).slice(0, 4))
      } catch {
        setJobs([])
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [apiCall])

  // Count total jobs available
  const totalJobs = jobs.length

  useEffect(() => {
    document.title = 'DayWork — Ishchi paneli'
  }, [])

  const formatCurrency = (amount) => {
    if (!amount) return '0'
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
    return amount.toLocaleString('uz-UZ')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a2e]">Ishchi paneli</h1>
          <p className="text-sm text-gray-500 mt-1">
            Faoliyatingizning umumiy ko'rinishi
          </p>
        </div>
        <Link to="/worker/search" className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#4f6ef7] text-white text-sm font-medium rounded-xl hover:bg-[#3b5de7] transition-all no-underline shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Ish qidirish
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Mavjud ishlar */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Mavjud ishlar</p>
            <div className="w-8 h-8 rounded-lg bg-[#4f6ef7]/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1a1a2e]">{totalJobs}</p>
          <p className="text-xs text-gray-400 mt-1">ta faol ish</p>
        </div>

        {/* O'rtacha maosh */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">O'rtacha maosh</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          {jobs.length > 0 ? (
            <>
              <p className="text-3xl font-bold text-[#1a1a2e]">{formatCurrency(Math.round(jobs.reduce((sum, j) => sum + (j.salary || 0), 0) / jobs.length))}</p>
              <p className="text-xs text-gray-400 mt-1">so'm / kun</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-[#1a1a2e]">—</p>
              <p className="text-xs text-gray-400 mt-1">ma'lumot yo'q</p>
            </>
          )}
        </div>

        {/* Kategoriyalar soni */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Kategoriyalar</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1a1a2e]">{new Set(jobs.map(j => j.category).filter(Boolean)).size || '—'}</p>
          <p className="text-xs text-gray-400 mt-1">ta turdagi ish</p>
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
        <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-100">
          {userPosition && (
            <MapContainer
              center={userPosition}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <RecenterMap position={userPosition} />
              <Marker position={userPosition}>
                <Popup>
                  <strong>Sizning joylashuvingiz</strong>
                </Popup>
              </Marker>
            </MapContainer>
          )}
          {!userPosition && (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-[#4f6ef7] rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-400 mt-3">Xarita yuklanmoqda...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Jobs from API */}
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a2e] mb-5">So'nggi ish e'lonlari</h2>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-7 bg-gray-200 rounded w-1/3 mt-auto" />
              </div>
            ))}
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="bg-white rounded-2xl p-10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <p className="text-gray-400 text-sm">Hozircha faol ish e'lonlari yo'q</p>
            <Link
              to="/worker/search"
              className="inline-block mt-3 px-4 py-2 bg-[#4f6ef7] text-white text-sm font-medium rounded-xl no-underline hover:bg-[#3b5de7] transition-all"
            >
              Ishlarni qidirish
            </Link>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {jobs.map((job) => (
              <div key={job._id || job.id} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(79,110,247,0.1)] transition-shadow duration-300 flex flex-col">
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

                {/* Location */}
                <div className="flex items-center gap-1.5 mb-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-xs text-gray-400">{job.location || "Noma'lum"}</span>
                </div>

                {/* Salary */}
                <div className="mt-auto pt-4">
                  <p className="text-xl font-bold text-[#1a1a2e]">
                    {job.salary ? job.salary.toLocaleString('uz-UZ') : '—'}
                  </p>
                  <p className="text-xs text-gray-400">UZS / {job.salaryPeriod || 'kun'}</p>
                </div>

                {/* Action button */}
                <Link
                  to="/worker/search"
                  className="mt-4 w-full py-2.5 text-center text-sm font-semibold text-[#4f6ef7] bg-[#4f6ef7]/5 hover:bg-[#4f6ef7] hover:text-white rounded-xl transition-all duration-200 no-underline"
                >
                  Ko'rish
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkerDashboard
