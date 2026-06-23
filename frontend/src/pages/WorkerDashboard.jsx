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

// Custom user location icon
const userIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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
  const [stats, setStats] = useState({ income: 0, completedJobs: 0, rating: 0 })

  // Get user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude])
        },
        () => {
          // Default to Tashkent if geolocation denied
          setUserPosition(TASHKENT_CENTER)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setUserPosition(TASHKENT_CENTER)
    }
  }, [])

  // Fetch nearby jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await apiCall('/jobs?limit=4&sort=nearby')
        setJobs(data.jobs || data || [])
      } catch {
        setJobs([])
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [apiCall])

  // Fetch worker stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiCall('/auth/me/stats')
        setStats({
          income: data.income || 0,
          completedJobs: data.completedJobs || 0,
          rating: data.rating || 0,
        })
      } catch {
        // Stats will show 0 if API not available
      }
    }
    fetchStats()
  }, [apiCall])

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
          <p className="text-3xl font-bold text-[#1a1a2e]">{formatCurrency(stats.income)} so'm</p>
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
          <p className="text-3xl font-bold text-[#1a1a2e]">{stats.completedJobs}</p>
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
          <p className="text-3xl font-bold text-[#1a1a2e]">{stats.rating > 0 ? stats.rating.toFixed(1) : '—'}</p>
          <p className="text-xs text-gray-400 mt-1">/ 5.0</p>
        </div>
      </div>

      {/* Real Map section */}
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
              <Marker position={userPosition} icon={userIcon}>
                <Popup>
                  <strong>Sizning joylashuvingiz</strong>
                </Popup>
              </Marker>

              {/* Job markers from API */}
              {jobs.filter(j => j.location?.lat && j.location?.lng).map((job) => (
                <Marker
                  key={job._id || job.id}
                  position={[job.location.lat, job.location.lng]}
                >
                  <Popup>
                    <strong>{job.title}</strong>
                    <br />
                    <span>{job.location?.address || ''}</span>
                    <br />
                    <span style={{ fontWeight: 600, color: '#4f6ef7' }}>
                      {job.budget?.toLocaleString('uz-UZ')} so'm
                    </span>
                  </Popup>
                </Marker>
              ))}
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
        <h2 className="text-lg font-semibold text-[#1a1a2e] mb-5">Sizga tavsiya etilgan ishlar</h2>

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
            <p className="text-gray-400 text-sm">Hozircha yaqin atrofda ishlar yo'q</p>
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
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-[#1a1a2e] mb-2 leading-snug">{job.title}</h3>

                {/* Location */}
                {job.location?.address && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-xs text-gray-400">{job.location.address}</span>
                  </div>
                )}

                {/* Salary */}
                <div className="mt-auto pt-4">
                  <p className="text-xl font-bold text-[#1a1a2e]">
                    {job.budget ? job.budget.toLocaleString('uz-UZ') : '—'}
                  </p>
                  <p className="text-xs text-gray-400">UZS</p>
                </div>

                {/* Action button */}
                <Link
                  to="/worker/search"
                  className="mt-4 w-full py-2.5 text-center text-sm font-semibold text-[#4f6ef7] bg-[#4f6ef7]/5 hover:bg-[#4f6ef7] hover:text-white rounded-xl transition-all duration-200 no-underline"
                >
                  Qabul qilish
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
