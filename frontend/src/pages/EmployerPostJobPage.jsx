import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../context/AuthContext'

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const TASHKENT_CENTER = [41.2995, 69.2401]

const categories = [
  'Qurilish',
  'Yuk tashish',
  'Tozalash',
  'Ombor ishlari',
  'Yetkazish',
  'Ko\'kalamzorlashtirish',
  'Parrandachilik',
  'Mehmonxona',
]

// Component that handles map click to place marker
const LocationMarker = ({ position, onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng])
    },
  })
  return position ? <Marker position={position} /> : null
}

// Component to recenter map when position changes
const RecenterMap = ({ position }) => {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, 15)
    }
  }, [position, map])
  return null
}

const EmployerPostJobPage = () => {
  const { apiCall } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    location: '',
    category: '',
    date: '',
    time: '',
    budget: '',
    description: '',
  })
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [mapPosition, setMapPosition] = useState(null)

  // Get user geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapPosition([pos.coords.latitude, pos.coords.longitude]),
        () => setMapPosition(TASHKENT_CENTER),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setMapPosition(TASHKENT_CENTER)
    }
  }, [])

  const handleMapPositionChange = useCallback((pos) => {
    setMapPosition(pos)
    // Reverse geocode to fill location text
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}&accept-language=uz`)
      .then(res => res.json())
      .then(data => {
        const addr = data.display_name || ''
        const shortAddr = addr.split(',').slice(0, 3).join(',')
        setForm(prev => ({ ...prev, location: shortAddr }))
      })
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImages].slice(0, 5))
  }

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.title || !form.category || !form.budget) {
      setError('Iltimos, barcha majburiy maydonlarni to\'ldiring')
      return
    }

    setSubmitting(true)
    try {
      await apiCall('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          location: {
            address: form.location,
            lat: mapPosition?.[0] || null,
            lng: mapPosition?.[1] || null,
          },
          category: form.category,
          date: form.date,
          time: form.time,
          budget: Number(form.budget.replace(/\D/g, '')),
          description: form.description,
        }),
      })
      navigate('/employer/jobs')
    } catch (err) {
      setError(err.message || 'E\'lon yaratishda xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const formatBudget = (value) => {
    const nums = value.replace(/\D/g, '')
    return nums ? nums.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Ish e'lon qilish</h1>
        <p className="text-sm text-gray-500 mt-1">
          Loyiha talablaringiz kiriting va mutaxassislar toping
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Title & Category */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Ish nomi */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ish nomi (Sarlavha)
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Masalan: My tarant, Yuk tashish..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Kategoriya */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoriya
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">Kategoriyani tanlang</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sana va vaqt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sana va vaqt
              </label>
              <div className="flex gap-3">
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all"
                />
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="w-28 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Ish hajmi (Budget) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ish hajmi (Buget)
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <input
                  type="text"
                  name="budget"
                  value={form.budget}
                  onChange={(e) => {
                    const formatted = formatBudget(e.target.value)
                    setForm((prev) => ({ ...prev, budget: formatted }))
                  }}
                  placeholder="Masalan: 500 000"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                  SO'M
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Location Picker */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ish joylashuvi (Xaritada bosing)
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Xaritada istalgan joyni bosib, ish joyini belgilang
          </p>

          {/* Location text input */}
          <div className="relative mb-4">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Manzil (xaritada bosganingizda avtomatik to'ldiriladi)"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Leaflet Map */}
          <div className="w-full h-[280px] rounded-xl overflow-hidden border border-gray-100">
            {mapPosition && (
              <MapContainer
                center={mapPosition}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap position={mapPosition} />
                <LocationMarker
                  position={mapPosition}
                  onPositionChange={handleMapPositionChange}
                />
              </MapContainer>
            )}
            {!mapPosition && (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-[#4f6ef7] rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-400 mt-3">Xarita yuklanmoqda...</p>
                </div>
              </div>
            )}
          </div>

          {mapPosition && (
            <p className="text-xs text-gray-400 mt-2">
              📍 Lat: {mapPosition[0].toFixed(5)}, Lng: {mapPosition[1].toFixed(5)}
            </p>
          )}
        </div>

        {/* Batafsil ma'lumot */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batafsil ma'lumot
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="Ish haqida to'liq ma'lumot bering, talablarni va sharoitlarni yozing..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400 resize-none"
          />
        </div>

        {/* Rasmlar */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rasmlar
          </label>

          {/* Image previews */}
          {images.length > 0 && (
            <div className="flex gap-3 mb-4 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img.preview}
                    alt={`Yuklangan ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#4f6ef7] hover:bg-[#4f6ef7]/5 transition-all">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-xs text-gray-400 mt-2">
              Rasm(alar) qo'shish
            </span>
            <span className="text-[11px] text-gray-300 mt-0.5">
              Ajralgan, boshqa formatlarda rasm yuklash mumkin
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/employer')}
            className="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer border-0"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Yuklanmoqda...' : "E'lon qilish"}
          </button>
        </div>
      </form>

      {/* Bottom info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pb-4">
        {[
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ),
            title: 'Aniq sana',
            desc: 'Ish boshlanish sanasini aniq ko\'rsating. Ishchilar tayyor bo\'lishadi.',
          },
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            ),
            title: "To'lov kafolati",
            desc: "Hamyoningizdan pul yechiladi va ish bajarilganidan keyin o'tkaziladi.",
          },
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ),
            title: 'Shuft narx',
            desc: 'Ishchilar sizning e\'loningizga ariza yuborishlari mumkin.',
          },
        ].map((card) => (
          <div key={card.title} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1a2e]">{card.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmployerPostJobPage
